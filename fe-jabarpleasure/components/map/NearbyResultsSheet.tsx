'use client';

import React, { useState } from 'react';
import { ChevronDown, MapPin, Compass, Users } from 'lucide-react';
import { ApiDestination } from '@/lib/api';

export interface NearbyDestination {
  id: string;
  name: string;
  category: string;
  distance: string;
  regency: string;
  visitorsCount?: number;
  image: string;
  coordinates: [number, number];
  raw?: ApiDestination;
}

interface NearbyResultsSheetProps {
  destinations?: NearbyDestination[];
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
  onItemClick?: (dest: NearbyDestination) => void;
  onSaveDestinations?: (selectedDestinations: NearbyDestination[]) => void;
  defaultMinimized?: boolean;
  isLoading?: boolean;
  className?: string;
}

// Precision custom vector icon matching the green signpost in the mockup
function SignpostIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M11 2v3H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h7v9h2v-9h5.586a1 1 0 0 0 .707-.293l3.414-3.414a1 1 0 0 0 0-1.414l-3.414-3.414A1 1 0 0 0 18.586 5H13V2h-2z" />
    </svg>
  );
}

export default function NearbyResultsSheet({
  destinations = [],
  selectedIds = [],
  onToggleSelect,
  onItemClick,
  onSaveDestinations,
  defaultMinimized = false,
  isLoading = false,
  className = '',
}: NearbyResultsSheetProps) {
  const [internalSelected, setInternalSelected] = useState<string[]>(selectedIds);
  const [isMinimized, setIsMinimized] = useState<boolean>(defaultMinimized);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  const handleToggle = (id: string) => {
    if (onToggleSelect) {
      onToggleSelect(id);
    } else {
      setInternalSelected((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    }
  };

  const activeSelected = onToggleSelect ? selectedIds : internalSelected;

  const handleSave = () => {
    const toSave = destinations.filter((d) => activeSelected.includes(d.id));
    if (toSave.length === 0) return;
    onSaveDestinations?.(toSave);
  };

  // Touch Swipe Gesture for dragging handle to minimize/expand
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY === null) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY;

    // Swipe down triggers minimize
    if (deltaY > 35 && !isMinimized) {
      setIsMinimized(true);
      setTouchStartY(null);
    }
    // Swipe up triggers expand
    else if (deltaY < -35 && isMinimized) {
      setIsMinimized(false);
      setTouchStartY(null);
    }
  };

  const handleTouchEnd = () => {
    setTouchStartY(null);
  };

  return (
    <div
      className={`w-full bg-white rounded-t-3xl border-t border-gray-100 shadow-[0_-8px_28px_rgba(0,0,0,0.12)] p-4 pt-2 flex flex-col z-20 transition-all duration-300 ease-in-out ${className}`}
    >
      {/* Top Drag Handle Bar (Click or Swipe to Minimize/Expand) */}
      <div
        onClick={() => setIsMinimized((prev) => !prev)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="button"
        tabIndex={0}
        aria-label={isMinimized ? 'Perluas hasil sekitar' : 'Kecilkan hasil sekitar'}
        className="w-full py-2 -mt-1 flex items-center justify-center cursor-pointer group focus:outline-none"
      >
        <div
          className={`h-1.5 rounded-full transition-all duration-300 ${
            isMinimized
              ? 'w-14 bg-[#4941EC] shadow-[0_1px_4px_rgba(73,65,236,0.4)]'
              : 'w-12 bg-[#4941EC]/50 group-hover:bg-[#4941EC]'
          }`}
        />
      </div>

      {/* Header Bar */}
      <div
        onClick={() => setIsMinimized((prev) => !prev)}
        className="flex items-center justify-between mb-2 cursor-pointer select-none group"
      >
        <div className="flex items-center gap-2">
          <h3 className="text-sm sm:text-base font-bold text-gray-900 tracking-tight">
            Hasil Sekitar
          </h3>
          <span className="bg-[#D1FAE5] text-[#059669] text-[11px] font-semibold px-2 py-0.5 rounded-md">
            {isLoading ? 'Memuat...' : `${destinations.length} ditemukan`}
          </span>
        </div>

        {/* Toggle Minimize / Expand Indicator */}
        <div className="flex items-center gap-1 text-xs font-semibold text-[#4941EC]">
          <span className="hidden xs:inline text-[11px]">
            {isMinimized ? 'Perluas' : 'Kecilkan'}
          </span>
          <div
            className={`p-1 rounded-full text-gray-400 group-hover:text-[#4941EC] transition-transform duration-300 ${
              isMinimized ? 'rotate-180' : 'rotate-0'
            }`}
          >
            <ChevronDown className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* Collapsible Content Area */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isMinimized
            ? 'max-h-0 opacity-0 pointer-events-none'
            : 'max-h-[460px] opacity-100 pointer-events-auto'
        }`}
      >
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-8 h-8 border-3 border-[#4941EC] border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-xs text-gray-500 font-medium">Mencari destinasi di sekitar Anda...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && destinations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
            <div className="w-12 h-12 bg-[#EEF0FF] rounded-2xl flex items-center justify-center mb-2.5 text-[#4941EC]">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-gray-900">
              Belum Ada Destinasi di Radius Ini
            </h4>
            <p className="text-[11px] text-gray-500 mt-1 max-w-[280px]">
              Coba perbesar radius pencarian (mis. 10km atau 25km) atau geser titik lokasi di Jawa Barat.
            </p>
          </div>
        )}

        {/* Destination Items List (scrollable) */}
        {!isLoading && destinations.length > 0 && (
          <>
            <div className="flex flex-col gap-2.5 max-h-[290px] overflow-y-auto no-scrollbar pr-0.5 mb-3 pt-1">
              {destinations.map((dest) => {
                const isSelected = activeSelected.includes(dest.id);

                return (
                  <div
                    key={dest.id}
                    onClick={() => onItemClick?.(dest)}
                    className="flex items-center gap-3 p-2 bg-white rounded-2xl border border-gray-100 hover:border-[#4941EC]/40 hover:shadow-xs shadow-2xs transition-all cursor-pointer group"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-[76px] h-[76px] rounded-xl overflow-hidden bg-gray-100 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={dest.image || '/gedung-sate.jpg'}
                        alt={dest.name}
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          (e.target as HTMLImageElement).src = '/gedung-sate.jpg';
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <span className="inline-block bg-[#EEF0FF] text-[#4941EC] text-[10px] font-semibold px-2 py-0.5 rounded-md w-fit">
                        {dest.category}
                      </span>

                      <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate mt-1">
                        {dest.name}
                      </h4>

                      <p className="text-[11px] text-gray-500 truncate mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#4941EC] shrink-0" />
                        <span>{dest.distance} &ndash; {dest.regency}</span>
                      </p>

                      <div className="flex items-center gap-1.5 mt-1 text-gray-600">
                        <Users className="w-3.5 h-3.5 text-[#4941EC] shrink-0" />
                        <span className="text-[11px] font-semibold text-gray-700">
                          {dest.visitorsCount !== undefined && dest.visitorsCount > 0
                            ? `${dest.visitorsCount.toLocaleString('id-ID')} pengunjung`
                            : 'Belum ada kunjungan'}
                        </span>
                      </div>
                    </div>

                    {/* Signpost Bookmark Action Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggle(dest.id);
                      }}
                      aria-label={`Pilih ${dest.name}`}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all active:scale-95 cursor-pointer ${
                        isSelected
                          ? 'bg-[#60CE9F] text-white shadow-xs'
                          : 'bg-[#D1FAE5] text-white/90 hover:bg-[#60CE9F]'
                      }`}
                    >
                      <SignpostIcon className="w-5 h-5 text-white" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Primary CTA: Simpan Destinasi */}
            <button
              type="button"
              disabled={activeSelected.length === 0}
              onClick={handleSave}
              className={`w-full py-3.5 bg-[#4941EC] hover:bg-[#3C35C7] text-white font-semibold text-sm rounded-xl shadow-[0_4px_12px_rgba(73,65,236,0.3)] active:scale-98 transition-all flex items-center justify-center ${
                activeSelected.length === 0
                  ? 'opacity-50 cursor-not-allowed shadow-none pointer-events-none'
                  : 'cursor-pointer'
              }`}
            >
              Simpan Destinasi Ke Rencana
            </button>
          </>
        )}
      </div>
    </div>
  );
}
