'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Upload, 
  Trash2, 
  Edit2,
  FileText, 
  CheckCircle2, 
  Plus, 
  X,
  Loader2,
  Video as VideoIcon,
  ArrowLeft,
  Play
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { onboardingService } from '@/services/onboardingService';
import { ONBOARDING_TRACKS, ONBOARDING_TRACK_META, type OnboardingTrack } from '@/lib/onboarding';

type LearnerProgress = {
  _id: string;
  name: string;
  department: string;
  track: OnboardingTrack;
  assignedVideos: number;
  watchedVideos: number;
  completedVideos: number;
  courseProgress: number;
  avgTestScore: number | null;
  testAttempts: number;
  lastActivity: string | null;
};
type ProgressSummary = {
  totalEmployees: number;
  averageCourseProgress: number;
  completedCourses: number;
};
type TrackSummaries = Record<OnboardingTrack, ProgressSummary>;
type TestQuestionForm = { question: string; options: string[]; correctAnswer: number };
type OnboardingVideo = {
  _id: string;
  title: string;
  description?: string;
  youtubeUrl?: string;
  cloudinaryUrl?: string;
  publicId?: string;
  coverImageUrl?: string;
  coverImagePublicId?: string;
  duration: number;
  track?: OnboardingTrack;
  departments?: string[];
  testQuestions?: TestQuestionForm[];
};
type VideoForm = {
  title: string;
  description: string;
  youtubeUrl: string;
  duration: number;
  track: OnboardingTrack;
  departments: string[];
  testQuestions: TestQuestionForm[];
  coverImageUrl: string;
  coverImagePublicId: string;
};
type VideoPayload = VideoForm & { cloudinaryUrl?: string; publicId?: string };
type YoutubeDurationPlayer = {
  getDuration: () => number;
  destroy: () => void;
};
type YoutubeApiWindow = Window & {
  YT?: { Player: new (element: HTMLElement, options: object) => YoutubeDurationPlayer };
  onYouTubeIframeAPIReady?: () => void;
};

const getYoutubeVideoId = (value: string) => {
  try {
    const url = new URL(value);
    const hostname = url.hostname.replace(/^www\./, '');
    const id = hostname === 'youtu.be'
      ? url.pathname.split('/').filter(Boolean)[0] || ''
      : hostname.endsWith('youtube.com')
        ? url.searchParams.get('v') || url.pathname.split('/').filter(Boolean).at(-1) || ''
        : '';
    return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : '';
  } catch {
    return '';
  }
};

const loadYoutubeIframeApi = () => new Promise<NonNullable<YoutubeApiWindow['YT']>>((resolve, reject) => {
  const youtubeWindow = window as YoutubeApiWindow;
  if (youtubeWindow.YT?.Player) {
    resolve(youtubeWindow.YT);
    return;
  }

  const previousReadyHandler = youtubeWindow.onYouTubeIframeAPIReady;
  const timeout = window.setTimeout(() => reject(new Error('YouTube player yuklanmadi')), 15000);
  youtubeWindow.onYouTubeIframeAPIReady = () => {
    previousReadyHandler?.();
    window.clearTimeout(timeout);
    if (youtubeWindow.YT?.Player) resolve(youtubeWindow.YT);
    else reject(new Error('YouTube player yuklanmadi'));
  };

  if (!document.querySelector('script[data-admin-youtube-api]')) {
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.dataset.adminYoutubeApi = 'true';
    script.onerror = () => {
      window.clearTimeout(timeout);
      reject(new Error('YouTube player yuklanmadi'));
    };
    document.head.appendChild(script);
  }
});

const getYoutubeDuration = async (url: string) => {
  const videoId = getYoutubeVideoId(url);
  if (!videoId) throw new Error('YouTube havolasi noto‘g‘ri');

  const YT = await loadYoutubeIframeApi();
  return new Promise<number>((resolve, reject) => {
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;pointer-events:none;';
    document.body.appendChild(container);
    let player: YoutubeDurationPlayer | null = null;
    const timeout = window.setTimeout(() => finish(new Error('Video davomiyligini olib bo‘lmadi')), 15000);

    const finish = (result: number | Error) => {
      window.clearTimeout(timeout);
      player?.destroy();
      container.remove();
      if (typeof result === 'number') resolve(result);
      else reject(result);
    };

    player = new YT.Player(container, {
      videoId,
      playerVars: { controls: 0, rel: 0 },
      events: {
        onReady: (event: { target: YoutubeDurationPlayer }) => {
          const duration = Math.round(event.target.getDuration());
          finish(duration > 0 ? duration : new Error('Video davomiyligini olib bo‘lmadi'));
        },
        onError: () => finish(new Error('YouTube videosini ochib bo‘lmadi')),
      },
    });
  });
};

export default function OnboardingAdminPage() {
  const searchParams = useSearchParams();
  const requestedView = searchParams.get('view');
  const selectedTrack = ONBOARDING_TRACKS.includes(requestedView as OnboardingTrack) ? requestedView as OnboardingTrack : null;
  const isOverview = !selectedTrack;
  const [videos, setVideos] = useState<OnboardingVideo[]>([]);
  const [learners, setLearners] = useState<LearnerProgress[]>([]);
  const [progressSummary, setProgressSummary] = useState<ProgressSummary | null>(null);
  const [trackSummaries, setTrackSummaries] = useState<TrackSummaries | null>(null);
  const [progressLoading, setProgressLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null);
  const [editingVideo, setEditingVideo] = useState<OnboardingVideo | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [playingVideo, setPlayingVideo] = useState<OnboardingVideo | null>(null);

  // Form State
  const [formData, setFormData] = useState<VideoForm>({
    title: '',
    description: '',
    youtubeUrl: '',
    duration: 0,
    track: 'SOFT_SKILLS' as OnboardingTrack,
    departments: ['All'] as string[],
    testQuestions: [],
    coverImageUrl: '',
    coverImagePublicId: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState('');
  const [isFetchingYoutube, setIsFetchingYoutube] = useState(false);
  const [youtubeInfoMessage, setYoutubeInfoMessage] = useState('');
  const youtubeLookupIdRef = useRef(0);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const data = await onboardingService.getVideos();
      setVideos(data as OnboardingVideo[]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadLearnerProgress = async () => {
    try {
      setProgressLoading(true);
      const response = await fetch('/api/onboarding/progress/admin');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Progress yuklanmadi');
      setLearners(data.learners || []);
      setProgressSummary(data.summary || null);
      setTrackSummaries(data.trackSummaries || null);
    } catch (error) {
      console.error(error);
    } finally {
      setProgressLoading(false);
    }
  };

  useEffect(() => {
    void loadVideos();
    void loadLearnerProgress();
  }, []);

  const formatDuration = (seconds: number) => {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPosterUrl = (video: OnboardingVideo) => {
    if (video.coverImageUrl) return video.coverImageUrl;
    if (video.youtubeUrl) {
      try {
        let videoId = '';
        const url = video.youtubeUrl;
        if (url.includes('v=')) {
          videoId = url.split('v=')[1].split('&')[0];
        } else if (url.includes('youtu.be/')) {
          videoId = url.split('youtu.be/')[1].split('?')[0];
        } else {
          videoId = url.split('/').pop() || '';
        }
        // hqdefault is more reliable than maxresdefault
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      } catch {
        return "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop";
      }
    }
    if (video.cloudinaryUrl) {
      return video.cloudinaryUrl.replace('/upload/', '/upload/so_30/').replace(/\.[^/.]+$/, ".jpg");
    }
    return "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop";
  };

  const handleOpenForm = (video?: OnboardingVideo) => {
    if (video) {
      setEditingVideo(video);
      setFormData({
        title: video.title,
        description: video.description || '',
        youtubeUrl: video.youtubeUrl || '',
        duration: video.duration || 0,
        track: video.track || 'SOFT_SKILLS',
        departments: video.departments || ['All'],
        testQuestions: video.testQuestions || [],
        coverImageUrl: video.coverImageUrl || '',
        coverImagePublicId: video.coverImagePublicId || '',
      });
    } else {
      setEditingVideo(null);
      setFormData({ title: '', description: '', youtubeUrl: '', duration: 0, track: selectedTrack || 'SOFT_SKILLS', departments: ['All'], testQuestions: [], coverImageUrl: '', coverImagePublicId: '' });
    }
    setSelectedFile(null);
    setSelectedCoverFile(null);
    setYoutubeInfoMessage('');
    setCoverPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return '';
    });
    setIsModalOpen(true);
  };

  const handleCoverSelection = (file: File | null) => {
    setSelectedCoverFile(file);
    setCoverPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return file ? URL.createObjectURL(file) : '';
    });
  };

  const handleAddTest = () => {
    setFormData(prev => ({
      ...prev,
      testQuestions: [...prev.testQuestions, { question: '', options: ['', '', '', ''], correctAnswer: 0 }]
    }));
  };

  const handleTestChange = (index: number, field: 'question' | 'correctAnswer', value: string | number) => {
    setFormData((current) => ({
      ...current,
      testQuestions: current.testQuestions.map((question, questionIndex) => questionIndex === index
        ? field === 'question'
          ? { ...question, question: String(value) }
          : { ...question, correctAnswer: Number(value) }
        : question),
    }));
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, text: string) => {
    setFormData((current) => ({
      ...current,
      testQuestions: current.testQuestions.map((question, index) => index === questionIndex
        ? { ...question, options: question.options.map((option, currentOptionIndex) => currentOptionIndex === optionIndex ? text : option) }
        : question),
    }));
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const videoData: VideoPayload = {
        title: formData.title,
        description: formData.description,
        youtubeUrl: formData.youtubeUrl,
        duration: formData.duration,
        track: formData.track,
        departments: formData.track === 'SALES' ? ['Sales'] : ['All'],
        testQuestions: formData.testQuestions,
        coverImageUrl: formData.coverImageUrl,
        coverImagePublicId: formData.coverImagePublicId,
      };

      if (selectedFile) {
        setUploading(true);
        // 1. Cloudinary'ga to'g'ridan-to'g'ri yuklash
        const cloudinaryRes = await onboardingService.uploadToCloudinary(selectedFile, (p) => setUploadProgress(p));
        
        videoData.cloudinaryUrl = cloudinaryRes.secure_url;
        videoData.publicId = cloudinaryRes.public_id;
        videoData.duration = Math.round(cloudinaryRes.duration || 0);
      }

      if (selectedCoverFile) {
        const coverRes = await onboardingService.uploadImageToCloudinary(selectedCoverFile, 'najot-hr-onboarding-covers');
        videoData.coverImageUrl = coverRes.secure_url;
        videoData.coverImagePublicId = coverRes.public_id;
      }

      if (!videoData.youtubeUrl && !videoData.cloudinaryUrl && !selectedFile) {
        return alert("Video fayl yoki YouTube link kiriting!");
      }

      // 2. Ma'lumotlarni bazaga saqlash
      if (editingVideo) {
        await onboardingService.updateVideo(editingVideo._id, videoData);
      } else {
        await onboardingService.saveVideoData(videoData);
      }
      
      setIsModalOpen(false);
      loadVideos();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Saqlashda xatolik yuz berdi');
    } finally {
      setUploading(false);
      setActionLoading(false);
      setUploadProgress(0);
      setSelectedFile(null);
      setSelectedCoverFile(null);
      setCoverPreviewUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return '';
      });
    }
  };

  const [actionLoading, setActionLoading] = useState(false);

  const fetchYoutubeInfo = useCallback(async (url: string) => {
    const normalizedUrl = url.trim();
    if (!normalizedUrl) return;
    if (!getYoutubeVideoId(normalizedUrl)) {
      setYoutubeInfoMessage('YouTube havolasini to‘liq va to‘g‘ri kiriting. Davomiylikni zarur bo‘lsa qo‘lda kiritishingiz mumkin.');
      return;
    }

    const lookupId = ++youtubeLookupIdRef.current;
    setIsFetchingYoutube(true);
    setYoutubeInfoMessage('YouTube ma’lumotlari olinmoqda…');
    try {
      const [infoResult, durationResult] = await Promise.allSettled([
        fetch(`/api/youtube/info?url=${encodeURIComponent(normalizedUrl)}`).then(async (response) => {
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || 'Video sarlavhasini olib bo‘lmadi');
          return typeof data.title === 'string' ? data.title : '';
        }),
        getYoutubeDuration(normalizedUrl),
      ]);
      if (lookupId !== youtubeLookupIdRef.current) return;

      const title = infoResult.status === 'fulfilled' ? infoResult.value : '';
      const duration = durationResult.status === 'fulfilled' ? durationResult.value : 0;

      if (title || duration) {
        setFormData((current) => current.youtubeUrl.trim() === normalizedUrl ? {
          ...current,
          title: current.title || title,
          duration: duration || current.duration,
        } : current);
      }

      setYoutubeInfoMessage(duration
        ? 'Davomiylik avtomatik olindi. Sarlavhani tekshirib, kerak bo‘lsa tahrirlang.'
        : 'Davomiylikni olib bo‘lmadi. Davomiylikni sekundlarda qo‘lda kiriting.');
    } catch {
      if (lookupId === youtubeLookupIdRef.current) {
        setYoutubeInfoMessage('YouTube ma’lumotlarini olib bo‘lmadi. Davomiylikni sekundlarda qo‘lda kiriting.');
      }
    } finally {
      if (lookupId === youtubeLookupIdRef.current) setIsFetchingYoutube(false);
    }
  }, []);

  useEffect(() => {
    if (!isModalOpen || !formData.youtubeUrl.trim()) return;
    const timer = window.setTimeout(() => void fetchYoutubeInfo(formData.youtubeUrl), 700);
    return () => window.clearTimeout(timer);
  }, [fetchYoutubeInfo, formData.youtubeUrl, isModalOpen]);

  const confirmDelete = async () => {
    if (!videoToDelete) return;
    setActionLoading(true);
    try {
      await onboardingService.deleteVideo(videoToDelete);
      setIsDeleteModalOpen(false);
      loadVideos();
    } catch {
      alert("O'chirishda xatolik");
    } finally {
      setActionLoading(false);
      setVideoToDelete(null);
    }
  };

  const getYoutubeEmbedUrl = (url: string) => {
    let videoId = '';
    if (url.includes('v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    } else {
      videoId = url.split('/').pop() || '';
    }
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const visibleVideos = selectedTrack ? videos.filter((video) => (video.track || 'SOFT_SKILLS') === selectedTrack) : videos;
  const visibleLearners = selectedTrack ? learners.filter((learner) => learner.track === selectedTrack) : learners;
  const visibleSummary = selectedTrack ? trackSummaries?.[selectedTrack] : progressSummary;
  const viewTitle = selectedTrack ? ONBOARDING_TRACK_META[selectedTrack].label : 'Umumiy ko‘rinish';
  const viewDescription = selectedTrack
    ? ONBOARDING_TRACK_META[selectedTrack].description
    : 'Barcha o‘quv yo‘llari, videolar va xodimlar natijasi bir joyda.';

  if (playingVideo) {
    return (
      <div className="space-y-4 md:space-y-6">
        <button onClick={() => setPlayingVideo(null)} className="flex items-center gap-2 text-gray-400 hover:text-primary font-black uppercase text-[10px] px-1">
          <ArrowLeft className="h-4 w-4" /> Orqaga
        </button>
        <div className="max-w-5xl mx-auto bg-white rounded-xl overflow-hidden shadow-2xl border border-gray-100 mx-1">
          {playingVideo.youtubeUrl ? (
            <iframe 
              src={getYoutubeEmbedUrl(playingVideo.youtubeUrl)} 
              className="w-full aspect-video bg-black border-none" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            />
          ) : (
            <video src={playingVideo.cloudinaryUrl} className="w-full aspect-video bg-black" controls autoPlay />
          )}
          <div className="p-8 md:p-10 border-t border-gray-50">
             <h2 className="text-2xl md:text-3xl font-bold text-dark leading-tight">{playingVideo.title}</h2>
             <p className="text-gray-500 mt-4 text-base md:text-lg leading-relaxed">{playingVideo.description}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 md:flex-row md:items-end md:justify-between">
        <div className="px-1">
          <h1 className="text-2xl font-bold tracking-tight text-dark md:text-3xl">Onboarding markazi</h1>
          <p className="mt-1 text-xs text-gray-500 md:text-sm">{viewDescription}</p>
        </div>
        {!isOverview && <Button className="h-11 text-sm" icon={<Upload className="h-4 w-4" />} onClick={() => handleOpenForm()}>Video yuklash</Button>}
      </div>

      <nav aria-label="Onboarding yo‘nalishlari" className="flex gap-2 overflow-x-auto border-b border-gray-200 pb-1">
        <Link href="/dashboard/onboarding?view=overview" className={`shrink-0 rounded-lg px-3 py-2 text-xs font-bold transition-colors ${isOverview ? 'bg-dark text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-dark'}`}>Umumiy ko‘rinish</Link>
        {ONBOARDING_TRACKS.map((track) => <Link key={track} href={`/dashboard/onboarding?view=${track}`} className={`shrink-0 rounded-lg px-3 py-2 text-xs font-bold transition-colors ${selectedTrack === track ? 'bg-primary text-white' : 'text-gray-500 hover:bg-primary/5 hover:text-primary'}`}>{ONBOARDING_TRACK_META[track].label}</Link>)}
      </nav>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="text-lg font-bold text-dark">{isOverview ? 'Xodimlar o‘quv jarayoni' : `${viewTitle}: xodimlar holati`}</h2><p className="mt-1 text-xs text-gray-500">Foiz video to‘liq ko‘rilib, testli darslarda kamida 60% natija olingandan keyingina oshadi.</p></div>
          <button type="button" onClick={() => void loadLearnerProgress()} className="text-xs font-bold text-primary hover:underline">Yangilash</button>
        </div>
        <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
          <div className="p-4 text-center"><p className="text-xl font-bold text-dark">{progressLoading ? '—' : visibleSummary?.totalEmployees || 0}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">Xodim</p></div>
          <div className="p-4 text-center"><p className="text-xl font-bold text-dark">{progressLoading ? '—' : `${visibleSummary?.averageCourseProgress || 0}%`}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">O‘rtacha jarayon</p></div>
          <div className="p-4 text-center"><p className="text-xl font-bold text-dark">{progressLoading ? '—' : visibleSummary?.completedCourses || 0}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">Kursni tugatgan</p></div>
        </div>
        <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left"><thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-400"><tr><th className="px-5 py-3">Xodim</th><th className="px-5 py-3">Darslar</th><th className="px-5 py-3">Jarayon</th><th className="px-5 py-3">Test</th><th className="px-5 py-3">Oxirgi faollik</th></tr></thead><tbody className="divide-y divide-gray-100">{progressLoading ? <tr><td colSpan={5} className="px-5 py-10 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-primary" /></td></tr> : visibleLearners.length ? visibleLearners.map((learner) => <tr key={learner._id} className="text-sm"><td className="px-5 py-4"><p className="font-bold text-dark">{learner.name}</p><p className="mt-0.5 text-xs text-gray-500">{learner.department}</p></td><td className="px-5 py-4 text-gray-600">{learner.completedVideos}/{learner.assignedVideos} yakunlangan</td><td className="px-5 py-4"><div className="flex min-w-32 items-center gap-2"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-primary" style={{ width: `${learner.courseProgress}%` }} /></div><span className="text-xs font-bold text-dark">{learner.courseProgress}%</span></div></td><td className="px-5 py-4 text-gray-600">{learner.avgTestScore === null ? '—' : `${learner.avgTestScore}%`} <span className="text-xs text-gray-400">({learner.testAttempts} urinish)</span></td><td className="px-5 py-4 text-xs text-gray-500">{learner.lastActivity ? new Intl.DateTimeFormat('uz-UZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(learner.lastActivity)) : 'Hali boshlamagan'}</td></tr>) : <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-500">Bu yo‘nalishda xodimlar hali yo‘q.</td></tr>}</tbody></table></div>
      </section>

      <div className="flex items-center justify-between gap-4"><div><h2 className="text-lg font-bold text-dark">{isOverview ? 'Barcha videolar' : `${viewTitle} videolari`}</h2><p className="mt-1 text-xs text-gray-500">{isOverview ? 'Yo‘nalishlar kesimida barcha materiallar.' : 'Ushbu rolga biriktirilgan xodimlargina ko‘ra oladi.'}</p></div>{isOverview && <Button className="hidden h-10 text-xs sm:inline-flex" icon={<Upload className="h-4 w-4" />} onClick={() => handleOpenForm()}>Video yuklash</Button>}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center"><Loader2 className="h-10 w-10 text-primary animate-spin mx-auto" /></div>
        ) : visibleVideos.length > 0 ? (
          visibleVideos.map((video) => (
            <div key={video._id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden group hover:shadow-md transition-all duration-300">
              <div className="aspect-video relative cursor-pointer overflow-hidden" onClick={() => setPlayingVideo(video)}>
                <img src={getPosterUrl(video)} alt={video.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg scale-90 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all duration-300">
                     <Play className="text-primary h-5 w-5 fill-primary ml-1" />
                   </div>
                </div>
                {video.duration > 0 && (
                  <div className="absolute bottom-3 right-3 px-2 py-1 bg-dark/70 backdrop-blur-sm text-white text-[10px] font-bold rounded-lg border border-white/20">
                    {formatDuration(video.duration)}
                  </div>
                )}
              </div>
              <div className="p-5 space-y-4">
                <div className="flex flex-wrap gap-1.5"><span className="rounded border border-primary/15 bg-primary/5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">{ONBOARDING_TRACK_META[(video.track || 'SOFT_SKILLS') as OnboardingTrack].label}</span></div>
                <h3 className="font-bold text-dark text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                  {video.title}
                </h3>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-gray-500">
                    <FileText className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-tight">{video.testQuestions?.length || 0} ta savol</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={(e) => { e.stopPropagation(); handleOpenForm(video); }} className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setVideoToDelete(video._id); setIsDeleteModalOpen(true); }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full rounded-xl border border-dashed border-gray-200 py-16 text-center"><VideoIcon className="mx-auto mb-4 h-10 w-10 text-gray-200 md:h-12 md:w-12" /><p className="text-sm font-semibold text-gray-500">Bu yo‘nalishda hali video yo‘q.</p>{!isOverview && <button type="button" onClick={() => handleOpenForm()} className="mt-3 text-xs font-bold text-primary hover:underline">Birinchi videoni yuklash</button>}</div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingVideo ? 'Videoni tahrirlash' : 'Yangi video qo\'shish'} maxWidth="max-w-3xl">
        <form onSubmit={handleUpload} className="space-y-6 overflow-y-auto max-h-[75vh] px-1 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">YouTube havolasi</label>
                {formData.youtubeUrl && !isFetchingYoutube && <button
                  type="button"
                  onClick={() => void fetchYoutubeInfo(formData.youtubeUrl)}
                  className="text-[10px] font-bold text-primary hover:text-primary/80 hover:underline"
                >
                  Qayta olish
                </button>}
              </div>
              <input
                className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary outline-none font-semibold text-dark text-sm"
                placeholder="https://www.youtube.com/watch?v=..."
                value={formData.youtubeUrl}
                onChange={(e) => {
                  youtubeLookupIdRef.current += 1;
                  setYoutubeInfoMessage('');
                  setFormData((current) => ({ ...current, youtubeUrl: e.target.value, duration: 0 }));
                }}
              />
              {(isFetchingYoutube || youtubeInfoMessage) && <p className={`flex items-center gap-1.5 text-[11px] leading-4 ${isFetchingYoutube ? 'text-primary' : formData.duration > 0 ? 'text-emerald-600' : 'text-amber-700'}`}>
                {isFetchingYoutube && <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />}
                {isFetchingYoutube ? 'Sarlavha va davomiylik avtomatik olinmoqda…' : youtubeInfoMessage}
              </p>}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Davomiyligi (sekund)</label>
                <span className="text-[10px] font-medium text-gray-400">Avtomatik to‘ldiriladi</span>
              </div>
              <input
                type="number"
                min="1"
                className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary outline-none font-semibold text-dark text-sm"
                placeholder="Masalan, 300"
                value={formData.duration || ''}
                onChange={(e) => {
                  setYoutubeInfoMessage(e.target.value ? 'Davomiylik qo‘lda kiritildi.' : '');
                  setFormData((current) => ({ ...current, duration: parseInt(e.target.value, 10) || 0 }));
                }}
              />
            </div>
          </div>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
              <span className="bg-white px-4 text-gray-400">Yoki Fayl Yuklash</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${selectedFile ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary'}`}>
              <input type="file" accept="video/*" className="hidden" id="video-upload" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
              <label htmlFor="video-upload" className="cursor-pointer block">
                <Upload className={`h-8 w-8 mx-auto mb-2 ${selectedFile ? 'text-primary' : 'text-gray-400'}`} />
                <p className="font-bold text-dark uppercase text-[10px] tracking-widest truncate max-w-[250px] mx-auto">
                  {selectedFile ? selectedFile.name : 'Video faylni tanlang'}
                </p>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Cover rasmi</label>
              {(coverPreviewUrl || formData.coverImageUrl) && <span className="text-[10px] font-medium text-emerald-600">Yuklashga tayyor</span>}
            </div>
            <div className="flex flex-col gap-3 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-3 sm:flex-row sm:items-center">
              <div className="h-24 w-full shrink-0 overflow-hidden rounded-lg bg-gray-200 sm:w-40">
                {coverPreviewUrl || formData.coverImageUrl ? <img src={coverPreviewUrl || formData.coverImageUrl} alt="Cover preview" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-center text-[10px] font-bold uppercase tracking-wider text-gray-400">Cover yo‘q</div>}
              </div>
              <div className="min-w-0 flex-1">
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" id="cover-upload" onChange={(e) => handleCoverSelection(e.target.files?.[0] || null)} />
                <label htmlFor="cover-upload" className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-xs font-bold text-dark transition-colors hover:border-primary hover:text-primary">
                  <Upload className="h-4 w-4" /> {selectedCoverFile ? 'Boshqa rasm tanlash' : 'Cover rasm yuklash'}
                </label>
                <p className="mt-2 truncate text-xs text-gray-500">{selectedCoverFile?.name || 'JPG, PNG yoki WEBP. Tavsiya: 16:9 format.'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Sarlavha</label>
              <input required className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary outline-none font-semibold text-dark text-sm" placeholder="Sarlavha" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Tavsif</label>
              <textarea className="w-full p-4 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary outline-none font-medium text-dark resize-none text-sm" placeholder="Tavsif" rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </div>
          </div>
          
          <div className="rounded-xl border border-primary/15 bg-primary/[0.03] p-4">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">O‘quv yo‘nalishi</label>
            <select value={formData.track} onChange={(event) => setFormData((current) => ({ ...current, track: event.target.value as OnboardingTrack }))} className="mt-2 h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-dark outline-none transition-colors focus:border-primary">
              {ONBOARDING_TRACKS.map((track) => <option key={track} value={track}>{ONBOARDING_TRACK_META[track].label}</option>)}
            </select>
            <p className="mt-2 text-xs leading-relaxed text-gray-500">{ONBOARDING_TRACK_META[formData.track].description} Video ushbu rolga mansub xodimlarga avtomatik ko‘rinadi.</p>
          </div>

          <div className="space-y-4">
             <div className="flex items-center justify-between border-b border-gray-100 pb-2">
               <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Test savollari</label>
               <button type="button" onClick={handleAddTest} className="text-primary font-bold text-[10px] uppercase flex items-center gap-1 hover:underline">
                 <Plus className="h-3.5 w-3.5" /> Savol qo‘shish
               </button>
             </div>
             {formData.testQuestions.map((q, qIdx) => (
               <div key={qIdx} className="p-5 bg-gray-50 rounded-xl border border-gray-200 space-y-4 relative">
                 <button type="button" onClick={() => setFormData(prev => ({...prev, testQuestions: prev.testQuestions.filter((_, i) => i !== qIdx)}))} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors">
                   <X className="h-4 w-4" />
                 </button>
                 <div className="space-y-2">
                   <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Savol #{qIdx + 1}</label>
                   <input className="w-full h-11 bg-white px-4 rounded-lg border border-gray-100 outline-none focus:border-primary font-semibold text-dark text-sm" placeholder="Savol matni..." value={q.question} onChange={(e) => handleTestChange(qIdx, 'question', e.target.value)} />
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                   {q.options.map((opt: string, oIdx: number) => (
                     <div key={oIdx} className="flex gap-2 items-center">
                        <button type="button" onClick={() => handleTestChange(qIdx, 'correctAnswer', oIdx)} className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center transition-all text-xs font-bold ${q.correctAnswer === oIdx ? 'bg-emerald-500 text-white shadow-sm' : 'bg-white text-gray-400 border border-gray-100'}`}>
                          {q.correctAnswer === oIdx ? <CheckCircle2 className="h-4 w-4" /> : (oIdx + 1)}
                        </button>
                        <input className="flex-grow h-9 bg-white px-3 rounded-lg border border-gray-100 outline-none text-xs font-medium focus:border-primary" placeholder={`Variant ${oIdx + 1}`} value={opt} onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)} />
                     </div>
                   ))}
                 </div>
               </div>
             ))}
          </div>
          <div className="pt-4">
            <Button type="submit" className="w-full h-14 text-base rounded-xl font-bold" isLoading={uploading || actionLoading}>
              {uploading ? `Yuklanmoqda ${uploadProgress}%` : editingVideo ? 'O\'zgarishlarni saqlash' : 'Videoni yuklash'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDelete} title="Videoni o'chirish" description="Ushbu video va barcha unga tegishli ma'lumotlar butunlay o'chib ketadi." isLoading={actionLoading} />
    </div>
  );
}
