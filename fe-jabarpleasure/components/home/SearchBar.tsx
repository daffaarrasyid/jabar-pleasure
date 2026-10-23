'use client';

import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';

interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  onClear?: () => void;
  onFilterClick?: () => void;
  onSubmit?: () => void;
  filterBadgeCount?: number;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({
  value = '',
  onChange,
  onClear,
  onFilterClick,
  onSubmit,
  filterBadgeCount,
  placeholder = 'Cari destinasi, kuliner, hiburan',
  className = '',
}: SearchBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSubmit?.();
    }
  };

  return (
    <div className={`w-full flex items-center gap-3 px-5 py-2 ${className}`}>
      {/* Search Input Box */}
      <div className="relative flex-1 flex items-center bg-white rounded-2xl border border-gray-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.03)] focus-within:border-[#4941EC] focus-within:ring-2 focus-within:ring-[#4941EC]/15 transition-all">
        {/* Search Icon */}
        <div className="pl-4 pr-2 text-gray-400 shrink-0 pointer-events-none">
          <Search className="w-5 h-5 stroke-[2]" />
        </div>

        {/* Input */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full py-3.5 pr-3 text-xs sm:text-sm text-gray-800 placeholder-gray-400 bg-transparent focus:outline-none font-normal"
        />

        {/* Clear Button */}
        {value.length > 0 ? (
          <button
            type="button"
            onClick={onClear}
            aria-label="Hapus pencarian"
            className="p-2 mr-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2]" />
          </button>
        ) : (
          <div className="pr-3 text-gray-300">
            <X className="w-4 h-4 stroke-[1.5]" />
          </div>
        )}
      </div>

      {/* Filter Button with optional badge */}
      <button
        type="button"
        onClick={onFilterClick}
        aria-label="Filter destinasi"
        className="relative w-12 h-12 shrink-0 bg-[#4941EC] hover:bg-[#3C35C7] text-white rounded-2xl flex items-center justify-center shadow-[0_4px_12px_rgba(73,65,236,0.25)] active:scale-95 transition-all cursor-pointer"
      >
        <SlidersHorizontal className="w-5 h-5 stroke-[2.3]" />
        {filterBadgeCount !== undefined && filterBadgeCount > 0 && (
          <span
            className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-[#EF4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-xs leading-none z-10 animate-in fade-in zoom-in-75 duration-200"
            aria-label={`${filterBadgeCount} filter aktif`}
          >
            {filterBadgeCount}
          </span>
        )}
      </button>
    </div>
  );
}
