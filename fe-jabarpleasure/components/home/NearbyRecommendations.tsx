'use client';

import React, { useEffect, useState } from 'react';
import { Users, Navigation } from 'lucide-react';
import { getNearbyDestinations, ApiDestination } from '@/lib/api';
import { getCategoryMeta } from '@/lib/categoryMeta';

export interface NearbyItem {
  id: string | number;
  name: string;
  category: string;
  visitorsCount?: number;
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
  onViewAll?: () => void;
  onSortClick?: () => void;
  className?: string;
}

export default function NearbyRecommendations({
  items: initialItems,
  selectedCategory = 'Semua',
  userCoords,
  onItemClick,
  onViewAll,
  onSortClick,
  className = '',
}: NearbyRecommendationsProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [destinations, setDestinations] = useState<NearbyItem[]>(() => {
    if (initialItems && initialItems.length > 0) return initialItems.slice(0, 5);
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem('jp_cached_nearby');
        if (stored) return JSON.parse(stored).slice(0, 5);
      } catch {
        // ignore
      }
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (initialItems && initialItems.length > 0) return false;
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem('jp_cached_nearby');
    }
    return true;
  });

  useEffect(() => {
    if (initialItems && initialItems.length > 0) {
      return;
    }

    let isMounted = true;
    const limit = isExpanded ? 10 : 5;

    getNearbyDestinations({
      category: selectedCategory !== 'Semua' ? selectedCategory : undefined,
      lat: userCoords?.lat ?? -6.9175,
      lng: userCoords?.lng ?? 107.6191,
      radius: 25.0, // Radius tertinggi 25km
      limit,
    })
      .then((data: ApiDestination[]) => {
        if (!isMounted) return;

        if (data && data.length > 0) {
          const mapped: NearbyItem[] = data.slice(0, limit).map((dest, idx) => {
            const meta = getCategoryMeta(dest.category?.name, idx);
            const distStr = dest.distance_km ? `${dest.distance_km} km` : 'Dekat Anda';
            const locStr = dest.address || dest.regency?.name || 'Jawa Barat';

            return {
              id: dest.id,
              name: dest.name,
              category: dest.category?.name || 'Wisata',
              visitorsCount: dest.check_ins_count ?? 0,
              location: locStr,
              distance: distStr,
              image: dest.cover_image_url || meta.fallbackImage,
              slug: dest.slug,
            };
          });
          setDestinations(mapped);
          if (typeof window !== 'undefined') {
            try {
              sessionStorage.setItem('jp_cached_nearby', JSON.stringify(mapped));
            } catch {
              // ignore
            }
          }
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
  }, [initialItems, selectedCategory, userCoords?.lat, userCoords?.lng, isExpanded]);

  const handleToggleExpand = () => {
    if (onViewAll || onSortClick) {
      (onViewAll || onSortClick)?.();
    } else {
      setIsExpanded((prev) => !prev);
    }
  };

  return (
    <section className={`w-full px-5 py-3 ${className}`}>
      {/* Section Header */}
      <div className="flex items-start justify-between mb-3.5">
        <div>
          <h2 className="text-base font-bold text-gray-900 tracking-tight">
            Rekomendasi Terdekat
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {isExpanded
              ? 'Menampilkan 10 destinasi terdekat dalam radius 25 km'
              : '5 destinasi terdekat dalam radius 25 km dari Anda'}
          </p>
        </div>
        <button
          type="button"
          onClick={handleToggleExpand}
          className="shrink-0 bg-[#60CE9F] hover:bg-[#4EB789] text-white text-[11px] font-semibold px-2.5 py-1 rounded-md transition-colors active:scale-95 cursor-pointer shadow-xs"
        >
          {isExpanded ? 'Lebih Sedikit' : 'Lihat Semua'}
        </button>
      </div>

      {/* Loading Skeletons */}
      {isLoading ? (
        <div className="flex flex-col gap-3.5">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="flex items-center gap-3.5 p-2 bg-white rounded-2xl border border-gray-100 animate-pulse"
            >
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
        /* Vertical List of Destinations (5 or 10 items) */
        <div className="flex flex-col gap-3.5">
          {destinations.map((item, idx) => {
            const meta = getCategoryMeta(item.category, idx);
            const CategoryIcon = meta.icon;

            return (
              <div
                key={item.id}
                onClick={() => onItemClick?.(item)}
                className="group flex items-center gap-3.5 p-2 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 shadow-xs hover:shadow-sm transition-all cursor-pointer"
              >
                {/* Destination Thumbnail */}
                <div className="relative w-[92px] h-[92px] rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image || meta.fallbackImage}
                    alt={item.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = meta.fallbackImage;
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Details Column */}
                <div className="flex-1 flex flex-col justify-between self-stretch py-0.5 min-w-0">
                  {/* Category & Visitor Count */}
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 bg-[#EEF0FF] text-[#4941EC] text-[10px] font-semibold px-2 py-0.5 rounded-md truncate max-w-[130px]">
                      <CategoryIcon className="w-3 h-3 shrink-0" />
                      <span className="truncate">{item.category}</span>
                    </span>
                    <div className="flex items-center gap-1 shrink-0 text-gray-600">
                      <Users className="w-3 h-3 text-[#4941EC]" />
                      <span className="text-[11px] font-semibold text-gray-700">
                        {item.visitorsCount !== undefined && item.visitorsCount > 0
                          ? item.visitorsCount.toLocaleString('id-ID')
                          : '0'}
                      </span>
                    </div>
                  </div>

                  {/* Title & Location */}
                  <div className="mt-1">
                    <h3
                      className="text-sm font-bold text-gray-900 group-hover:text-[#4941EC] transition-colors truncate"
                      title={item.name}
                    >
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {item.location}
                    </p>
                  </div>

                  {/* Distance & Action */}
                  <div className="flex items-center justify-between mt-1 pt-0.5">
                    <span className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                      <Navigation className="w-3 h-3 text-[#60CE9F] fill-[#60CE9F] shrink-0 rotate-45" />
                      <span>{item.distance}</span>
                    </span>
                    <span className="text-xs font-bold text-[#60CE9F] group-hover:text-[#4EB789] transition-colors flex items-center gap-0.5">
                      Detail <span className="text-sm leading-none">&rsaquo;</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
