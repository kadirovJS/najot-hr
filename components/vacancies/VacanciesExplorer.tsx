'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowLeft, ArrowRight, BriefcaseBusiness, Building2, CheckCircle2,
  Clock3, MapPin, Search, SlidersHorizontal, Sparkles, UsersRound, X,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import { formatUzDateShort } from '@/lib/date';
import { IVacancy, VACANCY_CATEGORIES } from '@/types/vacancy';

const categories = ['Barchasi', ...VACANCY_CATEGORIES];
const typeLabels: Record<string, string> = { 'Full-time': 'To‘liq stavka', 'Part-time': 'Yarim stavka', Remote: 'Masofaviy', Internship: 'Amaliyot' };

export default function VacanciesExplorer({ vacancies, failed }: { vacancies: IVacancy[]; failed: boolean }) {
  const page = useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState('Barchasi');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!page.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      gsap.from('[data-vacancy-hero]', { y: 38, opacity: 0, duration: .85, stagger: .09, ease: 'power3.out' });
      gsap.from('.career-compass', { scale: .65, opacity: 0, rotation: -18, duration: 1.15, delay: .12, ease: 'expo.out' });
      gsap.from('.vacancy-toolbar', { y: 35, opacity: 0, duration: .7, scrollTrigger: { trigger: '.vacancy-toolbar', start: 'top 90%', once: true } });
    }, page);
    return () => context.revert();
  }, []);

  const filteredVacancies = useMemo(() => vacancies.filter((vacancy) => {
    const query = searchQuery.trim().toLocaleLowerCase('uz');
    const matchesCategory = selectedCategory === 'Barchasi' || vacancy.category === selectedCategory;
    const matchesSearch = !query || `${vacancy.title} ${vacancy.location} ${vacancy.type}`.toLocaleLowerCase('uz').includes(query);
    return matchesCategory && matchesSearch;
  }), [vacancies, searchQuery, selectedCategory]);

  const resetFilters = () => { setSearchQuery(''); setSelectedCategory('Barchasi'); };
  const hasFilters = Boolean(searchQuery || selectedCategory !== 'Barchasi');

  return (
    <div ref={page} className="vacancies-page">
      <Header />
      <main>
        <section className="vacancies-hero">
          <div className="vacancies-hero-grid" aria-hidden="true" />
          <div className="site-container vacancies-hero-layout">
            <div className="vacancies-hero-copy">
              <Link data-vacancy-hero href="/" className="back-home"><ArrowLeft size={16} /> Bosh sahifa</Link>
              <span data-vacancy-hero className="eyebrow"><Sparkles size={15} /> Ochiq imkoniyatlar</span>
              <h1 data-vacancy-hero>Kasbingiz bilan <em>ta’limga ta’sir</em> qiling.</h1>
              <p data-vacancy-hero>Biz shunchaki xodim emas, muammoni ko‘ra oladigan, o‘rganishdan zavqlanadigan va natijaga egalik qiladigan hamfikrlarni izlaymiz.</p>
              <a data-vacancy-hero href="#open-roles" className="button button-primary">Mos rolni topish <ArrowRight size={18} /></a>
            </div>
            <div className="career-compass" aria-label={`${vacancies.length} ta ochiq vakansiya`}>
              <div className="compass-ring ring-one"/><div className="compass-ring ring-two"/><div className="compass-ring ring-three"/>
              <div className="compass-core"><strong>{vacancies.length}</strong><span>ochiq rol</span></div>
              <span className="compass-chip chip-one"><BriefcaseBusiness /> Karyera</span>
              <span className="compass-chip chip-two"><UsersRound /> Kuchli jamoa</span>
              <span className="compass-chip chip-three"><CheckCircle2 /> Real ta’sir</span>
            </div>
          </div>
          <div className="vacancies-marquee" aria-hidden="true"><div>O‘RGANISH · TASHABBUS · NATIJA · HAMJIHATLIK · O‘RGANISH · TASHABBUS · NATIJA · HAMJIHATLIK ·</div></div>
        </section>

        <section id="open-roles" className="open-roles">
          <div className="site-container">
            <div className="roles-heading">
              <div><span className="eyebrow">O‘z o‘rningizni toping</span><h2>Ochiq vakansiyalar</h2></div>
              <p><strong>{filteredVacancies.length}</strong> ta mos imkoniyat</p>
            </div>

            <div className="vacancy-toolbar">
              <div className="vacancy-search">
                <Search size={20} aria-hidden="true" />
                <label htmlFor="vacancy-search" className="sr-only">Vakansiya qidirish</label>
                <input id="vacancy-search" type="search" placeholder="Lavozim yoki hudud bo‘yicha qidiring" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
                {searchQuery && <button onClick={() => setSearchQuery('')} aria-label="Qidiruvni tozalash"><X size={18}/></button>}
              </div>
              <div className="category-filters" aria-label="Vakansiya kategoriyalari"><SlidersHorizontal size={17} />{categories.map((category) => <button key={category} className={selectedCategory === category ? 'is-active' : ''} aria-pressed={selectedCategory === category} onClick={() => setSelectedCategory(category)}>{category}</button>)}</div>
            </div>

            {failed ? (
              <div className="vacancy-state"><BriefcaseBusiness /><h3>Vakansiyalarni yuklab bo‘lmadi</h3><p>Internet aloqasini tekshirib, yana urinib ko‘ring.</p><Link className="button button-primary" href="/vacancies">Qayta urinish</Link></div>
            ) : filteredVacancies.length ? (
              <div className="vacancy-list">
                {filteredVacancies.map((vacancy, index) => (
                  <Link href={`/vacancies/${vacancy._id}`} className="vacancy-row" key={vacancy._id}>
                    <div className="vacancy-number">{String(index + 1).padStart(2, '0')}</div>
                    <div className="vacancy-main"><span className="vacancy-category">{vacancy.category}</span><h3>{vacancy.title}</h3><div className="vacancy-meta"><span><MapPin />{vacancy.location}</span><span><Clock3 />{typeLabels[vacancy.type] || vacancy.type}</span><span><Building2 />{vacancy.salary}</span></div></div>
                    <div className="vacancy-date"><span>E’lon qilingan</span>{formatUzDateShort(vacancy.createdAt)}</div>
                    <div className="vacancy-arrow"><ArrowRight /></div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="vacancy-state"><Search /><h3>Mos vakansiya topilmadi</h3><p>Boshqa kalit so‘z yozing yoki barcha yo‘nalishlarni ko‘ring.</p>{hasFilters && <button className="button button-primary" onClick={resetFilters}>Filtrlarni tozalash</button>}</div>
            )}
          </div>
        </section>

        <section className="vacancy-culture">
          <div className="site-container vacancy-culture-grid">
            <div><span className="eyebrow eyebrow-light">Nega Najot Ta’lim?</span><h2>Bu yerda ish — o‘sishning bir shakli.</h2></div>
            <div className="culture-points"><article><span>01</span><h3>O‘rganish muhiti</h3><p>Kurslar, mentorlik va tajriba almashish orqali doimiy rivojlanish.</p></article><article><span>02</span><h3>Ochiq jamoa</h3><p>Fikr bildirish, tashabbus ko‘rsatish va natijaga egalik qilish uchun joy bor.</p></article><article><span>03</span><h3>Sezilarli ta’sir</h3><p>Qilgan ishingiz minglab o‘quvchi va ularning kelajagiga xizmat qiladi.</p></article></div>
          </div>
        </section>
      </main>
      <footer className="vacancies-footer"><div className="site-container"><span>© 2026 Najot Ta’lim HR</span><Link href="/">Bosh sahifa</Link><Link href="/skills-check">Bilim testi</Link></div></footer>
    </div>
  );
}
