'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeft, CheckCircle2, FileText, Loader2, Lock, Pause, Play, RotateCcw,
  Video as VideoIcon, X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { onboardingService } from '@/services/onboardingService';
import OnboardingAdminPage from './AdminView';
import { getEmployeeOnboardingTrack, getEmployeeOnboardingTracks, ONBOARDING_TRACK_META, ONBOARDING_TRACKS, type OnboardingTrack } from '@/lib/onboarding';

type TestQuestion = { question: string; options: string[]; correctAnswer: number };
type OnboardingVideo = {
  _id: string;
  title: string;
  description?: string;
  youtubeUrl?: string;
  cloudinaryUrl?: string;
  coverImageUrl?: string;
  duration: number;
  track?: OnboardingTrack;
  testQuestions?: TestQuestion[];
  createdAt: string;
};
type VideoProgress = {
  _id?: string;
  videoId: string;
  watchedSeconds: number;
  resumePosition: number;
  isCompleted: boolean;
  testScore: number;
  scorePercentage: number;
  testFinished: boolean;
  testAttempts: number;
};
type YoutubePlayer = {
  getCurrentTime: () => number;
  getDuration: () => number;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  destroy: () => void;
};
type YoutubeWindow = Window & {
  YT?: { Player: new (id: string, options: object) => YoutubePlayer; PlayerState: Record<string, number> };
  onYouTubeIframeAPIReady?: () => void;
};

const SAVE_INTERVAL_SECONDS = 10;
const SEEK_TOLERANCE_SECONDS = 1.5;

const getYoutubeVideoId = (url: string) => {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtu.be')) return parsed.pathname.slice(1);
    return parsed.searchParams.get('v') || parsed.pathname.split('/').filter(Boolean).pop() || '';
  } catch {
    return '';
  }
};

const formatDuration = (seconds: number) => {
  const safeSeconds = Math.max(0, Math.floor(seconds || 0));
  return `${String(Math.floor(safeSeconds / 60)).padStart(2, '0')}:${String(safeSeconds % 60).padStart(2, '0')}`;
};

const getPosterUrl = (video: OnboardingVideo) => {
  if (video.coverImageUrl) return video.coverImageUrl;
  if (video.youtubeUrl) {
    const id = getYoutubeVideoId(video.youtubeUrl);
    if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  }
  if (video.cloudinaryUrl) return video.cloudinaryUrl.replace('/upload/', '/upload/so_30/').replace(/\.[^/.]+$/, '.jpg');
  return 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop';
};

export default function OnboardingPage() {
  return <Suspense fallback={<div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>}><OnboardingContent /></Suspense>;
}

function OnboardingContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const user = session?.user as { role?: string; department?: string } | undefined;
  const isAdmin = user?.role === 'SUPER_ADMIN';
  const learnerTrack = getEmployeeOnboardingTrack(user?.role, user?.department);
  const requestedTrack = searchParams.get('view');
  const availableTracks = getEmployeeOnboardingTracks(user?.role, user?.department);
  const activeTrack = ONBOARDING_TRACKS.includes(requestedTrack as OnboardingTrack) && availableTracks.includes(requestedTrack as OnboardingTrack)
    ? requestedTrack as OnboardingTrack
    : learnerTrack;
  const trackMeta = ONBOARDING_TRACK_META[activeTrack];
  const [videos, setVideos] = useState<OnboardingVideo[]>([]);
  const [progress, setProgress] = useState<VideoProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [activeVideo, setActiveVideo] = useState<OnboardingVideo | null>(null);
  const [activeProgress, setActiveProgress] = useState<VideoProgress | null>(null);
  const [showTest, setShowTest] = useState(false);
  const [testAnswers, setTestAnswers] = useState<number[]>([]);
  const [testResult, setTestResult] = useState<{ score: number; percentage: number } | null>(null);
  const [submittingTest, setSubmittingTest] = useState(false);
  const [playerError, setPlayerError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const ytPlayerRef = useRef<YoutubePlayer | null>(null);
  const ytIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeVideoRef = useRef<OnboardingVideo | null>(null);
  const allowedPositionRef = useRef(0);
  const lastSavedPositionRef = useRef(0);
  const initialResumePositionRef = useRef(0);
  const didRestoreNativePositionRef = useRef(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError('');
      const [videoData, progressData] = await Promise.all([
        onboardingService.getVideos() as Promise<OnboardingVideo[]>,
        onboardingService.getMyProgress() as Promise<VideoProgress[]>,
      ]);
      setVideos([...videoData].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
      setProgress(progressData);
    } catch {
      setLoadError('Kurs ma’lumotlarini yuklab bo‘lmadi. Internetni tekshirib, qayta urinib ko‘ring.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) void loadData();
  }, [user, loadData]);

  useEffect(() => {
    activeVideoRef.current = activeVideo;
  }, [activeVideo]);

  const updateProgressState = useCallback((saved: VideoProgress) => {
    setActiveProgress(saved);
    setProgress((current) => {
      const exists = current.some((item) => item.videoId === saved.videoId);
      return exists ? current.map((item) => item.videoId === saved.videoId ? saved : item) : [...current, saved];
    });
  }, []);

  const persistProgress = useCallback(async (position: number, ended = false) => {
    const video = activeVideoRef.current;
    if (!video || video.duration <= 0) return null;

    try {
      const saved = await onboardingService.updateProgress({
        videoId: video._id,
        action: 'heartbeat',
        position: Math.min(Math.max(0, Math.floor(position)), video.duration),
        ended,
      }) as VideoProgress;
      allowedPositionRef.current = Math.max(allowedPositionRef.current, saved.watchedSeconds);
      lastSavedPositionRef.current = saved.resumePosition;
      updateProgressState(saved);
      return saved;
    } catch (error) {
      setPlayerError(error instanceof Error ? error.message : 'Progress saqlanmadi.');
      return null;
    }
  }, [updateProgressState]);

  const stopYoutubeTracking = useCallback(() => {
    if (ytIntervalRef.current) {
      clearInterval(ytIntervalRef.current);
      ytIntervalRef.current = null;
    }
  }, []);

  const observePosition = useCallback((position: number, player?: YoutubePlayer) => {
    if (position > allowedPositionRef.current + SEEK_TOLERANCE_SECONDS) {
      const safePosition = allowedPositionRef.current;
      if (player) player.seekTo(safePosition, true);
      else if (videoRef.current) videoRef.current.currentTime = safePosition;
      setPlayerError('Videoning ko‘rilmagan qismiga oldinga o‘tib bo‘lmaydi.');
      return false;
    }

    allowedPositionRef.current = Math.max(allowedPositionRef.current, position);
    setCurrentPosition(position);
    if (position - lastSavedPositionRef.current >= SAVE_INTERVAL_SECONDS) {
      void persistProgress(position);
    }
    return true;
  }, [persistProgress]);

  const handleVideoEnded = useCallback(async () => {
    const video = activeVideoRef.current;
    if (!video) return;
    const saved = await persistProgress(video.duration, true);
    if (saved?.isCompleted && video.testQuestions?.length) setShowTest(true);
  }, [persistProgress]);

  useEffect(() => {
    if (!activeVideo?.youtubeUrl) return;
    const videoId = getYoutubeVideoId(activeVideo.youtubeUrl);
    if (!videoId) {
      setPlayerError('YouTube havolasi noto‘g‘ri.');
      return;
    }

    let cancelled = false;
    const createPlayer = () => {
      const ytWindow = window as YoutubeWindow;
      if (cancelled || !ytWindow.YT) return;
      const YT = ytWindow.YT;
      ytPlayerRef.current?.destroy();
      ytPlayerRef.current = new YT.Player('yt-player', {
        videoId,
        playerVars: { controls: 0, disablekb: 1, rel: 0, modestbranding: 1 },
        events: {
          onReady: (event: { target: YoutubePlayer }) => {
            const resumePosition = Math.min(initialResumePositionRef.current, Math.max(0, activeVideo.duration - 1));
            if (resumePosition > 0) event.target.seekTo(resumePosition, true);
          },
          onStateChange: (event: { data: number; target: YoutubePlayer }) => {
            if (event.data === YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              stopYoutubeTracking();
              void persistProgress(event.target.getCurrentTime());
              ytIntervalRef.current = setInterval(() => observePosition(event.target.getCurrentTime(), event.target), 1000);
            }
            if (event.data === YT.PlayerState.PAUSED) {
              setIsPlaying(false);
              stopYoutubeTracking();
              void persistProgress(event.target.getCurrentTime());
            }
            if (event.data === YT.PlayerState.ENDED) {
              setIsPlaying(false);
              stopYoutubeTracking();
              void handleVideoEnded();
            }
          },
        },
      });
    };

    const ytWindow = window as YoutubeWindow;
    const existingScript = document.querySelector<HTMLScriptElement>('script[data-youtube-api]');
    const previousReadyHandler = ytWindow.onYouTubeIframeAPIReady;
    const onYoutubeReady = () => {
      previousReadyHandler?.();
      createPlayer();
    };
    if (ytWindow.YT?.Player) createPlayer();
    else {
      ytWindow.onYouTubeIframeAPIReady = onYoutubeReady;
      if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.dataset.youtubeApi = 'true';
      document.head.appendChild(script);
      }
    }

    return () => {
      cancelled = true;
      stopYoutubeTracking();
      ytPlayerRef.current?.destroy();
      ytPlayerRef.current = null;
      if (ytWindow.onYouTubeIframeAPIReady === onYoutubeReady) ytWindow.onYouTubeIframeAPIReady = previousReadyHandler;
    };
  }, [activeVideo, handleVideoEnded, observePosition, persistProgress, stopYoutubeTracking]);

  const getProgress = useCallback((videoId: string) => progress.find((item) => item.videoId === videoId), [progress]);
  const hasPassedTest = (video: OnboardingVideo, item?: VideoProgress) => !video.testQuestions?.length || Boolean(item?.testFinished && item.scorePercentage >= 60);
  const isCourseStepComplete = (video: OnboardingVideo, item?: VideoProgress) => Boolean(item?.isCompleted && hasPassedTest(video, item));
  const visibleVideos = videos.filter((video) => (video.track || 'SOFT_SKILLS') === activeTrack);
  const isVideoLocked = (index: number) => index > 0 && !isCourseStepComplete(visibleVideos[index - 1], getProgress(visibleVideos[index - 1]._id));
  const courseProgress = visibleVideos.length ? Math.round((visibleVideos.filter((video) => isCourseStepComplete(video, getProgress(video._id))).length / visibleVideos.length) * 100) : 0;

  const openVideo = (video: OnboardingVideo) => {
    const saved = getProgress(video._id) || null;
    allowedPositionRef.current = saved?.watchedSeconds || 0;
    lastSavedPositionRef.current = saved?.resumePosition || 0;
    initialResumePositionRef.current = saved?.resumePosition || 0;
    didRestoreNativePositionRef.current = false;
    setPlayerError('');
    setIsPlaying(false);
    setCurrentPosition(saved?.resumePosition || 0);
    setTestAnswers([]);
    setTestResult(null);
    setShowTest(false);
    setActiveProgress(saved);
    setActiveVideo(video);
  };

  const closeVideo = async () => {
    const currentPosition = activeVideo?.youtubeUrl ? ytPlayerRef.current?.getCurrentTime() : videoRef.current?.currentTime;
    if (typeof currentPosition === 'number') await persistProgress(currentPosition);
    setActiveVideo(null);
    setShowTest(false);
    setTestResult(null);
  };

  const restoreNativePosition = (player: HTMLVideoElement) => {
    if (didRestoreNativePositionRef.current || !Number.isFinite(player.duration)) return;
    const resumePosition = Math.min(initialResumePositionRef.current, Math.max(0, player.duration - 0.25));
    didRestoreNativePositionRef.current = true;
    if (resumePosition > 0) player.currentTime = resumePosition;
    setCurrentPosition(resumePosition);
  };

  const togglePlayback = () => {
    if (activeVideo?.youtubeUrl) {
      if (isPlaying) ytPlayerRef.current?.pauseVideo();
      else ytPlayerRef.current?.playVideo();
      return;
    }
    if (!videoRef.current) return;
    if (videoRef.current.paused) void videoRef.current.play();
    else videoRef.current.pause();
  };

  const rewindVideo = () => {
    const target = Math.max(0, currentPosition - 10);
    if (activeVideo?.youtubeUrl) ytPlayerRef.current?.seekTo(target, true);
    else if (videoRef.current) videoRef.current.currentTime = target;
    setCurrentPosition(target);
  };

  const handleFinishTest = async () => {
    if (!activeVideo || !activeVideo.testQuestions || testAnswers.length !== activeVideo.testQuestions.length) return;
    setSubmittingTest(true);
    try {
      const saved = await onboardingService.submitTest(activeVideo._id, testAnswers) as VideoProgress;
      updateProgressState(saved);
      setTestResult({ score: saved.testScore, percentage: saved.scorePercentage });
    } catch (error) {
      setPlayerError(error instanceof Error ? error.message : 'Test natijasini saqlab bo‘lmadi.');
    } finally {
      setSubmittingTest(false);
    }
  };

  if (loading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  if (isAdmin) return <OnboardingAdminPage />;
  if (loadError) return <div className="mx-auto max-w-xl space-y-4 rounded-2xl border border-red-100 bg-red-50 p-6 text-center"><p className="text-sm font-semibold text-red-700">{loadError}</p><Button onClick={() => void loadData()}>Qayta urinish</Button></div>;

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12 md:space-y-8">
      {!activeVideo ? (
        <>
          <header className="flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center rounded-full bg-primary/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">Sizning o‘quv yo‘lingiz</div>
              <h1 className="text-3xl font-bold tracking-tight text-dark">{trackMeta.label}</h1>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-gray-500">{trackMeta.description}</p>
            </div>
            <div className="w-full sm:w-48">
              <div className="mb-2 flex justify-between text-xs font-bold text-gray-500"><span>Kurs jarayoni</span><span>{courseProgress}%</span></div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full bg-primary transition-[width] duration-300" style={{ width: `${courseProgress}%` }} /></div>
            </div>
          </header>

          {visibleVideos.length ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleVideos.map((video, index) => {
              const item = getProgress(video._id);
              const locked = isVideoLocked(index);
              const watchedPercent = video.duration ? Math.min(100, Math.round(((item?.watchedSeconds || 0) / video.duration) * 100)) : 0;
              const passed = hasPassedTest(video, item);
              return <button key={video._id} type="button" disabled={locked} onClick={() => openVideo(video)} className={`group overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition-colors ${locked ? 'cursor-not-allowed border-gray-200 opacity-60' : 'border-gray-200 hover:border-primary/40'}`}>
                <div className="relative aspect-video overflow-hidden bg-gray-100">
                  <img src={getPosterUrl(video)} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                  <div className="absolute inset-0 bg-black/15" />
                  {locked ? <div className="absolute inset-0 grid place-items-center bg-black/40"><Lock className="h-7 w-7 text-white" /></div> : isCourseStepComplete(video, item) ? <div className="absolute right-3 top-3 rounded-full bg-emerald-500 p-1.5 text-white"><CheckCircle2 className="h-4 w-4" /></div> : <div className="absolute inset-0 grid place-items-center"><span className="grid h-12 w-12 place-items-center rounded-full bg-white/95 text-primary shadow-sm"><Play className="ml-0.5 h-5 w-5 fill-current" /></span></div>}
                  <span className="absolute bottom-3 right-3 rounded-lg bg-black/70 px-2 py-1 text-[10px] font-bold text-white">{formatDuration(video.duration)}</span>
                </div>
                <div className="space-y-3 p-5">
                  <h2 className="line-clamp-2 text-base font-bold leading-snug text-dark">{video.title}</h2>
                  <div className="space-y-1.5"><div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-gray-500"><span>{video.testQuestions?.length ? (passed ? 'Test topshirildi' : 'Video va test') : 'Video jarayoni'}</span><span>{watchedPercent}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-gray-100"><div className={`h-full ${passed ? 'bg-emerald-500' : 'bg-primary'}`} style={{ width: `${watchedPercent}%` }} /></div></div>
                </div>
              </button>;
            })}
          </div> : <div className="rounded-2xl border border-gray-200 bg-white py-20 text-center"><VideoIcon className="mx-auto h-10 w-10 text-gray-300" /><p className="mt-3 text-sm font-medium text-gray-500">Siz uchun hozircha video biriktirilmagan.</p></div>}
        </>
      ) : (
        <div className="space-y-5">
          <button type="button" onClick={() => void closeVideo()} className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 transition-colors hover:text-dark"><ArrowLeft className="h-4 w-4" /> Kursga qaytish</button>
          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {!showTest ? <>
              <div className="relative aspect-video bg-black" onContextMenu={(event) => event.preventDefault()}>
                {activeVideo.youtubeUrl ? <div id="yt-player" className="h-full w-full" /> : <video ref={videoRef} src={activeVideo.cloudinaryUrl} className="h-full w-full" onLoadedMetadata={(event) => restoreNativePosition(event.currentTarget)} onCanPlay={(event) => restoreNativePosition(event.currentTarget)} onPlay={(event) => { setIsPlaying(true); void persistProgress(event.currentTarget.currentTime); }} onPause={(event) => { setIsPlaying(false); void persistProgress(event.currentTarget.currentTime); }} onSeeking={(event) => { if (event.currentTarget.currentTime > allowedPositionRef.current + SEEK_TOLERANCE_SECONDS) event.currentTarget.currentTime = allowedPositionRef.current; }} onTimeUpdate={(event) => { observePosition(event.currentTarget.currentTime); }} onRateChange={(event) => { if (event.currentTarget.playbackRate !== 1) event.currentTarget.playbackRate = 1; }} onEnded={() => { void handleVideoEnded(); }} />}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent px-4 pb-4 pt-10 text-white"><div className="flex items-center gap-2"><button type="button" onClick={rewindVideo} className="grid h-9 w-9 place-items-center rounded-full bg-white/15 transition-colors hover:bg-white/25" aria-label="10 soniya orqaga"><RotateCcw className="h-4 w-4" /></button><button type="button" onClick={togglePlayback} className="grid h-10 w-10 place-items-center rounded-full bg-white text-dark transition-transform hover:scale-105" aria-label={isPlaying ? 'Pauza' : 'Ko‘rishni boshlash'}>{isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="ml-0.5 h-4 w-4 fill-current" />}</button></div><span className="text-xs font-bold tabular-nums">{formatDuration(currentPosition)} / {formatDuration(activeVideo.duration)}</span></div>
              </div>
              <div className="space-y-5 p-6 md:p-8"><div className="flex flex-col justify-between gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-start"><div><h1 className="text-2xl font-bold tracking-tight text-dark">{activeVideo.title}</h1><p className="mt-2 text-sm leading-relaxed text-gray-500">Videoni oldinga o‘tkazish cheklangan. Orqaga qaytish va avval ko‘rilgan qismni qayta ko‘rish mumkin.</p></div>{activeVideo.testQuestions?.length ? activeProgress?.isCompleted ? <Button variant="outline" className="shrink-0" icon={<FileText className="h-4 w-4" />} onClick={() => setShowTest(true)}>Testni boshlash</Button> : <span className="group relative inline-flex shrink-0" title="Avval videoni to‘liq tomosha qiling"><Button disabled variant="outline" className="shrink-0" icon={<FileText className="h-4 w-4" />}>Testni boshlash</Button><span role="tooltip" className="pointer-events-none absolute bottom-[calc(100%+8px)] right-0 z-10 w-56 rounded-lg bg-dark px-3 py-2 text-center text-xs font-medium leading-snug text-white opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">Avval videoni to‘liq tomosha qiling.</span></span> : null}</div><p className="text-sm leading-relaxed text-gray-600">{activeVideo.description}</p>{playerError ? <p role="status" className="rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">{playerError}</p> : null}</div>
            </> : <div className="space-y-7 p-6 md:p-10"><div className="text-center"><h1 className="text-2xl font-bold text-dark">Video bo‘yicha test</h1><p className="mt-1 text-sm text-gray-500">Natija serverda hisoblanadi. O‘tish bali — 60%.</p></div>{!testResult ? <><div className="space-y-6">{activeVideo.testQuestions?.map((question, questionIndex) => <fieldset key={questionIndex} className="space-y-3"><legend className="flex items-start gap-3 text-base font-bold text-dark"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary text-xs text-white">{questionIndex + 1}</span>{question.question}</legend><div className="grid gap-2 sm:grid-cols-2">{question.options.map((option, optionIndex) => <button key={optionIndex} type="button" onClick={() => setTestAnswers((current) => { const next = [...current]; next[questionIndex] = optionIndex; return next; })} className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-colors ${testAnswers[questionIndex] === optionIndex ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>{option}</button>)}</div></fieldset>)}</div><Button className="w-full" isLoading={submittingTest} disabled={testAnswers.length !== activeVideo.testQuestions?.length} onClick={() => void handleFinishTest()}>Natijani ko‘rish</Button></> : <div className="space-y-5 py-8 text-center"><div className={`mx-auto grid h-16 w-16 place-items-center rounded-full ${testResult.percentage >= 60 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>{testResult.percentage >= 60 ? <CheckCircle2 className="h-8 w-8" /> : <X className="h-8 w-8" />}</div><div><h2 className="text-xl font-bold text-dark">{testResult.percentage >= 60 ? 'Test topshirildi' : 'Qayta urinib ko‘ring'}</h2><p className="mt-1 text-sm text-gray-500">Sizning natijangiz: <strong className="text-dark">{testResult.percentage}%</strong></p></div><div className="flex flex-col justify-center gap-3 sm:flex-row"><Button variant="secondary" onClick={() => { setTestAnswers([]); setTestResult(null); }}>Qayta topshirish</Button>{testResult.percentage >= 60 ? <Button onClick={() => void closeVideo()}>Kursga qaytish</Button> : null}</div></div>}</div>}
          </section>
        </div>
      )}
    </div>
  );
}
