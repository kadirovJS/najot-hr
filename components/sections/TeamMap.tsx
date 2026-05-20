'use client';

import { useState } from 'react';
import { YMaps, Map, Placemark, ZoomControl, FullscreenControl } from '@pbe/react-yandex-maps';
import { MapPin, Phone, Clock, Users as UsersIcon, Building2 } from 'lucide-react';

const branches = [
  { 
    id: 'chilonzor',
    name: "Najot Ta'lim Chilonzor filiali", 
    city: "Toshkent",
    address: "Chilonzor tumani, 9-kvartal, 11-uy",
    coords: [41.2858, 69.2040],
    phone: "+998 71 200 11 23",
    workTime: "09:00 - 20:00",
    students: "1000+",
    staff: "120+"
  },
  { 
    id: 'hadra',
    name: "Najot Ta'lim Hadra filiali", 
    city: "Toshkent",
    address: "Olmazor tumani, Sebzor ko'chasi",
    coords: [41.3235, 69.2435],
    phone: "+998 71 200 11 23",
    workTime: "09:00 - 20:00",
    students: "800+",
    staff: "90+"
  },
  { 
    id: 'chimboy',
    name: "Najot Ta'lim Chimboy filiali", 
    city: "Toshkent",
    address: "Olmazor tumani, Chimboy ko'chasi",
    coords: [41.3533, 69.1944],
    phone: "+998 71 200 11 23",
    workTime: "09:00 - 20:00",
    students: "500+",
    staff: "60+"
  },
  { 
    id: 'fargona',
    name: "Najot Ta'lim Farg'ona filiali", 
    city: "Farg'ona",
    address: "Farg'ona shahar, Mustaqillik ko'chasi",
    coords: [40.3894, 71.7830],
    phone: "+998 71 200 11 23",
    workTime: "09:00 - 19:00",
    students: "400+",
    staff: "40+"
  },
  { 
    id: 'samarqand',
    name: "Najot Ta'lim Samarqand filiali", 
    city: "Samarqand",
    address: "Samarqand shahar, Registon ko'chasi",
    coords: [39.6542, 66.9597],
    phone: "+998 71 200 11 23",
    workTime: "09:00 - 19:00",
    students: "300+",
    staff: "35+"
  },
  { 
    id: 'xorazm',
    name: "Najot Ta'lim Xorazm filiali", 
    city: "Urganch",
    address: "Urganch shahar, Al-Xorazmiy ko'chasi",
    coords: [41.5519, 60.6315],
    phone: "+998 71 200 11 23",
    workTime: "09:00 - 19:00",
    students: "200+",
    staff: "25+"
  },
];

export default function TeamMap() {
  const [selectedBranch, setSelectedBranch] = useState(branches[0]);

  return (
    <section id="locations" className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold tracking-wider text-accent uppercase mb-3">Bizning qamrovimiz</h2>
          <h3 className="text-3xl font-bold text-dark sm:text-4xl">Najot Ta'lim Filiallari</h3>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Bizning filiallarimiz mamlakatimizning turli hududlarida faoliyat yuritib, sifatli ta'limni hamma uchun ochiq qilmoqda.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-stretch">
          {/* Map Side - 50% */}
          <div className="lg:w-1/2 h-[400px] lg:h-[600px] rounded-3xl overflow-hidden shadow-xl border border-gray-100 order-2 lg:order-1">
            <YMaps query={{ lang: 'en_RU' }}>
              <Map 
                state={{ 
                  center: selectedBranch.coords, 
                  zoom: 14,
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
                
                {branches.map((branch) => (
                  <Placemark
                    key={branch.id}
                    geometry={branch.coords}
                    properties={{
                      balloonContentBody: branch.name,
                      hintContent: branch.name,
                    }}
                    options={{
                      preset: branch.id === selectedBranch.id ? 'islands#redEducationIcon' : 'islands#greenEducationIcon',
                      iconColor: branch.id === selectedBranch.id ? '#ff4d4d' : '#0db180',
                    }}
                    onClick={() => setSelectedBranch(branch)}
                  />
                ))}
              </Map>
            </YMaps>
          </div>

          {/* Info Side - 50% */}
          <div className="lg:w-1/2 flex flex-col gap-6 order-1 lg:order-2">
            {/* Branch Selector */}
            <div className="bg-gray-50 p-2 rounded-2xl flex flex-wrap gap-2">
              {branches.map((branch) => (
                <button
                  key={branch.id}
                  onClick={() => setSelectedBranch(branch)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedBranch.id === branch.id 
                      ? 'bg-primary text-white shadow-md' 
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {branch.city === "Toshkent" ? branch.name.replace("Najot Ta'lim ", "").replace(" filiali", "") : branch.city}
                </button>
              ))}
            </div>

            {/* Branch Details Card */}
            <div className="flex-grow bg-white p-8 rounded-3xl border border-gray-100 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-primary/10 rounded-2xl">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-dark">{selectedBranch.name}</h4>
                    <p className="text-gray-500">{selectedBranch.city} shahri</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-gray-50 rounded-lg mt-1">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-dark">Manzil</p>
                      <p className="text-gray-600">{selectedBranch.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-gray-50 rounded-lg mt-1">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-dark">Telefon</p>
                      <p className="text-gray-600">{selectedBranch.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-gray-50 rounded-lg mt-1">
                      <Clock className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-dark">Ish vaqti</p>
                      <p className="text-gray-600">{selectedBranch.workTime}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-gray-100">
                <div className="bg-accent/5 p-4 rounded-2xl border border-accent/10">
                  <div className="flex items-center gap-2 mb-1">
                    <UsersIcon className="h-4 w-4 text-accent" />
                    <span className="text-xs font-bold text-accent uppercase tracking-wider">O'quvchilar</span>
                  </div>
                  <p className="text-2xl font-bold text-dark">{selectedBranch.students}</p>
                </div>
                <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                  <div className="flex items-center gap-2 mb-1">
                    <UsersIcon className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">Xodimlar</span>
                  </div>
                  <p className="text-2xl font-bold text-dark">{selectedBranch.staff}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
