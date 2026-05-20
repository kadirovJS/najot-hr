'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { 
  PlayCircle, 
  CheckCircle2, 
  FileText, 
  Loader2,
  Lock,
  ArrowLeft,
  Video as VideoIcon,
  X,
  Play
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { onboardingService } from '@/services/onboardingService';
import OnboardingAdminPage from './AdminView'; // Admin qismini alohida faylga chiqaramiz

export default function OnboardingPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const isAdmin = user?.role === 'SUPER_ADMIN';

  const [videos, setVideos] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveTab] = useState<any>(null);
  
  // Test holati
  const [showTest, setShowTest] = useState(false);
  const [testAnswers, setTestAnswers] = useState<number[]>([]);
  const [testFinished, setTestFinished] = useState(false);
  const [testResult, setTestResult] = useState<{ score: number, percentage: number } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const ytPlayerRef = useRef<any>(null);
  const watchIntervalRef = useRef<any>(null);
 
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [videoData, progressData] = await Promise.all([
          onboardingService.getVideos(),
          onboardingService.getMyProgress()
        ]);
        // Videolarni tartiblash (eskidan yangiga)
        const sortedVideos = [...videoData].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        setVideos(sortedVideos);
        setProgress(progressData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (user) loadData();
  }, [user]);

  // YouTube API yuklash
  useEffect(() => {
    if (activeVideo?.youtubeUrl) {
      // @ts-ignore
      if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }

      const onPlayerReady = (event: any) => {
        // Player tayyor
      };

      const onPlayerStateChange = (event: any) => {
        // @ts-ignore
        if (event.data === window.YT.PlayerState.PLAYING) {
          startTracking();
        // @ts-ignore
        } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
          stopTracking();
        // @ts-ignore
          if (event.data === window.YT.PlayerState.ENDED) {
             handleVideoEnded();
          }
        }
      };

      // @ts-ignore
      window.onYouTubeIframeAPIReady = () => {
        createPlayer();
      };

      // @ts-ignore
      if (window.YT && window.YT.Player) {
        createPlayer();
      }

      function createPlayer() {
        const videoId = activeVideo.youtubeUrl.split('v=')[1]?.split('&')[0] || activeVideo.youtubeUrl.split('/').pop();
        // @ts-ignore
        ytPlayerRef.current = new window.YT.Player('yt-player', {
          videoId: videoId,
          events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
          }
        });
      }
    }

    return () => stopTracking();
  }, [activeVideo]);

  const startTracking = () => {
    if (watchIntervalRef.current) return;
    watchIntervalRef.current = setInterval(() => {
      if (ytPlayerRef.current && ytPlayerRef.current.getCurrentTime) {
        const currentTime = Math.floor(ytPlayerRef.current.getCurrentTime());
        saveProgress(currentTime);
      }
    }, 5000); // Har 5 sekundda
  };

  const stopTracking = () => {
    if (watchIntervalRef.current) {
      clearInterval(watchIntervalRef.current);
      watchIntervalRef.current = null;
    }
  };

  const saveProgress = (currentTime: number) => {
    if (!activeVideo) return;
    const duration = activeVideo.duration || (ytPlayerRef.current?.getDuration ? Math.floor(ytPlayerRef.current.getDuration()) : 0);
    const isCompleted = duration > 0 && currentTime >= duration * 0.90;
    
    onboardingService.updateProgress({
      videoId: activeVideo._id,
      watchedSeconds: currentTime,
      isCompleted
    });
  };

  const handleVideoEnded = () => {
    if (activeVideo.testQuestions?.length > 0) {
      setShowTest(true);
    }
  };

  // Video progressni saqlash (oddiy video uchun)
  const handleTimeUpdate = () => {
    if (!videoRef.current || !activeVideo) return;
    const currentTime = Math.floor(videoRef.current.currentTime);
    if (currentTime % 5 === 0) {
      saveProgress(currentTime);
    }
  };

  const getVideoProgress = (videoId: string) => {
    const p = progress.find(item => item.videoId === videoId);
    if (!p) return 0;
    const video = videos.find(v => v._id === videoId);
    if (!video || !video.duration) return p.isCompleted ? 100 : 0;
    return Math.min(Math.round((p.watchedSeconds / video.duration) * 100), 100);
  };

  const getTestStatus = (videoId: string) => {
    const p = progress.find(item => item.videoId === videoId);
    if (!p || !p.testFinished) return null;
    return {
      score: p.testScore,
      percentage: p.scorePercentage,
      passed: p.scorePercentage >= 60
    };
  };

  const isVideoLocked = (index: number) => {
    if (index === 0) return false;
    const prevVideo = videos[index - 1];
    const prevProgress = progress.find(p => p.videoId === prevVideo._id);
    
    // Oldingi videoni testi bo'lsa, 60% dan ko'p bo'lishi kerak
    if (prevVideo.testQuestions?.length > 0) {
      return !prevProgress || !prevProgress.testFinished || prevProgress.scorePercentage < 60;
    }
    
    // Testi bo'lmasa shunchaki tugatilgan bo'lishi kerak
    return !prevProgress || !prevProgress.isCompleted;
  };

  const handleFinishTest = async () => {
    let correct = 0;
    activeVideo.testQuestions.forEach((q: any, idx: number) => {
      if (testAnswers[idx] === q.correctAnswer) correct++;
    });

    const percentage = Math.round((correct / activeVideo.testQuestions.length) * 100);
    setTestResult({ score: correct, percentage });
    setTestFinished(true);

    // Progressni yangilash
    await onboardingService.updateProgress({
      videoId: activeVideo._id,
      testScore: correct,
      scorePercentage: percentage,
      testFinished: true,
      isCompleted: percentage >= 60
    });

    // Progressni qayta yuklash
    const newProgress = await onboardingService.getMyProgress();
    setProgress(newProgress);
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Loader2 className="h-10 w-10 text-primary animate-spin" />
    </div>
  );

  if (isAdmin) return <OnboardingAdminPage />;

  // --- TEACHER VIEW ---
  return (
    <div className="space-y-6 md:space-y-8 pb-12">
      {!activeVideo ? (
        <>
          <div className="px-1">
            <h1 className="text-2xl md:text-3xl font-black text-dark tracking-tight">O'quv kursi</h1>
            <p className="text-sm md:text-gray-500 font-medium">Bo'lim: <span className="text-primary">{user?.department}</span></p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {videos.map((video, idx) => {
              const prog = getVideoProgress(video._id);
              const testStatus = getTestStatus(video._id);
              const locked = isVideoLocked(idx);
              
              const getPosterUrl = (v: any) => {
                if (v.youtubeUrl) {
                  try {
                    let videoId = '';
                    const url = v.youtubeUrl;
                    if (url.includes('v=')) {
                      videoId = url.split('v=')[1]?.split('&')[0];
                    } else if (url.includes('youtu.be/')) {
                      videoId = url.split('youtu.be/')[1]?.split('?')[0];
                    } else {
                      videoId = url.split('/').pop() || '';
                    }
                    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                  } catch (e) {
                    return "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop";
                  }
                }
                if (v.cloudinaryUrl) {
                  return v.cloudinaryUrl.replace('/upload/', '/upload/so_30/').replace(/\.[^/.]+$/, ".jpg");
                }
                return "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop";
              };

              return (
                <div 
                  key={video._id} 
                  onClick={() => !locked && setActiveTab(video)}
                  className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden group transition-all ${locked ? 'opacity-75 grayscale cursor-not-allowed' : 'cursor-pointer hover:shadow-md hover:border-primary/30'}`}
                >
                  <div className="aspect-video bg-gray-100 relative flex items-center justify-center overflow-hidden">
                    <img src={getPosterUrl(video)} alt={video.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/20" />
                    
                    {locked ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                        <Lock className="text-white h-8 w-8" />
                      </div>
                    ) : testStatus?.passed ? (
                      <div className="absolute top-3 right-3 bg-emerald-500 text-white p-1.5 rounded-full shadow-md z-10">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                          <Play className="text-primary h-5 w-5 fill-primary ml-1" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-5 space-y-3">
                    <h3 className="font-bold text-dark text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">{video.title}</h3>
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        <span>{testStatus ? `Natija: ${testStatus.percentage}%` : 'Progress'}</span>
                        <span>{prog}%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-700 ${testStatus ? (testStatus.passed ? 'bg-emerald-500' : 'bg-red-500') : 'bg-primary'}`} style={{ width: `${prog}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="max-w-5xl mx-auto space-y-6">
          <button 
            onClick={() => { setActiveTab(null); setShowTest(false); setTestFinished(false); setTestResult(null); }}
            className="flex items-center gap-2 text-gray-500 hover:text-dark transition-all font-bold uppercase text-[10px] tracking-widest px-1"
          >
            <ArrowLeft className="h-4 w-4" /> Kursga qaytish
          </button>

          <div className="bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden mx-1">
            {!showTest ? (
              <>
                <div className="aspect-video bg-black relative">
                  {activeVideo.youtubeUrl ? (
                    <div id="yt-player" className="w-full h-full"></div>
                  ) : (
                    <video 
                      ref={videoRef}
                      src={activeVideo.cloudinaryUrl} 
                      className="w-full h-full"
                      controls
                      onTimeUpdate={handleTimeUpdate}
                      onEnded={handleVideoEnded}
                    />
                  )}
                </div>
                <div className="p-8 md:p-10 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-gray-100 pb-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-dark leading-tight">{activeVideo.title}</h2>
                    {activeVideo.testQuestions?.length > 0 && (
                       <Button 
                         variant="outline" 
                         icon={<FileText className="h-4 w-4" />}
                         onClick={() => setShowTest(true)}
                         className="shrink-0 h-11 text-xs rounded-lg border-gray-200 hover:border-primary"
                       >
                         Testni topshirish
                       </Button>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm md:text-lg font-medium leading-relaxed">{activeVideo.description}</p>
                </div>
              </>
            ) : (
              <div className="p-6 md:p-12 space-y-6 md:space-y-8">
                 <div className="text-center space-y-1">
                    <h2 className="text-xl md:text-2xl font-black text-dark">Video yuzasidan test</h2>
                    <p className="text-gray-400 text-xs md:text-sm font-medium italic">Bilimingizni mustahkamlang</p>
                 </div>

                 {!testFinished ? (
                    <div className="space-y-8 md:space-y-10">
                       {activeVideo.testQuestions.map((q: any, qIdx: number) => (
                         <div key={qIdx} className="space-y-3 md:space-y-4">
                            <h4 className="font-black text-dark text-base md:text-lg flex items-center gap-2 md:gap-3">
                               <span className="w-7 h-7 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-primary text-white flex items-center justify-center text-[10px] md:text-xs font-bold shrink-0">{qIdx + 1}</span>
                               <span className="min-w-0">{q.question}</span>
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 ml-9 md:ml-11">
                               {q.options.map((opt: string, oIdx: number) => (
                                 <button 
                                   key={oIdx}
                                   onClick={() => {
                                      const newAns = [...testAnswers];
                                      newAns[qIdx] = oIdx;
                                      setTestAnswers(newAns);
                                   }}
                                   className={`p-3 md:p-4 rounded-xl md:rounded-2xl border-2 text-left font-bold text-xs md:text-sm transition-all ${testAnswers[qIdx] === oIdx ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/10' : 'border-gray-50 bg-gray-50/50 text-gray-500 hover:border-gray-200'}`}
                                 >
                                   {opt}
                                 </button>
                               ))}
                            </div>
                         </div>
                       ))}
                       <Button 
                         className="w-full h-14 md:h-16 text-base md:text-lg" 
                         disabled={testAnswers.length < activeVideo.testQuestions.length}
                         onClick={handleFinishTest}
                       >
                         Natijani ko'rish
                       </Button>
                    </div>
                 ) : (
                    <div className="py-8 md:py-12 text-center space-y-5 md:space-y-6">
                       <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto shadow-sm ${testResult && testResult.percentage >= 60 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                          {testResult && testResult.percentage >= 60 ? (
                            <CheckCircle2 className="h-8 w-8 md:h-10 md:w-10 text-emerald-500" />
                          ) : (
                            <X className="h-8 w-8 md:h-10 md:w-10 text-red-500" />
                          )}
                       </div>
                       <div>
                          <h3 className="text-xl md:text-2xl font-black text-dark">
                            {testResult && testResult.percentage >= 60 ? 'Tabriklaymiz!' : 'Afsus...'}
                          </h3>
                          <p className="text-gray-500 text-sm md:text-base font-medium mt-1 md:mt-2">
                            Sizning natijangiz: <span className="font-black text-dark">{testResult?.percentage}%</span>
                          </p>
                          <p className="text-gray-400 text-[10px] md:text-sm mt-1 px-4">
                            {testResult && testResult.percentage >= 60 
                              ? "Siz ushbu darsni to'liq o'zlashtirdingiz." 
                              : "Keyingi darsni ochish uchun kamida 60% natija kerak."}
                          </p>
                       </div>
                       <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
                         <Button variant="secondary" className="h-12 text-sm" onClick={() => { setTestFinished(false); setTestAnswers([]); }}>
                            Qayta topshirish
                         </Button>
                         {testResult && testResult.percentage >= 60 && (
                            <Button className="h-12 text-sm" onClick={() => { setActiveTab(null); setShowTest(false); setTestFinished(false); setTestResult(null); }}>
                               Keyingi darsga o'tish
                            </Button>
                         )}
                       </div>
                    </div>
                 )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
