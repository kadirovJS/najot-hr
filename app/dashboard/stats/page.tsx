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
  console.log(data , "STAT")
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
    <div className="space-y-6 md:space-y-8 pb-20">
      <div className="px-1">
        <h1 className="text-2xl md:text-3xl font-bold text-dark tracking-tight">Tizim Statistikasi</h1>
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
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg md:text-xl font-bold text-dark">Ustozlar natijalari</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Individual ko'rsatkichlar</p>
          </div>
          
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Qidirish..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 pr-6 h-11 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-primary/50 transition-all font-semibold text-sm w-full md:w-64"
            />
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ustoz</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bo'lim</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Progress</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">O'rtacha Ball</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProgress.map((up: any) => (
                <tr key={up._id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary/5 rounded-lg flex items-center justify-center text-primary font-bold border border-primary/10 shadow-sm uppercase text-sm">
                        {up.name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-dark leading-none text-sm">{up.name}</p>
                        <p className="text-[10px] font-medium text-gray-400 mt-1">
                          {new Date(up.joinedAt).toLocaleDateString()} da qo'shilgan
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-2.5 py-1 bg-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-600 rounded border border-gray-200">
                      {up.department}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="flex-grow bg-gray-100 h-1.5 rounded-full overflow-hidden max-w-[100px]">
                        <div 
                          className={`h-full transition-all duration-1000 ${up.progress === 100 ? 'bg-emerald-500' : 'bg-primary'}`} 
                          style={{ width: `${up.progress}%` }} 
                        />
                      </div>
                      <span className="text-xs font-bold text-dark">{up.progress}%</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`text-sm font-bold ${up.avgScore >= 80 ? 'text-emerald-500' : up.avgScore >= 60 ? 'text-amber-500' : 'text-red-500'}`}>
                      {up.avgScore}%
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-2 text-gray-300 group-hover:text-primary transition-colors">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-gray-100">
          {filteredProgress.map((up: any) => (
            <div key={up._id} className="p-5 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 bg-primary/5 rounded-lg flex items-center justify-center text-primary font-bold border border-primary/10 shrink-0 text-sm">
                    {up.name[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-dark truncate text-sm">{up.name}</p>
                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-tighter">
                      {new Date(up.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-gray-100 text-[9px] font-bold uppercase tracking-widest text-gray-500 rounded border border-gray-200 shrink-0">
                  {up.department}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Progress</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-grow bg-gray-100 h-1 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${up.progress === 100 ? 'bg-emerald-500' : 'bg-primary'}`} 
                        style={{ width: `${up.progress}%` }} 
                      />
                    </div>
                    <span className="text-[10px] font-bold text-dark shrink-0">{up.progress}%</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest text-right">O'rtacha ball</p>
                  <p className={`text-sm font-bold text-right ${up.avgScore >= 80 ? 'text-emerald-500' : up.avgScore >= 60 ? 'text-amber-500' : 'text-red-500'}`}>
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
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 hover:border-primary/30 transition-all group">
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-primary/5 transition-colors border border-gray-100">{icon}</div>
        {trend && (
           <div className={`flex items-center gap-1 text-[9px] font-bold uppercase px-2 py-1 rounded border ${trend === 'up' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-red-600 bg-red-50 border-red-100'}`}>
             {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
             <span className="hidden xs:inline">{trend === 'up' ? 'O\'sish' : 'Pasayish'}</span>
           </div>
        )}
      </div>
      <div>
        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{title}</p>
        <p className="text-2xl md:text-3xl font-bold text-dark mt-2 tracking-tight">{value}</p>
        <p className="text-[10px] md:text-xs text-gray-400 font-medium mt-2">{subValue}</p>
      </div>
    </div>
  );
}
