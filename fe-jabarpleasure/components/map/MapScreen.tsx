'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, AlertTriangle, Search, X, Compass, Locate, ChevronRight, Check } from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import BottomNav, { NavTabId } from '@/components/layout/BottomNav';
import SearchBar from '@/components/home/SearchBar';
import MapExplorationFilter from '@/components/map/MapExplorationFilter';
import NearbyResultsSheet, { NearbyDestination } from '@/components/map/NearbyResultsSheet';
import { MarkerData } from '@/components/map/WebGisMap';
import { getNearbyDestinations, searchDestinations, ApiDestination, createItinerary, ApiItinerary } from '@/lib/api';
import { fetchRoadRoute } from '@/lib/routing';

// Dynamic import with SSR disabled for Leaflet WebGIS Map
const WebGisMap = dynamic(() => import('@/components/map/WebGisMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-3 border-[#4941EC] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-gray-600">Memuat Peta Jawa Barat...</p>
      </div>
    </div>
  ),
});

// Bounding box geografis Jawa Barat (SRID 4326)
export const JABAR_BOUNDS = {
  south: -7.82,
  north: -5.91,
  west: 106.36,
  east: 108.85,
};

// Preset kota populer di Jawa Barat untuk fallback manual
const JABAR_PRESET_CITIES = [
  { name: 'Kota Bandung', lat: -6.9175, lng: 107.6191 },
  { name: 'Kota Bogor', lat: -6.5950, lng: 106.7972 },
  { name: 'Lembang', lat: -6.8166, lng: 107.6166 },
  { name: 'Kota Cirebon', lat: -6.7320, lng: 108.5523 },
  { name: 'Sukabumi', lat: -6.9277, lng: 106.9300 },
  { name: 'Kota Bekasi', lat: -6.2383, lng: 106.9756 },
  { name: 'Garut', lat: -7.2278, lng: 107.9087 },
  { name: 'Depok', lat: -6.4025, lng: 106.7942 },
];

const DEFAULT_CENTER: [number, number] = [-6.9175, 107.6191]; // Default Kota Bandung

interface MapScreenProps {
  onNavigateToHome?: () => void;
  onNotificationClick?: () => void;
  onWishlistClick?: () => void;
  onProfileClick?: () => void;
  onNavigateToRencana?: (
    createdItinerary?: any,
    selectedDestinations?: NearbyDestination[],
    userDeparture?: { name: string; address: string; lat: number; lng: number }
  ) => void;
  onNavigateToRiwayat?: () => void;
  onSaveToWishlist?: (count: number) => void;
  favoritBadgeCount?: number;
  className?: string;
}

export default function MapScreen({
  onNavigateToHome,
  onNotificationClick,
  onWishlistClick,
  onProfileClick,
  onNavigateToRencana,
  onNavigateToRiwayat,
  onSaveToWishlist,
  favoritBadgeCount = 0,
  className = '',
}: MapScreenProps) {
  // 1. Geolocation & User Coordinates State
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationMode, setLocationMode] = useState<'gps' | 'manual'>('gps');
  const [activeLocationName, setActiveLocationName] = useState<string>('Kota Bandung');
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [zoomLevel, setZoomLevel] = useState<number>(13);
  const [isOutsideJabar, setIsOutsideJabar] = useState<boolean>(false);
  const [isGpsDenied, setIsGpsDenied] = useState<boolean>(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [manualAddressInput, setManualAddressInput] = useState<string>('');
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const [locationAlertDismissed, setLocationAlertDismissed] = useState<boolean>(false);

  // 2. Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [radius, setRadius] = useState<number>(10); // default 10 km

  // 3. Destinations Data State
  const [destinations, setDestinations] = useState<NearbyDestination[]>([]);
  const [, setRawDestinations] = useState<ApiDestination[]>([]);
  const [selectedDestIds, setSelectedDestIds] = useState<string[]>([]);
  const [activeDestinationId, setActiveDestinationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [localFavoritCount, setLocalFavoritCount] = useState<number>(favoritBadgeCount);

  // 4. Spatial Road Routing State (OSRM Turn-by-Turn Geometry)
  const [roadRouteCoords, setRoadRouteCoords] = useState<[number, number][] | undefined>(undefined);
  const [roadGeoJson, setRoadGeoJson] = useState<any>(null);
  const [, setRoadDistanceKm] = useState<number>(0);
  const [, setIsSavingPlan] = useState<boolean>(false);

  // Debounce timer ref for search input
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Helper untuk mengecek apakah koordinat ada di Jawa Barat
  const isInJawaBarat = useCallback((lat: number, lng: number): boolean => {
    return (
      lat >= JABAR_BOUNDS.south &&
      lat <= JABAR_BOUNDS.north &&
      lng >= JABAR_BOUNDS.west &&
      lng <= JABAR_BOUNDS.east
    );
  }, []);

  // Haversine distance calculator (fallback jika backend belum return distance_km)
  const calculateHaversine = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  };

  // Convert ApiDestination to NearbyDestination format for sheet & markers
  const transformDestinations = useCallback(
    (apiItems: ApiDestination[], refLat: number, refLng: number): NearbyDestination[] => {
      return apiItems.map((item) => {
        const itemLat = item.latitude || refLat;
        const itemLng = item.longitude || refLng;
        const distKm =
          item.distance_km != null
            ? Number(item.distance_km)
            : calculateHaversine(refLat, refLng, itemLat, itemLng);

        return {
          id: String(item.id),
          name: item.name,
          category: item.category?.name || 'Wisata',
          distance: `${distKm} km`,
          regency: item.regency?.name || item.address || 'Jawa Barat',
          visitorsCount: item.check_ins_count || 0,
          image: item.cover_image_url || item.cover_image || '/gedung-sate.jpg',
          coordinates: [itemLat, itemLng],
          raw: item,
        };
      });
    },
    []
  );

  // Fetch destinations from backend based on coords, category, radius, or search query
  const fetchDestinationsData = useCallback(
    async (
      lat: number,
      lng: number,
      rad: number,
      cat: string,
      search: string
    ) => {
      setIsLoading(true);
      try {
        let items: ApiDestination[] = [];

        if (search.trim().length >= 2) {
          // Gunakan search endpoint jika ada kata kunci
          items = await searchDestinations(search.trim(), {
            category: cat !== 'Semua' ? cat : undefined,
            lat,
            lng,
            limit: 25,
          });
        } else {
          // Gunakan nearby endpoint dengan filter radius & kategori
          items = await getNearbyDestinations({
            lat,
            lng,
            radius: rad,
            category: cat !== 'Semua' ? cat : undefined,
            limit: 20,
          });

          // Strict radius filtering safety check
          items = items.filter((item) => {
            if (item.distance_km != null) {
              return Number(item.distance_km) <= rad + 0.1;
            }
            const d = calculateHaversine(lat, lng, item.latitude || lat, item.longitude || lng);
            return d <= rad + 0.1;
          });
        }

        setRawDestinations(items);
        const transformed = transformDestinations(items, lat, lng);
        setDestinations(transformed);

        // Jika ada hasil pencarian teks, fokus ke hasil pertama
        if (search.trim().length >= 2 && transformed.length > 0) {
          setMapCenter(transformed[0].coordinates);
          setZoomLevel(14);
        }
      } catch (error) {
        console.error('Error fetching map destinations:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [transformDestinations]
  );

  // Flag untuk mencegah permintaan geolokasi ganda bersamaan
  const isRequestingGpsRef = useRef<boolean>(false);

  // Helper pemrosesan koordinat GPS sukses
  const handleGpsSuccess = useCallback(
    (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;

      if (isInJawaBarat(latitude, longitude)) {
        // Pengguna berada di dalam batas Jawa Barat
        const loc = { lat: latitude, lng: longitude };
        setUserLocation(loc);
        setLocationMode('gps');
        setActiveLocationName('Lokasi GPS Anda');
        setMapCenter([latitude, longitude]);
        setZoomLevel(14);
        setIsOutsideJabar(false);
        setIsGpsDenied(false);
        setLocationAlertDismissed(true);
        setIsLocationModalOpen(false);

        fetchDestinationsData(latitude, longitude, radius, selectedCategory, searchQuery);
      } else {
        // Pengguna terdeteksi di luar Jawa Barat
        setIsOutsideJabar(true);
        setIsGpsDenied(false);
        setLocationMode('manual');
        setActiveLocationName('Kota Bandung (Acuan Jabar)');
        const fallbackLoc = { lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1] };
        setUserLocation(fallbackLoc);
        setMapCenter(DEFAULT_CENTER);
        setZoomLevel(12);

        fetchDestinationsData(DEFAULT_CENTER[0], DEFAULT_CENTER[1], radius, selectedCategory, searchQuery);
      }
    },
    [fetchDestinationsData, isInJawaBarat, radius, searchQuery, selectedCategory]
  );

  // Helper pemrosesan fallback saat GPS gagal / timeout / ditolak
  const handleGpsFailure = useCallback(
    (error: GeolocationPositionError) => {
      // PERMISSION_DENIED = 1
      if (error.code === error.PERMISSION_DENIED) {
        setIsGpsDenied(true);
      } else {
        // Timeout (3) atau Position Unavailable (2)
        setIsGpsDenied(false);
      }

      setIsOutsideJabar(false);
      setLocationMode('manual');
      setActiveLocationName('Kota Bandung (Acuan Jabar)');
      const fallbackLoc = { lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1] };
      setUserLocation(fallbackLoc);
      setMapCenter(DEFAULT_CENTER);
      setZoomLevel(12);

      fetchDestinationsData(DEFAULT_CENTER[0], DEFAULT_CENTER[1], radius, selectedCategory, searchQuery);
    },
    [fetchDestinationsData, radius, searchQuery, selectedCategory]
  );

  // Fungsi untuk meminta lokasi GPS perangkat dengan fallback cerdas (High -> Low accuracy)
  const requestDeviceGpsLocation = useCallback(() => {
    if (typeof window === 'undefined') return;

    if (!('geolocation' in navigator)) {
      setIsGpsDenied(true);
      setLocationMode('manual');
      setActiveLocationName('Kota Bandung (Manual)');
      setUserLocation({ lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1] });
      fetchDestinationsData(DEFAULT_CENTER[0], DEFAULT_CENTER[1], radius, selectedCategory, searchQuery);
      return;
    }

    if (isRequestingGpsRef.current) return;
    isRequestingGpsRef.current = true;

    // Tahap 1: Coba ambil posisi dengan toleransi cache yang baik
    navigator.geolocation.getCurrentPosition(
      (position) => {
        isRequestingGpsRef.current = false;
        handleGpsSuccess(position);
      },
      (error) => {
        // Jika terjadi Timeout atau Position Unavailable pada mode hardware GNSS,
        // lakukan fallback otomatis ke mode jaringan/IP (enableHighAccuracy: false)
        // yang sangat andal dan cepat untuk laptop/PC tanpa chip GPS hardware
        if (error.code === error.TIMEOUT || error.code === error.POSITION_UNAVAILABLE) {
          navigator.geolocation.getCurrentPosition(
            (fallbackPos) => {
              isRequestingGpsRef.current = false;
              handleGpsSuccess(fallbackPos);
            },
            (finalError) => {
              isRequestingGpsRef.current = false;
              handleGpsFailure(finalError);
            },
            {
              enableHighAccuracy: false,
              timeout: 10000,
              maximumAge: 600000, // 10 menit
            }
          );
        } else {
          isRequestingGpsRef.current = false;
          handleGpsFailure(error);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 5000, // 5 detik sebelum mencoba fallback jaringan
        maximumAge: 300000, // 5 menit
      }
    );
  }, [fetchDestinationsData, handleGpsFailure, handleGpsSuccess, radius, searchQuery, selectedCategory]);

  // Inisialisasi awal saat load
  useEffect(() => {
    requestDeviceGpsLocation();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handler memilih opsi "Gunakan Lokasi Saat Ini (GPS)" dari Modal
  const handleUseCurrentGps = () => {
    isRequestingGpsRef.current = false;
    requestDeviceGpsLocation();
  };

  // Handler untuk memilih preset kota manual di Jawa Barat
  const handleSelectPresetCity = (city: { name: string; lat: number; lng: number }) => {
    const loc = { lat: city.lat, lng: city.lng };
    setUserLocation(loc);
    setLocationMode('manual');
    setActiveLocationName(city.name);
    setMapCenter([city.lat, city.lng]);
    setZoomLevel(14);
    setIsOutsideJabar(false);
    setIsGpsDenied(false);
    setIsLocationModalOpen(false);
    setLocationAlertDismissed(true);

    fetchDestinationsData(city.lat, city.lng, radius, selectedCategory, searchQuery);
  };

  // Handler untuk submit alamat manual melalui geocoding
  const handleManualGeocodeSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = manualAddressInput.trim();
    if (!query) return;

    setIsGeocoding(true);
    try {
      // Coba pencarian via OpenStreetMap Nominatim dibatasi Jawa Barat
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query + ', Jawa Barat'
      )}&countrycodes=id&viewbox=106.36,-5.91,108.85,-7.82&bounded=1&limit=1`;

      const res = await fetch(nominatimUrl);
      const data = await res.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);

        const loc = { lat, lng };
        setUserLocation(loc);
        setLocationMode('manual');
        setActiveLocationName(query);
        setMapCenter([lat, lng]);
        setZoomLevel(14);
        setIsOutsideJabar(false);
        setIsGpsDenied(false);
        setIsLocationModalOpen(false);
        setLocationAlertDismissed(true);

        fetchDestinationsData(lat, lng, radius, selectedCategory, searchQuery);
      } else {
        // Jika nominatim tidak mengembalikan hasil, cari kesamaan dengan kota preset
        const matchedCity = JABAR_PRESET_CITIES.find((c) =>
          query.toLowerCase().includes(c.name.toLowerCase().replace('kota ', ''))
        );

        if (matchedCity) {
          handleSelectPresetCity(matchedCity);
        } else {
          alert('Alamat tidak ditemukan di Jawa Barat. Silakan pilih salah satu kota populer di bawah.');
        }
      }
    } catch (err) {
      console.warn('Geocoding request failed:', err);
      handleSelectPresetCity(JABAR_PRESET_CITIES[0]);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Handler saat user mengubah radius pencarian
  const handleChangeRadius = (newRadius: number) => {
    setRadius(newRadius);
    const activeLat = userLocation?.lat || DEFAULT_CENTER[0];
    const activeLng = userLocation?.lng || DEFAULT_CENTER[1];
    fetchDestinationsData(activeLat, activeLng, newRadius, selectedCategory, searchQuery);
  };

  // Handler saat user toggle kategori
  const handleToggleCategory = (category: string) => {
    setSelectedCategory((prev) => (prev === category ? 'Semua' : category));
    const nextCategory = selectedCategory === category ? 'Semua' : category;
    const activeLat = userLocation?.lat || DEFAULT_CENTER[0];
    const activeLng = userLocation?.lng || DEFAULT_CENTER[1];
    fetchDestinationsData(activeLat, activeLng, radius, nextCategory, searchQuery);
  };

  // Handler Reset Filter
  const handleResetFilter = () => {
    setSelectedCategory('Semua');
    setRadius(10);
    setSearchQuery('');
    const activeLat = userLocation?.lat || DEFAULT_CENTER[0];
    const activeLng = userLocation?.lng || DEFAULT_CENTER[1];
    fetchDestinationsData(activeLat, activeLng, 10, 'Semua', '');
  };

  // Handler saat search bar diinput (dengan debounce 350ms)
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(() => {
      const activeLat = userLocation?.lat || DEFAULT_CENTER[0];
      const activeLng = userLocation?.lng || DEFAULT_CENTER[1];
      fetchDestinationsData(activeLat, activeLng, radius, selectedCategory, query);
    }, 350);
  };

  // Handler Search Submit
  const handleSearchSubmit = () => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    const activeLat = userLocation?.lat || DEFAULT_CENTER[0];
    const activeLng = userLocation?.lng || DEFAULT_CENTER[1];
    fetchDestinationsData(activeLat, activeLng, radius, selectedCategory, searchQuery);
  };

  // Handler Re-center GPS Button
  const handleRecenter = () => {
    if (userLocation) {
      setMapCenter([userLocation.lat, userLocation.lng]);
      setZoomLevel(14);
    }
  };

  // Handler klik marker pada peta
  const handleMarkerClick = (marker: MarkerData) => {
    setActiveDestinationId(marker.id);
    setMapCenter(marker.coordinates);
  };

  // Handler klik kartu destinasi pada bottom sheet
  const handleDestinationCardClick = (dest: NearbyDestination) => {
    setActiveDestinationId(dest.id);
    setMapCenter(dest.coordinates);
    setZoomLevel(15);
  };

  // Handler Toggle Selection Bookmark
  const handleToggleDestination = (id: string) => {
    setSelectedDestIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Handler Simpan Destinasi ke Rencana / Wishlist (Tanpa langsung commit ke database)
  const handleSaveDestinations = (savedItems: NearbyDestination[]) => {
    const itemsToSave =
      savedItems.length > 0
        ? savedItems
        : activeDestinationId
        ? destinations.filter((d) => d.id === activeDestinationId)
        : [];

    if (itemsToSave.length === 0) return;

    const newCount = (localFavoritCount || 0) + itemsToSave.length;
    setLocalFavoritCount(newCount);
    onSaveToWishlist?.(newCount);

    // Kirim destinasi terpilih dan titik acuan keberangkatan ke ringkasan rencana
    onNavigateToRencana?.(undefined, itemsToSave, {
      name: activeLocationName || 'Lokasi Terkini',
      address: `Titik keberangkatan di ${activeLocationName || 'Jawa Barat'}`,
      lat: userLocation?.lat || DEFAULT_CENTER[0],
      lng: userLocation?.lng || DEFAULT_CENTER[1],
    });
  };

  // Handle BottomNav Tab Switching
  const handleTabChange = (tab: NavTabId) => {
    if (tab === 'beranda') {
      onNavigateToHome?.();
    } else if (tab === 'profil') {
      onProfileClick?.();
    } else if (tab === 'riwayat') {
      onNavigateToRiwayat?.();
    } else if (tab === 'rencana') {
      onNavigateToRencana?.();
    }
  };

  // Convert destinations to MarkerData format for Leaflet
  const mapMarkers: MarkerData[] = destinations.map((d) => ({
    id: d.id,
    label: d.name,
    category: d.category,
    coordinates: d.coordinates,
  }));

  // Menghitung rute perjalanan spasial jalan raya (OSRM Polyline) dari titik user ke destinasi tujuan
  useEffect(() => {
    const originLat = userLocation?.lat || mapCenter[0];
    const originLng = userLocation?.lng || mapCenter[1];
    let waypoints: [number, number][] = [];

    if (selectedDestIds.length > 0) {
      const selected = destinations.filter((d) => selectedDestIds.includes(d.id));
      if (selected.length > 0) {
        waypoints = [
          [originLat, originLng],
          ...selected.map((d) => d.coordinates),
        ];
      }
    } else if (activeDestinationId) {
      const active = destinations.find((d) => d.id === activeDestinationId);
      if (active) {
        waypoints = [
          [originLat, originLng],
          active.coordinates,
        ];
      }
    }

    if (waypoints.length >= 2) {
      let isCancelled = false;
      fetchRoadRoute(waypoints)
        .then((result) => {
          if (!isCancelled) {
            setRoadRouteCoords(result.coordinates);
            setRoadGeoJson(result.geojson);
            setRoadDistanceKm(result.distanceKm);
          }
        })
        .catch((err) => {
          console.warn('Road routing error:', err);
          if (!isCancelled) {
            setRoadRouteCoords(waypoints);
          }
        });

      return () => {
        isCancelled = true;
      };
    } else {
      setRoadRouteCoords(undefined);
      setRoadGeoJson(null);
      setRoadDistanceKm(0);
    }
  }, [userLocation, mapCenter, selectedDestIds, activeDestinationId, destinations]);

  // Badge count filter aktif
  const activeFiltersCount =
    (selectedCategory !== 'Semua' ? 1 : 0) + (radius !== 10 ? 1 : 0);

  return (
    <div
      className={`relative w-full h-full flex flex-col bg-[#F9FAFB] overflow-hidden ${className}`}
    >
      {/* 1. Top Header with Brand Logo, Bell Badge, and Wishlist Button */}
      <AppHeader
        wishlistCount={localFavoritCount}
        onNotificationClick={onNotificationClick}
        onWishlistClick={onWishlistClick || onProfileClick}
        className="shrink-0 z-30"
      />

      {/* 2. Floating Top Row Controls: Search Bar, Tombol Pengaturan GPS, Tombol Filter */}
      <div className="absolute top-[68px] left-0 right-0 z-20">
        <SearchBar
          value={searchQuery}
          onChange={handleSearchChange}
          onClear={() => {
            setSearchQuery('');
            const activeLat = userLocation?.lat || DEFAULT_CENTER[0];
            const activeLng = userLocation?.lng || DEFAULT_CENTER[1];
            fetchDestinationsData(activeLat, activeLng, radius, selectedCategory, '');
          }}
          onSubmit={handleSearchSubmit}
          onGpsClick={() => setIsLocationModalOpen(true)}
          isGpsActive={locationMode === 'gps'}
          onFilterClick={() => setIsFilterOpen((prev) => !prev)}
          filterBadgeCount={activeFiltersCount}
          placeholder="Cari destinasi wisata di Jawa Barat..."
        />

        {/* 3. Floating Filter Eksplorasi Card */}
        {isFilterOpen && (
          <div className="px-5 mt-2">
            <MapExplorationFilter
              selectedCategory={selectedCategory}
              onToggleCategory={handleToggleCategory}
              radius={radius}
              onChangeRadius={handleChangeRadius}
              onReset={handleResetFilter}
            />
          </div>
        )}

        {/* 4. Alert Banner: Di Luar Jawa Barat ATAU GPS Ditolak */}
        {(isOutsideJabar || isGpsDenied) && !locationAlertDismissed && (
          <div className="px-5 mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="bg-amber-50/95 backdrop-blur-xs border border-amber-200 rounded-2xl p-3 shadow-[0_4px_16px_rgba(245,158,11,0.15)] flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-600 mt-0.5">
                <AlertTriangle className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-amber-900 leading-tight">
                  {isOutsideJabar
                    ? 'Lokasi di Luar Jawa Barat'
                    : 'Izin Lokasi (GPS) Tidak Aktif'}
                </h4>
                <p className="text-[11px] text-amber-700 mt-0.5 leading-snug">
                  {isOutsideJabar
                    ? 'Titik GPS Anda berada di luar Jawa Barat. Silakan tentukan titik alamat manual untuk mencari destinasi terdekat.'
                    : 'Aktifkan GPS atau tentukan alamat manual di Jawa Barat untuk mencari destinasi terdekat.'}
                </p>

                {/* Tombol aksi cepat */}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsLocationModalOpen(true)}
                    className="bg-[#4941EC] hover:bg-[#3C35C7] text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all active:scale-95 cursor-pointer shadow-2xs flex items-center gap-1"
                  >
                    <MapPin className="w-3 h-3" />
                    <span>Pilih Lokasi</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocationAlertDismissed(true)}
                    className="text-amber-800 hover:text-amber-950 text-[11px] font-medium px-2 py-1 cursor-pointer"
                  >
                    Nanti Saja
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLocationAlertDismissed(true)}
                aria-label="Tutup pesan"
                className="text-amber-500 hover:text-amber-700 p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. Fullscreen Interactive Leaflet WebGIS Map */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        <WebGisMap
          center={mapCenter}
          zoom={zoomLevel}
          userLocation={userLocation}
          radiusKm={radius}
          markers={mapMarkers}
          selectedMarkerId={activeDestinationId}
          routeCoordinates={roadRouteCoords}
          onMarkerClick={handleMarkerClick}
          onRecenter={handleRecenter}
        />
      </main>

      {/* 6. Floating Bottom Sheet: Hasil Destinasi Sekitar */}
      <div className="absolute bottom-16 left-0 right-0 z-20 max-w-[480px] mx-auto">
        <NearbyResultsSheet
          destinations={destinations}
          selectedIds={selectedDestIds}
          isLoading={isLoading}
          onToggleSelect={handleToggleDestination}
          onItemClick={handleDestinationCardClick}
          onSaveDestinations={handleSaveDestinations}
        />
      </div>

      {/* 7. Modal Titikkan Lokasi: Pilihan GPS atau Masukkan Lokasi Manual */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-[440px] p-5 shadow-2xl border border-gray-100 flex flex-col gap-4 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#EEF0FF] text-[#4941EC] flex items-center justify-center">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Tentukan Titik Acuan Lokasi
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Pilih metode penentuan titik pencarian destinasi
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 text-gray-400 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Pilihan 1: Gunakan Lokasi Saat Ini (GPS) */}
            <button
              type="button"
              onClick={handleUseCurrentGps}
              className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all active:scale-98 cursor-pointer text-left group ${
                locationMode === 'gps'
                  ? 'bg-[#EEF0FF] border-[#4941EC]'
                  : 'bg-gray-50 hover:bg-[#EEF0FF]/50 border-gray-200 hover:border-[#4941EC]/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                    locationMode === 'gps'
                      ? 'bg-[#4941EC] text-white'
                      : 'bg-white text-[#4941EC] border border-gray-200'
                  }`}
                >
                  <Locate className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-gray-900 group-hover:text-[#4941EC] transition-colors">
                      Gunakan Lokasi Saat Ini (GPS)
                    </h4>
                    {locationMode === 'gps' && (
                      <span className="text-[10px] bg-[#10B981] text-white font-bold px-1.5 py-0.2 rounded-md">
                        Aktif
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Deteksi koordinat GPS langsung dari perangkat Anda
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#4941EC] shrink-0 ml-2" />
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-0.5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <span className="relative px-3 bg-white text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Atau Masukkan Lokasi Manual
              </span>
            </div>

            {/* Pilihan 2: Form Input Alamat Manual */}
            <form onSubmit={handleManualGeocodeSubmit} className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-700">
                Tulis Nama Alamat / Tempat di Jawa Barat:
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={manualAddressInput}
                  onChange={(e) => setManualAddressInput(e.target.value)}
                  placeholder="Contoh: Jl. Dago, Bandung atau Lembang"
                  className="w-full text-xs py-2.5 pl-3 pr-20 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#4941EC] focus:bg-white outline-none text-gray-800 placeholder-gray-400 transition-all"
                />
                <button
                  type="submit"
                  disabled={isGeocoding || !manualAddressInput.trim()}
                  className="absolute right-1.5 px-3 py-1.5 bg-[#4941EC] hover:bg-[#3C35C7] disabled:bg-gray-300 text-white text-xs font-semibold rounded-lg transition-all active:scale-95 cursor-pointer"
                >
                  {isGeocoding ? 'Mencari...' : 'Terapkan'}
                </button>
              </div>
            </form>

            {/* Pilihan 3: Quick Preset Cities in Jabar */}
            <div>
              <span className="block text-xs font-semibold text-gray-600 mb-2">
                Pilih Kota Populer di Jawa Barat:
              </span>
              <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto no-scrollbar pr-0.5">
                {JABAR_PRESET_CITIES.map((city) => {
                  const isCityActive =
                    locationMode === 'manual' && activeLocationName === city.name;

                  return (
                    <button
                      key={city.name}
                      type="button"
                      onClick={() => handleSelectPresetCity(city)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl text-left transition-all active:scale-95 cursor-pointer group border ${
                        isCityActive
                          ? 'bg-[#EEF0FF] border-[#4941EC]'
                          : 'bg-gray-50 hover:bg-[#EEF0FF]/50 border-gray-100 hover:border-[#4941EC]/30'
                      }`}
                    >
                      <MapPin
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isCityActive ? 'text-[#4941EC]' : 'text-gray-400 group-hover:text-[#4941EC]'
                        }`}
                      />
                      <span
                        className={`text-xs font-semibold truncate ${
                          isCityActive
                            ? 'text-[#4941EC]'
                            : 'text-gray-800 group-hover:text-[#4941EC]'
                        }`}
                      >
                        {city.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. Fixed Bottom Navigation Bar */}
      <div className="shrink-0 w-full z-30">
        <BottomNav activeTab="peta" onTabChange={handleTabChange} />
      </div>
    </div>
  );
}
