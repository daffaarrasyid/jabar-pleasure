'use client';

import React, { useEffect, useState } from 'react';
import { Star, AlignJustify } from 'lucide-react';
import { getNearbyDestinations, ApiDestination } from '@/lib/api';

export interface NearbyItem {
  id: string | number;
  name: string;
  category: string;
  rating: number;
  location: string;
  distance: string;
  image: string;
  slug?: string;
}

interface NearbyRecommendationsProps {
  items?: NearbyItem[];
  selectedCategory?: string;
  userCoords?: { lat: number; lng: number } | null;
  onItemClick?: (item: NearbyItem) => void;
  onSortClick?: () => void;
  className?: string;
}

const FALLBACK_NEARBY_IMAGES = [
  '/tahura-juanda.jpg',
  '/ranca-upas.jpg',
  '/tebing-keraton.jpg',
  '/floating-market.jpg',
  '/dusun-bambu.jpg',
  '/tangkuban-parahu.jpg',
];

export default function NearbyRecommendations({
  items: initialItems,
  selectedCategory = 'Semua',
  userCoords,
  onItemClick,
  onSortClick,
  className = '',
}: NearbyRecommendationsProps) {
  const [destinations, setDestinations] = useState<NearbyItem[]>(initialItems || []);
  const [isLoading, setIsLoading] = useState<boolean>(!initialItems);

  useEffect(() => {
    if (initialItems && initialItems.length > 0) {
      setDestinations(initialItems);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    getNearbyDestinations({
      category: selectedCategory !== 'Semua' ? selectedCategory : undefined,
      lat: userCoords?.lat ?? -6.9175,
      lng: userCoords?.lng ?? 107.6191,
      radius: 25.0, // Friendly radius covering surrounding POIs
      limit: 6,
    })
      .then((data: ApiDestination[]) => {
        if (!isMounted) return;

        if (data && data.length > 0) {
          const mapped: NearbyItem[] = data.map((dest, idx) => {
            const fallbackImg = FALLBACK_NEARBY_IMAGES[idx % FALLBACK_NEARBY_IMAGES.length];
            const distStr = dest.distance_km ? `${dest.distance_km} km` : 'Dekat Anda';
            const locStr = dest.address || dest.regency?.name || 'Jawa Barat';

            return {
              id: dest.id,
              name: dest.name,
              category: dest.category?.name || 'Wisata',
              rating: 4.8,
              location: locStr,
              distance: distStr,
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
        console.warn('Failed to load nearby recommendations:', err);
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

      {/* Loading Skeletons */}
      {isLoading ? (
        <div className="flex flex-col gap-3.5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex items-center gap-3.5 p-2 bg-white rounded-2xl border border-gray-100 animate-pulse">
              <div className="w-[92px] h-[92px] rounded-xl bg-gray-200 shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : destinations.length === 0 ? (
        <div className="bg-white rounded-2xl p-6 text-center border border-gray-100">
          <p className="text-xs text-gray-500">
            Belum ada destinasi terdekat yang ditemukan untuk kategori ini.
          </p>
        </div>
      ) : (
        /* Vertical List of Destinations */
        <div className="flex flex-col gap-3.5">
          {destinations.map((item) => (
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
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/tahura-juanda.jpg';
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Details Column */}
              <div className="flex-1 flex flex-col justify-between self-stretch py-0.5 min-w-0">
                {/* Category & Rating */}
                <div className="flex items-center justify-between">
                  <span className="bg-[#EEF0FF] text-[#4941EC] text-[10px] font-semibold px-2 py-0.5 rounded-md truncate max-w-[130px]">
                    {item.category}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <Star className="w-3.5 h-3.5 fill-[#EDAD40] text-[#EDAD40]" />
                    <span className="text-xs font-bold text-gray-800">
                      {item.rating}
                    </span>
                  </div>
                </div>

                {/* Title & Location */}
                <div className="mt-1">
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#4941EC] transition-colors truncate" title={item.name}>
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
      )}
    </section>
  );
}
