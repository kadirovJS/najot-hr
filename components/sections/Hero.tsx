'use client';

import Link from 'next/link';
import { ArrowDown, ArrowUpRight, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createShowcaseDraft, type HeroSlide, type ShowcaseSettings } from '@/lib/landing';

interface HeroProps {
  initialShowcase: ShowcaseSettings;
  initialSlides: HeroSlide[];
}

export default function Hero({ initialShowcase, initialSlides }: HeroProps) {
  const [showcase] = useState<ShowcaseSettings>(() => createShowcaseDraft(initialShowcase));
  const [slides] = useState<HeroSlide[]>(initialSlides);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 6000);
    return () => window.clearInterval(interval);
  }, [slides.length]);

  const currentSlide = slides[activeSlide];
  const heading = currentSlide?.title || showcase.title;
  const description = currentSlide?.description || showcase.description;

  return (
    <section className={`hero-shell ${currentSlide?.image ? 'has-hero-image' : ''}`} aria-labelledby="hero-title">
      {currentSlide?.image && <div className="hero-background" style={{ backgroundImage: `url("${currentSlide.image}")` }} aria-hidden="true" />}
      {currentSlide?.image && <div className="hero-image-overlay" aria-hidden="true" />}
      <div className="hero-grid" aria-hidden="true" />
      <div className="site-container hero-layout">
        <div className="hero-copy">
          <div className="eyebrow">
            <Sparkles size={15} /> {showcase.eyebrow}
          </div>
          <h1 id="hero-title">
            {heading}
          </h1>
          <p className="hero-lead">
            {description}
          </p>
          <div className="hero-actions">
            <Link href={showcase.primaryCtaHref} className="button button-primary">
              {showcase.primaryCtaLabel} <ArrowUpRight size={19} />
            </Link>
            <Link href={showcase.secondaryCtaHref} className="button button-ghost">
              {showcase.secondaryCtaLabel}
            </Link>
          </div>
          <div className="hero-proof" aria-label="Platforma ko‘rsatkichlari">
            {showcase.metrics.map((metric) => (
              <div key={`${metric.value}-${metric.label}`}><strong>{metric.value}</strong><span>{metric.label}</span></div>
            ))}
          </div>
          {slides.length > 1 && (
            <div className="hero-slide-nav" aria-label="Showcase slaydlari">
              {slides.map((slide, index) => (
                <button key={slide._id || slide.image} type="button" className={index === activeSlide ? 'is-active' : ''} onClick={() => setActiveSlide(index)} aria-label={`${index + 1}-slaydga o‘tish`} aria-current={index === activeSlide} />
              ))}
            </div>
          )}
        </div>
      </div>
      <a href="#pathways" className="scroll-cue" aria-label="Keyingi bo‘limga o‘tish"><ArrowDown size={18} /> Pastga</a>
    </section>
  );
}
