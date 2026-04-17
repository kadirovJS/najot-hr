'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import Image from 'next/image';

import 'swiper/css';

const team = [
  { name: "Abdufattoh", role: "HR Menejer", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&h=200&auto=format&fit=crop" },
  { name: "Sardorbek", role: "Project Manager", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&h=200&auto=format&fit=crop" },
  { name: "Malika", role: "Dizayner", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200&auto=format&fit=crop" },
  { name: "Diyorbek", role: "Lead Developer", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&h=200&auto=format&fit=crop" },
  { name: "Nigora", role: "Marketing Menejer", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&h=200&auto=format&fit=crop" },
  { name: "Javohir", role: "Mentor", image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&h=200&auto=format&fit=crop" },
];

export default function TeamMembers() {
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
        {[...team, ...team].map((member, idx) => (
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
