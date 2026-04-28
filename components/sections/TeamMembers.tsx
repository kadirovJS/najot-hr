'use client';

import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import Image from 'next/image';

import 'swiper/css';

export default function TeamMembers() {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/landing/team', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        setTeam(data || []);
      })
      .catch(err => console.error("Error loading team:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || team.length === 0) {
    return null; // Or a skeleton
  }

  // Multiply team to ensure smooth infinite loop if team is small
  const displayTeam = team.length < 6 ? [...team, ...team, ...team] : team;

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 mb-12 text-center">
        <h2 className="text-3xl font-bold text-dark">Jamoa a'zolarimiz</h2>
        <p className="text-gray-500 mt-4">Bizning muvaffaqiyatimiz ortida turgan insonlar</p>
      </div>

      <Swiper
        slidesPerView={2}
        spaceBetween={20}
        loop={true}
        speed={5000}
        autoplay={{
          delay: 0,
          disableOnInteraction: false,
        }}
        breakpoints={{
          640: { slidesPerView: 3 },
          768: { slidesPerView: 4 },
          1024: { slidesPerView: 6 },
        }}
        modules={[Autoplay]}
        className="team-swiper"
      >
        {displayTeam.map((member, idx) => (
          <SwiperSlide key={idx}>
            <div className="flex flex-col items-center group">
              <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden mb-4 border-4 border-transparent group-hover:border-primary transition-all duration-300">
                <Image 
                  src={member.image} 
                  alt={member.name} 
                  fill 
                  className="object-cover"
                />
              </div>
              <h4 className="font-bold text-dark text-center">{member.name}</h4>
              <p className="text-sm text-gray-500 text-center">{member.role}</p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx global>{`
        .team-swiper .swiper-wrapper {
          transition-timing-function: linear !important;
        }
      `}</style>
    </section>
  );
}
