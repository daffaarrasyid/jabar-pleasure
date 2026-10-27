'use client';

import React, { useState } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import BottomNav, { NavTabId } from '@/components/layout/BottomNav';
import SearchBar from '@/components/home/SearchBar';
import CategoryFilter from '@/components/home/CategoryFilter';
import FeaturedEntertainment from '@/components/home/FeaturedEntertainment';
import SpatialRadarCard from '@/components/home/SpatialRadarCard';
import NearbyRecommendations, { NearbyItem } from '@/components/home/NearbyRecommendations';
import TopDestinationsView from '@/components/home/TopDestinationsView';

interface HomeScreenProps {
  onNavigateToMap?: () => void;
  onNotificationClick?: () => void;
  onWishlistClick?: () => void;
  onProfileClick?: () => void;
  onNavigateToRiwayat?: () => void;
  onItemClick?: (item: { id: string; name: string }) => void;
  favoritBadgeCount?: number;
  initialViewMode?: 'overview' | 'top-destinations';
  className?: string;
}

export default function HomeScreen({
  onNavigateToMap,
  onNotificationClick,
  onWishlistClick,
  onProfileClick,
  onNavigateToRiwayat,
  onItemClick,
  favoritBadgeCount = 0,
  initialViewMode = 'overview',
  className = '',
}: HomeScreenProps) {
  const [viewMode, setViewMode] = useState<'overview' | 'top-destinations'>(initialViewMode);
  const [activeTab, setActiveTab] = useState<NavTabId>('beranda');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  const handleTabChange = (tab: NavTabId) => {
    setActiveTab(tab);
    if (tab === 'peta') {
      onNavigateToMap?.();
    } else if (tab === 'profil') {
      onProfileClick?.();
    } else if (tab === 'riwayat') {
      onNavigateToRiwayat?.();
    }
  };

  if (viewMode === 'top-destinations') {
    return (
      <TopDestinationsView
        onBack={() => setViewMode('overview')}
        onNavigateToMap={onNavigateToMap}
        onNotificationClick={onNotificationClick}
        onWishlistClick={onWishlistClick || onProfileClick}
        onProfileClick={onProfileClick}
        onNavigateToRiwayat={onNavigateToRiwayat}
        onItemClick={onItemClick}
        favoritBadgeCount={favoritBadgeCount}
        className={className}
      />
    );
  }

  return (
    <div
      className={`relative w-full h-full flex flex-col bg-[#F9FAFB] overflow-hidden ${className}`}
    >
      {/* Top Header with Brand Logo, Notifications, and Wishlist Button */}
      <AppHeader
        unreadNotifications={2}
        wishlistCount={favoritBadgeCount}
        onNotificationClick={onNotificationClick}
        onWishlistClick={onWishlistClick || onProfileClick}
      />

      {/* Main Scrollable Content */}
      <main className="flex-1 w-full overflow-y-auto overflow-x-hidden no-scrollbar pb-24">
        {/* Search Bar & Filter Button */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={() => setSearchQuery('')}
          onFilterClick={() => {}}
        />

        {/* Categories Horizontal Carousel */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Featured Section: Tempat Hiburan untuk Anda */}
        <FeaturedEntertainment
          onViewAll={() => setViewMode('top-destinations')}
          onItemClick={(item) => onItemClick?.(item)}
        />

        {/* Spatial Radar Card: Jawa Barat */}
        <SpatialRadarCard
          latitude="-6.9175"
          longitude="107.6191"
        />

        {/* Rekomendasi Terdekat Section */}
        <NearbyRecommendations
          onItemClick={(item: NearbyItem) => onItemClick?.(item)}
        />
      </main>

      {/* Fixed Bottom Navigation Bar */}
      <div className="absolute bottom-0 left-0 right-0 w-full z-30">
        <BottomNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </div>
    </div>
  );
}
