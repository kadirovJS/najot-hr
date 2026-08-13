import type { Metadata } from 'next';
import { connection } from 'next/server';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import AboutTeam from '@/components/sections/AboutTeam';
import Hero from '@/components/sections/Hero';
import LandingMotion from '@/components/sections/LandingMotion';
import Partners from '@/components/sections/Partners';
import TeamMap from '@/components/sections/TeamMap';
import TeamMembers from '@/components/sections/TeamMembers';
import FeaturedBlogs from '@/components/sections/FeaturedBlogs';
import { dbConnect } from '@/lib/db';
import LandingSetting from '@/models/LandingSetting';
import { createShowcaseDraft, DEFAULT_SHOWCASE, type HeroSlide, type ShowcaseSettings } from '@/lib/landing';

function TelegramIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" {...props}>
      <path d="M320 72C183 72 72 183 72 320C72 457 183 568 320 568C457 568 568 457 568 320C568 183 457 72 320 72zM435 240.7C431.3 279.9 415.1 375.1 406.9 419C403.4 437.6 396.6 443.8 390 444.4C375.6 445.7 364.7 434.9 350.7 425.7C328.9 411.4 316.5 402.5 295.4 388.5C270.9 372.4 286.8 363.5 300.7 349C304.4 345.2 367.8 287.5 369 282.3C369.2 281.6 369.3 279.2 367.8 277.9C366.3 276.6 364.2 277.1 362.7 277.4C360.5 277.9 325.6 300.9 258.1 346.5C248.2 353.3 239.2 356.6 231.2 356.4C222.3 356.2 205.3 351.4 192.6 347.3C177.1 342.3 164.7 339.6 165.8 331C166.4 326.5 172.5 322 184.2 317.3C256.5 285.8 304.7 265 328.8 255C397.7 226.4 412 221.4 421.3 221.2C423.4 221.2 427.9 221.7 430.9 224.1C432.9 225.8 434.1 228.2 434.4 230.8C434.9 234 435 237.3 434.8 240.6z" />
    </svg>
  );
}

function InstagramIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" {...props}>
      <path d="M320.3 205C256.8 204.8 205.2 256.2 205 319.7C204.8 383.2 256.2 434.8 319.7 435C383.2 435.2 434.8 383.8 435 320.3C435.2 256.8 383.8 205.2 320.3 205zM319.7 245.4C360.9 245.2 394.4 278.5 394.6 319.7C394.8 360.9 361.5 394.4 320.3 394.6C279.1 394.8 245.6 361.5 245.4 320.3C245.2 279.1 278.5 245.6 319.7 245.4zM413.1 200.3C413.1 185.5 425.1 173.5 439.9 173.5C454.7 173.5 466.7 185.5 466.7 200.3C466.7 215.1 454.7 227.1 439.9 227.1C425.1 227.1 413.1 215.1 413.1 200.3zM542.8 227.5C541.1 191.6 532.9 159.8 506.6 133.6C480.4 107.4 448.6 99.2 412.7 97.4C375.7 95.3 264.8 95.3 227.8 97.4C192 99.1 160.2 107.3 133.9 133.5C107.6 159.7 99.5 191.5 97.7 227.4C95.6 264.4 95.6 375.3 97.7 412.3C99.4 448.2 107.6 480 133.9 506.2C160.2 532.4 191.9 540.6 227.8 542.4C264.8 544.5 375.7 544.5 412.7 542.4C448.6 540.7 480.4 532.5 506.6 506.2C532.8 480 541 448.2 542.8 412.3C544.9 375.3 544.9 264.5 542.8 227.5zM495 452C487.2 471.6 472.1 486.7 452.4 494.6C422.9 506.3 352.9 503.6 320.3 503.6C287.7 503.6 217.6 506.2 188.2 494.6C168.6 486.8 153.5 471.7 145.6 452C133.9 422.5 136.6 352.5 136.6 319.9C136.6 287.3 134 217.2 145.6 187.8C153.4 168.2 168.5 153.1 188.2 145.2C217.7 133.5 287.7 136.2 320.3 136.2C352.9 136.2 423 133.6 452.4 145.2C472 153 487.1 168.1 495 187.8C506.7 217.3 504 287.3 504 319.9C504 352.5 506.7 422.6 495 452z" />
    </svg>
  );
}

function YoutubeIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" {...props}>
      <path d="M581.7 188.1C575.5 164.4 556.9 145.8 533.4 139.5C490.9 128 320.1 128 320.1 128C320.1 128 149.3 128 106.7 139.5C83.2 145.8 64.7 164.4 58.4 188.1C47 231 47 320.4 47 320.4C47 320.4 47 409.8 58.4 452.7C64.7 476.3 83.2 494.2 106.7 500.5C149.3 512 320.1 512 320.1 512C320.1 512 490.9 512 533.5 500.5C557 494.2 575.5 476.3 581.8 452.7C593.2 409.8 593.2 320.4 593.2 320.4C593.2 320.4 593.2 231 581.8 188.1zM264.2 401.6L264.2 239.2L406.9 320.4L264.2 401.6z" />
    </svg>
  );
}

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
      <FeaturedBlogs />
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
          <div><strong>Bizni kuzating</strong><span className="socials"><a href="https://t.me/najottalim" target="_blank" rel="noopener noreferrer" aria-label="Telegram"><TelegramIcon /></a><a href="https://www.instagram.com/najottalimteam/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><InstagramIcon /></a><a href="https://youtube.com/@najottalim" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><YoutubeIcon /></a></span></div>
        </div>
        <div className="site-container footer-bottom"><span>© 2026 Najot Ta’lim. Barcha huquqlar himoyalangan.</span><span>Toshkent, O‘zbekiston</span></div>
      </footer>
    </main>
  );
}
