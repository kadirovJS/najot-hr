'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
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

type DashboardUser = {
  name?: string | null;
  role?: string;
  department?: string;
};

type DashboardStats = {
  users: number;
  vacancies: number;
  avgOnboarding: number;
  completedOnboarding: number;
};

type DashboardNotification = {
  _id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  createdAt: string;
};

const formatNotificationDate = (value: string) => {
  const date = new Date(value);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();

  return isToday
    ? date.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
    : date.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short' });
};

const formatDashboardDate = (date: Date) => {
  const months = [
    'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
    'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr',
  ];

  return `${date.getFullYear()}-yil, ${date.getDate()}-${months[date.getMonth()]}`;
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const user = session?.user as DashboardUser | undefined;
  const isAdmin = user?.role === 'SUPER_ADMIN';

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, notificationsRes] = await Promise.all([
        isAdmin ? fetch('/api/dashboard/stats').then((res) => res.json() as Promise<DashboardStats>) : Promise.resolve(null),
        fetch('/api/notifications').then((res) => res.json() as Promise<DashboardNotification[]>)
      ]);
      setStats(statsRes);
      setNotifications(notificationsRes);
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (user) void loadData();
  }, [user, loadData]);

  const clearNotifications = async () => {
    setActionLoading(true);
    try {
      await fetch('/api/notifications', { method: 'DELETE' });
      setNotifications([]);
      setIsClearModalOpen(false);
    } catch {
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
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-24 md:space-y-10 md:pb-12">
      <div className="flex items-start justify-between gap-3 border-b border-gray-200 pb-5 md:items-center md:pb-6">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold tracking-tight text-dark md:text-3xl">Xush kelibsiz, {user?.name}!</h1>
          <p className="mt-1 text-xs font-medium text-gray-500 md:text-sm">Bugun: <span className="text-primary/80">{formatDashboardDate(new Date())}</span></p>
        </div>
        {!isAdmin && (
           <div className="shrink-0 rounded-xl border border-gray-200 bg-white px-3 py-2 md:px-4 md:py-3">
             <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Bo&apos;lim</p>
             <p className="max-w-28 truncate text-xs font-bold text-dark md:max-w-none md:text-sm">{user?.department || "Noma&apos;lum"}</p>
           </div>
        )}
      </div>

      {isAdmin && stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            trend="O‘rtacha"
          />
          <StatCard 
            icon={<Star className="text-amber-500" />} 
            title="Tugatganlar" 
            value={stats.completedOnboarding} 
            trend="Xodimlar" 
          />
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3 lg:gap-8">
        {/* Tizim yangiliklari / Notifications */}
        <section className="order-2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:order-none lg:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 p-5 md:p-6">
            <div>
              <h3 className="text-lg md:text-xl font-bold text-dark tracking-tight">Tizim yangiliklari</h3>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">So&apos;nggi 14 kundagi harakatlar</p>
            </div>
            {isAdmin && notifications.length > 0 && (
              <button 
                onClick={() => setIsClearModalOpen(true)}
                className="rounded-lg border border-transparent p-2 text-gray-400 transition-all hover:border-gray-200 hover:bg-white hover:text-red-600"
                title="Tozalash"
                aria-label="Bildirishnomalarni tozalash"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <div className="max-h-[480px] divide-y divide-gray-100 overflow-y-auto lg:max-h-[576px]">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <Link 
                  key={notif._id} 
                  href={notif.link || '#'}
                  className="group flex gap-4 p-4 transition-colors hover:bg-gray-50/70 md:gap-5 md:p-5"
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                    notif.type === 'NEW_VIDEO' ? 'bg-purple-50 text-purple-500 border-purple-100' :
                    notif.type === 'NEW_VACANCY' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' :
                    notif.type === 'NEW_COMMENT' ? 'bg-blue-50 text-blue-500 border-blue-100' : 'bg-gray-50 text-gray-500 border-gray-200'
                  }`}>
                    {notif.type === 'NEW_VIDEO' ? <PlayCircle className="h-5 w-5" /> :
                     notif.type === 'NEW_VACANCY' ? <Briefcase className="h-5 w-5" /> :
                     notif.type === 'NEW_COMMENT' ? <MessageSquare className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="truncate text-sm font-bold text-dark transition-colors group-hover:text-primary md:text-base">{notif.title}</h4>
                      <span className="mt-0.5 shrink-0 text-[10px] font-bold uppercase tracking-widest text-gray-400">{formatNotificationDate(notif.createdAt)}</span>
                    </div>
                    <p className="mt-1 text-xs font-medium leading-relaxed text-gray-500 line-clamp-2 md:text-sm">{notif.message}</p>
                  </div>
                  <div className="self-center hidden sm:block opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                    <ChevronRight className="text-primary h-5 w-5" />
                  </div>
                </Link>
              ))
            ) : (
              <div className="flex min-h-72 flex-col justify-center space-y-4 bg-gray-50/20 py-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-gray-100 bg-white text-gray-200">
                  <Bell className="h-8 w-8" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 md:text-xs">Hozircha yangiliklar yo&apos;q</p>
              </div>
            )}
          </div>
        </section>

        {/* Tezkor havolalar yoki boshqa vidjet */}
        <aside className="order-1 flex flex-col gap-4 self-start lg:order-none lg:sticky lg:top-8">
          <div className="group relative flex flex-col justify-center overflow-hidden rounded-2xl border border-dark bg-dark p-6 text-white shadow-sm">
            <div className="relative z-10">
               <h3 className="mb-2 text-xl font-bold">Bilim olishdan to&apos;xtamang!</h3>
               <p className="mb-7 text-sm font-medium leading-relaxed text-white/60">Najot Ta&apos;lim jamoasi bilan birgalikda yuksak marralarni zabt eting.</p>
               <Link href="/dashboard/onboarding" className="inline-flex w-fit items-center gap-2 rounded-xl border border-primary bg-primary px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-white hover:text-primary">
                  Kursni davom ettirish <ChevronRight className="h-4 w-4" />
               </Link>
            </div>
            <PlayCircle className="absolute -bottom-8 -right-8 h-32 w-32 text-white/5 transform -rotate-12 transition-transform group-hover:scale-110 group-hover:rotate-0" />
          </div>

          {!isAdmin && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-2">
                <div className="h-6 w-1.5 rounded-full bg-primary" />
                <h3 className="text-lg font-bold tracking-tight text-dark">Mening natijam</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  <span>Progress</span>
                  <span className="text-primary">25%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full border border-gray-200/50 bg-gray-100">
                  <div className="h-full w-[25%] bg-primary shadow-sm transition-all duration-1000" />
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>

      <ConfirmModal 
        isOpen={isClearModalOpen} 
        onClose={() => setIsClearModalOpen(false)} 
        onConfirm={clearNotifications} 
        title="Bildirishnomalarni tozalash" 
        description="Barcha bildirishnomalarni butunlay o‘chirib tashlamoqchimisiz? Ushbu amalni ortga qaytarib bo‘lmaydi."
        isLoading={actionLoading} 
      />
    </div>
  );
}

function StatCard({ icon, title, value, trend }: { icon: ReactNode; title: string; value: string | number; trend: string }) {
  return (
    <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-colors hover:border-primary/30">
      <div className="mb-5 flex items-start justify-between">
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 transition-colors group-hover:bg-primary/5">{icon}</div>
        <span className="rounded-lg border border-primary/10 bg-primary/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">{trend}</span>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{title}</p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-dark">{value}</p>
      </div>
    </div>
  );
}
