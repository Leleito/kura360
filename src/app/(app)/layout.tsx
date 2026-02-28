import { LayoutProvider } from '@/components/layout/layout-context';
import { Sidebar, MobileBottomNav } from '@/components/layout/sidebar';
import { TopBar } from '@/components/layout/top-bar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <LayoutProvider>
      <div className="flex h-screen overflow-hidden bg-[#F2F5F9]">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 h-full">
          <TopBar />
          <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 pb-20 lg:pb-6">
            {children}
          </main>
          <MobileBottomNav />
        </div>
      </div>
    </LayoutProvider>
  );
}
