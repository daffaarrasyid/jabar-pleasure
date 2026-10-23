'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import AppHeader from '@/components/layout/AppHeader';
import BottomNav, { NavTabId } from '@/components/layout/BottomNav';
import SearchBar from '@/components/home/SearchBar';
import MapExplorationFilter from '@/components/map/MapExplorationFilter';
import NearbyResultsSheet, { NearbyDestination } from '@/components/map/NearbyResultsSheet';

// Dynamic import with SSR disabled for Leaflet WebGIS Map
const WebGisMap = dynamic(() => import('@/components/map/WebGisMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-gray-100">
      <p className="animate-pulse text-sm font-semibold text-gray-600">
        Memuat Peta Spasial Jawa Barat...
      </p>
    </div>
  ),
});

interface MapScreenProps {
  onNavigateToHome?: () => void;
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
  onSaveToWishlist?: (count: number) => void;
  favoritBadgeCount?: number;
  className?: string;
}

export default function MapScreen({
  onNavigateToHome,
  onNotificationClick,
  onProfileClick,
  onSaveToWishlist,
  favoritBadgeCount = 0,
  className = '',
}: MapScreenProps) {
  // State 1: Search Query (Empty on landing Peta.png, 'Kota Bogor' on results)
  const [searchQuery, setSearchQuery] = useState('');

  // State 2: Filter Card Visibility (Open on initial landing Peta.png & Peta (2).png)
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  // State 3: Filter Categories & Radius
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [radius, setRadius] = useState<number>(1);

  // State 4: Has performed search / Showing Results Bottom Sheet
  const [showResults, setShowResults] = useState(false);

  // State 5: Selected Destinations for saving
  const [selectedDestIds, setSelectedDestIds] = useState<string[]>(['krb-1']);

  // State 6: Local Wishlist Badge Count (falls back to prop or internal state)
  const [localFavoritCount, setLocalFavoritCount] = useState<number>(favoritBadgeCount);

  // Handle category toggle
  const handleToggleCategory = (category: string) => {
    setSelectedCategories((prev) => {
      const updated = prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category];

      // If user starts selecting categories, automatically perform search for Bogor
      if (updated.length > 0 && !showResults) {
        setSearchQuery('Kota Bogor');
        setShowResults(true);
      }
      return updated;
    });
  };

  // Handle Search Submission (by Enter or typing)
  const handleSearchSubmit = () => {
    if (searchQuery.trim().length > 0) {
      setShowResults(true);
      if (selectedCategories.length === 0) {
        setSelectedCategories(['Alam', 'Kuliner', 'Sejarah']);
      }
    }
  };

  // Trigger search when typing or selecting quick filter
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query.toLowerCase().includes('bogor') || query.trim().length >= 3) {
      setShowResults(true);
      if (selectedCategories.length === 0) {
        setSelectedCategories(['Alam', 'Kuliner', 'Sejarah']);
      }
    } else if (query.trim().length === 0) {
      setShowResults(false);
    }
  };

  // Handle Reset Filter
  const handleResetFilter = () => {
    setSelectedCategories([]);
    setRadius(1);
    setSearchQuery('');
    setShowResults(false);
  };

  // Handle Toggle Selection in Bottom Sheet
  const handleToggleDestination = (id: string) => {
    setSelectedDestIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Flow Step: "Simpan Destinasi" -> Increment badge, close sheet, transition back to landing Peta.png
  const handleSaveDestinations = (savedItems: NearbyDestination[]) => {
    const newCount = (localFavoritCount || 0) + (savedItems.length > 0 ? 1 : 1);
    setLocalFavoritCount(newCount);
    onSaveToWishlist?.(newCount);

    // Return back to landing Peta.png view as specified
    setShowResults(false);
    setIsFilterOpen(true); // Return to Peta.png landing filter state
  };

  // Handle BottomNav Tab Switching
  const handleTabChange = (tab: NavTabId) => {
    if (tab === 'beranda') {
      onNavigateToHome?.();
    }
  };

  // Active filter count for badge on filter button
  const activeFiltersCount =
    (selectedCategories.length > 0 ? 1 : 0) + (radius > 1 ? 1 : 0) || (showResults ? 2 : 0);

  return (
    <div
      className={`relative w-full h-full flex flex-col bg-[#F9FAFB] overflow-hidden ${className}`}
    >
      {/* 1. Top Header with Brand Logo, Bell Badge, and Profile Avatar */}
      <AppHeader
        unreadNotifications={2}
        avatarSrc="/user-avatar.jpg"
        onNotificationClick={onNotificationClick}
        onProfileClick={onProfileClick}
        className="shrink-0"
      />

      {/* 2. Floating Search Bar & Filter Button Overlay */}
      <div className="absolute top-[68px] left-0 right-0 z-20">
        <SearchBar
          value={searchQuery}
          onChange={handleSearchChange}
          onClear={() => {
            setSearchQuery('');
            setShowResults(false);
          }}
          onSubmit={handleSearchSubmit}
          onFilterClick={() => setIsFilterOpen((prev) => !prev)}
          filterBadgeCount={showResults ? activeFiltersCount : 0}
          placeholder="Cari destinasi, kuliner, hiburan"
        />

        {/* 3. Floating Filter Eksplorasi Card (toggled or landing) */}
        {isFilterOpen && (
          <div className="px-5 mt-1">
            <MapExplorationFilter
              selectedCategories={selectedCategories}
              onToggleCategory={handleToggleCategory}
              radius={radius}
              onChangeRadius={(r) => {
                setRadius(r);
                if (!showResults) {
                  setSearchQuery('Kota Bogor');
                  setShowResults(true);
                }
              }}
              onReset={handleResetFilter}
            />
          </div>
        )}
      </div>

      {/* 4. Fullscreen / Interactive Leaflet WebGIS Map Background */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        <WebGisMap
          center={[-6.5982, 106.8028]}
          zoom={16}
          showRouteAndMarkers={showResults}
        />
      </main>

      {/* 5. Floating Bottom Sheet: Hasil Sekitar (when results are active) */}
      {showResults && (
        <div className="absolute bottom-16 left-0 right-0 z-20 max-w-[480px] mx-auto">
          <NearbyResultsSheet
            selectedIds={selectedDestIds}
            onToggleSelect={handleToggleDestination}
            onSaveDestinations={handleSaveDestinations}
          />
        </div>
      )}

      {/* 6. Fixed Bottom Navigation Bar with Favorit badge indicator */}
      <div className="shrink-0 w-full z-30">
        <BottomNav
          activeTab="peta"
          onTabChange={handleTabChange}
          badges={{
            favorit: localFavoritCount,
          }}
        />
      </div>
    </div>
  );
}
