'use client';

import React, { useState } from 'react';
import { Star, ChevronDown } from 'lucide-react';

export interface NearbyDestination {
  id: string;
  name: string;
  category: string;
  distance: string;
  regency: string;
  rating: number;
  ratingCountText: string;
  image: string;
  coordinates: [number, number];
}

interface NearbyResultsSheetProps {
  destinations?: NearbyDestination[];
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
  onSaveDestinations?: (selectedDestinations: NearbyDestination[]) => void;
  defaultMinimized?: boolean;
  className?: string;
}

const DEFAULT_DESTINATIONS: NearbyDestination[] = [
  {
    id: 'krb-1',
    name: 'Kebun Raya Bogor',
    category: 'Alam',
    distance: '2.4 km',
    regency: 'Bogor Tengah, Kota Bogor',
    rating: 4.8,
    ratingCountText: '1rb+ rating',
    image: '/kebun-raya-bogor.jpg',
    coordinates: [-6.595, 106.7972],
  },
  {
    id: 'krb-2',
    name: 'Kebun Raya Bogor',
    category: 'Alam',
    distance: '2.4 km',
    regency: 'Bogor Tengah, Kota Bogor',
    rating: 4.8,
    ratingCountText: '1rb+ rating',
    image: '/kebun-raya-bogor.jpg',
    coordinates: [-6.5962, 106.7995],
  },
  {
    id: 'krb-3',
    name: 'Kebun Raya Bogor',
    category: 'Alam',
    distance: '2.4 km',
    regency: 'Bogor Tengah, Kota Bogor',
    rating: 4.8,
    ratingCountText: '1rb+ rating',
    image: '/kebun-raya-bogor.jpg',
    coordinates: [-6.6015, 106.8062],
  },
  {
    id: 'krb-4',
    name: 'Kebun Raya Bogor',
    category: 'Alam',
    distance: '2.4 km',
    regency: 'Bogor Tengah, Kota Bogor',
    rating: 4.8,
    ratingCountText: '1rb+ rating',
    image: '/kebun-raya-bogor.jpg',
    coordinates: [-6.5982, 106.8028],
  },
];

// Precision custom vector icon matching the green signpost in the mockup
function SignpostIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M11 2v3H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h7v9h2v-9h5.586a1 1 0 0 0 .707-.293l3.414-3.414a1 1 0 0 0 0-1.414l-3.414-3.414A1 1 0 0 0 18.586 5H13V2h-2z" />
    </svg>
  );
}

export default function NearbyResultsSheet({
  destinations = DEFAULT_DESTINATIONS,
  selectedIds = ['krb-1'],
  onToggleSelect,
  onSaveDestinations,
  defaultMinimized = false,
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
    onSaveDestinations?.(toSave.length > 0 ? toSave : [destinations[0]]);
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
            {destinations.length} ditemukan
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
        {/* Destination Items List (scrollable) */}
        <div className="flex flex-col gap-2.5 max-h-[290px] overflow-y-auto no-scrollbar pr-0.5 mb-3 pt-1">
          {destinations.map((dest) => {
            const isSelected = activeSelected.includes(dest.id);

            return (
              <div
                key={dest.id}
                className="flex items-center gap-3 p-2 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 shadow-2xs transition-all"
              >
                {/* Thumbnail */}
                <div className="relative w-[76px] h-[76px] rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-full object-cover"
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

                  <p className="text-[11px] text-gray-500 truncate mt-0.5">
                    {dest.distance} &ndash; {dest.regency}
                  </p>

                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 fill-[#EDAD40] text-[#EDAD40]" />
                    <span className="text-[11px] font-semibold text-gray-700">
                      {dest.rating}
                    </span>
                    <span className="text-[11px] text-gray-400">&ndash;</span>
                    <span className="text-[11px] text-gray-500">
                      {dest.ratingCountText}
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
          onClick={handleSave}
          className="w-full py-3.5 bg-[#4941EC] hover:bg-[#3C35C7] text-white font-semibold text-sm rounded-xl shadow-[0_4px_12px_rgba(73,65,236,0.3)] active:scale-98 transition-all cursor-pointer flex items-center justify-center"
        >
          Simpan Destinasi
        </button>
      </div>
    </div>
  );
}
