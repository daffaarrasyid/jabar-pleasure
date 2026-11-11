'use client';

import React, { useState } from 'react';
import {
  X,
  HelpCircle,
  ChevronDown,
  MessageCircle,
  Mail,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

interface HelpCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FAQS = [
  {
    question: 'Bagaimana cara membuat dan memulai rencana perjalanan?',
    answer:
      'Buka menu "Rencana" dari navigasi bawah, pilih lokasi keberangkatan Anda atau gunakan GPS realtime. Tambahkan destinasi wisata yang ingin dikunjungi, lalu klik "Buat Rencana". Setelah rute terbentuk di peta, klik "Mulai Perjalanan" untuk panduan check-in langkah demi langkah.',
  },
  {
    question: 'Mengapa jarak destinasi tidak muncul atau belum presisi?',
    answer:
      'Pastikan Anda telah mengizinkan browser atau perangkat mengakses GPS (Lokasi). JabarPleasure menggunakan PostGIS spatial querying untuk mengukur jarak sebenarnya (haversine / spheroid) dari koordinat Anda ke titik destinasi.',
  },
  {
    question: 'Bagaimana cara mengajukan destinasi wisata/hiburan baru?',
    answer:
      'Di halaman Beranda, cari kartu "Ajukan Destinasi Baru". Isi nama tempat, kategori wisata, dan koordinat GPS lokasi atau tautan Google Maps. Pengajuan Anda akan ditinjau dan divalidasi oleh tim admin WebGIS.',
  },
  {
    question: 'Bagaimana cara mengunggah foto & video jurnal perjalanan?',
    answer:
      'Setelah perjalanan Anda diselesaikan di menu "Riwayat", klik "Lihat Perjalanan" pada kartu trip tersebut. Di halaman Detail Perjalanan, klik tombol "Kelola Media Jurnal". Anda dapat melampirkan foto (maks. 2MB) dan video singkat (maks. 10MB) dengan caption kenangan Anda.',
  },
  {
    question: 'Apakah saya bisa menyelesaikan perjalanan lebih awal?',
    answer:
      'Ya! Jika di tengah perjalanan terjadi kendala atau perubahan jadwal, cukup klik tombol bendera "Selesaikan Perjalanan" di layar aktif perjalanan. Riwayat destinasi yang telah Anda kunjungi akan tersimpan dengan rapi.',
  },
];

export default function HelpCenterModal({ isOpen, onClose }: HelpCenterModalProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!isOpen) return null;

  const toggleAccordion = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  const handleOpenWhatsApp = () => {
    const text = encodeURIComponent('Halo Tim Bantuan JabarPleasure, saya membutuhkan bantuan terkait aplikasi.');
    window.open(`https://wa.me/6281234567890?text=${text}`, '_blank');
  };

  const handleOpenEmail = () => {
    window.location.href = 'mailto:bantuan@jabarpleasure.id?subject=Pertanyaan%20Layanan%20JabarPleasure';
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-center-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-[480px] bg-white rounded-t-3xl shadow-2xl z-10 flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Drag Pill Handle */}
        <div className="pt-3 pb-1 flex justify-center shrink-0">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EEF2FF] text-[#4941EC] flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h2 id="help-center-title" className="text-base font-bold text-gray-900 leading-tight">
                Pusat Bantuan
              </h2>
              <p className="text-xs text-gray-500">
                Pertanyaan umum & kontak bantuan JabarPleasure
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* FAQ Accordion Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-[#4941EC]" />
              <h3 className="text-xs font-bold text-gray-900">
                Pertanyaan yang Sering Diajukan (FAQ)
              </h3>
            </div>

            <div className="space-y-2.5">
              {FAQS.map((faq, idx) => {
                const isOpen = openIndex === idx;
                return (
                  <div
                    key={idx}
                    className="border border-gray-100 rounded-2xl overflow-hidden transition-all bg-white"
                  >
                    <button
                      type="button"
                      onClick={() => toggleAccordion(idx)}
                      className="w-full flex items-center justify-between p-3.5 text-left hover:bg-gray-50/80 cursor-pointer"
                    >
                      <span className="text-xs font-semibold text-gray-900 pr-2 leading-snug">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-[#4941EC]' : ''
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-3.5 pb-3.5 pt-1 text-[11px] text-gray-600 leading-relaxed border-t border-gray-50 bg-[#F9FAFB]/50 animate-in fade-in duration-150">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact Support Channels */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 mb-2.5">
              Hubungi Layanan Pengguna
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              {/* WhatsApp Button */}
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-2xl flex flex-col items-center justify-center text-center text-emerald-800 transition-colors cursor-pointer group active:scale-[0.98]"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-1.5 shadow-xs">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold flex items-center gap-1">
                  WhatsApp Support
                  <ExternalLink className="w-3 h-3 text-emerald-600" />
                </span>
                <span className="text-[10px] text-emerald-600 mt-0.5">
                  Respon Cepat (08.00 - 20.00)
                </span>
              </button>

              {/* Email Support Button */}
              <button
                type="button"
                onClick={handleOpenEmail}
                className="p-3 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-2xl flex flex-col items-center justify-center text-center text-[#4941EC] transition-colors cursor-pointer group active:scale-[0.98]"
              >
                <div className="w-8 h-8 rounded-full bg-[#4941EC] text-white flex items-center justify-center mb-1.5 shadow-xs">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold flex items-center gap-1">
                  Email Bantuan
                  <ExternalLink className="w-3 h-3 text-[#4941EC]" />
                </span>
                <span className="text-[10px] text-[#4941EC]/80 mt-0.5">
                  bantuan@jabarpleasure.id
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex justify-end shrink-0 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold active:scale-[0.98] transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

