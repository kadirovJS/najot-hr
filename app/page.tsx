import type { Metadata } from 'next';
import { connection } from 'next/server';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Camera, Play, Send } from 'lucide-react';
import Header from '@/components/layout/Header';
import AboutTeam from '@/components/sections/AboutTeam';
import Hero from '@/components/sections/Hero';
import LandingMotion from '@/components/sections/LandingMotion';
import Partners from '@/components/sections/Partners';
import TeamMap from '@/components/sections/TeamMap';
import TeamMembers from '@/components/sections/TeamMembers';
import { dbConnect } from '@/lib/db';
import LandingSetting from '@/models/LandingSetting';
import { createShowcaseDraft, DEFAULT_SHOWCASE, type HeroSlide, type ShowcaseSettings } from '@/lib/landing';

export const metadata: Metadata = { title: "Najot Ta'lim HR | Kelajakni birga o‘rgatamiz", description: "Najot Ta'lim jamoasi, qadriyatlari va ochiq vakansiyalari." };

async function getHeroData(): Promise<{ showcase: ShowcaseSettings; slides: HeroSlide[] }> {
  try {
    await dbConnect();
    const settings = await LandingSetting.findOne().lean();
    const showcase = settings?.showcase ? createShowcaseDraft(settings.showcase as ShowcaseSettings) : createShowcaseDraft(DEFAULT_SHOWCASE);
    const slides = Array.isArray(settings?.heroSlides)
      ? settings.heroSlides.map((slide: HeroSlide) => ({ _id: String(slide._id), title: slide.title, description: slide.description, image: slide.image }))
      : [];
    return { showcase, slides };
  } catch (error) {
    console.error('Landing hero settings could not be loaded:', error);
    return { showcase: createShowcaseDraft(DEFAULT_SHOWCASE), slides: [] };
  }
}

export default async function Home() {
  await connection();
  const { showcase, slides } = await getHeroData();

  return (
    <main className="landing-page">
      <LandingMotion />
      <Header />
      <Hero initialShowcase={showcase} initialSlides={slides} />
      <AboutTeam />
      <TeamMembers />
      <TeamMap />
      <Partners />
      <section className="final-cta">
        <div className="final-cta-orbit" aria-hidden="true" />
        <div data-reveal className="site-container final-cta-inner">
          <span className="eyebrow eyebrow-light">Keyingi qadam</span>
          <h2>Ta’lim kelajagida sizning ham o‘rningiz bor.</h2>
          <p>Tajriba, g‘oya va energiyangizni minglab insonlar kelajagiga aylantiradigan jamoaga qo‘shiling.</p>
          <div className="hero-actions"><Link href="/vacancies" className="button button-white">Vakansiyalarni ko‘rish <ArrowUpRight size={19} /></Link><Link href="/auth/login" className="button button-dark-outline">Tizimga kirish</Link></div>
        </div>
      </section>
      <footer className="site-footer">
        <div className="site-container footer-grid">
          <div className="footer-brand"><Image src="/najot.png" alt="Najot Ta'lim" width={150} height={42} /><p>Zamonaviy kasblar orqali insonlar hayotini yaxshilaymiz.</p></div>
          <div><strong>Platforma</strong><Link href="/vacancies">Vakansiyalar</Link><Link href="/skills-check">Bilim testi</Link><Link href="/auth/login">Kirish</Link></div>
          <div><strong>Jamoa</strong><Link href="#about">Biz haqimizda</Link><Link href="#values">Qadriyatlar</Link><Link href="#locations">Filiallar</Link></div>
          <div><strong>Bizni kuzating</strong><span className="socials"><a href="https://t.me/najottalim" aria-label="Telegram"><Send /></a><a href="https://instagram.com/najottalim" aria-label="Instagram"><Camera /></a><a href="https://youtube.com/@najottalim" aria-label="YouTube"><Play /></a></span></div>
        </div>
        <div className="site-container footer-bottom"><span>© 2026 Najot Ta’lim. Barcha huquqlar himoyalangan.</span><span>Toshkent, O‘zbekiston</span></div>
      </footer>
    </main>
  );
}
