'use client';

// Client componentlarda metadata ishlamaydi, shuning uchun layout.tsx dagi template ishlaydi.
// Agar har bir page uchun alohida kerak bo'lsa, page.tsx ni server component qilib,
// uni ichida client componentni chaqirish kerak.

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { Search, MapPin, Briefcase, Clock, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { vacancyService } from '@/services/vacancyService';
import { IVacancy } from '@/types/vacancy';

const categories = ['Barchasi', 'IT', 'HR', "O'quv bo'limi", 'SMM', 'Marketing', 'Sales'];

export default function VacanciesPage() {
  const [vacancies, setVacancies] = useState<IVacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Barchasi');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchVacancies = async () => {
      try {
        const data = await vacancyService.getVacancies();
        setVacancies(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchVacancies();
  }, []);

  const filteredVacancies = vacancies.filter(v => {
    const matchesCategory = selectedCategory === 'Barchasi' || v.category === selectedCategory;
    const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 md:px-6 py-12">
        {/* Header section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-dark mb-4">Vakansiyalar</h1>
          <p className="text-gray-500 max-w-2xl mx-auto italic font-medium">
            Najot Ta'lim jamoasiga qo'shiling va kelajak ta'limini biz bilan birga quring.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between">
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                  selectedCategory === cat 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'bg-white text-gray-500 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Vakansiya qidirish..."
              className="w-full h-12 pl-12 pr-4 bg-white rounded-2xl border border-gray-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto" />
            <p className="text-gray-400 mt-4 font-bold tracking-widest uppercase text-xs">Yuklanmoqda...</p>
          </div>
        ) : filteredVacancies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVacancies.map((vacancy) => (
              <div 
                key={vacancy._id} 
                className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all group"
              >
                <div className="flex justify-between items-start mb-6">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-lg uppercase tracking-wider">
                    {vacancy.category}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1 uppercase tracking-widest">
                    <Clock className="h-3 w-3" /> {new Date(vacancy.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <h3 className="text-xl font-black text-dark mb-6 group-hover:text-primary transition-colors leading-tight">
                  {vacancy.title}
                </h3>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-gray-500 text-sm font-bold">
                    <div className="p-2 bg-gray-50 rounded-lg"><MapPin className="h-4 w-4 text-primary" /></div>
                    {vacancy.location}
                  </div>
                  <div className="flex items-center gap-3 text-gray-500 text-sm font-bold">
                    <div className="p-2 bg-gray-50 rounded-lg"><Briefcase className="h-4 w-4 text-primary" /></div>
                    {vacancy.type}
                  </div>
                  <div className="text-primary font-black text-lg pl-1">
                    {vacancy.salary}
                  </div>
                </div>

                <Link 
                  href={`/vacancies/${vacancy._id}`}
                  className="w-full h-14 bg-gray-50 rounded-2xl flex items-center justify-center gap-2 font-black text-dark hover:bg-primary hover:text-white transition-all group/btn"
                >
                  Batafsil <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-gray-200">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-dark mb-2">Hech narsa topilmadi</h3>
            <p className="text-gray-500">Qidiruv so'rovini yoki filtrlarni o'zgartirib ko'ring.</p>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-100 py-8 text-center text-sm text-gray-400 font-bold uppercase tracking-widest">
        © 2026 Najot Ta'lim HR. Barcha huquqlar himoyalangan.
      </footer>
    </div>
  );
}
