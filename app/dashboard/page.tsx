import { getServerSession } from "next-auth";
import { Users, Briefcase, PlayCircle, Star } from 'lucide-react';
import { authOptions } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-dark">Xush kelibsiz, {user?.name}!</h1>
        <p className="text-gray-500">Sizning rolingiz: <span className="text-primary font-bold">{user?.role}</span></p>
      </div>

      {user?.role === 'SUPER_ADMIN' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={<Users className="text-blue-500" />} title="Xodimlar" value="124" trend="+12" />
          <StatCard icon={<Briefcase className="text-primary" />} title="Vakansiyalar" value="8" trend="+2" />
          <StatCard icon={<PlayCircle className="text-purple-500" />} title="Onboarding" value="45%" trend="O'rtacha" />
          <StatCard icon={<Star className="text-accent" />} title="Natijalar" value="4.8" trend="Reyting" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-4">Mening Onboarding jarayonim</h3>
            <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden">
              <div className="bg-primary h-full w-[25%]"></div>
            </div>
            <p className="mt-4 text-sm text-gray-500">Siz 4 tadan 1 ta videoni ko'rdingiz (25%)</p>
            <button className="mt-6 w-full py-3 bg-primary text-white font-bold rounded-xl">Davom ettirish</button>
          </div>
          
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Bo'lim</h3>
              <p className="text-gray-500">{user?.department || "Noma'lum"}</p>
            </div>
            <div className="mt-4 p-4 bg-accent/5 rounded-2xl border border-accent/10">
              <p className="text-sm text-accent italic">"Bilim olishdan to'xtamang, Najot Ta'lim siz bilan!"</p>
            </div>
          </div>
        </div>
      )}

      {/* So'nggi xabarlar yoki yangiliklar */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold mb-6">Tizim yangiliklari</h3>
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="flex gap-4 p-4 hover:bg-gray-50 rounded-2xl transition-all cursor-pointer border border-transparent hover:border-gray-100">
              <div className="w-12 h-12 bg-gray-100 rounded-xl shrink-0 flex items-center justify-center">
                <PlayCircle className="text-primary h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-dark">Yangi darslik qo'shildi</h4>
                <p className="text-sm text-gray-500">"Kompaniya madaniyati va etika qoidalari" videosi barcha xodimlar uchun ochiq.</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, trend }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-gray-50 rounded-2xl">{icon}</div>
        <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-1 rounded-lg uppercase tracking-wider">{trend}</span>
      </div>
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <p className="text-3xl font-black text-dark mt-1">{value}</p>
      </div>
    </div>
  );
}
