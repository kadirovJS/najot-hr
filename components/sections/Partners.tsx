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
          <h2 className="text-2xl md:text-3xl font-bold text-dark italic relative inline-block">
            Bizning hamkorlar
            <span className="absolute -bottom-2 left-0 w-full h-1 bg-primary/20 rounded-full" />
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8 items-center justify-items-center">
          {partners.map((partner) => (
            <div 
              key={partner._id} 
              className="w-full h-20 md:h-24 flex items-center justify-center p-4 bg-white/50 border border-gray-100/50 rounded-2xl group transition-all duration-300 hover:bg-white hover:shadow-md hover:border-gray-200"
            >
              <img 
                src={partner.logo} 
                alt={partner.name} 
                className="max-h-full max-w-full object-contain transition-all duration-500 ease-in-out transform group-hover:scale-110"
                title={partner.name}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
