import Header from '@/components/layout/Header';
import AboutTeam from '@/components/sections/AboutTeam';
import Hero from '@/components/sections/Hero';
import Partners from '@/components/sections/Partners';
import TeamMap from '@/components/sections/TeamMap';
import TeamMembers from '@/components/sections/TeamMembers';

import  { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Najot Ta'lim HR | Jamoamizga qo'shiling",
};

export default function Home() {


  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-grow">
        <Hero />
        <AboutTeam />
        <TeamMembers/>
        <TeamMap />
        <Partners />
        
        <section id="vacancies" className="py-24 bg-primary text-white">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold mb-6 md:text-4xl">Siz ham Najot Ta'lim jamoasining bir qismi bo'ling!</h2>
            <p className="max-w-2xl mx-auto text-lg mb-10 opacity-90">
              Biz bilan kelajak ta'limini rivojlantirish uchun o'z hissangizni qo'shing. Hozirda bizda 10+ dan ortiq bo'sh ish o'rinlari mavjud.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                href="/auth/register" 
                className="h-14 px-10 rounded-xl bg-white text-primary font-bold inline-flex items-center justify-center transition-all hover:bg-opacity-95 active:scale-95"
              >
                Ro'yxatdan o'tish
              </Link>
              <Link 
                href="/vacancies"
                className="h-14 px-10 rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white font-bold inline-flex items-center justify-center transition-all hover:bg-white/20 active:scale-95"
              >
                Vakansiyalarni ko'rish
              </Link>
            </div>
          </div>
        </section>
      </div>

      <footer className="bg-dark text-white py-12 border-t border-white/10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col items-center md:items-start gap-4">
              <Image
                src="/najot.png" 
                alt="Najot Ta'lim Logo" 
                width={140} 
                height={35} 
                className="h-8 w-auto brightness-200"
              />
              <p className="text-sm text-gray-400">© 2026 Najot Ta'lim HR. Barcha huquqlar himoyalangan.</p>
            </div>
            
            <div className="flex items-center gap-8 text-sm font-medium">
              <Link href="#" className="hover:text-primary transition-colors">Yordam</Link>
              <Link href="#" className="hover:text-primary transition-colors">Maxfiylik</Link>
              <Link href="#" className="hover:text-primary transition-colors">Bog'lanish</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}