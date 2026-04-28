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

export default function OnboardingAdminPage() {
  const [videos, setVideos] = useState<any[]>([]);
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
    testQuestions: [] as any[]
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

  useEffect(() => {
    loadVideos();
  }, []);

  const getPosterUrl = (video: any) => {
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
        testQuestions: video.testQuestions || []
      });
    } else {
      setEditingVideo(null);
      setFormData({ title: '', description: '', youtubeUrl: '', duration: 0, departments: ['All'], testQuestions: [] });
    }
    setSelectedFile(null);
    setIsModalOpen(true);
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
      };

      if (selectedFile) {
        setUploading(true);
        // 1. Cloudinary'ga to'g'ridan-to'g'ri yuklash
        const cloudinaryRes = await onboardingService.uploadToCloudinary(selectedFile, (p) => setUploadProgress(p));
        
        videoData.cloudinaryUrl = cloudinaryRes.secure_url;
        videoData.publicId = cloudinaryRes.public_id;
        videoData.duration = Math.round(cloudinaryRes.duration || 0);
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
    }
  };

  const [actionLoading, setActionLoading] = useState(false);
  const [isFetchingYoutube, setIsFetchingYoutube] = useState(false);

  const fetchYoutubeInfo = async () => {
    if (!formData.youtubeUrl) return;
    
    setIsFetchingYoutube(true);
    try {
      const res = await fetch(`/api/youtube/info?url=${encodeURIComponent(formData.youtubeUrl)}`);
      const data = await res.json();
      
      if (data.error) {
        alert(data.error);
        return;
      }

      setFormData(prev => ({
        ...prev,
        title: prev.title || data.title,
        duration: data.duration || prev.duration
      }));
      
    } catch (error) {
      console.error("Error fetching YouTube info:", error);
      alert("YouTube ma'lumotlarini yuklashda xatolik");
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
        <div className="max-w-5xl mx-auto bg-white rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-2xl mx-1">
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
          <div className="p-6 md:p-12">
             <h2 className="text-xl md:text-3xl font-black text-dark leading-tight">{playingVideo.title}</h2>
             <p className="text-gray-600 mt-4 text-sm md:text-lg leading-relaxed">{playingVideo.description}</p>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center"><Loader2 className="h-10 w-10 text-primary animate-spin mx-auto" /></div>
        ) : videos.length > 0 ? (
          videos.map((video) => (
            <div key={video._id} className="bg-white rounded-2xl md:rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all">
              <div className="aspect-video relative cursor-pointer overflow-hidden" onClick={() => setPlayingVideo(video)}>
                <img src={getPosterUrl(video)} alt={video.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-dark/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center shadow-2xl"><Play className="text-primary h-6 w-6 md:h-8 md:w-8 fill-primary ml-1" /></div>
                </div>
              </div>
              <div className="p-5 md:p-6 space-y-3 md:space-y-4">
                <div className="flex flex-wrap gap-1.5 md:gap-2">
                   {video.departments.map((d: string) => <span key={d} className="px-2 py-0.5 md:px-2 md:py-1 bg-gray-50 text-[8px] md:text-[9px] font-black uppercase tracking-widest text-gray-400 rounded-lg border border-gray-100">{d}</span>)}
                </div>
                <h3 className="font-black text-dark text-base md:text-lg leading-tight line-clamp-2">{video.title}</h3>
                <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-gray-50">
                  <span className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase flex items-center gap-1"><FileText className="h-3 w-3" /> {video.testQuestions?.length || 0} ta test</span>
                  <div className="flex gap-1 md:gap-2">
                    <button onClick={() => handleOpenForm(video)} className="p-1.5 md:p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg md:rounded-xl transition-all"><Edit2 className="h-3.5 w-3.5 md:h-4 md:w-4" /></button>
                    <button onClick={() => { setVideoToDelete(video._id); setIsDeleteModalOpen(true); }} className="p-1.5 md:p-2 text-red-500 hover:bg-red-50 rounded-lg md:rounded-xl transition-all"><Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" /></button>
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
        <form onSubmit={handleUpload} className="space-y-5 md:space-y-6 overflow-y-auto max-h-[75vh] px-1 md:px-2 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2 md:space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 md:ml-2">YouTube Link</label>
              <div className="flex gap-2">
                <input className="flex-grow h-12 md:h-14 px-4 md:px-5 rounded-xl md:rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary outline-none font-bold text-dark text-sm" placeholder="https://..." value={formData.youtubeUrl} onChange={(e) => setFormData({...formData, youtubeUrl: e.target.value})} />
                <button 
                  type="button" 
                  onClick={fetchYoutubeInfo}
                  disabled={isFetchingYoutube || !formData.youtubeUrl}
                  className="px-3 md:px-4 h-12 md:h-14 bg-gray-100 text-primary rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase hover:bg-primary hover:text-white transition-all disabled:opacity-50 shrink-0"
                >
                  {isFetchingYoutube ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Tekshirish'}
                </button>
              </div>
            </div>
            <div className="space-y-2 md:space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 md:ml-2">Davomiyligi (sekund)</label>
              <input type="number" className="w-full h-12 md:h-14 px-4 md:px-5 rounded-xl md:rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary outline-none font-bold text-dark text-sm" placeholder="300" value={formData.duration} onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 0})} />
            </div>
          </div>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-[8px] md:text-xs uppercase font-black tracking-widest">
              <span className="bg-white px-4 text-gray-400">Yoki Fayl Yuklash</span>
            </div>
          </div>

          <div className="space-y-2 md:space-y-4">
            <div className={`border-2 border-dashed rounded-2xl md:rounded-3xl p-5 md:p-6 text-center transition-all ${selectedFile ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary'}`}>
              <input type="file" accept="video/*" className="hidden" id="video-upload" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
              <label htmlFor="video-upload" className="cursor-pointer block">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-50 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-sm">
                  <Upload className={`h-5 w-5 md:h-6 md:w-6 ${selectedFile ? 'text-primary' : 'text-gray-400'}`} />
                </div>
                <p className="font-black text-dark uppercase text-[8px] md:text-[10px] tracking-widest truncate max-w-[200px] mx-auto">
                  {selectedFile ? selectedFile.name : 'Video faylni tanlang'}
                </p>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 md:ml-2">Sarlavha</label>
              <input required className="w-full h-12 md:h-14 px-4 md:px-5 rounded-xl md:rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary outline-none font-bold text-dark text-sm" placeholder="Sarlavha" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 md:ml-2">Tavsif</label>
              <textarea className="w-full p-4 md:p-5 rounded-xl md:rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary outline-none font-medium text-dark resize-none text-sm" placeholder="Tavsif" rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </div>
          </div>
          
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 md:ml-2">Bo'limlar</label>
            <div className="flex flex-wrap gap-2">
              {departments.map(dept => (
                <button key={dept} type="button" onClick={() => handleDeptToggle(dept)} className={`px-3 md:px-4 py-2 rounded-lg md:rounded-xl text-[9px] md:text-xs font-black uppercase transition-all ${formData.departments.includes(dept) ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-gray-50 text-gray-400 border border-gray-100 hover:bg-gray-100'}`}>{dept}</button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
             <div className="flex items-center justify-between"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 md:ml-2">Testlar</label><button type="button" onClick={handleAddTest} className="text-primary font-black text-[10px] uppercase flex items-center gap-1"><Plus className="h-3 w-3" /> Test qo'shish</button></div>
             {formData.testQuestions.map((q, qIdx) => (
               <div key={qIdx} className="p-4 md:p-6 bg-gray-50/50 rounded-2xl md:rounded-[2rem] border border-gray-100 space-y-4 relative">
                 <button type="button" onClick={() => setFormData(prev => ({...prev, testQuestions: prev.testQuestions.filter((_, i) => i !== qIdx)}))} className="absolute top-3 right-3 md:top-4 md:right-4 text-gray-400 hover:text-red-500"><X className="h-4 w-4 md:h-5 md:w-5" /></button>
                 <div className="space-y-2">
                   <label className="text-[8px] font-black text-gray-300 uppercase tracking-widest ml-1">Savol #{qIdx + 1}</label>
                   <input className="w-full h-11 md:h-12 bg-white px-4 rounded-xl border border-gray-100 outline-none focus:border-primary font-bold text-dark text-sm" placeholder="Savol..." value={q.question} onChange={(e) => handleTestChange(qIdx, 'question', e.target.value)} />
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                   {q.options.map((opt: string, oIdx: number) => (
                     <div key={oIdx} className="flex gap-2 items-center">
                        <button type="button" onClick={() => handleTestChange(qIdx, 'correctAnswer', oIdx)} className={`w-9 h-9 md:w-10 md:h-10 shrink-0 rounded-lg flex items-center justify-center transition-all text-xs font-bold ${q.correctAnswer === oIdx ? 'bg-emerald-500 text-white' : 'bg-white text-gray-300 border border-gray-100'}`}>{q.correctAnswer === oIdx ? <CheckCircle2 className="h-4 w-4" /> : (oIdx + 1)}</button>
                        <input className="flex-grow h-9 md:h-10 bg-white px-3 rounded-lg border border-gray-100 outline-none text-xs font-medium" placeholder={`Variant ${oIdx + 1}`} value={opt} onChange={(e) => handleTestChange(qIdx, 'option', { optIdx: oIdx, text: e.target.value })} />
                     </div>
                   ))}
                 </div>
               </div>
             ))}
          </div>
          <Button type="submit" className="w-full h-14 md:h-16 text-base md:text-lg" isLoading={uploading || actionLoading}>{uploading ? `Yuklanmoqda ${uploadProgress}%` : editingVideo ? 'Saqlash' : 'Yuklash'}</Button>
        </form>
      </Modal>

      <ConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDelete} title="Videoni o'chirish" description="Ushbu video va barcha unga tegishli ma'lumotlar butunlay o'chib ketadi." isLoading={actionLoading} />
    </div>
  );
}
