'use client';

import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { 
  Users, 
  Briefcase, 
  PlayCircle, 
  Star, 
  Bell, 
  Trash2, 
  Loader2,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

export default function DashboardPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const isAdmin = user?.role === 'SUPER_ADMIN';

  const [stats, setStats] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, notificationsRes] = await Promise.all([
        isAdmin ? fetch('/api/dashboard/stats').then(res => res.json()) : Promise.resolve(null),
        fetch('/api/notifications').then(res => res.json())
      ]);
      setStats(statsRes);
      setNotifications(notificationsRes);
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const clearNotifications = async () => {
    setActionLoading(true);
    try {
      await fetch('/api/notifications', { method: 'DELETE' });
      setNotifications([]);
      setIsClearModalOpen(false);
    } catch (error) {
      alert("Xatolik yuz berdi");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Loader2 className="h-10 w-10 text-primary animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 md:space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-dark tracking-tight text-center md:text-left">Xush kelibsiz, {user?.name}!</h1>
          <p className="text-sm text-gray-500 font-medium text-center md:text-left mt-1">Bugun: <span className="text-primary/80">{new Date().toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })}</span></p>
        </div>
        {!isAdmin && (
           <div className="px-5 py-2 bg-gray-50 rounded-lg border border-gray-200 shadow-sm w-fit mx-auto md:mx-0">
             <p className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Bo'lim</p>
             <p className="font-bold text-dark text-sm">{user?.department || "Noma'lum"}</p>
           </div>
        )}
      </div>

      {isAdmin && stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard 
            icon={<Users className="text-blue-500" />} 
            title="Jami xodimlar" 
            value={stats.users} 
            trend="+ Yangi" 
          />
          <StatCard 
            icon={<Briefcase className="text-emerald-500" />} 
            title="Aktiv vakansiyalar" 
            value={stats.vacancies} 
            trend="Live" 
          />
          <StatCard 
            icon={<PlayCircle className="text-purple-500" />} 
            title="Avg Onboarding" 
            value={`${stats.avgOnboarding}%`} 
            trend="O'rtacha" 
          />
          <StatCard 
            icon={<Star className="text-amber-500" />} 
            title="Tugatganlar" 
            value={stats.completedOnboarding} 
            trend="Xodimlar" 
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-stretch">
        {/* Tizim yangiliklari / Notifications */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
            <div>
              <h3 className="text-lg md:text-xl font-bold text-dark tracking-tight">Tizim yangiliklari</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">So'nggi harakatlar</p>
            </div>
            {isAdmin && notifications.length > 0 && (
              <button 
                onClick={() => setIsClearModalOpen(true)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-200"
                title="Tozalash"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <div className="divide-y divide-gray-100 flex-grow">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <Link 
                  key={notif._id} 
                  href={notif.link || '#'}
                  className="flex gap-4 md:gap-6 p-6 md:p-8 hover:bg-gray-50/50 transition-all group"
                >
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg shrink-0 flex items-center justify-center border shadow-sm ${
                    notif.type === 'NEW_VIDEO' ? 'bg-purple-50 text-purple-500 border-purple-100' :
                    notif.type === 'NEW_VACANCY' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' :
                    notif.type === 'NEW_COMMENT' ? 'bg-blue-50 text-blue-500 border-blue-100' : 'bg-gray-50 text-gray-500 border-gray-200'
                  }`}>
                    {notif.type === 'NEW_VIDEO' ? <PlayCircle className="h-5 w-5" /> :
                     notif.type === 'NEW_VACANCY' ? <Briefcase className="h-5 w-5" /> :
                     notif.type === 'NEW_COMMENT' ? <MessageSquare className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-dark text-sm md:text-lg group-hover:text-primary transition-colors truncate">{notif.title}</h4>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest shrink-0 mt-1">{new Date(notif.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-gray-500 font-medium mt-1.5 leading-relaxed text-xs md:text-sm line-clamp-2">{notif.message}</p>
                  </div>
                  <div className="self-center hidden sm:block opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                    <ChevronRight className="text-primary h-5 w-5" />
                  </div>
                </Link>
              ))
            ) : (
              <div className="py-12 md:py-20 text-center space-y-4 h-full flex flex-col justify-center bg-gray-50/10">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200 border border-gray-100">
                  <Bell className="h-8 w-8" />
                </div>
                <p className="text-gray-400 font-bold uppercase text-[10px] md:text-xs tracking-widest">Hozircha yangiliklar yo'q</p>
              </div>
            )}
          </div>
        </div>

        {/* Tezkor havolalar yoki boshqa vidjet */}
        <div className="flex flex-col gap-6">
          <div className="bg-dark p-8 rounded-xl text-white shadow-xl relative overflow-hidden group flex-grow flex flex-col justify-center border border-dark">
            <div className="relative z-10">
               <h3 className="text-xl font-bold mb-2">Bilim olishdan to'xtamang!</h3>
               <p className="text-white/50 text-sm font-medium mb-8 leading-relaxed">Najot Ta'lim jamoasi bilan birgalikda yuksak marralarni zabt eting.</p>
               <Link href="/dashboard/onboarding" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-bold text-sm hover:bg-white hover:text-primary transition-all w-fit shadow-lg shadow-primary/20 border border-primary">
                  Kursni davom ettirish <ChevronRight className="h-4 w-4" />
               </Link>
            </div>
            <PlayCircle className="absolute -bottom-8 -right-8 h-32 w-32 text-white/5 transform -rotate-12 transition-transform group-hover:scale-110 group-hover:rotate-0" />
          </div>

          {!isAdmin && (
             <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                   <div className="w-1.5 h-6 bg-primary rounded-full" />
                   <h3 className="font-bold text-dark text-lg uppercase tracking-tight">Mening natijam</h3>
                </div>
                <div className="space-y-4">
                   <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      <span>Progress</span>
                      <span className="text-primary">25%</span>
                   </div>
                   <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden border border-gray-200/50">
                      <div className="bg-primary h-full w-[25%] transition-all duration-1000 shadow-sm" />
                   </div>
                </div>
             </div>
          )}
        </div>
      </div>

      <ConfirmModal 
        isOpen={isClearModalOpen} 
        onClose={() => setIsClearModalOpen(false)} 
        onConfirm={clearNotifications} 
        title="Bildirishnomalarni tozalash" 
        description="Barcha bildirishnomalarni butunlay o'chirib tashlamoqchimisiz? Ushbu amalni ortga qaytarib bo'lmaydi." 
        isLoading={actionLoading} 
      />
    </div>
  );
}

function StatCard({ icon, title, value, trend }: any) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-primary/30 transition-all group">
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-primary/5 transition-colors border border-gray-100 shadow-sm">{icon}</div>
        <span className="text-[10px] font-bold text-primary bg-primary/5 px-2.5 py-1 rounded border border-primary/10 uppercase tracking-wider">{trend}</span>
      </div>
      <div>
        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{title}</p>
        <p className="text-3xl font-bold text-dark mt-1 tracking-tight">{value}</p>
      </div>
    </div>
  );
}
