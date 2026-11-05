'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminNavbar from '@/components/admin/AdminNavbar';
import AdminSidebar, { AdminMenuTab } from '@/components/admin/AdminSidebar';
import AdminOverview from '@/components/admin/AdminOverview';
import { getAdminSession, removeAdminSession, isAdminAuthenticated } from '@/lib/auth';
import { Construction } from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();

  // Lazy initializer to get initial session name without synchronous setState in effect
  const [adminName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const session = getAdminSession();
      const rawName = session?.user?.name;
      if (typeof rawName === 'string' && rawName) {
        return rawName === 'admin123'
          ? 'Admin (Jawa Barat)'
          : rawName;
      }
    }
    return 'Admin (Jawa Barat)';
  });

  const [activeTab, setActiveTab] = useState<AdminMenuTab>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return isAdminAuthenticated();
    }
    return true;
  });

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.replace('/admin/login');
    }
  }, [router]);

  const handleLogout = () => {
    removeAdminSession();
    router.replace('/admin/login');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#F9FAFB]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#4941EC] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-gray-500">Memverifikasi sesi admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#F9FAFB] flex flex-col text-gray-900">
      {/* Top Admin Navbar */}
      <AdminNavbar
        adminName={adminName}
        onLogout={handleLogout}
        onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />

      {/* Main Layout Area: Sidebar + Content */}
      <div className="flex-1 flex w-full max-w-[1600px] mx-auto">
        {/* Admin Sidebar */}
        <AdminSidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Scrollable Main Content Pane */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'overview' ? (
            <AdminOverview />
          ) : (
            /* Placeholder Screen for Secondary Admin Menus */
            <div className="bg-white rounded-2xl border border-gray-200/90 p-8 sm:p-12 text-center shadow-2xs">
              <div className="w-14 h-14 rounded-2xl bg-[#EEF0FF] text-[#4941EC] flex items-center justify-center mx-auto mb-4">
                <Construction className="w-7 h-7" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                Menu {activeTab.toUpperCase()} Sedang Dipersiapkan
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1.5 max-w-md mx-auto">
                Halaman ini difokuskan pada tahap tampilan antarmuka (frontend). Anda dapat kembali ke menu Overview & Analitik.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className="mt-6 px-4 py-2 bg-[#4941EC] hover:bg-[#3C35C7] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Kembali ke Overview & Analitik
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
