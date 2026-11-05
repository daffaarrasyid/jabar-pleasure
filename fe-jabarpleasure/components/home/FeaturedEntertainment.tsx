'use client';

import React, { useEffect, useState } from 'react';
import { Star, Navigation } from 'lucide-react';
import { getFeaturedDestinations, ApiDestination } from '@/lib/api';

export interface FeaturedItem {
  id: string | number;
  name: string;
  category: string;
  rating: number;
  distance: string;
  regency: string;
  image: string;
  slug?: string;
}

interface FeaturedEntertainmentProps {
  items?: FeaturedItem[];
  selectedCategory?: string;
  userCoords?: { lat: number; lng: number } | null;
  onViewAll?: () => void;
  onItemClick?: (item: FeaturedItem) => void;
  className?: string;
}

const FALLBACK_IMAGES = [
  '/tangkuban-parahu.jpg',
  '/gunung-malabar.jpg',
  '/floating-market.jpg',
  '/gedung-sate.jpg',
  '/tahura-juanda.jpg',
  '/ranca-upas.jpg',
];

export default function FeaturedEntertainment({
  items: initialItems,
  selectedCategory = 'Semua',
  userCoords,
  onViewAll,
  onItemClick,
  className = '',
}: FeaturedEntertainmentProps) {
  const [destinations, setDestinations] = useState<FeaturedItem[]>(
    initialItems ? initialItems.slice(0, 5) : []
  );
  const [isLoading, setIsLoading] = useState<boolean>(!initialItems);

  useEffect(() => {
    if (initialItems && initialItems.length > 0) {
      return;
    }

    let isMounted = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);

    getFeaturedDestinations({
      category: selectedCategory !== 'Semua' ? selectedCategory : undefined,
      lat: userCoords?.lat ?? -6.9175,
      lng: userCoords?.lng ?? 107.6191,
      limit: 5,
    })
      .then((data: ApiDestination[]) => {
        if (!isMounted) return;

        if (data && data.length > 0) {
          const mapped: FeaturedItem[] = data.slice(0, 5).map((dest, idx) => {
            const fallbackImg = FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length];
            const distanceStr = dest.distance_km ? `${dest.distance_km} km` : 'Terdekat';

            return {
              id: dest.id,
              name: dest.name,
              category: dest.category?.name || 'Wisata',
              rating: 4.8,
              distance: distanceStr,
              regency: dest.regency?.name || 'Jawa Barat',
              image: dest.cover_image_url || fallbackImg,
              slug: dest.slug,
            };
          });
          setDestinations(mapped);
        } else {
          setDestinations([]);
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch featured destinations:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [initialItems, selectedCategory, userCoords?.lat, userCoords?.lng]);

  return (
    <section className={`w-full px-5 py-3 ${className}`}>
      {/* Section Header */}
      <div className="flex items-start justify-between mb-3.5">
        <div>
          <h2 className="text-base font-bold text-gray-900 tracking-tight">
            Tempat Hiburan untuk Anda
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Kurasi 5 destinasi terbaik berbasis minat
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

      {/* Loading Skeleton - Horizontal Scroll */}
      {isLoading ? (
        <div className="flex gap-3.5 overflow-x-auto no-scrollbar pb-2">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="w-[195px] shrink-0 flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse"
            >
              <div className="w-full h-[120px] bg-gray-200" />
              <div className="p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                </div>
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : destinations.length === 0 ? (
        <div className="bg-white rounded-2xl p-6 text-center border border-gray-100">
          <p className="text-xs text-gray-500">
            Belum ada destinasi untuk kategori ini.
          </p>
        </div>
      ) : (
        /* Horizontal Scroll Carousel - limited to 5 items */
        <div className="flex gap-3.5 overflow-x-auto no-scrollbar pb-2 pt-0.5">
          {destinations.slice(0, 5).map((item) => (
            <div
              key={item.id}
              onClick={() => onItemClick?.(item)}
              className="w-[195px] shrink-0 snap-start group flex flex-col bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-0.5 border border-gray-100/90 shadow-xs hover:shadow-md"
            >
              {/* Card Image */}
              <div className="relative w-full h-[120px] bg-gray-100 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/tangkuban-parahu.jpg';
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Card Meta & Content */}
              <div className="p-3 flex flex-col gap-1.5 flex-1">
                <div className="flex items-center justify-between">
                  <span className="bg-[#4941EC] text-white text-[10px] font-semibold px-2 py-0.5 rounded-md truncate max-w-[100px]">
                    {item.category}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <Star className="w-3.5 h-3.5 fill-[#EDAD40] text-[#EDAD40]" />
                    <span className="text-xs font-bold text-gray-800">
                      {item.rating}
                    </span>
                  </div>
                </div>

                {/* Destination Title */}
                <h3
                  className="text-xs sm:text-sm font-bold text-gray-900 truncate mt-0.5 group-hover:text-[#4941EC] transition-colors"
                  title={item.name}
                >
                  {item.name}
                </h3>

                {/* Distance & Location */}
                <div className="flex items-center gap-1.5 text-xs text-gray-500 truncate mt-auto pt-0.5">
                  <Navigation className="w-3 h-3 text-[#60CE9F] fill-[#60CE9F] shrink-0 rotate-45" />
                  <span className="truncate">{item.distance} • {item.regency}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
