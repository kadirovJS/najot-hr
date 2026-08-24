'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Menu, X } from 'lucide-react';

const links = [
  { href: '/blog', label: 'Blog' },
  { href: '/vacancies', label: 'Vakansiyalar' },
  { href: '/skills-check', label: 'Test' },
  { href: '/#about', label: 'Biz haqimizda' },
  { href: '/#values', label: 'Qadriyatlar' },
  { href: '/#locations', label: 'Filiallar' },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <header className="site-header">
      <div className="site-container header-inner">
        <Link href="/" className="brand" aria-label="Najot Ta'lim HR bosh sahifasi" onClick={() => setOpen(false)}>
          <Image src="/najot.png" alt="Najot Ta'lim" width={144} height={42} priority />
        </Link>
        <nav className="desktop-nav" aria-label="Asosiy navigatsiya">
          {links.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
        </nav>
        <div className="header-actions">
          <Link href="/auth/login" className="header-cta">Kirish <ArrowUpRight size={17} /></Link>
          <button className="menu-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? 'Menyuni yopish' : 'Menyuni ochish'}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      <div
        id="mobile-menu"
        className={`mobile-menu ${open ? 'is-open' : ''}`}
        aria-hidden={!open}
        inert={!open}
      >
        <nav aria-label="Mobil navigatsiya">
          {links.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}<ArrowUpRight size={17} /></Link>)}
          <Link href="/auth/login" onClick={() => setOpen(false)}>Kirish<ArrowUpRight size={17} /></Link>
        </nav>
      </div>
    </header>
  );
}
