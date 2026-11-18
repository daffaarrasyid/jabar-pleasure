'use client';

import React, { useState } from 'react';
import {
  X,
  Check,
  Trash2,
  MapPin,
  ExternalLink,
  Calendar,
  User,
  Tag,
  Loader2,
  Info,
  Clock,
  Coins,
} from 'lucide-react';

export interface PendingSubmission {
  id: number | string;
  name: string;
  submitter: string;
  category: string;
  locationMethod: string;
  coordsOrUrl: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  description?: string;
  price_range?: string;
  opening_hours?: string;
  evidence_image?: string | null;
  admin_note?: string | null;
}

interface InspectionModalProps {
  isOpen: boolean;
  submission: PendingSubmission | null;
  onClose: () => void;
  onApprove: (id: number | string, adminNote?: string) => void;
  onReject: (id: number | string, adminNote?: string) => void;
  isLoading?: boolean;
}

export default function InspectionModal({
  isOpen,
  submission,
  onClose,
  onApprove,
  onReject,
  isLoading = false,
}: InspectionModalProps) {
  const [adminNote, setAdminNote] = useState('');

  if (!isOpen || !submission) return null;

  const isLink = submission.coordsOrUrl.startsWith('http');

  const handleApproveClick = () => {
    onApprove(submission.id, adminNote.trim() || undefined);
  };

  const handleRejectClick = () => {
    onReject(submission.id, adminNote.trim() || undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="absolute inset-0" onClick={isLoading ? undefined : onClose} aria-hidden="true" />

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 bg-gray-50/50 shrink-0">
          <div>
            <span className="text-[10px] font-semibold text-[#4941EC] bg-[#EEF0FF] px-2 py-0.5 rounded-md">
              Validasi POI Pengguna
            </span>
            <h3 className="text-base font-semibold text-gray-900 mt-1">
              Tinjau Pengajuan: {submission.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Details */}
        <div className="p-5 space-y-4 text-xs sm:text-sm overflow-y-auto flex-1">
          {/* Submitter and Date */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
            <div className="flex items-center gap-2 text-gray-600">
              <User className="w-4 h-4 text-gray-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-gray-400 font-medium uppercase">Pengaju</p>
                <p className="font-semibold text-gray-900 truncate">{submission.submitter}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-gray-400 font-medium uppercase">Waktu Pengajuan</p>
                <p className="font-semibold text-gray-900 truncate">{submission.date}</p>
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100">
            <span className="text-gray-500 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-[#4941EC]" />
              Kategori Wisata:
            </span>
            <span className="font-semibold text-[#4941EC] bg-[#EEF0FF] px-2.5 py-1 rounded-lg text-xs">
              {submission.category}
            </span>
          </div>

          {/* Description if any */}
          {submission.description && (
            <div className="p-3 rounded-xl border border-gray-100 space-y-1">
              <span className="text-gray-400 text-[10px] uppercase font-bold flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-gray-400" />
                Deskripsi
              </span>
              <p className="text-gray-700 text-xs leading-relaxed">{submission.description}</p>
            </div>
          )}

          {/* Operational & Price info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl border border-gray-100">
              <span className="text-[10px] text-gray-400 uppercase flex items-center gap-1 font-semibold">
                <Coins className="w-3 h-3 text-[#EDAD40]" /> Rentang Tiket
              </span>
              <p className="text-xs font-semibold text-gray-800 mt-0.5">
                {submission.price_range || 'Gratis / Menyesuaikan'}
              </p>
            </div>
            <div className="p-3 rounded-xl border border-gray-100">
              <span className="text-[10px] text-gray-400 uppercase flex items-center gap-1 font-semibold">
                <Clock className="w-3 h-3 text-[#60CE9F]" /> Jam Buka
              </span>
              <p className="text-xs font-semibold text-gray-800 mt-0.5">
                {submission.opening_hours || 'Setiap Hari'}
              </p>
            </div>
          </div>

          {/* Location Method */}
          <div className="p-3.5 rounded-xl border border-gray-100 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#60CE9F]" />
                Metode Titik Lokasi:
              </span>
              <span className="font-semibold text-gray-800">
                {submission.locationMethod}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-gray-50 font-mono text-xs text-gray-700 flex items-center justify-between">
              <span className="truncate">{submission.coordsOrUrl}</span>
              {isLink ? (
                <a
                  href={submission.coordsOrUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#4941EC] hover:underline flex items-center gap-1 text-[11px] shrink-0 ml-2"
                >
                  <ExternalLink className="w-3 h-3" />
                  Buka Peta
                </a>
              ) : (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    submission.coordsOrUrl.replace(/Lat:\s*|Long:\s*/g, '')
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#4941EC] hover:underline flex items-center gap-1 text-[11px] shrink-0 ml-2"
                >
                  <ExternalLink className="w-3 h-3" />
                  Cek di Maps
                </a>
              )}
            </div>
          </div>

          {/* Curator Note Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-gray-700">
              Catatan Kurator / Alasan (Opsional)
            </label>
            <textarea
              rows={2}
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Tuliskan catatan untuk pengaju (misal: Disetujui / Alasan penolakan)..."
              disabled={isLoading}
              className="w-full text-xs p-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#4941EC] transition-all resize-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            disabled={isLoading}
            onClick={handleRejectClick}
            className="px-4 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            <span>Tolak Pengajuan</span>
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={handleApproveClick}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#60CE9F] hover:bg-[#4EB789] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
            <span>Setujui & Publikasikan POI</span>
          </button>
        </div>
      </div>
    </div>
  );
}
