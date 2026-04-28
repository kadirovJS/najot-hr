'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Award, 
  Repeat, 
  Search,
  Loader2,
  ChevronRight,
  User as UserIcon
} from 'lucide-react';

export default function StatisticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/dashboard/stats/detailed')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Loader2 className="h-10 w-10 text-primary animate-spin" />
    </div>
  );

  const filteredProgress = data?.userProgress.filter((up: any) => 
    up.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    up.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const growth = data.overview.usersLastMonth === 0 
    ? 100 
    : Math.round(((data.overview.usersThisMonth - data.overview.usersLastMonth) / data.overview.usersLastMonth) * 100);

  return (
    <div className="space-y-6 md:space-y-10 pb-20">
      <div className="px-1">
        <h1 className="text-2xl md:text-3xl font-black text-dark tracking-tight">Tizim Statistikasi</h1>
        <p className="text-sm md:text-gray-500 font-medium">O'quv jarayoni va xodimlar faolligi tahlili</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
          icon={<Users className="text-blue-500" />} 
          title="Yangi Ustozlar" 
          value={data.overview.usersThisMonth} 
          subValue={`${growth >= 0 ? '+' : ''}${growth}% o'tgan oydan`}
          trend={growth >= 0 ? 'up' : 'down'}
        />
        <StatCard 
          icon={<Award className="text-amber-500" />} 
          title="O'rtacha Ball" 
          value={`${Math.round(data.overview.avgTestScore)}%`} 
          subValue="Umumiy test natijasi"
        />
        <StatCard 
          icon={<Repeat className="text-purple-500" />} 
          title="Urinishlar" 
          value={data.overview.avgAttemptsPerTest} 
          subValue="Har bir test uchun o'rtacha"
        />
        <StatCard 
          icon={<BarChart3 className="text-emerald-500" />} 
          title="Jami Ustozlar" 
          value={data.overview.totalTeachers} 
          subValue="Aktiv xodimlar soni"
        />
      </div>

      {/* User Progress Table */}
      <div className="bg-white rounded-2xl md:rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 md:p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg md:text-xl font-black text-dark">Ustozlar natijalari</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Individual ko'rsatkichlar</p>
          </div>
          
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Qidirish..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 pr-6 h-12 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-bold text-sm w-full md:w-64"
            />
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ustoz</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Bo'lim</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Progress</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">O'rtacha Ball</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProgress.map((up: any) => (
                <tr key={up._id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary font-black shadow-sm border border-gray-50 uppercase">
                        {up.name[0]}
                      </div>
                      <div>
                        <p className="font-black text-dark leading-none">{up.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">
                          {new Date(up.joinedAt).toLocaleDateString()} da qo'shilgan
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-500 rounded-lg border border-gray-100">
                      {up.department}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="flex-grow bg-gray-100 h-2 rounded-full overflow-hidden max-w-[100px]">
                        <div 
                          className={`h-full transition-all duration-1000 ${up.progress === 100 ? 'bg-emerald-500' : 'bg-primary'}`} 
                          style={{ width: `${up.progress}%` }} 
                        />
                      </div>
                      <span className="text-sm font-black text-dark">{up.progress}%</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`text-sm font-black ${up.avgScore >= 80 ? 'text-emerald-500' : up.avgScore >= 60 ? 'text-amber-500' : 'text-red-500'}`}>
                      {up.avgScore}%
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-2 text-gray-300 group-hover:text-primary transition-colors">
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-gray-50">
          {filteredProgress.map((up: any) => (
            <div key={up._id} className="p-5 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary font-black border border-primary/10 shrink-0">
                    {up.name[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-dark truncate text-sm">{up.name}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">
                      {new Date(up.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-gray-50 text-[8px] font-black uppercase tracking-widest text-gray-500 rounded-lg border border-gray-100 shrink-0">
                  {up.department}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Progress</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-grow bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${up.progress === 100 ? 'bg-emerald-500' : 'bg-primary'}`} 
                        style={{ width: `${up.progress}%` }} 
                      />
                    </div>
                    <span className="text-xs font-black text-dark shrink-0">{up.progress}%</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">O'rtacha ball</p>
                  <p className={`text-sm font-black text-right ${up.avgScore >= 80 ? 'text-emerald-500' : up.avgScore >= 60 ? 'text-amber-500' : 'text-red-500'}`}>
                    {up.avgScore}%
                  </p>
                </div>
              </div>
            </div>
          ))}
          {filteredProgress.length === 0 && (
            <div className="p-10 text-center text-gray-400 font-bold uppercase text-xs tracking-widest">
              Ma'lumotlar topilmadi
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, subValue, trend }: any) {
  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] shadow-sm border border-gray-100 hover:border-primary transition-all group">
      <div className="flex justify-between items-start mb-4 md:mb-6">
        <div className="p-3 md:p-4 bg-gray-50 rounded-2xl group-hover:bg-primary/5 transition-colors">{icon}</div>
        {trend && (
           <div className={`flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 rounded-lg ${trend === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
             {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
             <span className="hidden xs:inline">{trend === 'up' ? 'O\'sish' : 'Pasayish'}</span>
           </div>
        )}
      </div>
      <div>
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{title}</p>
        <p className="text-2xl md:text-4xl font-black text-dark mt-2 tracking-tight">{value}</p>
        <p className="text-[10px] md:text-xs text-gray-500 font-medium mt-2">{subValue}</p>
      </div>
    </div>
  );
}
