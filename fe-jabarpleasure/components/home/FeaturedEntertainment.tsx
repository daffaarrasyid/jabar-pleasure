'use client';

import React from 'react';
import { Star, Navigation } from 'lucide-react';

export interface FeaturedItem {
  id: string;
  name: string;
  category: string;
  rating: number;
  distance: string;
  regency: string;
  image: string;
}

interface FeaturedEntertainmentProps {
  items?: FeaturedItem[];
  onViewAll?: () => void;
  onItemClick?: (item: FeaturedItem) => void;
  className?: string;
}

const DEFAULT_FEATURED: FeaturedItem[] = [
  {
    id: 'tangkuban-1',
    name: 'Tangkuban Parahu',
    category: 'Alam',
    rating: 4.8,
    distance: '24.5 km',
    regency: 'Subang',
    image: '/tangkuban-parahu.jpg',
  },
  {
    id: 'tangkuban-2',
    name: 'Tangkuban Parahu',
    category: 'Alam',
    rating: 4.8,
    distance: '24.5 km',
    regency: 'Subang',
    image: '/tangkuban-parahu.jpg',
  },
];

export default function FeaturedEntertainment({
  items = DEFAULT_FEATURED,
  onViewAll,
  onItemClick,
  className = '',
}: FeaturedEntertainmentProps) {
  return (
    <section className={`w-full px-5 py-3 ${className}`}>
      {/* Section Header */}
      <div className="flex items-start justify-between mb-3.5">
        <div>
          <h2 className="text-base font-bold text-gray-900 tracking-tight">
            Tempat Hiburan untuk Anda
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Kurasi destinasi berbasis pola penjelajahan
          </p>
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className="shrink-0 bg-[#60CE9F] hover:bg-[#4EB789] text-white text-[11px] font-semibold px-2.5 py-1 rounded-md transition-colors active:scale-95 cursor-pointer shadow-xs"
        >
          Lihat Semua
        </button>
      </div>

      {/* 2-Card Row Grid matching mockup */}
      <div className="grid grid-cols-2 gap-3 min-w-0">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onItemClick?.(item)}
            className="min-w-0 group flex flex-col bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
          >
            {/* Card Image */}
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Badges & Meta Row */}
            <div className="pt-2.5 pb-1 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="bg-[#4941EC] text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-md">
                  {item.category}
                </span>
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-[#EDAD40] text-[#EDAD40]" />
                  <span className="text-xs font-bold text-gray-800">
                    {item.rating}
                  </span>
                </div>
              </div>

              {/* Destination Title */}
              <h3 className="text-sm font-bold text-gray-900 truncate mt-0.5 group-hover:text-[#4941EC] transition-colors">
                {item.name}
              </h3>

              {/* Distance & Location */}
              <div className="flex items-center gap-1.5 text-xs text-gray-500 truncate">
                <Navigation className="w-3 h-3 text-[#60CE9F] fill-[#60CE9F] shrink-0 rotate-45" />
                <span className="truncate">{item.distance} - {item.regency}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
