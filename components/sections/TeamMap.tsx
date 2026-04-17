'use client';

import { YMaps, Map, Placemark, ZoomControl, FullscreenControl } from '@pbe/react-yandex-maps';

const locations = [
  { name: "Farg'ona shahar", coords: [40.3894, 71.7830] },
  { name: "Najot Ta'lim Chilonzor filiali", coords: [41.2858, 69.2040] },
  { name: "Najot Ta'lim Hadra filiali", coords: [41.3235, 69.2435] },
  { name: "Najot Ta'lim Chimboy filiali", coords: [41.3533, 69.1944] },
  { name: "Samarqand filiali", coords: [39.6542, 66.9597] },
  { name: "Xorazm filiali", coords: [41.5519, 60.6315] },
];

export default function TeamMap() {
  return (
    <section id="locations" className="py-24 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold tracking-wider text-accent uppercase mb-3">Bizning qamrovimiz</h2>
          <h3 className="text-3xl font-bold text-dark sm:text-4xl">Najot Ta'lim Jamoasi Butun O'zbekiston Bo'ylab</h3>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Bizning jamoamiz a'zolari va filiallarimiz mamlakatimizning turli hududlarida faoliyat yuritib, ta'lim sifatini oshirishga hissa qo'shmoqda.
          </p>
        </div>

        <div className="relative w-full max-w-5xl mx-auto h-[450px] md:h-[600px] bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          <YMaps query={{ lang: 'en_RU' }}>
            <Map 
              defaultState={{ 
                center: [41.311081, 69.240562], // O'zbekiston markazi (Toshkent yaqini)
                zoom: 6,
                controls: []
              }} 
              width="100%" 
              height="100%"
              options={{
                suppressMapOpenBlock: true,
              }}
            >
              <ZoomControl options={{ position: { right: 10, top: 10 } }} />
              <FullscreenControl />
              
              {locations.map((loc, idx) => (
                <Placemark
                  key={idx}
                  geometry={loc.coords}
                  properties={{
                    balloonContentBody: loc.name,
                    hintContent: loc.name,
                  }}
                  options={{
                    preset: 'islands#greenEducationIcon',
                    iconColor: '#0db180',
                  }}
                />
              ))}
            </Map>
          </YMaps>

          {/* Stats Label */}
          <div className="absolute bottom-6 left-6 right-6 md:right-auto md:w-auto z-10">
            <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-gray-200 shadow-lg">
              <div className="flex justify-around md:justify-start gap-6">
                <div>
                  <p className="text-2xl font-bold text-primary">6+</p>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Yirik Filiallar</p>
                </div>
                <div className="w-px h-8 bg-gray-200"></div>
                <div>
                  <p className="text-2xl font-bold text-accent">300+</p>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Jamoa a'zolari</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
