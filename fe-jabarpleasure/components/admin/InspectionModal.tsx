'use client';

import React from 'react';
import { X, Check, Trash2, MapPin, ExternalLink, Calendar, User, Tag } from 'lucide-react';

export interface PendingSubmission {
  id: number | string;
  name: string;
  submitter: string;
  category: string;
  locationMethod: string;
  coordsOrUrl: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface InspectionModalProps {
  isOpen: boolean;
  submission: PendingSubmission | null;
  onClose: () => void;
  onApprove: (id: number | string) => void;
  onReject: (id: number | string) => void;
}

export default function InspectionModal({
  isOpen,
  submission,
  onClose,
  onApprove,
  onReject,
}: InspectionModalProps) {
  if (!isOpen || !submission) return null;

  const isLink = submission.coordsOrUrl.startsWith('http');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-10 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 bg-gray-50/50">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#4941EC] bg-[#EEF0FF] px-2 py-0.5 rounded-md">
              Validasi POI Pengguna
            </span>
            <h3 className="text-base font-bold text-gray-900 mt-1">
              Tinjau Pengajuan: {submission.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Details */}
        <div className="p-5 space-y-4 text-xs sm:text-sm">
          {/* Submitter and Date */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
            <div className="flex items-center gap-2 text-gray-600">
              <User className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-[10px] text-gray-400 uppercase">Pengaju</p>
                <p className="font-semibold text-gray-900">{submission.submitter}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-[10px] text-gray-400 uppercase">Waktu Pengajuan</p>
                <p className="font-semibold text-gray-900">{submission.date}</p>
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100">
            <span className="text-gray-500 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-[#4941EC]" />
              Kategori Wisata:
            </span>
            <span className="font-bold text-[#4941EC] bg-[#EEF0FF] px-2.5 py-1 rounded-lg text-xs">
              {submission.category}
            </span>
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
              {isLink && (
                <a
                  href={submission.coordsOrUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#4941EC] hover:underline flex items-center gap-1 text-[11px] shrink-0 ml-2"
                >
                  <ExternalLink className="w-3 h-3" />
                  Buka Peta
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={() => onReject(submission.id)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Tolak Pengajuan</span>
          </button>

          <button
            type="button"
            onClick={() => onApprove(submission.id)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#60CE9F] hover:bg-[#4EB789] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Setujui & Publikasikan POI</span>
          </button>
        </div>
      </div>
    </div>
  );
}

