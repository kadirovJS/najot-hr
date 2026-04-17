'use client';

// Client componentlarda metadata ishlamaydi, shuning uchun layout.tsx dagi template ishlaydi.
// Agar har bir page uchun alohida kerak bo'lsa, page.tsx ni server component qilib,
// uni ichida client componentni chaqirish kerak.

import { useState } from 'react';
import Header from '@/components/layout/Header';
import { Search, MapPin, Briefcase, Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const categories = ['Barchasi', 'IT', 'HR', "O'quv bo'limi", 'SMM', 'Marketing'];

const allVacancies = [
  {
    id: 1,
    title: 'Senior React Developer',
    category: 'IT',
    location: 'Toshkent (Hadra)',
    type: 'Full-time',
    salary: '1500$ - 2500$',
    postedAt: '2 kun oldin'
  },
  {
    id: 2,
    title: 'HR Manager',
    category: 'HR',
    location: 'Toshkent (Chilonzor)',
    type: 'Full-time',
    salary: '8 mln - 12 mln',
    postedAt: 'Bugun'
  },
  {
    id: 3,
    title: 'Frontend Mentor',
    category: "O'quv bo'limi",
    location: 'Farg\'ona',
    type: 'Part-time',
    salary: '5 mln - 10 mln',
    postedAt: '3 kun oldin'
  },
  {
    id: 4,
    title: 'Social Media Manager',
    category: 'SMM',
    location: 'Toshkent (Chimboy)',
    type: 'Full-time',
    salary: '6 mln - 9 mln',
    postedAt: '1 hafta oldin'
  },
  {
    id: 5,
    title: 'Python Backend Mentor',
    category: "O'quv bo'limi",
    location: 'Samarqand',
    type: 'Full-time',
    salary: '10 mln - 15 mln',
    postedAt: '4 kun oldin'
  },
  {
    id: 6,
    title: 'Technical Recruiter',
    category: 'HR',
    location: 'Toshkent (Hadra)',
    type: 'Full-time',
    salary: '7 mln - 10 mln',
    postedAt: '5 kun oldin'
  }
];

export default function VacanciesPage() {
  const [selectedCategory, setSelectedCategory] = useState('Barchasi');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVacancies = allVacancies.filter(v => {
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
          <p className="text-gray-500 max-w-2xl mx-auto">
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
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  selectedCategory === cat 
                    ? 'bg-primary text-white shadow-md shadow-primary/20' 
                    : 'bg-white text-gray-600 hover:bg-gray-100'
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
              className="w-full h-12 pl-12 pr-4 bg-white rounded-xl border border-gray-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Results */}
        {filteredVacancies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVacancies.map((vacancy) => (
              <div 
                key={vacancy.id} 
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-lg uppercase tracking-wider">
                    {vacancy.category}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {vacancy.postedAt}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-dark mb-4 group-hover:text-primary transition-colors">
                  {vacancy.title}
                </h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <MapPin className="h-4 w-4" /> {vacancy.location}
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Briefcase className="h-4 w-4" /> {vacancy.type}
                  </div>
                  <div className="text-primary font-bold text-sm">
                    {vacancy.salary}
                  </div>
                </div>

                <Link 
                  href={`/vacancies/${vacancy.id}`}
                  className="w-full h-11 border border-gray-100 rounded-lg flex items-center justify-center gap-2 font-semibold text-gray-700 hover:bg-primary hover:text-white hover:border-primary transition-all group/btn"
                >
                  Batafsil <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-dark mb-2">Hech narsa topilmadi</h3>
            <p className="text-gray-500">Qidiruv so'rovini yoki filtrlarni o'zgartirib ko'ring.</p>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        © 2026 Najot Ta'lim HR. Barcha huquqlar himoyalangan.
      </footer>
    </div>
  );
}
