'use client';

import { useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import { MapPin, Briefcase, Clock, DollarSign, ChevronLeft, CheckCircle2, Send } from 'lucide-react';
import Link from 'next/link';

const allVacancies = [
  {
    id: 1,
    title: 'Senior React Developer',
    category: 'IT',
    location: 'Toshkent (Hadra)',
    type: 'Full-time',
    salary: '1500$ - 2500$',
    postedAt: '2 kun oldin',
    description: "Bizning jamoamizga tajribali React dasturchi kerak. Siz murakkab interfeyslarni yaratish va optimallashtirish bilan shug'ullanasiz.",
    requirements: [
      "React.js va Next.js bo'yicha 3+ yillik tajriba",
      "TypeScript bilan ishlash ko'nikmasi",
      "State management (Redux, Zustand yoki React Query) bo'yicha bilimlar",
      "Yaxshi muloqot qobiliyati va jamoada ishlash"
    ],
    benefits: [
      "Zamonaviy ofis va qulay sharoitlar",
      "Professional o'sish uchun treninglar",
      "Bepul tushlik va kofe-breyklar",
      "Kuchli va ahil jamoa"
    ]
  },
  {
    id: 2,
    title: 'HR Manager',
    category: 'HR',
    location: 'Toshkent (Chilonzor)',
    type: 'Full-time',
    salary: '8 mln - 12 mln',
    postedAt: 'Bugun',
    description: "Kompaniyamizning kadrlar siyosatini yuritish va jamoani kengaytirish uchun HR menejer qidirmoqdamiz.",
    requirements: [
      "HR sohasida kamida 2 yillik tajriba",
      "O'zbek va rus tillarini mukammal bilish",
      "Intervyu o'tkazish texnikalarini bilish",
      "Mehnat kodeksi bo'yicha boshlang'ich bilimlar"
    ],
    benefits: [
      "Raqobatbardosh ish haqi",
      "Sog'liqni saqlash sug'urtasi",
      "Karyera o'sishi imkoniyati",
      "Korporativ tadbirlar"
    ]
  },
  // Boshqa vakansiyalar uchun ham shunday ma'lumotlar...
];

export default function VacancyDetail() {
  const params = useParams();
  const id = Number(params.id);
  
  const vacancy = allVacancies.find(v => v.id === id) || allVacancies[0];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 md:px-6 py-12">
        <Link 
          href="/vacancies" 
          className="inline-flex items-center gap-2 text-gray-500 hover:text-primary mb-8 transition-colors font-medium"
        >
          <ChevronLeft className="h-5 w-5" /> Vakansiyalarga qaytish
        </Link>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-grow space-y-8">
            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="px-4 py-1.5 bg-primary/10 text-primary text-sm font-bold rounded-full uppercase tracking-wider">
                  {vacancy.category}
                </span>
                <span className="px-4 py-1.5 bg-gray-100 text-gray-600 text-sm font-bold rounded-full">
                  {vacancy.type}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-dark mb-6">{vacancy.title}</h1>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-gray-100">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-400 uppercase font-bold tracking-widest">Manzil</span>
                  <div className="flex items-center gap-2 text-dark font-semibold">
                    <MapPin className="h-4 w-4 text-primary" /> {vacancy.location}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-400 uppercase font-bold tracking-widest">Maosh</span>
                  <div className="flex items-center gap-2 text-dark font-semibold">
                    <DollarSign className="h-4 w-4 text-primary" /> {vacancy.salary}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-400 uppercase font-bold tracking-widest">Ish turi</span>
                  <div className="flex items-center gap-2 text-dark font-semibold">
                    <Briefcase className="h-4 w-4 text-primary" /> {vacancy.type}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-400 uppercase font-bold tracking-widest">E'lon qilindi</span>
                  <div className="flex items-center gap-2 text-dark font-semibold">
                    <Clock className="h-4 w-4 text-primary" /> {vacancy.postedAt}
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <h2 className="text-2xl font-bold text-dark mb-4">Ish tavsifi</h2>
                <p className="text-gray-600 leading-relaxed mb-8">
                  {vacancy.description}
                </p>

                <h2 className="text-2xl font-bold text-dark mb-4">Nomzodga qo'yiladigan talablar</h2>
                <ul className="space-y-4 mb-8">
                  {vacancy.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-600">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-1 shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>

                <h2 className="text-2xl font-bold text-dark mb-4">Biz nima taklif qilamiz?</h2>
                <ul className="space-y-4">
                  {vacancy.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-600">
                      <CheckCircle2 className="h-5 w-5 text-accent mt-1 shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-96 shrink-0">
            <div className="sticky top-28 bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
              <h3 className="text-xl font-bold text-dark mb-6">Ariza topshirish</h3>
              <p className="text-gray-500 text-sm mb-8">
                Ushbu vakansiya sizga ma'qul keldimi? Hoziroq arizangizni qoldiring!
              </p>
              
              <div className="space-y-4">
                <button className="w-full h-14 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:bg-opacity-95 active:scale-[0.98] transition-all">
                  <Send className="h-5 w-5" /> Arizani yuborish
                </button>
                <p className="text-[11px] text-gray-400 text-center">
                  Tugmani bosish orqali siz shaxsiy ma'lumotlaringizni qayta ishlashga rozilik bildirasiz.
                </p>
              </div>

              <div className="mt-10 pt-8 border-t border-gray-100">
                <h4 className="font-bold text-dark mb-4">Ulashish</h4>
                <div className="flex gap-3">
                  {['Telegram', 'Linkedin', 'Copy'].map(social => (
                    <button key={social} className="flex-grow py-2 border border-gray-100 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                      {social}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-100 py-8 text-center text-sm text-gray-400 mt-12">
        © 2026 Najot Ta'lim HR. Barcha huquqlar himoyalangan.
      </footer>
    </div>
  );
}
