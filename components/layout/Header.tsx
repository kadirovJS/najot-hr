'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: '/#about', label: 'Jamoa haqida' },
    { href: '/#locations', label: 'Hududlar' },
    { href: '/vacancies', label: 'Vakansiyalar' },
    { href: '/skills-check', label: 'Skills Check' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
          <Image 
            src="https://najottalim.uz/icons/logo.svg" 
            alt="Najot Ta'lim Logo" 
            width={160} 
            height={40} 
            className="h-10 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <Link 
            href="/auth/login" 
            className="inline-flex h-10 md:h-11 items-center justify-center rounded-lg bg-primary px-5 md:px-8 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-opacity-90 active:scale-95"
          >
            Kirish
          </Link>

          {/* Mobile Menu Button */}
          <button 
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-100 md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6 text-dark" /> : <Menu className="h-6 w-6 text-dark" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-64 border-b border-gray-100 bg-white' : 'max-h-0'}`}>
        <nav className="flex flex-col p-4 space-y-4">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className="text-base font-medium text-gray-600 hover:text-primary transition-colors px-2 py-1"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
