import DashboardNav from '@/components/dashboard/DashboardNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardNav />
      <main className="flex-grow p-4 md:p-8 pb-20 md:pb-8">
        {children}
      </main>
    </div>
  );
}
