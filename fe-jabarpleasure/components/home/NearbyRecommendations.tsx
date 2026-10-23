'use client';

import React from 'react';
import { Star, AlignJustify } from 'lucide-react';

export interface NearbyItem {
  id: string;
  name: string;
  category: string;
  rating: number;
  location: string;
  distance: string;
  image: string;
}

interface NearbyRecommendationsProps {
  items?: NearbyItem[];
  onItemClick?: (item: NearbyItem) => void;
  onSortClick?: () => void;
  className?: string;
}

const DEFAULT_NEARBY: NearbyItem[] = [
  {
    id: 'tahura-1',
    name: 'Taman Hutan Raya Juanda',
    category: 'Alam',
    rating: 4.8,
    location: 'Dago Pakar, Ciburial',
    distance: '5.4 km',
    image: '/tahura-juanda.jpg',
  },
  {
    id: 'tahura-2',
    name: 'Taman Hutan Raya Juanda',
    category: 'Alam',
    rating: 4.8,
    location: 'Dago Pakar, Ciburial',
    distance: '5.4 km',
    image: '/tahura-juanda.jpg',
  },
  {
    id: 'tahura-3',
    name: 'Taman Hutan Raya Juanda',
    category: 'Alam',
    rating: 4.8,
    location: 'Dago Pakar, Ciburial',
    distance: '5.4 km',
    image: '/tahura-juanda.jpg',
  },
  {
    id: 'tahura-4',
    name: 'Taman Hutan Raya Juanda',
    category: 'Alam',
    rating: 4.8,
    location: 'Dago Pakar, Ciburial',
    distance: '5.4 km',
    image: '/tahura-juanda.jpg',
  },
];

export default function NearbyRecommendations({
  items = DEFAULT_NEARBY,
  onItemClick,
  onSortClick,
  className = '',
}: NearbyRecommendationsProps) {
  return (
    <section className={`w-full px-5 py-3 ${className}`}>
      {/* Section Header */}
      <div className="flex items-start justify-between mb-3.5">
        <div>
          <h2 className="text-base font-bold text-gray-900 tracking-tight">
            Rekomendasi Terdekat
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Pilihan populer terverifikasi disekeliling Anda
          </p>
        </div>
        <button
          type="button"
          onClick={onSortClick}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#60CE9F] hover:text-[#4EB789] transition-colors cursor-pointer py-1"
        >
          <AlignJustify className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Jarak</span>
        </button>
      </div>

      {/* Vertical List of Destinations */}
      <div className="flex flex-col gap-3.5">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onItemClick?.(item)}
            className="group flex items-center gap-3.5 p-2 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 shadow-xs hover:shadow-sm transition-all cursor-pointer"
          >
            {/* Destination Thumbnail */}
            <div className="relative w-[92px] h-[92px] rounded-xl overflow-hidden bg-gray-100 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Details Column */}
            <div className="flex-1 flex flex-col justify-between self-stretch py-0.5">
              {/* Category & Rating */}
              <div className="flex items-center justify-between">
                <span className="bg-[#EEF0FF] text-[#4941EC] text-[10px] font-semibold px-2.5 py-0.5 rounded-md">
                  {item.category}
                </span>
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-[#EDAD40] text-[#EDAD40]" />
                  <span className="text-xs font-bold text-gray-800">
                    {item.rating}
                  </span>
                </div>
              </div>

              {/* Title & Location */}
              <div className="mt-1">
                <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#4941EC] transition-colors truncate">
                  {item.name}
                </h3>
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {item.location}
                </p>
              </div>

              {/* Distance & Action */}
              <div className="flex items-center justify-between mt-1 pt-0.5">
                <span className="text-xs font-semibold text-gray-700">
                  {item.distance}
                </span>
                <span className="text-xs font-bold text-[#60CE9F] group-hover:text-[#4EB789] transition-colors flex items-center gap-0.5">
                  Detail <span className="text-sm leading-none">&rsaquo;</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
