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
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-dark tracking-tight">Xush kelibsiz, {user?.name}!</h1>
          <p className="text-sm md:text-gray-500 font-medium">Bugun: <span className="text-primary">{new Date().toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })}</span></p>
        </div>
        {!isAdmin && (
           <div className="px-4 md:px-6 py-2 md:py-3 bg-white rounded-xl md:rounded-2xl border border-gray-100 shadow-sm w-fit">
             <p className="text-[8px] md:text-[10px] font-black uppercase text-gray-400 tracking-widest">Bo'lim</p>
             <p className="font-bold text-dark text-sm md:text-base">{user?.department || "Noma'lum"}</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Tizim yangiliklari / Notifications */}
        <div className="lg:col-span-2 bg-white rounded-2xl md:rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 md:p-8 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h3 className="text-lg md:text-xl font-black text-dark tracking-tight">Tizim yangiliklari</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">So'nggi harakatlar</p>
            </div>
            {isAdmin && notifications.length > 0 && (
              <button 
                onClick={() => setIsClearModalOpen(true)}
                className="p-2 md:p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl md:rounded-2xl transition-all"
                title="Tozalash"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}
          </div>
          
          <div className="divide-y divide-gray-50">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <Link 
                  key={notif._id} 
                  href={notif.link || '#'}
                  className="flex gap-4 md:gap-6 p-5 md:p-8 hover:bg-gray-50/50 transition-all group"
                >
                  <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-[1.25rem] shrink-0 flex items-center justify-center shadow-sm ${
                    notif.type === 'NEW_VIDEO' ? 'bg-purple-50 text-purple-500' :
                    notif.type === 'NEW_VACANCY' ? 'bg-emerald-50 text-emerald-500' :
                    notif.type === 'NEW_COMMENT' ? 'bg-blue-50 text-blue-500' : 'bg-gray-50 text-gray-500'
                  }`}>
                    {notif.type === 'NEW_VIDEO' ? <PlayCircle className="h-5 w-5 md:h-6 md:w-6" /> :
                     notif.type === 'NEW_VACANCY' ? <Briefcase className="h-5 w-5 md:h-6 md:w-6" /> :
                     notif.type === 'NEW_COMMENT' ? <MessageSquare className="h-5 w-5 md:h-6 md:w-6" /> : <Bell className="h-5 w-5 md:h-6 md:w-6" />}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-black text-dark text-sm md:text-lg group-hover:text-primary transition-colors truncate">{notif.title}</h4>
                      <span className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest shrink-0">{new Date(notif.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-gray-500 font-medium mt-1 leading-relaxed text-xs md:text-sm line-clamp-2">{notif.message}</p>
                  </div>
                  <div className="self-center hidden sm:block opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                    <ChevronRight className="text-primary h-5 w-5" />
                  </div>
                </Link>
              ))
            ) : (
              <div className="py-12 md:py-20 text-center space-y-4">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200">
                  <Bell className="h-6 w-6 md:h-8 md:w-8" />
                </div>
                <p className="text-gray-400 font-bold uppercase text-[10px] md:text-xs tracking-widest">Hozircha yangiliklar yo'q</p>
              </div>
            )}
          </div>
        </div>

        {/* Tezkor havolalar yoki boshqa vidjet */}
        <div className="space-y-6">
          <div className="bg-dark p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
               <h3 className="text-lg md:text-xl font-black mb-2 italic">Bilim olishdan to'xtamang!</h3>
               <p className="text-white/60 text-xs md:text-sm font-medium mb-6 leading-relaxed">Najot Ta'lim jamoasi bilan birgalikda yuksak marralarni zabt eting.</p>
               <Link href="/dashboard/onboarding" className="inline-flex items-center gap-2 px-5 md:px-6 py-2.5 md:py-3 bg-primary rounded-xl font-bold text-xs md:text-sm hover:bg-white hover:text-primary transition-all">
                  Kursni davom ettirish <ChevronRight className="h-4 w-4" />
               </Link>
            </div>
            <PlayCircle className="absolute -bottom-6 -right-6 h-24 w-24 md:h-32 md:w-32 text-white/5 transform -rotate-12 transition-transform group-hover:scale-110 group-hover:rotate-0" />
          </div>

          {!isAdmin && (
             <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] border border-gray-100 shadow-sm">
                <h3 className="font-black text-dark text-base md:text-lg mb-4">Mening natijam</h3>
                <div className="space-y-4">
                   <div className="flex justify-between text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">
                      <span>Progress</span>
                      <span className="text-primary">25%</span>
                   </div>
                   <div className="w-full bg-gray-100 h-2 md:h-3 rounded-full overflow-hidden">
                      <div className="bg-primary h-full w-[25%] transition-all duration-1000" />
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
        title="Tozalash" 
        description="Barcha bildirishnomalarni butunlay o'chirmoqchimisiz?" 
        isLoading={actionLoading} 
      />
    </div>
  );
}

function StatCard({ icon, title, value, trend }: any) {
  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] shadow-sm border border-gray-100 hover:border-primary transition-all group">
      <div className="flex justify-between items-start mb-4 md:mb-6">
        <div className="p-3 md:p-4 bg-gray-50 rounded-xl md:rounded-2xl group-hover:bg-primary/5 transition-colors">{icon}</div>
        <span className="text-[8px] md:text-[10px] font-black text-primary bg-primary/5 px-2 md:px-3 py-1 rounded-lg uppercase tracking-widest">{trend}</span>
      </div>
      <div>
        <p className="text-gray-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest">{title}</p>
        <p className="text-2xl md:text-4xl font-black text-dark mt-2 tracking-tight">{value}</p>
      </div>
    </div>
  );
}
