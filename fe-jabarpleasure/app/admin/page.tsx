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

  const [adminName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const session = getAdminSession();
      const rawName = session?.user?.name;
      if (typeof rawName === 'string' && rawName) {
        return rawName === 'admin' ? 'Admin123' : rawName;
      }
    }
    return 'Admin123';
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#F6F8FB]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#4941EC] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-gray-500">Memverifikasi sesi admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#F6F8FB] flex text-gray-900">
      {/* Left Admin Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Pane */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto">
          {/* Top Floating Admin Navbar */}
          <AdminNavbar
            adminName={adminName}
            onLogout={handleLogout}
            onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          />

          {/* Tab Content */}
          {activeTab === 'overview' ? (
            <AdminOverview />
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-12 text-center shadow-xs">
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
        </div>
      </main>
    </div>
  );
}
