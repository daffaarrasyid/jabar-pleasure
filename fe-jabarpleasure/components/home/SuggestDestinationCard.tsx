'use client';

import React from 'react';
import { Plus } from 'lucide-react';

interface SuggestDestinationCardProps {
  onOpenForm?: () => void;
  className?: string;
}

export default function SuggestDestinationCard({
  onOpenForm,
  className = '',
}: SuggestDestinationCardProps) {
  return (
    <section className={`w-full px-5 py-2 ${className}`}>
      {/* Sleek & Compact Blue Gradient Card */}
      <div
        onClick={onOpenForm}
        className="relative w-full rounded-2xl bg-gradient-to-r from-[#4941EC] via-[#4840EB] to-[#5950F6] p-3.5 px-4 text-white shadow-sm select-none cursor-pointer group flex items-center justify-between gap-3 overflow-hidden transition-all duration-200 hover:shadow-md"
      >
        {/* Subtle decorative dot pattern */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '12px 12px',
          }}
        />

        {/* Text Prompt */}
        <div className="relative z-10 flex-1 min-w-0 pr-1">
          <p className="text-xs sm:text-sm font-semibold text-white tracking-tight leading-snug">
            Tidak menemukan destinasi?
          </p>
        </div>

        {/* Compact 'Ajukan' Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenForm?.();
          }}
          className="relative z-10 shrink-0 bg-white text-[#4941EC] hover:bg-gray-50 active:scale-95 text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Ajukan</span>
        </button>
      </div>
    </section>
  );
}
