import { Users, Target, Rocket, Heart } from 'lucide-react';

const values = [
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: "Hamjihatlik",
    description: "Biz bir maqsad yo'lida birlashgan yirik oilamiz. Jamoaviy ruh bizning eng katta kuchimizdir."
  },
  {
    icon: <Target className="h-8 w-8 text-primary" />,
    title: "Natijaviylik",
    description: "Biz faqat natija uchun ishlaymiz. Har bir darsimiz va loyihamiz o'quvchilar hayotida ijobiy o'zgarish qilishiga intilamiz."
  },
  {
    icon: <Rocket className="h-8 w-8 text-primary" />,
    title: "Doimiy rivojlanish",
    description: "O'z ustimizda ishlashdan to'xtamaymiz. Ta'lim sohasidagi eng so'nggi trendlarni qo'llaymiz."
  },
  {
    icon: <Heart className="h-8 w-8 text-primary" />,
    title: "Samimiylik",
    description: "Bizning muhitda ishonch va samimiylik ustuvor. Har bir fikr va taklif biz uchun muhim."
  }
];

export default function AboutTeam() {
  return (
    <div className="py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        {/* Intro section */}
        <div className="flex flex-col md:flex-row items-center gap-12 mb-24">
          <div className="flex-1">
            <h2 className="text-sm font-bold tracking-wider text-accent uppercase mb-3">Bizning jamoa</h2>
            <h3 className="text-3xl font-bold text-dark sm:text-4xl mb-6">
              Najot Ta'lim — bu faqat o'quv markazi emas, bu katta bir harakatdir.
            </h3>
            <p className="text-lg text-gray-600 leading-relaxed">
              Bizning HR tizimimiz har bir xodimning salohiyatini ochishga va ularni professional darajada qo'llab-quvvatlashga yo'naltirilgan. Biz bilan siz nafaqat ishli bo'lasiz, balki o'z sohangizning eng yaxshi mutaxassisiga aylanasiz.
            </p>
          </div>
          <div className="flex-1 relative h-[400px] w-full rounded-2xl overflow-hidden shadow-2xl">
             <img 
               src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop" 
               alt="Team working" 
               className="object-cover h-full w-full"
             />
          </div>
        </div>

        {/* Values grid */}
        <div id="values" className="text-center mb-16">
          <h2 className="text-3xl font-bold text-dark mb-4">Bizning Qadriyatlarimiz</h2>
          <p className="text-accent font-medium">Bizning ishimizni belgilaydigan tamoyillar</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <div key={index} className="p-8 rounded-2xl border border-gray-100 bg-gray-50/50 transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="mb-4 inline-block p-3 bg-white rounded-xl shadow-sm">
                {value.icon}
              </div>
              <h4 className="text-xl font-bold text-dark mb-3">{value.title}</h4>
              <p className="text-gray-600 leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
