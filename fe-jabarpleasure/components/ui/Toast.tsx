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
      bg: 'bg-emerald-600',
      icon: <CheckCircle2 className="w-4 h-4 text-white shrink-0" />,
    },
    error: {
      bg: 'bg-red-600',
      icon: <AlertCircle className="w-4 h-4 text-white shrink-0" />,
    },
    info: {
      bg: 'bg-[#4941EC]',
      icon: <Info className="w-4 h-4 text-white shrink-0" />,
    },
  };

  const { bg, icon } = typeConfig[type];

  return (
    <div
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-full text-white text-xs sm:text-sm font-medium shadow-lg animate-in fade-in slide-in-from-top-4 duration-200 select-none ${bg} ${className}`}
      role="alert"
    >
      {icon}
      <span>{message}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup notifikasi"
          className="ml-1 p-0.5 hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
