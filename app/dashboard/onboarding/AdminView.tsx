'use client';

import { useState, useEffect } from 'react';
import { 
  PlayCircle, 
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

const departments = ['All', 'Support teacher', 'Main teacher', 'Management', 'Sales', 'Boshqaruv', 'Other'];

type LearnerProgress = {
  _id: string;
  name: string;
  department: string;
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
  const [videos, setVideos] = useState<any[]>([]);
  const [learners, setLearners] = useState<LearnerProgress[]>([]);
  const [progressSummary, setProgressSummary] = useState<ProgressSummary | null>(null);
  const [progressLoading, setProgressLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null);
  const [editingVideo, setEditingVideo] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [playingVideo, setPlayingVideo] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    youtubeUrl: '',
    duration: 0,
    departments: ['All'] as string[],
    testQuestions: [] as any[],
    coverImageUrl: '',
    coverImagePublicId: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState('');

  const loadVideos = async () => {
    try {
      setLoading(true);
      const data = await onboardingService.getVideos();
      setVideos(data);
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

  const getPosterUrl = (video: any) => {
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
      } catch (e) {
        return "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop";
      }
    }
    if (video.cloudinaryUrl) {
      return video.cloudinaryUrl.replace('/upload/', '/upload/so_30/').replace(/\.[^/.]+$/, ".jpg");
    }
    return "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop";
  };

  const handleOpenForm = (video?: any) => {
    if (video) {
      setEditingVideo(video);
      setFormData({
        title: video.title,
        description: video.description || '',
        youtubeUrl: video.youtubeUrl || '',
        duration: video.duration || 0,
        departments: video.departments || ['All'],
        testQuestions: video.testQuestions || [],
        coverImageUrl: video.coverImageUrl || '',
        coverImagePublicId: video.coverImagePublicId || '',
      });
    } else {
      setEditingVideo(null);
      setFormData({ title: '', description: '', youtubeUrl: '', duration: 0, departments: ['All'], testQuestions: [], coverImageUrl: '', coverImagePublicId: '' });
    }
    setSelectedFile(null);
    setSelectedCoverFile(null);
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

  const handleDeptToggle = (dept: string) => {
    setFormData(prev => ({
      ...prev,
      departments: prev.departments.includes(dept)
        ? prev.departments.filter(d => d !== dept)
        : [...prev.departments, dept]
      }));
  };

  const handleAddTest = () => {
    setFormData(prev => ({
      ...prev,
      testQuestions: [...prev.testQuestions, { question: '', options: ['', '', '', ''], correctAnswer: 0 }]
    }));
  };

  const handleTestChange = (index: number, field: string, value: any) => {
    const newTests = [...formData.testQuestions];
    if (field === 'option') {
      newTests[index].options[value.optIdx] = value.text;
    } else {
      newTests[index][field] = value;
    }
    setFormData(prev => ({ ...prev, testQuestions: newTests }));
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      let videoData: any = {
        title: formData.title,
        description: formData.description,
        youtubeUrl: formData.youtubeUrl,
        duration: formData.duration,
        departments: formData.departments,
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
      alert("Saqlashda xatolik yuz berdi");
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
  const [isFetchingYoutube, setIsFetchingYoutube] = useState(false);

  const fetchYoutubeInfo = async () => {
    if (!formData.youtubeUrl) return;
    
    setIsFetchingYoutube(true);
    try {
      const [res, duration] = await Promise.all([
        fetch(`/api/youtube/info?url=${encodeURIComponent(formData.youtubeUrl)}`),
        getYoutubeDuration(formData.youtubeUrl),
      ]);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'YouTube ma’lumotlarini yuklab bo‘lmadi');

      setFormData(prev => ({
        ...prev,
        title: prev.title || data.title,
        duration,
      }));
      
    } catch (error) {
      console.error("Error fetching YouTube info:", error);
      alert(error instanceof Error ? error.message : "YouTube ma'lumotlarini yuklashda xatolik");
    } finally {
      setIsFetchingYoutube(false);
    }
  };

  const confirmDelete = async () => {
    if (!videoToDelete) return;
    setActionLoading(true);
    try {
      await onboardingService.deleteVideo(videoToDelete);
      setIsDeleteModalOpen(false);
      loadVideos();
    } catch (error) {
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="px-1">
          <h1 className="text-2xl md:text-3xl font-black text-dark tracking-tight">Admin: Onboarding</h1>
          <p className="text-gray-500 text-xs md:text-sm">Videolar va o'quv materiallari boshqaruvi</p>
        </div>
        <Button className="h-12 text-sm" icon={<Upload className="h-5 w-5" />} onClick={() => handleOpenForm()}>Video qo'shish</Button>
      </div>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="text-lg font-bold text-dark">Xodimlar o‘quv jarayoni</h2><p className="mt-1 text-xs text-gray-500">Foiz video to‘liq ko‘rilib, testli darslarda kamida 60% natija olingandan keyingina oshadi.</p></div>
          <button type="button" onClick={() => void loadLearnerProgress()} className="text-xs font-bold text-primary hover:underline">Yangilash</button>
        </div>
        <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
          <div className="p-4 text-center"><p className="text-xl font-bold text-dark">{progressLoading ? '—' : progressSummary?.totalEmployees || 0}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">Xodim</p></div>
          <div className="p-4 text-center"><p className="text-xl font-bold text-dark">{progressLoading ? '—' : `${progressSummary?.averageCourseProgress || 0}%`}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">O‘rtacha jarayon</p></div>
          <div className="p-4 text-center"><p className="text-xl font-bold text-dark">{progressLoading ? '—' : progressSummary?.completedCourses || 0}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">Kursni tugatgan</p></div>
        </div>
        <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left"><thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-400"><tr><th className="px-5 py-3">Xodim</th><th className="px-5 py-3">Darslar</th><th className="px-5 py-3">Jarayon</th><th className="px-5 py-3">Test</th><th className="px-5 py-3">Oxirgi faollik</th></tr></thead><tbody className="divide-y divide-gray-100">{progressLoading ? <tr><td colSpan={5} className="px-5 py-10 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-primary" /></td></tr> : learners.length ? learners.map((learner) => <tr key={learner._id} className="text-sm"><td className="px-5 py-4"><p className="font-bold text-dark">{learner.name}</p><p className="mt-0.5 text-xs text-gray-500">{learner.department}</p></td><td className="px-5 py-4 text-gray-600">{learner.completedVideos}/{learner.assignedVideos} yakunlangan</td><td className="px-5 py-4"><div className="flex min-w-32 items-center gap-2"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-primary" style={{ width: `${learner.courseProgress}%` }} /></div><span className="text-xs font-bold text-dark">{learner.courseProgress}%</span></div></td><td className="px-5 py-4 text-gray-600">{learner.avgTestScore === null ? '—' : `${learner.avgTestScore}%`} <span className="text-xs text-gray-400">({learner.testAttempts} urinish)</span></td><td className="px-5 py-4 text-xs text-gray-500">{learner.lastActivity ? new Intl.DateTimeFormat('uz-UZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(learner.lastActivity)) : 'Hali boshlamagan'}</td></tr>) : <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-500">Xodimlar uchun hali progress ma’lumoti yo‘q.</td></tr>}</tbody></table></div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center"><Loader2 className="h-10 w-10 text-primary animate-spin mx-auto" /></div>
        ) : videos.length > 0 ? (
          videos.map((video) => (
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
                <div className="flex flex-wrap gap-1.5">
                   {video.departments.map((d: string) => (
                     <span key={d} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[9px] font-bold uppercase tracking-wider rounded border border-gray-200">
                       {d}
                     </span>
                   ))}
                </div>
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
          <div className="col-span-full py-20 text-center"><VideoIcon className="h-10 w-10 md:h-12 md:w-12 text-gray-200 mx-auto mb-4" /><p className="text-gray-400 font-bold uppercase text-[10px] md:text-xs tracking-widest">Videolar yo'q</p></div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingVideo ? 'Videoni tahrirlash' : 'Yangi video qo\'shish'} maxWidth="max-w-3xl">
        <form onSubmit={handleUpload} className="space-y-6 overflow-y-auto max-h-[75vh] px-1 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">YouTube Link</label>
              <div className="flex gap-2">
                <input className="flex-grow h-11 px-4 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary outline-none font-semibold text-dark text-sm" placeholder="https://..." value={formData.youtubeUrl} onChange={(e) => setFormData({...formData, youtubeUrl: e.target.value})} />
                <button 
                  type="button" 
                  onClick={fetchYoutubeInfo}
                  disabled={isFetchingYoutube || !formData.youtubeUrl}
                  className="px-4 h-11 bg-gray-100 text-dark rounded-lg font-bold text-[10px] uppercase hover:bg-gray-200 transition-all disabled:opacity-50 shrink-0 border border-gray-200"
                >
                  {isFetchingYoutube ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Tekshirish'}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Davomiyligi (sekund)</label>
              <input type="number" className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary outline-none font-semibold text-dark text-sm" placeholder="300" value={formData.duration} onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 0})} />
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
          
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Bo'limlar</label>
            <div className="flex flex-wrap gap-2">
              {departments.map(dept => (
                <button key={dept} type="button" onClick={() => handleDeptToggle(dept)} className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${formData.departments.includes(dept) ? 'bg-primary text-white shadow-md' : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'}`}>{dept}</button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
             <div className="flex items-center justify-between border-b border-gray-100 pb-2">
               <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Test savollari</label>
               <button type="button" onClick={handleAddTest} className="text-primary font-bold text-[10px] uppercase flex items-center gap-1 hover:underline">
                 <Plus className="h-3.5 w-3.5" /> Savol qo'shish
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
                        <input className="flex-grow h-9 bg-white px-3 rounded-lg border border-gray-100 outline-none text-xs font-medium focus:border-primary" placeholder={`Variant ${oIdx + 1}`} value={opt} onChange={(e) => handleTestChange(qIdx, 'option', { optIdx: oIdx, text: e.target.value })} />
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
