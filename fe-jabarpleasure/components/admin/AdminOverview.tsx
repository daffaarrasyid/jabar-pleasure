'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Clock,
  Users,
  MessageCircle,
  Eye,
  ArrowRight,
  TrendingUp,
  CheckCircle,
} from 'lucide-react';
import InspectionModal, { PendingSubmission } from './InspectionModal';

const MOCK_SUBMISSIONS: PendingSubmission[] = [
  {
    id: 1,
    name: 'Curug Tilu Leuwi Opat',
    submitter: '@julyandre',
    category: 'Wisata Alam & Terbuka',
    locationMethod: 'GPS Realtime',
    coordsOrUrl: 'Lat: -6.7925, Long: 107.5872',
    date: 'Hari ini, 09:24 WIB',
    status: 'pending',
  },
  {
    id: 2,
    name: 'Dago Bakery Punclut',
    submitter: '@daffa_dev',
    category: 'Modern & Lifestyle',
    locationMethod: 'Link Google Maps',
    coordsOrUrl: 'https://maps.app.goo.gl/dagoBakeryPunclut',
    date: 'Kemarin, 16:45 WIB',
    status: 'pending',
  },
  {
    id: 3,
    name: 'Kampung Kohod',
    submitter: '@rifaldi_pm',
    category: 'Rekreasi Keluarga',
    locationMethod: 'GPS Realtime',
    coordsOrUrl: 'Lat: -6.0428, Long: 106.6214',
    date: '3 Nov 2026, 11:10 WIB',
    status: 'pending',
  },
  {
    id: 4,
    name: 'Kampung Kohod',
    submitter: '@rifaldi_pm',
    category: 'Rekreasi Keluarga',
    locationMethod: 'GPS Realtime',
    coordsOrUrl: 'Lat: -6.0428, Long: 106.6214',
    date: '3 Nov 2026, 10:15 WIB',
    status: 'pending',
  },
];

export default function AdminOverview() {
  const [submissions, setSubmissions] = useState<PendingSubmission[]>(MOCK_SUBMISSIONS);
  const [selectedSubmission, setSelectedSubmission] = useState<PendingSubmission | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleOpenInspection = (sub: PendingSubmission) => {
    setSelectedSubmission(sub);
    setIsModalOpen(true);
  };

  const handleApprove = (id: number | string) => {
    setSubmissions((prev) => prev.filter((item) => item.id !== id));
    setIsModalOpen(false);
    showToast('Pengajuan destinasi disetujui & dipublikasikan ke peta.');
  };

  const handleReject = (id: number | string) => {
    setSubmissions((prev) => prev.filter((item) => item.id !== id));
    setIsModalOpen(false);
    showToast('Pengajuan destinasi ditolak.');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gray-900 text-white text-xs font-medium shadow-xl animate-in fade-in slide-in-from-top-4">
          <CheckCircle className="w-4 h-4 text-[#60CE9F]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Title & Subtitle */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
          Overview Kinerja & Ringkasan Sistem
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Metrik operasional real-time JabarPleasure
        </p>
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
                1.250
              </span>
              <span className="text-[11px] font-semibold text-emerald-500 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> 24
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
              POI terverifikasi bulan ini
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
                5
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
              memerlukan validasi kurator
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
                4.580
              </span>
              <span className="text-[11px] font-semibold text-emerald-500 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> 312
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
              pengguna baru minggu ini
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
                8
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
              ulasan & masukan komunitas
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
                Top Clicks
              </span>
            </div>

            <div className="space-y-4">
              {/* Wisata Alam & Terbuka */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-gray-800">Wisata Alam & Terbuka</span>
                  <span className="text-gray-900 font-bold">78%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#4941EC] rounded-full"
                    style={{ width: '78%' }}
                  />
                </div>
              </div>

              {/* Modern & Lifestyle */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-gray-800">Modern & Lifestyle</span>
                  <span className="text-gray-900 font-bold">62%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#EDAD40] rounded-full"
                    style={{ width: '62%' }}
                  />
                </div>
              </div>

              {/* Publik & Edukasi */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-gray-800">Publik & Edukasi</span>
                  <span className="text-gray-900 font-bold">45%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#60CE9F] rounded-full"
                    style={{ width: '45%' }}
                  />
                </div>
              </div>

              {/* Rekreasi Keluarga */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-gray-800">Rekreasi Keluarga</span>
                  <span className="text-gray-900 font-bold">90%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#3B82F6] rounded-full"
                    style={{ width: '90%' }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-6">
            <span className="text-[11px] text-gray-400">
              Data agregasi 30 hari terakhir
            </span>
            <button
              type="button"
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
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-6">
            <span className="text-[11px] text-gray-400">
              Sistem verifikasi spasial aktif
            </span>
            <button
              type="button"
              className="text-xs font-semibold text-[#4941EC] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Lihat Riwayat</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Inspection Modal for Reviewing Submissions */}
      <InspectionModal
        isOpen={isModalOpen}
        submission={selectedSubmission}
        onClose={() => setIsModalOpen(false)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
