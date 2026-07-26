'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, BriefcaseBusiness, Check, Clock3, Copy, MapPin, Send, Share2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import { vacancyService } from '@/services/vacancyService';
import { IVacancy } from '@/types/vacancy';

const typeLabels: Record<string, string> = { 'Full-time': 'To‘liq stavka', 'Part-time': 'Yarim stavka', Remote: 'Masofaviy', Internship: 'Amaliyot' };

export default function VacancyDetail() {
  const { id } = useParams<{ id: string }>();
  const root = useRef<HTMLDivElement>(null);
  const [vacancy, setVacancy] = useState<IVacancy | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    vacancyService.getVacancyById(id).then(setVacancy).catch(() => setFailed(true)).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!vacancy || !root.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      gsap.from('[data-detail-hero]', { y: 30, opacity: 0, duration: .72, stagger: .08, ease: 'power3.out' });
      gsap.utils.toArray<HTMLElement>('[data-detail-section]').forEach((section) => gsap.from(section, { y: 30, opacity: 0, duration: .65, ease: 'power2.out', scrollTrigger: { trigger: section, start: 'top 88%', once: true } }));
    }, root);
    return () => context.revert();
  }, [vacancy]);

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true); window.setTimeout(() => setCopied(false), 2500);
  };

  if (loading) return <div className="vacancy-detail-page"><Header/><main className="detail-loading site-container"><div/><div/><div/></main></div>;

  if (failed || !vacancy) return <div className="vacancy-detail-page"><Header/><main className="detail-not-found site-container"><BriefcaseBusiness/><h1>Vakansiya topilmadi</h1><p>Bu vakansiya yopilgan yoki manzil noto‘g‘ri bo‘lishi mumkin.</p><Link href="/vacancies" className="button button-primary"><ArrowLeft size={18}/> Barcha vakansiyalar</Link></main></div>;

  const telegramText = encodeURIComponent(`Assalomu alaykum, men “${vacancy.title}” vakansiyasi bo‘yicha ariza topshirmoqchiman.`);

  return (
    <div ref={root} className="vacancy-detail-page">
      <Header />
      <main>
        <section className="detail-hero">
          <div className="site-container">
            <Link data-detail-hero href="/vacancies" className="back-home"><ArrowLeft size={16}/> Vakansiyalarga qaytish</Link>
            <div className="detail-hero-grid">
              <div>
                <span data-detail-hero className="detail-category">{vacancy.category}</span>
                <h1 data-detail-hero>{vacancy.title}</h1>
                <p data-detail-hero className="detail-intro">Najot Ta’lim jamoasida bilim, tashabbus va natijaga asoslangan muhitda ishlang.</p>
              </div>
              <div data-detail-hero className="detail-hero-action">
                <span>Arizalar qabul qilinmoqda</span>
                <a href={`https://t.me/Najot_Talim_IT?text=${telegramText}`} target="_blank" rel="noopener noreferrer">Ariza yuborish <Send size={18}/></a>
              </div>
            </div>
            <div data-detail-hero className="detail-facts">
              <div><MapPin/><span>Manzil<strong>{vacancy.location}</strong></span></div>
              <div><BriefcaseBusiness/><span>Ish formati<strong>{typeLabels[vacancy.type] || vacancy.type}</strong></span></div>
              <div><Clock3/><span>E’lon sanasi<strong>{new Intl.DateTimeFormat('uz-UZ', { day:'2-digit', month:'long', year:'numeric' }).format(new Date(vacancy.createdAt))}</strong></span></div>
              <div><span className="salary-mark">$</span><span>Maosh<strong>{vacancy.salary}</strong></span></div>
            </div>
          </div>
        </section>

        <section className="detail-body">
          <div className="site-container detail-layout">
            <article className="detail-content">
              <section data-detail-section className="detail-section"><span className="detail-section-label">Vakansiya haqida</span><h2>Siz nima ustida ishlaysiz?</h2><p className="detail-description">{vacancy.description}</p></section>
              {vacancy.requirements?.length > 0 && <section data-detail-section className="detail-section"><span className="detail-section-label">Nomzoddan kutamiz</span><h2>Asosiy talablar</h2><ul className="detail-list">{vacancy.requirements.map((requirement) => <li key={requirement}><Check/>{requirement}</li>)}</ul></section>}
              {vacancy.benefits?.length > 0 && <section data-detail-section className="detail-section"><span className="detail-section-label">Biz taklif qilamiz</span><h2>Jamoaga qo‘shilganda</h2><ul className="detail-list benefits-list">{vacancy.benefits.map((benefit) => <li key={benefit}><Check/>{benefit}</li>)}</ul></section>}
            </article>

            <aside className="detail-apply">
              <div className="detail-apply-card">
                <span className="eyebrow">Keyingi qadam</span><h2>Jamoaga qo‘shiling</h2><p>Telegram orqali HR jamoamizga yozing. Qisqa ma’lumot va rezyumengizni yuborishingiz mumkin.</p>
                <a href={`https://t.me/Najot_Talim_IT?text=${telegramText}`} target="_blank" rel="noopener noreferrer" className="button button-primary">Ariza yuborish <Send size={18}/></a>
                <div className="share-row"><span><Share2/> Vakansiyani ulashish</span><button onClick={copyLink}>{copied ? <Check/> : <Copy/>}{copied ? 'Nusxalandi' : 'Havolani nusxalash'}</button></div>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <footer className="vacancies-footer"><div className="site-container"><span>© 2026 Najot Ta’lim HR</span><Link href="/">Bosh sahifa</Link><Link href="/vacancies">Vakansiyalar</Link></div></footer>
    </div>
  );
}
