'use client';

import React, { useEffect, useState, useSyncExternalStore, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Construction, LogOut, Loader2 } from 'lucide-react';
import AdminNavbar from '@/components/admin/AdminNavbar';
import AdminSidebar, { AdminMenuTab } from '@/components/admin/AdminSidebar';
import AdminOverview from '@/components/admin/AdminOverview';
import AdminPoiManagement from '@/components/admin/AdminPoiManagement';
import AdminSubmissionManagement from '@/components/admin/AdminSubmissionManagement';
import AdminFeedbackManagement from '@/components/admin/AdminFeedbackManagement';
import AdminUserManagement from '@/components/admin/AdminUserManagement';
import AdminMediaModeration from '@/components/admin/AdminMediaModeration';
import { getAdminSession, removeAdminSession, isAdminAuthenticated } from '@/lib/auth';
import { getAdminOverviewMetrics } from '@/lib/api';
import { useAdminIdleTimer } from '@/hooks/useAdminIdleTimer';

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
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.replace('/admin/login');
    }
  }, [router]);

  const executeLogout = useCallback(async (reason?: string) => {
    setIsLoggingOut(true);
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
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
      const queryParam = reason ? `?reason=${encodeURIComponent(reason)}` : '';
      router.replace(`/admin/login${queryParam}`);
    }
  }, [router]);

  // Admin Inactivity Idle Timer (Auto logout after 60 minutes)
  useAdminIdleTimer({
    timeoutMs: 60 * 60 * 1000,
    onTimeout: () => {
      executeLogout('idle_timeout');
    },
    enabled: true,
  });

  // Fetch pending count for notification badge
  useEffect(() => {
    getAdminOverviewMetrics()
      .then((metrics) => {
        if (metrics?.kpi?.pending_submissions?.value !== undefined) {
          setPendingCount(metrics.kpi.pending_submissions.value);
        }
      })
      .catch(() => null);
  }, []);

  // Window scroll listener ensures navbar sticky activation regardless of page height
  useEffect(() => {
    const handleWindowScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleWindowScroll, { passive: true });
    handleWindowScroll();
    return () => window.removeEventListener('scroll', handleWindowScroll);
  }, []);

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
            pendingCount={pendingCount}
            onLogout={() => setShowLogoutConfirm(true)}
            onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            onOpenPending={() => setActiveTab('pengajuan')}
            isScrolled={isScrolled}
          />

          {/* Tab Content */}
          {activeTab === 'overview' && <AdminOverview />}
          {activeTab === 'poi' && <AdminPoiManagement />}
          {activeTab === 'pengajuan' && <AdminSubmissionManagement />}
          {activeTab === 'saran' && <AdminFeedbackManagement />}
          {activeTab === 'akun' && <AdminUserManagement />}
          {activeTab === 'moderasi' && <AdminMediaModeration />}
          {activeTab !== 'overview' &&
            activeTab !== 'poi' &&
            activeTab !== 'pengajuan' &&
            activeTab !== 'saran' &&
            activeTab !== 'akun' &&
            activeTab !== 'moderasi' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-12 text-center shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-[#EEF0FF] text-[#4941EC] flex items-center justify-center mx-auto mb-4">
                <Construction className="w-7 h-7" />
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 tracking-tight">
                Menu {String(activeTab).toUpperCase()} Sedang Dipersiapkan
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

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div
            className="fixed inset-0"
            onClick={() => !isLoggingOut && setShowLogoutConfirm(false)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-[360px] bg-white rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200 border border-gray-100 z-10">
            <div className="w-14 h-14 rounded-full bg-red-50 text-[#EF4444] flex items-center justify-center mb-3.5">
              <LogOut className="w-7 h-7 stroke-[2.2]" />
            </div>

            <h2 className="text-base font-bold text-gray-900 tracking-tight">
              Konfirmasi Keluar Admin
            </h2>

            <p className="text-xs text-gray-500 mt-2 mb-6 leading-relaxed max-w-[280px]">
              Apakah Anda yakin ingin mengakhiri sesi Administrator JabarPleasure? Anda harus masuk kembali untuk mengelola sistem.
            </p>

            <div className="w-full flex flex-col gap-2.5">
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={() => executeLogout()}
                className="w-full py-3 px-4 rounded-xl bg-[#EF4444] hover:bg-red-600 active:scale-[0.98] text-white text-xs font-bold shadow-md shadow-red-500/20 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mengakhiri sesi...</span>
                  </>
                ) : (
                  <span>Ya, Keluar</span>
                )}
              </button>

              <button
                type="button"
                disabled={isLoggingOut}
                onClick={() => setShowLogoutConfirm(false)}
                className="w-full py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-[0.98] text-gray-700 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
