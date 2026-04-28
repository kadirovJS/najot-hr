'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
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
        <h2 className="text-2xl font-black text-dark">Kitob topilmadi</h2>
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
        className="flex items-center gap-2 text-gray-400 hover:text-primary transition-all font-black uppercase text-[10px] tracking-widest px-2"
      >
        <ArrowLeft className="h-4 w-4" /> Kitoblarga qaytish
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 items-start">
        {/* Chap tomon: Rasm va asosiy ma'lumotlar */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8 px-2">
          <div className="aspect-[4/5] sm:aspect-[3/4] rounded-2xl md:rounded-[3rem] overflow-hidden shadow-2xl bg-white border border-gray-100 max-w-sm mx-auto lg:max-w-none">
            {book.imageUrl ? (
              <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-gray-100">
                <BookOpen className="h-24 w-24 md:h-32 md:w-32" />
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-2xl md:rounded-[2.5rem] p-6 md:p-8 border border-gray-100 shadow-sm space-y-4 max-w-sm mx-auto lg:max-w-none">
             <div className="flex items-center gap-3 text-gray-500">
                <User className="h-5 w-5 text-primary shrink-0" />
                <span className="font-bold text-sm md:text-base">{book.author}</span>
             </div>
             <div className="flex items-center gap-3 text-gray-500">
                <Calendar className="h-5 w-5 text-primary shrink-0" />
                <span className="font-bold text-sm md:text-base">{formatDate(book.createdAt)}</span>
             </div>
          </div>
        </div>

        {/* O'ng tomon: Tavsif va Izohlar */}
        <div className="lg:col-span-8 space-y-8 md:space-y-10 px-2">
          <div className="space-y-4 md:space-y-6">
            <h1 className="text-3xl md:text-5xl font-black text-dark tracking-tight leading-tight">
              {book.title}
            </h1>
            <div className="w-16 md:w-20 h-1.5 md:h-2 bg-primary rounded-full" />
            <p className="text-gray-600 text-base md:text-xl font-medium leading-relaxed whitespace-pre-wrap">
              {book.description}
            </p>
          </div>

          <div className="space-y-6 md:space-y-8 pt-8 md:pt-10 border-t border-gray-100">
            <div className="flex items-center gap-3 md:gap-4">
               <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
                  <MessageSquare className="h-5 w-5 md:h-6 md:w-6 text-primary" />
               </div>
               <h2 className="text-xl md:text-2xl font-black text-dark">Fikr-mulohazalar ({book.comments?.length || 0})</h2>
            </div>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="relative">
               <textarea 
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Fikringizni yozing..."
                  className="w-full p-5 md:p-6 pr-16 md:pr-20 rounded-2xl md:rounded-[2rem] border border-gray-100 bg-white focus:border-primary outline-none font-medium text-dark shadow-sm min-h-[100px] md:min-h-[120px] resize-none text-sm md:text-base"
               />
               <button 
                  type="submit"
                  disabled={submittingComment || !commentText.trim()}
                  className="absolute bottom-4 right-4 md:bottom-6 md:right-6 p-3 md:p-4 bg-primary text-white rounded-xl md:rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
               >
                  {submittingComment ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
               </button>
            </form>

            {/* Comments List */}
            <div className="space-y-4 md:space-y-6">
              {book.comments && book.comments.length > 0 ? (
                [...book.comments].reverse().map((comment: any, idx: number) => {
                  const isOwner = (session?.user as any)?.id === comment.userId;
                  const isEditing = editingCommentId === comment._id;

                  return (
                    <div key={comment._id || idx} className="bg-gray-50/50 p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-gray-100 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-lg md:rounded-xl flex items-center justify-center text-primary font-black shadow-sm border border-gray-50 shrink-0">
                            {comment.userName[0]}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-black text-dark text-xs md:text-sm leading-none truncate">{comment.userName}</h4>
                            <span className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">{formatDate(comment.createdAt)}</span>
                          </div>
                        </div>

                        {isOwner && !isEditing && (
                          <div className="flex gap-1 shrink-0">
                            <button 
                              onClick={() => {
                                setEditingCommentId(comment._id);
                                setEditText(comment.text);
                              }}
                              className="p-1.5 md:p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteComment(comment._id)}
                              className="p-1.5 md:p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="space-y-3 md:pl-13">
                          <textarea 
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full p-3 md:p-4 rounded-xl md:rounded-2xl border border-gray-200 bg-white focus:border-primary outline-none font-medium text-xs md:text-sm text-dark resize-none"
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <Button size="sm" className="h-9 px-4 text-xs" onClick={() => handleUpdateComment(comment._id)}>Saqlash</Button>
                            <Button size="sm" variant="outline" className="h-9 px-4 text-xs" onClick={() => setEditingCommentId(null)}>Bekor</Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-600 font-medium text-xs md:text-sm leading-relaxed md:pl-13">
                          {comment.text}
                        </p>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 md:py-10 bg-gray-50/50 rounded-2xl md:rounded-[2rem] border border-dashed border-gray-200">
                   <p className="text-gray-400 font-bold text-[10px] md:text-sm uppercase tracking-widest italic px-4">Hozircha izohlar yo'q. Birinchi bo'ling!</p>
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
