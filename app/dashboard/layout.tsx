import type { Metadata } from 'next';
import DashboardNav from '@/components/dashboard/DashboardNav';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <div className="flex min-h-screen bg-gray-50">
        <DashboardNav />
        <main className="min-w-0 flex-grow p-4 pb-20 md:p-8 md:pb-8">
          {children}
        </main>
      </div>
    </Providers>
  );
}
