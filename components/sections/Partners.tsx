'use client';

import { useState, useEffect } from 'react';

export default function Partners() {
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/landing/partners', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        setPartners(data || []);
      })
      .catch(err => console.error("Error loading partners:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || partners.length === 0) {
    return null;
  }

  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-dark">Bizning hamkorlar</h2>
          <p className="text-gray-500 mt-4">Biz bilan birga ishlovchi yetakchi kompaniyalar</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 items-center">
          {partners.map((partner) => (
            <div key={partner._id} className="group relative aspect-[3/2] w-full overflow-hidden rounded-[2rem] bg-white border border-gray-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
              <img 
                src={partner.logo} 
                alt={partner.name} 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
              />
              <div className="absolute inset-0 bg-dark/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
