'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Clock,
  Users,
  MessageSquare,
  BarChart3,
  Eye,
  CheckCircle,
  TrendingUp,
  Inbox,
  Filter,
} from 'lucide-react';
import InspectionModal, { PendingSubmission } from './InspectionModal';

const INITIAL_SUBMISSIONS: PendingSubmission[] = [
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
];

export default function AdminOverview() {
  const [submissions, setSubmissions] = useState<PendingSubmission[]>(INITIAL_SUBMISSIONS);
  const [selectedSubmission, setSelectedSubmission] = useState<PendingSubmission | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleOpenInspection = (sub: PendingSubmission) => {
    setSelectedSubmission(sub);
    setIsModalOpen(true);
  };

  const handleApprove = (id: number | string) => {
    setSubmissions((prev) =>
      prev.filter((item) => item.id !== id)
    );
    setIsModalOpen(false);
    showToast('Pengajuan destinasi berhasil disetujui & dipublikasikan ke peta WebGIS.');
  };

  const handleReject = (id: number | string) => {
    setSubmissions((prev) =>
      prev.filter((item) => item.id !== id)
    );
    setIsModalOpen(false);
    showToast('Pengajuan destinasi telah ditolak.');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Category Top Click stats from wireframe
  const categoryAnalytics = [
    {
      name: 'Wisata Alam & Terbuka',
      percentage: 45,
      clicks: '2.140 klik',
      color: 'bg-gradient-to-r from-[#4941EC] to-[#60CE9F]',
      textColor: 'text-[#4941EC]',
    },
    {
      name: 'Modern & Lifestyle',
      percentage: 30,
      clicks: '1.420 klik',
      color: 'bg-[#4941EC]',
      textColor: 'text-[#4941EC]',
    },
    {
      name: 'Publik & Edukasi',
      percentage: 15,
      clicks: '710 klik',
      color: 'bg-[#60CE9F]',
      textColor: 'text-[#059669]',
    },
    {
      name: 'Rekreasi Keluarga',
      percentage: 10,
      clicks: '480 klik',
      color: 'bg-[#EDAD40]',
      textColor: 'text-[#D97706]',
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs sm:text-sm animate-in slide-in-from-bottom">
          <CheckCircle className="w-4 h-4 text-[#60CE9F]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Section: Overview Kinerja & Ringkasan Sistem WebGIS */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
              Overview Kinerja & Ringkasan Sistem WebGIS
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Metrik operasional real-time pariwisata Jawa Barat
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 bg-white border border-gray-200 px-3 py-1.5 rounded-xl shadow-2xs">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <span>27 Kabupaten/Kota</span>
          </div>
        </div>

        {/* 4 Cards Grid Full-Width */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Total POI */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">Total POI</span>
              <div className="w-9 h-9 rounded-xl bg-[#EEF0FF] text-[#4941EC] flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5">
              <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                1.250
              </h3>
              <p className="text-[11px] font-medium text-[#059669] flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                <span>+24 POI terverifikasi bulan ini</span>
              </p>
            </div>
          </div>

          {/* Card 2: Pengajuan Menunggu */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">Pengajuan Menunggu</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#EDAD40] flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5">
              <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                {submissions.length}
              </h3>
              <p className="text-[11px] font-medium text-amber-600 flex items-center gap-1 mt-1">
                <Inbox className="w-3 h-3" />
                <span>Memerlukan validasi kurator</span>
              </p>
            </div>
          </div>

          {/* Card 3: Total Pengguna */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">Total Pengguna</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#60CE9F] flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5">
              <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                4.820
              </h3>
              <p className="text-[11px] font-medium text-[#059669] flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                <span>+312 pengguna baru minggu ini</span>
              </p>
            </div>
          </div>

          {/* Card 4: Masukan Baru */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">Masukan Baru</span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5">
              <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                5
              </h3>
              <p className="text-[11px] font-medium text-purple-600 flex items-center gap-1 mt-1">
                <span>Ulasan & masukan komunitas</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Middle Section: Two Columns (Left: Barchart, Right: Pending UGC Submissions Table) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols on LG): Analitik Perilaku & Tren Kategori */}
        <section className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#EEF0FF] text-[#4941EC]">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 tracking-tight">
                    Analitik Perilaku & Tren Kategori
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Proporsi klik preferensi eksplorasi pengunjung
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-[#4941EC] bg-[#EEF0FF] px-2 py-0.5 rounded-md">
                Top Clicks
              </span>
            </div>

            {/* Horizontal Bar Chart (Matching Wireframe) */}
            <div className="space-y-4 my-2">
              {categoryAnalytics.map((cat) => (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-gray-700 truncate max-w-[200px]">
                      {cat.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-gray-400 font-normal">
                        {cat.clicks}
                      </span>
                      <span className={`font-bold ${cat.textColor}`}>
                        {cat.percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Bar Track Container */}
                  <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden p-0.5 flex items-center">
                    <div
                      className={`h-full rounded-full ${cat.color} transition-all duration-700 ease-out`}
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
            <span>Data agregasi 30 hari terakhir</span>
            <span className="text-[#4941EC] font-semibold cursor-pointer hover:underline">
              Unduh Laporan &rarr;
            </span>
          </div>
        </section>

        {/* Right Column (7 Cols on LG): Pengajuan Lokasi Baru Perlu Validasi */}
        <section className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                  <Inbox className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 tracking-tight">
                    Pengajuan Lokasi Baru Perlu Validasi
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Menampilkan 3 antrean pengajuan pengguna (Pending UGC)
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                {submissions.length} Antrean
              </span>
            </div>

            {/* Submissions Table / Cards */}
            {submissions.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <CheckCircle className="w-8 h-8 text-[#60CE9F] mx-auto mb-2" />
                <p className="text-xs font-semibold text-gray-700">Semua pengajuan telah divalidasi</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Tidak ada antrean tertunda saat ini.</p>
              </div>
            ) : (
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-200/80 text-[11px] font-bold uppercase text-gray-400">
                      <th className="pb-2.5 font-bold">Nama Destinasi</th>
                      <th className="pb-2.5 font-bold hidden sm:table-cell">Pengaju</th>
                      <th className="pb-2.5 font-bold">Kategori</th>
                      <th className="pb-2.5 font-bold hidden md:table-cell">Metode Lokasi</th>
                      <th className="pb-2.5 font-bold text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {submissions.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/70 transition-colors group">
                        <td className="py-3 pr-2">
                          <p className="font-bold text-gray-900 group-hover:text-[#4941EC] transition-colors truncate max-w-[150px] sm:max-w-[180px]">
                            {item.name}
                          </p>
                          <span className="sm:hidden text-[10px] text-gray-400 block truncate">
                            {item.submitter}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-gray-600 hidden sm:table-cell">
                          <span className="font-medium text-gray-700">{item.submitter}</span>
                        </td>
                        <td className="py-3 px-2">
                          <span className="bg-[#EEF0FF] text-[#4941EC] px-2 py-0.5 rounded-md text-[10px] font-semibold whitespace-nowrap">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-gray-500 hidden md:table-cell whitespace-nowrap">
                          {item.locationMethod}
                        </td>
                        <td className="py-3 pl-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleOpenInspection(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 shadow-2xs transition-all active:scale-95 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-gray-500" />
                            <span>Tinjau</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
            <span>Sistem verifikasi spasial aktif</span>
            <span className="text-[#4941EC] font-semibold cursor-pointer hover:underline">
              Lihat Riwayat &rarr;
            </span>
          </div>
        </section>
      </div>

      {/* Inspection Modal */}
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

