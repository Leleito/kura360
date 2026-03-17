import { LayoutProvider } from '@/components/layout/layout-context';
import { CampaignProvider } from '@/lib/campaign-context';
import { RoleProvider } from '@/lib/rbac/use-role';
import { ToastProvider } from '@/components/ui/toast';
import { Sidebar, MobileBottomNav } from '@/components/layout/sidebar';
import { TopBar } from '@/components/layout/top-bar';
import { DemoBanner } from '@/components/layout/demo-banner';
import { TourProvider } from '@/components/tour/tour-provider';
import { TourOverlay } from '@/components/tour/tour-overlay';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <CampaignProvider>
      <RoleProvider>
      <ToastProvider>
        <TourProvider>
        <LayoutProvider>
          <DemoBanner />
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
          <TourOverlay />
        </LayoutProvider>
        </TourProvider>
      </ToastProvider>
      </RoleProvider>
    </CampaignProvider>
  );
}
