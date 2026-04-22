'use client';

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
  Library
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';

export default function DashboardNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;

  const links = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'TEACHER', 'HR', 'ACCOUNTANT'] },
    { name: 'Xodimlar', href: '/dashboard/users', icon: Users, roles: ['SUPER_ADMIN'] },
    { name: 'Vakansiyalar', href: '/dashboard/vacancies', icon: Briefcase, roles: ['SUPER_ADMIN', 'HR'] },
    { name: 'Testlar', href: '/dashboard/tests', icon: FileText, roles: ['SUPER_ADMIN'] },
    { name: 'Kitoblar', href: '/dashboard/books', icon: Library, roles: ['SUPER_ADMIN', 'TEACHER', 'HR', 'ACCOUNTANT'] },
    { name: 'Statistika', href: '/dashboard/stats', icon: BarChart3, roles: ['SUPER_ADMIN'] },
    { name: 'Onboarding', href: '/dashboard/onboarding', icon: PlayCircle, roles: ['SUPER_ADMIN', 'TEACHER', 'HR', 'ACCOUNTANT'] },
    { name: 'Sozlamalar', href: '/dashboard/settings', icon: Settings, roles: ['SUPER_ADMIN', 'TEACHER', 'HR', 'ACCOUNTANT'] },
  ];

  const filteredLinks = links.filter(link => link.roles.includes(role));

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 h-screen sticky top-0">
        <div className="p-6 border-b border-gray-50 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">N</div>
          <span className="font-bold text-dark">ERP SYSTEM</span>
        </div>
        
        <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
          {filteredLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
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
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut className="h-5 w-5" />
            Chiqish
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 py-1 z-50 flex justify-around items-center h-16">
        {filteredLinks.slice(0, 5).map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center flex-grow py-1 gap-1 rounded-xl transition-all ${
                isActive ? 'text-primary' : 'text-gray-400'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{link.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
