'use client';

import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

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

  return (
    <AnimatePresence mode="wait">
      {loading || slides.length === 0 ? (
        <motion.section 
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="relative w-full h-[500px] md:h-[650px] bg-white flex items-center justify-center overflow-hidden"
        >
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <h1 className="text-[12vw] md:text-[10vw] font-black text-gray-400/15 uppercase tracking-tighter leading-none text-center select-none">
              Najot <br className="md:hidden" /> Ta'lim
            </h1>
          </div>
          <div className="z-10 flex flex-col items-center">
             <div className="w-48 h-1 bg-gray-100 rounded-full overflow-hidden relative">
               <motion.div 
                 className="absolute inset-0 bg-primary/40"
                 initial={{ x: "-100%" }}
                 animate={{ x: "100%" }}
                 transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
               />
             </div>
          </div>
        </motion.section>
      ) : (
        <motion.section 
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative w-full overflow-hidden"
        >
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
                    <motion.h1 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="max-w-4xl text-3xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl mb-6"
                    >
                      {slide.title}
                    </motion.h1>
                    <motion.p 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="max-w-2xl text-lg text-gray-200 mb-10"
                    >
                      {slide.description}
                    </motion.p>
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="flex flex-col sm:flex-row gap-4"
                    >
                      <Link
                        href="/vacancies"
                        className="h-12 px-8 rounded-lg bg-primary text-white font-semibold inline-flex items-center justify-center transition-all hover:bg-opacity-90 active:scale-95"
                      >
                        Vakansiyalarni ko'rish
                      </Link>
                      <button className="h-12 px-8 rounded-lg bg-white text-dark font-semibold transition-all hover:bg-gray-100 active:scale-95">
                        Batafsil ma'lumot
                      </button>
                    </motion.div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
