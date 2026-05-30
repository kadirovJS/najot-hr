'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import { MapPin, Briefcase, Clock, DollarSign, ChevronLeft, CheckCircle2, Send, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { vacancyService } from '@/services/vacancyService';
import { IVacancy } from '@/types/vacancy';
import { motion, AnimatePresence } from 'framer-motion';

export default function VacancyDetail() {
  const params = useParams();
  const id = params.id as string;
  
  const [vacancy, setVacancy] = useState<IVacancy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVacancy = async () => {
      try {
        const data = await vacancyService.getVacancyById(id);
        setVacancy(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchVacancy();
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 md:px-6 py-12">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-24 relative overflow-hidden flex flex-col items-center justify-center min-h-[500px]"
            >
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
                <h2 className="text-[10vw] font-black text-gray-400/15 uppercase tracking-tighter leading-none text-center select-none whitespace-nowrap">
                  Najot Ta'lim
                </h2>
              </div>
              <div className="z-10 flex flex-col items-center">
                <div className="w-32 h-1 bg-gray-100 rounded-full overflow-hidden relative">
                  <motion.div 
                    className="absolute inset-0 bg-primary/40"
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  />
                </div>
              </div>
            </motion.div>
          ) : !vacancy ? (
            <motion.div 
              key="not-found"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center min-h-[400px]"
            >
              <h2 className="text-2xl font-bold text-dark mb-4">Vakansiya topilmadi</h2>
              <Link href="/vacancies" className="text-primary font-bold hover:underline">Barcha vakansiyalarga qaytish</Link>
            </motion.div>
          ) : (
            <motion.div 
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Link 
                href="/vacancies" 
                className="inline-flex items-center gap-2 text-gray-400 hover:text-primary mb-8 transition-colors font-bold uppercase text-[10px] tracking-widest"
              >
                <ChevronLeft className="h-4 w-4" /> Vakansiyalarga qaytish
              </Link>

              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-grow space-y-8">
                  <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-gray-100">
                    <div className="flex flex-wrap gap-3 mb-8">
                      <span className="px-5 py-2 bg-primary/10 text-primary text-xs font-black rounded-xl uppercase tracking-widest">
                        {vacancy.category}
                      </span>
                      <span className="px-5 py-2 bg-gray-100 text-gray-500 text-xs font-black rounded-xl uppercase tracking-widest">
                        {vacancy.type}
                      </span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-black text-dark mb-8 leading-tight">{vacancy.title}</h1>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 py-8 border-y border-gray-50">
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] text-gray-400 uppercase font-black tracking-[0.2em]">Manzil</span>
                        <div className="flex items-center gap-2 text-dark font-bold">
                          <MapPin className="h-4 w-4 text-primary" /> {vacancy.location}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] text-gray-400 uppercase font-black tracking-[0.2em]">Maosh</span>
                        <div className="flex items-center gap-2 text-dark font-bold">
                          <DollarSign className="h-4 w-4 text-primary" /> {vacancy.salary}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] text-gray-400 uppercase font-black tracking-[0.2em]">Ish turi</span>
                        <div className="flex items-center gap-2 text-dark font-bold">
                          <Briefcase className="h-4 w-4 text-primary" /> {vacancy.type}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] text-gray-400 uppercase font-black tracking-[0.2em]">Sana</span>
                        <div className="flex items-center gap-2 text-dark font-bold">
                          <Clock className="h-4 w-4 text-primary" /> {new Date(vacancy.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="mt-12 space-y-12">
                      <section>
                        <h2 className="text-2xl font-black text-dark mb-6 flex items-center gap-3">
                          <div className="w-2 h-8 bg-primary rounded-full" />
                          Ish tavsifi
                        </h2>
                        <p className="text-gray-600 leading-relaxed text-lg font-medium">
                          {vacancy.description}
                        </p>
                      </section>

                      {vacancy.requirements?.length > 0 && (
                        <section>
                          <h2 className="text-2xl font-black text-dark mb-6 flex items-center gap-3">
                            <div className="w-2 h-8 bg-primary rounded-full" />
                            Nomzodga talablar
                          </h2>
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {vacancy.requirements.map((req, i) => (
                              <li key={i} className="flex items-start gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 text-gray-600 font-bold text-sm">
                                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                                <span>{req}</span>
                              </li>
                            ))}
                          </ul>
                        </section>
                      )}

                      {vacancy.benefits?.length > 0 && (
                        <section>
                          <h2 className="text-2xl font-black text-dark mb-6 flex items-center gap-3">
                            <div className="w-2 h-8 bg-accent rounded-full" />
                            Biz nima taklif qilamiz?
                          </h2>
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {vacancy.benefits.map((benefit, i) => (
                              <li key={i} className="flex items-start gap-4 p-5 bg-amber-50/30 rounded-2xl border border-amber-100/50 text-gray-600 font-bold text-sm">
                                <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                                <span>{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </section>
                      )}
                    </div>
                  </div>
                </div>

                <div className="lg:w-96 shrink-0">
                  <div className="sticky top-28 bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100">
                    <h3 className="text-2xl font-black text-dark mb-4">Ariza topshirish</h3>
                    <p className="text-gray-400 text-sm font-bold mb-8 leading-relaxed">
                      Ushbu vakansiya sizga ma'qul keldimi? Hoziroq arizangizni qoldiring va jamoamizga qo'shiling!
                    </p>
                    
                    <div className="space-y-4">
                      <button className="w-full h-16 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-3 hover:bg-opacity-95 active:scale-[0.98] transition-all text-lg">
                        <Send className="h-6 w-6" /> Arizani yuborish
                      </button>
                      <p className="text-[10px] text-gray-400 text-center font-bold uppercase tracking-widest">
                        Najot Ta'lim HR jamoasi
                      </p>
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-50">
                      <h4 className="font-black text-dark mb-6 uppercase text-xs tracking-widest">Ulashish</h4>
                      <div className="grid grid-cols-3 gap-3">
                        {['Telegram', 'LinkedIn', 'Copy'].map(social => (
                          <button key={social} className="py-3 bg-gray-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-primary hover:text-white transition-all">
                            {social}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="bg-white border-t border-gray-100 py-8 text-center text-sm text-gray-400 font-bold uppercase tracking-widest mt-12">
        © 2026 Najot Ta'lim HR. Barcha huquqlar himoyalangan.
      </footer>
    </div>
  );
}
