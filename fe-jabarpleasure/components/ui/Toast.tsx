'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
  className?: string;
}

export default function Toast({
  message,
  type = 'info',
  onClose,
  className = '',
}: ToastProps) {
  const typeConfig = {
    success: {
      badgeBg: 'bg-emerald-500/15',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />,
    },
    error: {
      badgeBg: 'bg-red-500/15',
      icon: <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0 stroke-[2.5]" />,
    },
    info: {
      badgeBg: 'bg-[#4941EC]/12',
      icon: <Info className="w-3.5 h-3.5 text-[#4941EC] shrink-0 stroke-[2.5]" />,
    },
  };

  const { badgeBg, icon } = typeConfig[type];

  return (
    <div
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-[100] max-w-[calc(100vw-32px)] sm:max-w-md w-max flex items-center gap-2.5 pl-3 pr-2.5 py-2 sm:pl-3.5 sm:pr-3 sm:py-2.5 rounded-full bg-white/80 backdrop-blur-xl saturate-150 border border-white/70 shadow-[0_10px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.95)] ring-1 ring-black/[0.04] text-gray-800 text-xs sm:text-[13px] font-semibold select-none animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-300 ease-out transition-all ${className}`}
      role="alert"
    >
      {/* Apple-style Soft Tinted Icon Capsule */}
      <div className={`w-6 h-6 rounded-full ${badgeBg} flex items-center justify-center shrink-0`}>
        {icon}
      </div>

      {/* Toast Message */}
      <span className="truncate leading-snug">{message}</span>

      {/* Dismiss Button */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup notifikasi"
          className="ml-0.5 p-1 text-gray-400 hover:text-gray-700 active:scale-90 hover:bg-black/[0.05] rounded-full transition-all cursor-pointer shrink-0"
        >
          <X className="w-3.5 h-3.5 stroke-[2.2]" />
        </button>
      )}
    </div>
  );
}
