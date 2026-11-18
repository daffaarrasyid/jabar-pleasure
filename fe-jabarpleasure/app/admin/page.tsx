'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminNavbar from '@/components/admin/AdminNavbar';
import AdminSidebar, { AdminMenuTab } from '@/components/admin/AdminSidebar';
import AdminOverview from '@/components/admin/AdminOverview';
import AdminSubmissionsTab from '@/components/admin/AdminSubmissionsTab';
import AdminPoiTab from '@/components/admin/AdminPoiTab';
import AdminUsersTab from '@/components/admin/AdminUsersTab';
import AdminMediaTab from '@/components/admin/AdminMediaTab';
import AdminFeedbackTab from '@/components/admin/AdminFeedbackTab';
import { getAdminSession, removeAdminSession, isAdminAuthenticated } from '@/lib/auth';
import { getAdminOverviewMetrics } from '@/lib/api';

export default function AdminDashboardPage() {
  const router = useRouter();

  const [adminName, setAdminName] = useState<string>('Admin123');
  const [activeTab, setActiveTab] = useState<AdminMenuTab>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      setIsAuthenticated(false);
      router.replace('/admin/login');
      return;
    }

    const session = getAdminSession();
    const rawName = session?.user?.name;
    if (typeof rawName === 'string' && rawName) {
      setAdminName(rawName === 'admin' ? 'Admin123' : rawName);
    }
  }, [router]);

  // Fetch pending count for notification badge
  useEffect(() => {
    getAdminOverviewMetrics().then((metrics) => {
      if (metrics?.kpi?.pending_submissions?.value !== undefined) {
        setPendingCount(metrics.kpi.pending_submissions.value);
      }
    }).catch(() => null);
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
            pendingCount={pendingCount}
            onLogout={handleLogout}
            onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            onOpenPending={() => setActiveTab('pengajuan')}
          />

          {/* Dynamic Tab Content */}
          {activeTab === 'overview' && <AdminOverview />}
          {activeTab === 'poi' && <AdminPoiTab />}
          {activeTab === 'pengajuan' && <AdminSubmissionsTab />}
          {activeTab === 'saran' && <AdminFeedbackTab />}
          {activeTab === 'akun' && <AdminUsersTab />}
          {activeTab === 'moderasi' && <AdminMediaTab />}
        </div>
      </main>
    </div>
  );
}
