'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { 
  ArrowLeft, 
  BookOpen, 
  User, 
  Calendar, 
  MessageSquare, 
  Send, 
  Loader2,
  Trash2,
  Edit2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { bookService } from '@/services/bookService';

export default function BookDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === 'SUPER_ADMIN';

  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Edit comment state
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // Delete comment state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadBook = async () => {
    try {
      setLoading(true);
      const data = await bookService.getBook(id as string);
      setBook(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadBook();
  }, [id]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const updatedBook = await bookService.addComment(id as string, commentText);
      setBook(updatedBook);
      setCommentText('');
    } catch (error) {
      alert("Izoh qoldirishda xatolik yuz berdi");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editText.trim()) return;
    try {
      const updatedBook = await bookService.updateComment(id as string, commentId, editText);
      setBook(updatedBook);
      setEditingCommentId(null);
      setEditText('');
    } catch (error) {
      alert("Tahrirlashda xatolik");
    }
  };

  const handleDeleteComment = (commentId: string) => {
    setCommentToDelete(commentId);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteComment = async () => {
    if (!commentToDelete) return;
    setActionLoading(true);
    try {
      const updatedBook = await bookService.deleteComment(id as string, commentToDelete);
      setBook(updatedBook);
      setIsDeleteModalOpen(false);
    } catch (error) {
      alert("O'chirishda xatolik");
    } finally {
      setActionLoading(false);
      setCommentToDelete(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateStr));
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-dark">Kitob topilmadi</h2>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/dashboard/books')}>
          Ro'yxatga qaytish
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 pb-20">
      <button 
        onClick={() => router.push('/dashboard/books')}
        className="flex items-center gap-2 text-gray-500 hover:text-dark transition-all font-bold uppercase text-[10px] tracking-widest px-1"
      >
        <ArrowLeft className="h-4 w-4" /> Kutubxonaga qaytish
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
        {/* Chap tomon: Rasm va asosiy ma'lumotlar */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
          <div className="aspect-[3/4] rounded-xl overflow-hidden shadow-xl bg-white border border-gray-200 max-w-sm mx-auto lg:max-w-none group">
            {book.imageUrl ? (
              <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-gray-200">
                <BookOpen className="h-20 w-20" />
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-4 max-w-sm mx-auto lg:max-w-none">
             <div className="flex items-center gap-3 text-gray-600">
                <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span className="font-semibold text-sm">{book.author}</span>
             </div>
             <div className="flex items-center gap-3 text-gray-600">
                <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <span className="font-semibold text-sm">{formatDate(book.createdAt)}</span>
             </div>
          </div>
        </div>

        {/* O'ng tomon: Tavsif va Izohlar */}
        <div className="lg:col-span-8 space-y-10">
          <div className="space-y-6 border-b border-gray-100 pb-10">
            <h1 className="text-3xl md:text-5xl font-bold text-dark tracking-tight leading-tight">
              {book.title}
            </h1>
            <div className="w-12 h-1.5 bg-primary/30 rounded-full" />
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-wrap">
                {book.description}
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center border border-primary/10">
                  <MessageSquare className="h-5 w-5 text-primary" />
               </div>
               <h2 className="text-xl font-bold text-dark">Fikr-mulohazalar ({book.comments?.length || 0})</h2>
            </div>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="relative group">
               <textarea 
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Kitob haqida fikringizni yozing..."
                  className="w-full p-5 pr-14 rounded-xl border border-gray-200 bg-white focus:bg-white focus:border-primary/50 outline-none font-medium text-dark shadow-sm min-h-[120px] resize-none text-sm transition-all"
               />
               <button 
                  type="submit"
                  disabled={submittingComment || !commentText.trim()}
                  className="absolute bottom-4 right-4 p-2.5 bg-primary text-white rounded-lg shadow-md hover:bg-primary/90 transition-all disabled:opacity-50 disabled:grayscale"
                  title="Yuborish"
               >
                  {submittingComment ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
               </button>
            </form>

            {/* Comments List */}
            <div className="space-y-5">
              {book.comments && book.comments.length > 0 ? (
                [...book.comments].reverse().map((comment: any, idx: number) => {
                  const isOwner = (session?.user as any)?.id === comment.userId;
                  const canManageComment = isAdmin || isOwner;
                  const isEditing = editingCommentId === comment._id;

                  return (
                    <div key={comment._id || idx} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4 hover:border-gray-200 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-primary/10 bg-primary/5 text-sm font-bold text-primary">
                            {comment.userImage ? (
                              <Image
                                src={comment.userImage}
                                alt={`${comment.userName} profil rasmi`}
                                fill
                                sizes="36px"
                                className="object-cover"
                              />
                            ) : (
                              comment.userName?.trim().charAt(0).toUpperCase() || '?'
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-dark text-sm leading-none">{comment.userName}</h4>
                            <span className="text-[10px] font-medium text-gray-400 mt-1 block">{formatDate(comment.createdAt)}</span>
                          </div>
                        </div>

                        {canManageComment && !isEditing && (
                          <div className="flex gap-1">
                            <button 
                              onClick={() => {
                                setEditingCommentId(comment._id);
                                setEditText(comment.text);
                              }}
                              className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-all"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteComment(comment._id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="space-y-3">
                          <textarea 
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full p-4 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary outline-none font-medium text-sm text-dark resize-none"
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <Button size="sm" className="h-9 px-5 text-xs rounded-md" onClick={() => handleUpdateComment(comment._id)}>Saqlash</Button>
                            <Button size="sm" variant="outline" className="h-9 px-5 text-xs rounded-md" onClick={() => setEditingCommentId(null)}>Bekor qilish</Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {comment.text}
                        </p>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                   <p className="text-gray-400 font-medium text-sm italic">Hozircha izohlar yo'q. Birinchi bo'lib o'z fikringizni qoldiring!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        onConfirm={confirmDeleteComment} 
        title="Izohni o'chirish" 
        description="Ushbu fikr-mulohazani butunlay o'chirib tashlamoqchimisiz?" 
        isLoading={actionLoading} 
      />
    </div>
  );
}
