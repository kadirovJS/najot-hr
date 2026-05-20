import { cloneElement } from 'react';
import { Lightbulb, TrendingUp, MessageSquare, Globe, Zap, Users } from 'lucide-react';

const values = [
  {
    icon: <Lightbulb className="h-8 w-8 text-primary" />,
    title: "Innovatsion fikrlash",
    description: "Biz har doim yangi g'oyalar va innovatsiyalarni qo'llab-quvvatlaymiz, ta'limda eng so'nggi texnologiyalarni qo'llaymiz."
  },
  {
    icon: <TrendingUp className="h-8 w-8 text-primary" />,
    title: "Professionalizm va rivojlanish",
    description: "O'z ustimizda ishlashdan to'xtamaymiz. Jamoamizning har bir a'zosi professional o'sishi uchun barcha sharoitlarni yaratamiz."
  },
  {
    icon: <MessageSquare className="h-8 w-8 text-primary" />,
    title: "Fikrlarga ochiqlik",
    description: "Bizning muhitda har bir fikr va taklif muhim. Biz ochiq muloqot va samimiylik tarafdorimiz."
  },
  {
    icon: <Globe className="h-8 w-8 text-primary" />,
    title: "Ijtimoiy mas’uliyat",
    description: "Biz jamiyat rivojiga hissa qo'shishni va sifatli ta'lim orqali insonlar hayotini o'zgartirishni o'z burchimiz deb bilamiz."
  },
  {
    icon: <Zap className="h-8 w-8 text-primary" />,
    title: "Moslashuvchanlik",
    description: "Tez o'zgaruvchan zamonda yangiliklarni tez qabul qilamiz va har qanday vaziyatda samarali yechimlar topamiz."
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: "Jamoaviy ruh",
    description: "Biz bir maqsad yo'lida birlashgan yirik oilamiz. Hamjihatlik va o'zaro qo'llab-quvvatlash bizning asosiy kuchimizdir."
  }
];

export default function AboutTeam() {
  return (
    <div id="about" className="py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        {/* Intro section */}
        <div className="flex flex-col md:flex-row items-center gap-12 mb-24">
          <div className="flex-1">
            <h2 className="text-sm font-bold tracking-wider text-accent uppercase mb-3">Biz haqimizda</h2>
            <h3 className="text-3xl font-bold text-dark sm:text-4xl mb-6">
              “Najot Ta'lim” — zamonaviy kasblar markazi
            </h3>
            <div className="space-y-4 text-lg text-gray-600 leading-relaxed">
              <p>
                “Najot Ta'lim” bu — dasturlash, dizayn va marketing kabi zamonaviy kasblar o‘rgatiladigan markazdir. Biz zamonaviy kasblar yordamida insonlar hayotini yaxshilovchi va kelajakka bo‘lgan ishonchni mustahkamlovchi maskan hisoblanamiz.
              </p>
              <p>
                Hozirgi kunda markazimiz bir vaqtning o‘zida 2500 dan ortiq o‘quvchilar va 350 dan ortiq katta jamoani bir maskanga yig‘a olgan ta‘lim va innovatsiya markaziga aylandi.
              </p>
            </div>
          </div>
          <div className="flex-1 relative h-[400px] w-full rounded-2xl overflow-hidden shadow-2xl">
             <img 
               src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop" 
               alt="Najot Ta'lim jamoasi" 
               className="object-cover h-full w-full"
             />
          </div>
        </div>

        {/* Values grid */}
        <div id="values" className="text-center mb-16">
          <h2 className="text-3xl font-bold text-dark mb-4">Bizning Qadriyatlarimiz</h2>
          <p className="text-accent font-medium">Bizning ishimizni belgilaydigan tamoyillar</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {values.map((value, index) => (
            <div key={index} className="group relative p-8 rounded-2xl border border-gray-100 bg-gray-50/50 transition-all hover:shadow-xl hover:-translate-y-1 overflow-hidden">
              {/* Background Icon Watermark */}
              <div className="absolute -right-4 -bottom-4 text-primary/5 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-12">
                {cloneElement(value.icon as React.ReactElement<any>, { className: "h-32 w-32" })}
              </div>
              
              <div className="relative z-10">
                <div className="mb-4 inline-block p-3 bg-white rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-110">
                  {value.icon}
                </div>
                <h4 className="text-xl font-bold text-dark mb-3">{value.title}</h4>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
