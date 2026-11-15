'use client';

import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import AdminNavbar from '@/components/admin/AdminNavbar';
import AdminSidebar, { AdminMenuTab } from '@/components/admin/AdminSidebar';
import AdminOverview from '@/components/admin/AdminOverview';
import AdminPoiManagement from '@/components/admin/AdminPoiManagement';
import AdminSubmissionManagement from '@/components/admin/AdminSubmissionManagement';
import AdminFeedbackManagement from '@/components/admin/AdminFeedbackManagement';
import { getAdminSession, removeAdminSession, isAdminAuthenticated } from '@/lib/auth';
import { Construction } from 'lucide-react';

function subscribeAdminSession(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getAdminNameSnapshot(): string {
  const session = getAdminSession();
  const rawName = session?.user?.name;
  if (typeof rawName === 'string' && rawName) {
    return rawName.toLowerCase() === 'admin' ? 'Admin123' : rawName;
  }
  return 'Admin123';
}

function getAdminNameServerSnapshot(): string {
  return 'Admin123';
}

export default function AdminDashboardPage() {
  const router = useRouter();

  // useSyncExternalStore ensures exact server HTML match on hydration and syncs client session without cascading renders
  const adminName = useSyncExternalStore(
    subscribeAdminSession,
    getAdminNameSnapshot,
    getAdminNameServerSnapshot
  );

  const [activeTab, setActiveTab] = useState<AdminMenuTab>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.replace('/admin/login');
    }
  }, [router]);

  // Window scroll listener ensures navbar sticky activation regardless of page height
  useEffect(() => {
    const handleWindowScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleWindowScroll, { passive: true });
    handleWindowScroll();
    return () => window.removeEventListener('scroll', handleWindowScroll);
  }, []);

  const handleLogout = async () => {
    try {
      const session = getAdminSession();
      if (session?.token) {
        await fetch('/api/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.token}`,
            Accept: 'application/json',
          },
        }).catch(() => null);
      }
    } finally {
      removeAdminSession();
      router.replace('/admin/login');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F6F8FB] flex text-gray-900">
      {/* Left Admin Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Pane with top margin aligned to sidebar (pt-4) */}
      <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 pt-4 pb-8">
        <div className="max-w-[1400px] mx-auto">
          {/* Top Floating Sticky Admin Navbar */}
          <AdminNavbar
            adminName={adminName}
            onLogout={handleLogout}
            onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            isScrolled={isScrolled}
          />

          {/* Tab Content */}
          {activeTab === 'overview' && <AdminOverview />}
          {activeTab === 'poi' && <AdminPoiManagement />}
          {activeTab === 'pengajuan' && <AdminSubmissionManagement />}
          {activeTab === 'saran' && <AdminFeedbackManagement />}
          {activeTab !== 'overview' &&
            activeTab !== 'poi' &&
            activeTab !== 'pengajuan' &&
            activeTab !== 'saran' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-12 text-center shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-[#EEF0FF] text-[#4941EC] flex items-center justify-center mx-auto mb-4">
                <Construction className="w-7 h-7" />
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 tracking-tight">
                Menu {activeTab.toUpperCase()} Sedang Dipersiapkan
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1.5 max-w-md mx-auto">
                Halaman ini difokuskan pada tahap tampilan antarmuka (frontend). Anda dapat kembali ke menu Overview & Analitik atau POI Destinasi.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className="mt-6 px-4 py-2 bg-[#4941EC] hover:bg-[#3C35C7] text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Kembali ke Overview & Analitik
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
