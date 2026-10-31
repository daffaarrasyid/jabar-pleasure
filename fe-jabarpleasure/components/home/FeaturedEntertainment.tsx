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
  const [destinations, setDestinations] = useState<FeaturedItem[]>(initialItems || []);
  const [isLoading, setIsLoading] = useState<boolean>(!initialItems);

  useEffect(() => {
    if (initialItems && initialItems.length > 0) {
      setDestinations(initialItems);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    getFeaturedDestinations({
      category: selectedCategory !== 'Semua' ? selectedCategory : undefined,
      lat: userCoords?.lat ?? -6.9175,
      lng: userCoords?.lng ?? 107.6191,
      limit: 4,
    })
      .then((data: ApiDestination[]) => {
        if (!isMounted) return;

        if (data && data.length > 0) {
          const mapped: FeaturedItem[] = data.map((dest, idx) => {
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

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 min-w-0">
          {[1, 2].map((n) => (
            <div key={n} className="flex flex-col bg-white rounded-2xl overflow-hidden animate-pulse">
              <div className="w-full aspect-[4/3] bg-gray-200" />
              <div className="p-2.5 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
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
        /* 2-Card Row Grid matching mockup */
        <div className="grid grid-cols-2 gap-3 min-w-0">
          {destinations.map((item) => (
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
                  onError={(e) => {
                    // Fallback if image fails to load
                    (e.target as HTMLImageElement).src = '/tangkuban-parahu.jpg';
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Badges & Meta Row */}
              <div className="pt-2.5 pb-1 flex flex-col gap-1">
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
                <h3 className="text-sm font-bold text-gray-900 truncate mt-0.5 group-hover:text-[#4941EC] transition-colors" title={item.name}>
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
      )}
    </section>
  );
}
