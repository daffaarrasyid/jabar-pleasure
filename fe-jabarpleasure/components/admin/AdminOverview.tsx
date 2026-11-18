'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  MapPin,
  Clock,
  Users,
  MessageCircle,
  Eye,
  ArrowRight,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import InspectionModal, { PendingSubmission } from './InspectionModal';
import {
  getAdminOverviewMetrics,
  getAdminSubmissions,
  approveSubmission,
  rejectSubmission,
  AdminOverviewMetrics,
} from '@/lib/api';

const DEFAULT_METRICS: AdminOverviewMetrics = {
  kpi: {
    total_poi: {
      value: 1250,
      display_value: '1.250',
      trend_delta: 24,
      trend_label: 'POI terverifikasi bulan ini',
    },
    pending_submissions: {
      value: 0,
      display_value: '0',
      trend_label: 'memerlukan validasi kurator',
    },
    total_users: {
      value: 4580,
      display_value: '4.580',
      trend_delta: 312,
      trend_label: 'pengguna baru minggu ini',
    },
    new_feedback: {
      value: 8,
      display_value: '8',
      trend_label: 'ulasan & masukan komunitas',
    },
  },
  category_trends: [
    { id: 1, name: 'Wisata Alam & Terbuka', slug: 'wisata-alam-terbuka', count: 320, percentage: 78, color: '#4941EC' },
    { id: 2, name: 'Modern & Lifestyle', slug: 'modern-lifestyle', count: 210, percentage: 62, color: '#EDAD40' },
    { id: 3, name: 'Publik & Edukasi', slug: 'publik-edukasi', count: 140, percentage: 45, color: '#60CE9F' },
    { id: 4, name: 'Rekreasi Keluarga', slug: 'rekreasi-keluarga', count: 380, percentage: 90, color: '#3B82F6' },
  ],
};

export default function AdminOverview() {
  const [metrics, setMetrics] = useState<AdminOverviewMetrics>(DEFAULT_METRICS);
  const [submissions, setSubmissions] = useState<PendingSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<PendingSubmission | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const showToast = (text: string, isError = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [metricsData, submissionsData] = await Promise.all([
        getAdminOverviewMetrics(),
        getAdminSubmissions('pending'),
      ]);

      if (metricsData) {
        setMetrics(metricsData);
      }

      if (Array.isArray(submissionsData)) {
        const mapped: PendingSubmission[] = submissionsData.map((item: any) => {
          const lat = item.latitude ?? (item.proposed_location?.coordinates ? item.proposed_location.coordinates[1] : null);
          const lng = item.longitude ?? (item.proposed_location?.coordinates ? item.proposed_location.coordinates[0] : null);

          let locationText = 'Koordinat Peta';
          if (lat && lng) {
            locationText = `Lat: ${Number(lat).toFixed(4)}, Long: ${Number(lng).toFixed(4)}`;
          }

          const rawDate = item.created_at ? new Date(item.created_at) : new Date();
          const formattedDate = rawDate.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }) + ' WIB';

          return {
            id: item.id,
            name: item.name,
            submitter: item.user?.name ? `@${item.user.name}` : '@pengguna',
            category: item.category?.name || 'Destinasi Wisata',
            locationMethod: item.evidence_image?.startsWith('http') ? 'Link Google Maps' : 'GPS Realtime',
            coordsOrUrl: item.evidence_image?.startsWith('http') ? item.evidence_image : locationText,
            date: formattedDate,
            status: item.status || 'pending',
            description: item.description,
            price_range: item.price_range,
            opening_hours: item.opening_hours,
            evidence_image: item.evidence_image,
            admin_note: item.admin_note,
          };
        });
        setSubmissions(mapped);
      }
    } catch (err) {
      console.error('Failed to load admin overview data:', err);
      showToast('Gagal memuat data metrik terbaru.', true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenInspection = (sub: PendingSubmission) => {
    setSelectedSubmission(sub);
    setIsModalOpen(true);
  };

  const handleApprove = async (id: number | string, adminNote?: string) => {
    setIsActionLoading(true);
    try {
      await approveSubmission(id, adminNote);
      setSubmissions((prev) => prev.filter((item) => item.id !== id));
      setIsModalOpen(false);
      showToast('Pengajuan destinasi disetujui & dipublikasikan ke peta!');
      // Reload metrics to update counter
      getAdminOverviewMetrics().then((res) => res && setMetrics(res));
    } catch (err: any) {
      showToast(err.message || 'Gagal menyetujui pengajuan.', true);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReject = async (id: number | string, adminNote?: string) => {
    setIsActionLoading(true);
    try {
      await rejectSubmission(id, adminNote);
      setSubmissions((prev) => prev.filter((item) => item.id !== id));
      setIsModalOpen(false);
      showToast('Pengajuan destinasi telah ditolak.');
      // Reload metrics
      getAdminOverviewMetrics().then((res) => res && setMetrics(res));
    } catch (err: any) {
      showToast(err.message || 'Gagal menolak pengajuan.', true);
    } finally {
      setIsActionLoading(false);
    }
  };

  const kpi = metrics.kpi;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl text-white text-xs font-medium shadow-xl animate-in fade-in slide-in-from-top-4 ${
            toastMessage.isError ? 'bg-red-600' : 'bg-gray-900'
          }`}
        >
          {toastMessage.isError ? (
            <AlertCircle className="w-4 h-4 text-white" />
          ) : (
            <CheckCircle className="w-4 h-4 text-[#60CE9F]" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Title & Subtitle + Refresh Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Overview Kinerja & Ringkasan Sistem
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Metrik operasional real-time JabarPleasure WebGIS
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 active:scale-95 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 transition-all cursor-pointer shadow-xs disabled:opacity-50"
          title="Segarkan data metrik"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total POI */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full bg-[#4941EC] text-white flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(73,65,236,0.25)]">
            <MapPin className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-800">Total POI</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                {isLoading ? '...' : kpi.total_poi.display_value}
              </span>
              {kpi.total_poi.trend_delta ? (
                <span className="text-[11px] font-semibold text-emerald-500 flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> {kpi.total_poi.trend_delta}
                </span>
              ) : null}
            </div>
            <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
              {kpi.total_poi.trend_label}
            </p>
          </div>
        </div>

        {/* Card 2: Pengajuan menunggu */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full bg-[#EDAD40] text-white flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(237,173,64,0.25)]">
            <Clock className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-800">Pengajuan menunggu</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                {isLoading ? '...' : submissions.length}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
              {kpi.pending_submissions.trend_label}
            </p>
          </div>
        </div>

        {/* Card 3: Total Pengguna */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full bg-[#60CE9F] text-white flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(96,206,159,0.3)]">
            <Users className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-800">Total Pengguna</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                {isLoading ? '...' : kpi.total_users.display_value}
              </span>
              {kpi.total_users.trend_delta ? (
                <span className="text-[11px] font-semibold text-emerald-500 flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> {kpi.total_users.trend_delta}
                </span>
              ) : null}
            </div>
            <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
              {kpi.total_users.trend_label}
            </p>
          </div>
        </div>

        {/* Card 4: Masukan Baru */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full bg-[#3B82F6] text-white flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(59,130,246,0.25)]">
            <MessageCircle className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-800">Masukan Baru</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                {isLoading ? '...' : kpi.new_feedback.display_value}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
              {kpi.new_feedback.trend_label}
            </p>
          </div>
        </div>
      </div>

      {/* Two Large Side-by-Side Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Analitik Perilaku & Tren Kategori (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold text-gray-900 tracking-tight">
                Analitik Perilaku & Tren Kategori
              </h2>
              <span className="text-xs font-semibold text-[#4941EC]">
                Distribusi POI
              </span>
            </div>

            <div className="space-y-4">
              {metrics.category_trends.map((cat) => (
                <div key={cat.id || cat.slug}>
                  <div className="flex justify-between text-xs mb-1.5 font-medium">
                    <span className="text-gray-800">{cat.name}</span>
                    <span className="text-gray-900 font-bold">{cat.percentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${cat.percentage}%`,
                        backgroundColor: cat.color || '#4941EC',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-6">
            <span className="text-[11px] text-gray-400">
              Data agregasi spasial 30 hari terakhir
            </span>
            <button
              type="button"
              onClick={() => showToast('Fitur ekspor laporan sedang dipersiapkan.')}
              className="text-xs font-semibold text-[#4941EC] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Unduh Laporan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column: Validasi Pengajuan Lokasi Baru (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-900 tracking-tight">
                Validasi Pengajuan Lokasi Baru
              </h2>
              <span className="text-xs font-bold text-[#4941EC]">
                {submissions.length} Antrean
              </span>
            </div>

            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-gray-400 text-xs">
                <Loader2 className="w-6 h-6 animate-spin text-[#4941EC]" />
                <span>Memuat antrean pengajuan...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-700 font-semibold">
                      <th className="py-2.5 pr-2">Nama Destinasi</th>
                      <th className="py-2.5 px-2">Pengaju</th>
                      <th className="py-2.5 px-2">Kategori</th>
                      <th className="py-2.5 px-2">Metode Lokasi</th>
                      <th className="py-2.5 pl-2 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {submissions.map((sub) => (
                      <tr
                        key={sub.id}
                        className="hover:bg-gray-50/70 transition-colors"
                      >
                        <td className="py-3 pr-2 font-medium text-gray-900">
                          {sub.name}
                        </td>
                        <td className="py-3 px-2 text-gray-600 font-medium">
                          {sub.submitter}
                        </td>
                        <td className="py-3 px-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#EEF2FF] text-[#4941EC] text-[10px] font-semibold whitespace-nowrap">
                            {sub.category}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-gray-500 whitespace-nowrap">
                          {sub.locationMethod}
                        </td>
                        <td className="py-3 pl-2 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleOpenInspection(sub)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-gray-200 text-[11px] font-medium text-gray-700 hover:bg-gray-100 active:scale-95 transition-all cursor-pointer shadow-2xs"
                          >
                            <Eye className="w-3 h-3 text-gray-500" />
                            <span>Tinjau</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {submissions.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-8 text-center text-xs text-gray-400"
                        >
                          Semua antrean pengajuan telah selesai diverifikasi.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-6">
            <span className="text-[11px] text-gray-400">
              Sistem verifikasi spasial aktif (SRID 4326)
            </span>
            <span className="text-xs font-semibold text-[#4941EC]">
              Status Kurator: Aktif
            </span>
          </div>
        </div>
      </div>

      {/* Detail Inspection Modal for Reviewing Submissions */}
      <InspectionModal
        isOpen={isModalOpen}
        submission={selectedSubmission}
        isLoading={isActionLoading}
        onClose={() => setIsModalOpen(false)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
