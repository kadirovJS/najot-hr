'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Newspaper,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  ImagePlus,
  Loader2,
  Sparkles,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { blogService } from '@/services/blogService';
import { IBlog, BlogFormData } from '@/types/blog';

const emptyForm: BlogFormData = {
  title: '',
  excerpt: '',
  content: '',
  coverImage: '',
  images: [],
};

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<IBlog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<IBlog | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<BlogFormData>(emptyForm);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await blogService.getPosts(true);
      setPosts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleOpenForm = (post?: IBlog) => {
    if (post) {
      setEditingPost(post);
      setFormData({
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        coverImage: post.coverImage,
        images: post.images?.length ? post.images : [post.coverImage],
        mainBlog: post.mainBlog,
      });
    } else {
      setEditingPost(null);
      setFormData(emptyForm);
    }
    setIsFormModalOpen(true);
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const currentImageCount = formData.images.length;

    if (currentImageCount + files.length > 5) {
      alert(`Postga ko‘pi bilan 5 ta rasm qo‘shish mumkin. Hozir ${currentImageCount} ta rasm tanlangan.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    if (files.some((file) => !file.type.startsWith('image/'))) {
      alert('Faqat rasm fayllarini yuklash mumkin');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    if (files.some((file) => file.size > 5 * 1024 * 1024)) {
      alert("Har bir rasm hajmi 5MB dan oshmasligi kerak");
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setImageUploading(true);
    try {
      const uploadedImages = await Promise.all(files.map(async (file) => (await blogService.uploadBlogImage(file)).secure_url));
      setFormData((current) => {
        const images = [...current.images, ...uploadedImages];
        return { ...current, images, coverImage: current.coverImage || images[0] };
      });
    } catch {
      alert('Rasm yuklashda xatolik yuz berdi');
    } finally {
      setImageUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (image: string) => {
    setFormData((current) => {
      const images = current.images.filter((item) => item !== image);
      return { ...current, images, coverImage: current.coverImage === image ? images[0] || '' : current.coverImage };
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.images.length || !formData.coverImage) {
      alert('Iltimos, kamida bitta rasm yuklang');
      return;
    }

    setActionLoading(true);
    try {
      if (editingPost) {
        await blogService.updatePost(editingPost._id, formData);
      } else {
        await blogService.createPost(formData);
      }
      setIsFormModalOpen(false);
      loadPosts();
    } catch {
      alert('Xatolik yuz berdi');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleVisibility = async (post: IBlog) => {
    try {
      await blogService.updatePost(post._id, { isVisible: !post.isVisible });
      loadPosts();
    } catch {
      alert('Xatolik yuz berdi');
    }
  };

  const handleDeleteClick = (id: string) => {
    setPostToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;
    setActionLoading(true);
    try {
      await blogService.deletePost(postToDelete);
      setIsDeleteModalOpen(false);
      loadPosts();
    } catch {
      alert("O'chirishda xatolik");
    } finally {
      setActionLoading(false);
      setPostToDelete(null);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-dark tracking-tight">Blog boshqaruvi</h1>
          <p className="text-gray-500 text-xs md:text-sm font-medium">Maqolalarni yaratish, tahrirlash va nashr qilish</p>
        </div>
        <Button className="w-full md:w-auto h-11 px-8 rounded-lg text-sm" icon={<Plus className="h-4 w-4" />} onClick={() => handleOpenForm()}>
          Yangi post
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto" />
            <p className="text-gray-400 mt-4 font-medium">Postlar yuklanmoqda...</p>
          </div>
        ) : posts.length > 0 ? (
          posts.map((post) => {
            const isMainBlog = post.mainBlog === true;
            return (
            <div key={post._id} className={`bg-white p-5 md:p-6 rounded-xl border-2 transition-all ${isMainBlog ? 'border-accent bg-[#fffdf9] shadow-[0_5px_18px_rgba(188,142,91,0.12)]' : post.isVisible ? 'border-gray-200 shadow-sm' : 'border-gray-300 bg-gray-50/50 opacity-75 grayscale'}`}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-start gap-4 flex-grow min-w-0">
                  <div className="relative w-24 h-16 md:w-32 md:h-20 shrink-0 rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                    <Image src={post.coverImage} alt={post.title} fill className="object-cover" />
                  </div>
                  <div className="space-y-2 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {!post.isVisible && (
                        <span className="px-2.5 py-1 bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-wider rounded border border-red-100 flex items-center gap-1.5">
                          <EyeOff className="h-3 w-3" /> Yopilgan
                        </span>
                      )}
                      {isMainBlog && (
                        <span className="px-2.5 py-1 bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-wider rounded border border-accent/30 flex items-center gap-1.5">
                          <Sparkles className="h-3 w-3" /> Main blog
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-dark truncate leading-snug">{post.title}</h3>
                    <p className="text-xs md:text-sm text-gray-500 line-clamp-1">{post.excerpt}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                      <Clock className="h-3.5 w-3.5 shrink-0" /> {new Date(post.createdAt).toLocaleDateString()} · {post.viewCount || 0} marta o‘qilgan
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-gray-50 p-1.5 rounded-lg shrink-0 w-fit border border-gray-100">
                  <button onClick={() => toggleVisibility(post)} className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-white rounded-md transition-all shadow-sm border border-transparent hover:border-gray-100" title={post.isVisible ? 'Yopish' : 'Ochish'}>
                    {post.isVisible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  </button>
                  <button onClick={() => handleOpenForm(post)} className="p-2 text-gray-400 hover:text-primary hover:bg-white rounded-md transition-all shadow-sm border border-transparent hover:border-gray-100" title="Tahrirlash">
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button onClick={() => handleDeleteClick(post._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-md transition-all shadow-sm border border-transparent hover:border-gray-100" title="O'chirish">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
            );
          })
        ) : (
          <div className="bg-white py-16 md:py-24 rounded-xl border border-dashed border-gray-200 text-center px-6">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <Newspaper className="h-8 w-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium text-sm">Hozircha blog postlari mavjud emas</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingPost ? 'Postni tahrirlash' : "Yangi post qo'shish"}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-6 overflow-y-auto max-h-[75vh] px-1 custom-scrollbar">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-3 px-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Post rasmlari</label>
              <span className="text-xs font-semibold text-gray-500">{formData.images.length}/5</span>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" id="blog-images-input" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
              {formData.images.map((image, index) => {
                const isCover = image === formData.coverImage;
                return (
                  <div key={image} className={`relative aspect-square overflow-hidden rounded-lg bg-gray-100 ${isCover ? 'ring-2 ring-primary ring-offset-2' : 'border border-gray-200'}`}>
                    <Image src={image} alt={`${index + 1}-post rasmi`} fill className="object-cover" sizes="(max-width: 768px) 50vw, 140px" />
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-black/55 p-1.5">
                      <button type="button" onClick={() => setFormData((current) => ({ ...current, coverImage: image }))} disabled={isCover} className="min-h-7 rounded-md bg-white px-2 text-[10px] font-bold text-dark transition-colors hover:bg-gray-100 disabled:cursor-default disabled:bg-primary disabled:text-white">
                        {isCover ? 'Asosiy' : 'Asosiy qilish'}
                      </button>
                      <button type="button" onClick={() => removeImage(image)} className="grid h-7 w-7 place-items-center rounded-md bg-white/95 text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600" aria-label={`${index + 1}-rasmni olib tashlash`}>
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {formData.images.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={imageUploading}
                  className="flex aspect-square flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 px-3 text-center text-gray-500 transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary disabled:cursor-wait"
                >
                  {imageUploading ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : <ImagePlus className="h-6 w-6" />}
                  <span className="text-xs font-semibold">{imageUploading ? 'Yuklanmoqda…' : 'Rasm qo‘shish'}</span>
                </button>
              )}
            </div>
            <p className="px-1 text-xs leading-relaxed text-gray-500">1 tadan 5 tagacha rasm yuklang. “Asosiy” deb belgilangan rasm post sahifasida birinchi ko‘rinadi.</p>
          </div>

          <label className="flex items-start gap-3 rounded-lg border border-accent/30 bg-accent/5 p-4 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.mainBlog ?? false}
              onChange={(event) => setFormData({ ...formData, mainBlog: event.target.checked })}
              className="mt-0.5 h-4 w-4 accent-[#bc8e5b]"
            />
            <span>
              <span className="flex items-center gap-1.5 text-sm font-bold text-dark"><Sparkles className="h-4 w-4 text-accent" /> Asosiy sahifada ko‘rsatish</span>
              <span className="mt-1 block text-xs leading-relaxed text-gray-500">Belgilangan va ochiq post bosh sahifadagi Hikoyalarimiz bo‘limida ko‘rinadi.</span>
            </span>
          </label>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Sarlavha</label>
            <input
              required
              className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary/50 outline-none transition-all font-semibold text-dark text-sm"
              placeholder="Maqola sarlavhasi"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Qisqacha tavsif (Excerpt)</label>
            <textarea
              required
              rows={2}
              className="w-full p-4 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary/50 outline-none transition-all font-medium text-dark resize-none text-sm leading-relaxed"
              placeholder="Ro'yxat sahifasida ko'rinadigan qisqa matn..."
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Maqola matni</label>
            <textarea
              required
              rows={10}
              className="w-full p-4 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary/50 outline-none transition-all font-medium text-dark resize-none text-sm leading-relaxed"
              placeholder="Maqolaning to'liq matni..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </div>

          <div className="pt-2">
            <Button type="submit" className="w-full h-14 text-base rounded-xl font-bold" isLoading={actionLoading} disabled={imageUploading}>
              {editingPost ? "O'zgarishlarni saqlash" : "Postni e'lon qilish"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Postni o'chirib tashlaysizmi?"
        description="Bu post tizimdan butunlay o'chib ketadi. Buning o'rniga uni 'yopib qo'yishingiz' (Eye icon) ham mumkin."
        isLoading={actionLoading}
      />

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
      `}</style>
    </div>
  );
}
