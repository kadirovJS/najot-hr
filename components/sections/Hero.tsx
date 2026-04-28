'use client';

import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import Image from 'next/image';

// Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import Link from 'next/link';

export default function Hero() {
  const [slides, setSlides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/landing/settings', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data.heroSlides) {
          setSlides(data.heroSlides);
        }
      })
      .catch(err => console.error("Error loading hero slides:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || slides.length === 0) {
    return (
      <section className="relative w-full h-[500px] md:h-[650px] bg-gray-100 animate-pulse flex items-center justify-center">
        <div className="text-gray-300">Yuklanmoqda...</div>
      </section>
    );
  }

  return (

    <section className="relative w-full overflow-hidden">
      <Swiper
        spaceBetween={0}
        centeredSlides={true}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        navigation={true}
        modules={[Autoplay, Pagination, Navigation]}
        className="h-[500px] md:h-[650px] w-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="relative h-full w-full">
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover brightness-50"
                priority={index === 0}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                <h1 className="max-w-4xl text-3xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl mb-6">
                  {slide.title}
                </h1>
                <p className="max-w-2xl text-lg text-gray-200 mb-10">
                  {slide.description}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/vacancies"
                    className="h-12 px-8 rounded-lg bg-primary text-white font-semibold inline-flex items-center justify-center transition-all hover:bg-opacity-90 active:scale-95"
                  >
                    Vakansiyalarni ko'rish
                  </Link>
                  <button className="h-12 px-8 rounded-lg bg-white text-dark font-semibold transition-all hover:bg-gray-100 active:scale-95">
                    Batafsil ma'lumot
                  </button>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
