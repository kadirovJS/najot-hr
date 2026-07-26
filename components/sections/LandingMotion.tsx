'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function LandingMotion() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((element) => {
        gsap.from(element, {
          y: 46,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: element, start: 'top 88%', once: true },
        });
      });
      gsap.utils.toArray<HTMLElement>('[data-stagger]').forEach((container) => {
        gsap.from(container.children, {
          y: 34, opacity: 0, duration: 0.65, stagger: 0.08, ease: 'power2.out',
          scrollTrigger: { trigger: container, start: 'top 84%', once: true },
        });
      });
    });
    return () => context.revert();
  }, []);
  return null;
}
