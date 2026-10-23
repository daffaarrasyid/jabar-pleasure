'use client';

import React, { useState, useMemo } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import BottomNav, { NavTabId } from '@/components/layout/BottomNav';
import SearchBar from '@/components/home/SearchBar';
import CategoryFilter from '@/components/home/CategoryFilter';
import { Star, ArrowLeft } from 'lucide-react';

export interface TopDestinationItem {
  id: string;
  name: string;
  category: string;
  rating: number;
  distance: string;
  regency: string;
  image: string;
}

interface TopDestinationsViewProps {
  onBack?: () => void;
  onNavigateToMap?: () => void;
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
  onItemClick?: (item: TopDestinationItem) => void;
  favoritBadgeCount?: number;
  initialQuery?: string;
  className?: string;
}

const DEFAULT_DESTINATIONS: TopDestinationItem[] = [
  {
    id: 'malabar-1',
    name: 'Gunung Malabar',
    category: 'Alam',
    rating: 4.8,
    distance: '4.5 km',
    regency: 'Bandung Timur',
    image: '/gunung-malabar.jpg',
  },
  {
    id: 'malabar-2',
    name: 'Gunung Malabar',
    category: 'Alam',
    rating: 4.8,
    distance: '4.5 km',
    regency: 'Bandung Timur',
    image: '/gunung-malabar.jpg',
  },
  {
    id: 'malabar-3',
    name: 'Gunung Malabar',
    category: 'Alam',
    rating: 4.8,
    distance: '4.5 km',
    regency: 'Bandung Timur',
    image: '/gunung-malabar.jpg',
  },
  {
    id: 'malabar-4',
    name: 'Gunung Malabar',
    category: 'Alam',
    rating: 4.8,
    distance: '4.5 km',
    regency: 'Bandung Timur',
    image: '/gunung-malabar.jpg',
  },
];

export default function TopDestinationsView({
  onBack,
  onNavigateToMap,
  onNotificationClick,
  onProfileClick,
  onItemClick,
  favoritBadgeCount = 0,
  initialQuery = 'Gunung disekitar bandung',
  className = '',
}: TopDestinationsViewProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  const filteredItems = useMemo(() => {
    return DEFAULT_DESTINATIONS.filter((item) => {
      const matchCategory =
        selectedCategory === 'Semua' || item.category === selectedCategory;
      const matchQuery =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.regency.toLowerCase().includes(searchQuery.toLowerCase()) ||
        searchQuery.toLowerCase().includes('gunung') ||
        searchQuery.toLowerCase().includes('bandung');
      return matchCategory && matchQuery;
    });
  }, [searchQuery, selectedCategory]);

  const handleTabChange = (tab: NavTabId) => {
    if (tab === 'peta') {
      onNavigateToMap?.();
    } else if (tab === 'beranda') {
      onBack?.();
    }
  };

  return (
    <div
      className={`relative w-full h-full flex flex-col bg-[#F9FAFB] overflow-hidden ${className}`}
    >
      {/* 1. App Header */}
      <AppHeader
        unreadNotifications={2}
        avatarSrc="/user-avatar.jpg"
        onNotificationClick={onNotificationClick}
        onProfileClick={onProfileClick}
        className="shrink-0"
      />

      {/* 2. Main Scrollable Content */}
      <main className="flex-1 w-full overflow-y-auto overflow-x-hidden no-scrollbar pb-24">
        {/* Search Bar with Query */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={() => setSearchQuery('')}
          onFilterClick={() => {}}
          placeholder="Cari destinasi, kuliner, hiburan"
        />

        {/* Category Pills Filter */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Section Heading: Top Destinasi with subtle back action */}
        <div className="flex items-center justify-between px-5 pt-3 pb-2 select-none">
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                aria-label="Kembali ke Beranda"
                className="p-1 -ml-1 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.4]" />
              </button>
            )}
            <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
              Top Destinasi
            </h2>
          </div>
          <span className="text-xs text-gray-400 font-medium">
            {filteredItems.length} destinasi
          </span>
        </div>

        {/* Vertical List of Cards */}
        <div className="flex flex-col gap-4 px-5 pt-1 pb-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onItemClick?.(item)}
              className="group bg-white rounded-3xl p-3 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md transition-all cursor-pointer flex flex-col"
            >
              {/* Full Width Image Container */}
              <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                />
              </div>

              {/* Card Meta & Details */}
              <div className="px-1 pt-2.5 pb-0.5 flex flex-col">
                {/* Badge & Rating Row */}
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
                <h3 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-[#4941EC] transition-colors mt-1.5">
                  {item.name}
                </h3>

                {/* Distance & Action Row */}
                <div className="flex items-center justify-between mt-1 text-xs">
                  <span className="text-gray-500 font-medium">
                    {item.distance} &ndash; {item.regency}
                  </span>
                  <span className="font-bold text-[#60CE9F] group-hover:text-[#4EB789] transition-colors flex items-center gap-0.5">
                    Detail <span className="text-sm leading-none">&rsaquo;</span>
                  </span>
                </div>
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="py-12 text-center text-gray-400 text-sm">
              Tidak ada destinasi yang cocok dengan pencarian.
            </div>
          )}
        </div>
      </main>

      {/* 3. Fixed Bottom Navigation Bar */}
      <div className="shrink-0 w-full z-30">
        <BottomNav
          activeTab="beranda"
          onTabChange={handleTabChange}
          badges={{
            favorit: favoritBadgeCount,
          }}
        />
      </div>
    </div>
  );
}
