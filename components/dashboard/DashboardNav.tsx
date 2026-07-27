'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  PlayCircle,
  Settings,
  LogOut,
  BarChart3,
  Library,
  Newspaper,
  Menu,
  X,
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { ConfirmModal } from '../ui/ConfirmModal';

export default function DashboardNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const role = (session?.user as { role?: string } | undefined)?.role;

  const links = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'TEACHER', 'HR', 'ACCOUNTANT'] },
    { name: 'Xodimlar', href: '/dashboard/users', icon: Users, roles: ['SUPER_ADMIN'] },
    { name: 'Vakansiyalar', href: '/dashboard/vacancies', icon: Briefcase, roles: ['SUPER_ADMIN', 'HR'] },
    { name: 'Blog', href: '/dashboard/blog', icon: Newspaper, roles: ['SUPER_ADMIN'] },
    { name: 'Testlar', href: '/dashboard/tests', icon: FileText, roles: ['SUPER_ADMIN'] },
    { name: 'Kitoblar', href: '/dashboard/books', icon: Library, roles: ['SUPER_ADMIN', 'TEACHER', 'HR', 'ACCOUNTANT'] },
    { name: 'Statistika', href: '/dashboard/stats', icon: BarChart3, roles: ['SUPER_ADMIN'] },
    { name: 'Onboarding', href: '/dashboard/onboarding', icon: PlayCircle, roles: ['SUPER_ADMIN', 'TEACHER', 'HR', 'ACCOUNTANT'] },
    { name: 'Landing Sozlamalari', href: '/dashboard/landing-settings', icon: LayoutDashboard, roles: ['SUPER_ADMIN'] },
    { name: 'Sozlamalar', href: '/dashboard/settings', icon: Settings, roles: ['SUPER_ADMIN', 'TEACHER', 'HR', 'ACCOUNTANT'] },
  ];

  const filteredLinks = role ? links.filter((link) => link.roles.includes(role)) : [];
  const mobilePriorityHrefs = role === 'SUPER_ADMIN'
    ? ['/dashboard', '/dashboard/users', '/dashboard/onboarding', '/dashboard/settings']
    : ['/dashboard', '/dashboard/onboarding', '/dashboard/books', '/dashboard/settings'];
  const mobilePrimaryLinks = mobilePriorityHrefs
    .map((href) => filteredLinks.find((link) => link.href === href))
    .filter((link): link is typeof links[number] => Boolean(link));
  const mobileMoreLinks = filteredLinks.filter((link) => !mobilePrimaryLinks.some((primary) => primary.href === link.href));

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 min-w-[256px] shrink-0 bg-white border-r border-gray-100 h-screen sticky top-0">
        <div className="p-6 border-b border-gray-50 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">N</div>
          <span className="font-bold text-2xl font-bold text-dark">HRLY</span>
        </div>
        
        <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
          {filteredLinks.map((link) => {
            const Icon = link.icon;
            const isActive = link.href === '/dashboard' 
              ? pathname === link.href 
              : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-dark'
                }`}
              >
                <Icon className="h-5 w-5" />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-50">
          <button 
            onClick={() => setIsLogoutModalOpen(true)}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut className="h-5 w-5" />
            Chiqish
          </button>
        </div>
      </aside>

      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={() => signOut({ callbackUrl: '/' })}
        title="Tizimdan chiqish"
        description="Rostdan ham tizimdan chiqmoqchimisiz?"
      />

      {/* Mobile Bottom Navigation */}
      {isMoreMenuOpen && mobileMoreLinks.length > 0 && (
        <div className="fixed inset-x-3 bottom-20 z-40 rounded-2xl border border-gray-200 bg-white p-3 shadow-lg md:hidden">
          <div className="mb-2 flex items-center justify-between px-2"><p className="text-xs font-bold text-dark">Boshqa bo‘limlar</p><button type="button" onClick={() => setIsMoreMenuOpen(false)} className="rounded-lg p-1 text-gray-400" aria-label="Menyuni yopish"><X className="h-4 w-4" /></button></div>
          <div className="grid grid-cols-3 gap-1">
            {mobileMoreLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return <Link key={link.href} href={link.href} onClick={() => setIsMoreMenuOpen(false)} className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl px-1 text-center text-[10px] font-semibold ${isActive ? 'bg-primary/5 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}><Icon className="h-5 w-5" /><span className="line-clamp-1">{link.name}</span></Link>;
            })}
          </div>
        </div>
      )}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center border-t border-gray-200 bg-white px-2 pb-[max(0.25rem,env(safe-area-inset-bottom))] pt-1 md:hidden">
        {mobilePrimaryLinks.map((link) => {
          const Icon = link.icon;
          const isActive = link.href === '/dashboard' 
            ? pathname === link.href 
            : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1 transition-colors ${
                isActive ? 'bg-primary/5 text-primary' : 'text-gray-400'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="max-w-full truncate text-[10px] font-medium">{link.name}</span>
            </Link>
          );
        })}
        {mobileMoreLinks.length > 0 && <button type="button" onClick={() => setIsMoreMenuOpen((open) => !open)} className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1 text-[10px] font-medium transition-colors ${isMoreMenuOpen ? 'bg-primary/5 text-primary' : 'text-gray-400'}`} aria-expanded={isMoreMenuOpen} aria-label="Ko‘proq bo‘limlar"><Menu className="h-5 w-5" /><span>Ko‘proq</span></button>}
      </nav>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}
