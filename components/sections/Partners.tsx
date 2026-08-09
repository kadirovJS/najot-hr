'use client';

import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import Image from 'next/image';

import 'swiper/css';

type Partner = {
  _id: string;
  logo: string;
  name: string;
};

export default function Partners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updateMotionPreference();
    mediaQuery.addEventListener('change', updateMotionPreference);

    return () => mediaQuery.removeEventListener('change', updateMotionPreference);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPartners() {
      try {
        const response = await fetch('/api/landing/partners', {
          cache: 'no-store',
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Partners request failed with ${response.status}`);
        }

        const data = await response.json() as Partner[];
        setPartners(data || []);
      } catch (error) {
        // React Strict Mode and Fast Refresh may abort an in-flight request in development.
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          console.error('Error loading partners:', error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadPartners();
    return () => controller.abort();
  }, []);

  if (loading || partners.length === 0) {
    return null;
  }

  // A few repeated slides keep the loop seamless when only a small set of logos exists.
  const displayPartners = partners.length < 6 ? [...partners, ...partners, ...partners] : partners;

  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-dark italic relative inline-block">
            Bizning hamkorlar
            <span className="absolute -bottom-2 left-0 w-full h-1 bg-primary/20 rounded-full" />
          </h2>
        </div>

        <Swiper
          slidesPerView={2.2}
          spaceBetween={16}
          loop
          speed={5500}
          autoplay={prefersReducedMotion ? false : {
            delay: 0,
            disableOnInteraction: false,
          }}
          breakpoints={{
            640: { slidesPerView: 3.2, spaceBetween: 20 },
            768: { slidesPerView: 4.2, spaceBetween: 24 },
            1024: { slidesPerView: 6.2, spaceBetween: 28 },
          }}
          modules={[Autoplay]}
          className="partners-swiper"
        >
          {displayPartners.map((partner, index) => (
            <SwiperSlide key={`${partner._id}-${index}`}>
              <div className="group flex h-28 flex-col items-center justify-center gap-2 rounded-2xl border border-gray-100/50 bg-white/50 p-3 text-center transition-all duration-300 hover:border-gray-200 hover:bg-white hover:shadow-md md:h-32 md:p-4">
                <div className="h-12 w-full md:h-16">
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    width={240}
                    height={96}
                    sizes="(max-width: 639px) 45vw, (max-width: 767px) 29vw, (max-width: 1023px) 23vw, 16vw"
                    className="h-full w-full object-contain transition-transform duration-500 ease-in-out group-hover:scale-110"
                  />
                </div>
                <p className="line-clamp-2 text-xs font-semibold leading-tight text-gray-600">{partner.name}</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style jsx global>{`
        .partners-swiper .swiper-wrapper {
          transition-timing-function: linear !important;
        }
      `}</style>
    </section>
  );
}
