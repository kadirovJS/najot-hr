'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Library, 
  Plus, 
  Search, 
  BookOpen, 
  User, 
  MessageSquare, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Loader2,
  X,
  Upload
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { bookService } from '@/services/bookService';
import { onboardingService } from '@/services/onboardingService';

export default function BooksPage() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === 'SUPER_ADMIN';

  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<any>(null);
  const [bookToDelete, setBookToDelete] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const data = await bookService.getBooks();
      setBooks(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const handleOpenForm = (book?: any) => {
    if (book) {
      setEditingBook(book);
      setFormData({
        title: book.title,
        author: book.author,
        description: book.description
      });
    } else {
      setEditingBook(null);
      setFormData({ title: '', author: '', description: '' });
    }
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      let bookData = { ...formData } as any;

      if (selectedFile) {
        const cloudinaryRes = await onboardingService.uploadImageToCloudinary(selectedFile);
        bookData.imageUrl = cloudinaryRes.secure_url;
        bookData.publicId = cloudinaryRes.public_id;
      }

      if (editingBook) {
        await bookService.updateBook(editingBook._id, bookData);
      } else {
        await bookService.createBook(bookData);
      }
      
      setIsModalOpen(false);
      loadBooks();
    } catch (error) {
      alert("Saqlashda xatolik yuz berdi");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!bookToDelete) return;
    setActionLoading(true);
    try {
      await bookService.deleteBook(bookToDelete);
      setIsDeleteModalOpen(false);
      loadBooks();
    } catch (error) {
      alert("O'chirishda xatolik");
    } finally {
      setActionLoading(false);
      setBookToDelete(null);
    }
  };

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(search.toLowerCase()) || 
    book.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 md:space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-dark tracking-tight">Tavsiya qilingan kitoblar</h1>
          <p className="text-gray-500 text-xs md:text-sm font-medium">Bilim - bu muvaffaqiyat garovi</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Qidirish..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 pr-6 h-11 w-full rounded-lg border border-gray-200 bg-white focus:bg-white focus:border-primary/50 outline-none font-semibold text-dark shadow-sm transition-all text-sm"
            />
          </div>
          {isAdmin && (
            <Button className="w-full sm:w-auto h-11 px-8 rounded-lg text-sm" icon={<Plus className="h-4 w-4" />} onClick={() => handleOpenForm()}>Qo'shish</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto" />
          </div>
        ) : filteredBooks.length > 0 ? (
          filteredBooks.map((book) => (
            <div key={book._id} className="group relative bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all flex flex-col">
              <Link href={`/dashboard/books/${book._id}`} className="block flex-grow">
                <div className="aspect-[4/5] relative overflow-hidden bg-gray-50 border-b border-gray-100">
                  {book.imageUrl ? (
                    <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-gray-200">
                      <BookOpen className="h-12 w-12" />
                      <span className="font-bold uppercase text-[9px] tracking-widest text-gray-400">Rasm yo'q</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-5 space-y-2">
                  <div className="space-y-1">
                    <h3 className="font-bold text-dark text-base leading-tight line-clamp-1 group-hover:text-primary transition-colors">{book.title}</h3>
                    <p className="text-primary/80 font-semibold text-xs">{book.author}</p>
                  </div>
                  <p className="text-gray-500 text-[11px] line-clamp-2 font-medium leading-relaxed">
                    {book.description}
                  </p>
                </div>
              </Link>
              
              <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
                <div className="flex items-center gap-4 text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span className="text-[11px] font-bold">{book.comments?.length || 0}</span>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex gap-1">
                    <button onClick={() => handleOpenForm(book)} className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"><Edit2 className="h-3.5 w-3.5" /></button>
                    <button onClick={() => { setBookToDelete(book._id); setIsDeleteModalOpen(true); }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 md:py-20 text-center">
             <Library className="h-12 w-12 text-gray-200 mx-auto mb-4" />
             <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Kitoblar topilmadi</p>
          </div>
        )}
      </div>

      {/* Book Form Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingBook ? 'Kitobni tahrirlash' : 'Yangi kitob qo\'shish'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto max-h-[70vh] px-1 custom-scrollbar">
          <div className="space-y-4">
            <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${selectedFile ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary'}`}>
              <input type="file" accept="image/*" className="hidden" id="book-image" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
              <label htmlFor="book-image" className="cursor-pointer block">
                <div className="w-14 h-14 bg-gray-50 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                  <Upload className={`h-7 w-7 ${selectedFile ? 'text-primary' : 'text-gray-400'}`} />
                </div>
                <p className="font-bold text-dark uppercase text-[10px] tracking-widest">
                  {selectedFile ? selectedFile.name : editingBook ? 'Muqovani almashtirish' : 'Muqova rasmini yuklang'}
                </p>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Kitob nomi</label>
              <input required className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary outline-none font-semibold text-dark text-sm" placeholder="Nomini kiriting..." value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Muallif</label>
              <input required className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary outline-none font-semibold text-dark text-sm" placeholder="Muallif ismini kiriting..." value={formData.author} onChange={(e) => setFormData({...formData, author: e.target.value})} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Tavsif</label>
            <textarea required className="w-full p-4 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary outline-none font-medium text-dark resize-none text-sm leading-relaxed" placeholder="Kitob haqida batafsil..." rows={5} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
          </div>

          <div className="pt-2">
            <Button type="submit" className="w-full h-14 text-base rounded-xl font-bold" isLoading={actionLoading}>
              {editingBook ? 'O\'zgarishlarni saqlash' : 'Kitobni yaratish'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        onConfirm={handleDelete} 
        title="Kitobni o'chirish" 
        description="Ushbu kitob va unga tegishli barcha izohlar butunlay o'chirib tashlanadi. Tasdiqlaysizmi?"
        isLoading={actionLoading}
      />
    </div>
  );
}
