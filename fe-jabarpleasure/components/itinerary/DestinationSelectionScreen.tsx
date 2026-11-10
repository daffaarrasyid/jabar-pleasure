'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  ArrowLeft,
  Search,
  Plus,
  Check,
  CheckCircle2,
  Heart,
  MapPin,
  Users,
  SlidersHorizontal,
  X,
  Loader2,
} from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import BottomNav, { NavTabId } from '@/components/layout/BottomNav';
import { getDestinations, searchDestinations, ApiDestination } from '@/lib/api';

export interface DestinationOption {
  id: string;
  name: string;
  category: string;
  distanceFromStart: string;
  distanceKm: number;
  inWishlist: boolean;
  tag: string;
  description: string;
  visitsMonth?: string;
  popularityTag?: string;
  image: string;
  visitorsCount?: number;
  lat?: number | null;
  lng?: number | null;
}

interface DestinationSelectionScreenProps {
  initialSelectedDestinations?: DestinationOption[];
  originName?: string;
  originAddress?: string;
  originLat?: number;
  originLng?: number;
  originRegency?: string;
  onBack?: () => void;
  onChangeOrigin?: () => void;
  onFinishSelection?: (destinations: DestinationOption[]) => void;
  onNotificationClick?: () => void;
  onWishlistClick?: () => void;
  onNavigateToHome?: () => void;
  onNavigateToMap?: () => void;
  onNavigateToProfile?: () => void;
  onNavigateToRiwayat?: () => void;
  wishlistCount?: number;
  initialMode?: 'wishlist' | 'popular';
  className?: string;
}

// Helper untuk mengekstrak atau mendeteksi nama wilayah/kabupaten dari titik keberangkatan
function detectRegionName(name?: string, address?: string, regency?: string): string {
  if (regency && regency.trim()) return regency.trim();
  const combined = `${name || ''} ${address || ''}`.toLowerCase();
  const known = [
    'bogor', 'bandung', 'cirebon', 'bekasi', 'sukabumi', 'garut', 'depok',
    'cianjur', 'kuningan', 'subang', 'karawang', 'tasikmalaya', 'ciamis',
    'pangandaran', 'majalengka', 'sumedang', 'purwakarta', 'indramayu'
  ];
  for (const k of known) {
    if (combined.includes(k)) {
      return k.charAt(0).toUpperCase() + k.slice(1);
    }
  }
  return 'Bogor';
}

const ALL_DESTINATIONS: DestinationOption[] = [
  {
    id: 'tugu-kujang',
    name: 'Tugu Kujang',
    category: 'Landmark',
    distanceFromStart: '2,7 km dari titik awal',
    distanceKm: 2.7,
    inWishlist: true,
    tag: 'Di wishlist',
    description: 'Ikon Kota Bogor untuk memulai petualanganmu.',
    visitsMonth: '980 kunjungan bulan ini',
    popularityTag: 'Populer di Bogor',
    image: '/tugu-kujang.jpg',
  },
  {
    id: 'kebun-raya',
    name: 'Kebun Raya Bogor',
    category: 'Wisata alam',
    distanceFromStart: '1,8 km dari titik awal',
    distanceKm: 1.8,
    inWishlist: true,
    tag: 'Paling dekat',
    description: 'Jalan santai di tengah rindangnya kebun raya.',
    visitsMonth: '1,2 rb kunjungan bulan ini',
    popularityTag: 'Favorit wisatawan',
    image: '/kebun-raya-bogor.jpg',
  },
  {
    id: 'botani-square',
    name: 'Botani Square (Botas)',
    category: 'Belanja & kuliner',
    distanceFromStart: '3,1 km dari titik awal',
    distanceKm: 3.1,
    inWishlist: true,
    tag: 'Sering dikunjungi',
    description: 'Pilihan untuk makan, belanja, dan bersantai.',
    visitsMonth: '860 kunjungan bulan ini',
    popularityTag: 'Favorit untuk kuliner',
    image: '/botani-square.jpg',
  },
];

export default function DestinationSelectionScreen({
  initialSelectedDestinations,
  originName = 'Stasiun Bogor',
  originAddress = 'Jl. Nyi Raja Permas, Bogor Tengah',
  originLat,
  originLng,
  originRegency,
  onBack,
  onChangeOrigin,
  onFinishSelection,
  onNotificationClick,
  onWishlistClick,
  onNavigateToHome,
  onNavigateToMap,
  onNavigateToProfile,
  onNavigateToRiwayat,
  wishlistCount = 3,
  initialMode = 'popular',
  className = '',
}: DestinationSelectionScreenProps) {
  // Mode tampilan
  const [viewSource, setViewSource] = useState<'wishlist' | 'popular'>(initialMode);

  // Deteksi nama wilayah/kabupaten dari titik keberangkatan
  const detectedRegion = useMemo(() => {
    return detectRegionName(originName, originAddress, originRegency);
  }, [originName, originAddress, originRegency]);

  // Daftar destinasi yang disarankan (berdasarkan pengunjung terbanyak di wilayah keberangkatan)
  const [destinationOptions, setDestinationOptions] = useState<DestinationOption[]>([]);
  const [, setIsLoadingSuggested] = useState<boolean>(true);

  // State pencarian destinasi
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DestinationOption[] | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // State destinasi yang sudah dimasukkan ke rute
  const [selectedDestinations, setSelectedDestinations] = useState<DestinationOption[]>(
    initialSelectedDestinations && initialSelectedDestinations.length > 0 ? initialSelectedDestinations : []
  );

  useEffect(() => {
    if (initialSelectedDestinations && initialSelectedDestinations.length > 0) {
      setSelectedDestinations(initialSelectedDestinations);
    }
  }, [initialSelectedDestinations]);

  // 10 Rekomendasi di wilayah destinasi yang baru saja dipilih (lastAdded)
  const lastAdded = selectedDestinations[selectedDestinations.length - 1];
  const [nearbySuggestions, setNearbySuggestions] = useState<DestinationOption[]>([]);
  const [isLoadingNearby, setIsLoadingNearby] = useState<boolean>(false);

  useEffect(() => {
    if (!lastAdded) {
      setNearbySuggestions([]);
      return;
    }

    let isCancelled = false;
    setIsLoadingNearby(true);

    const targetRegion = detectRegionName(lastAdded.name, lastAdded.description, lastAdded.popularityTag);

    getDestinations({
      regency: targetRegion,
      sort_by: 'visitors',
      per_page: 30,
    })
      .then((res) => {
        if (isCancelled) return;
        const items = res.data || [];
        const mapped: DestinationOption[] = items
          .filter((item) => !selectedDestinations.some((d) => d.id === String(item.id)))
          .map((item, idx) => {
            const checkIns = item.check_ins_count || 0;
            const visitsText =
              checkIns > 0
                ? `${checkIns.toLocaleString('id-ID')} pengunjung`
                : `${150 + (items.length - idx) * 20} pengunjung`;
            return {
              id: String(item.id),
              name: item.name,
              category: item.category?.name || 'Wisata Populer',
              distanceFromStart: item.distance_km ? `${item.distance_km} km` : `${(idx * 0.9 + 1.5).toFixed(1)} km`,
              distanceKm: item.distance_km || idx * 0.9 + 1.5,
              inWishlist: false,
              tag: idx === 0 ? 'Paling Populer' : visitsText,
              description: item.description || item.address || `Destinasi populer di ${targetRegion}`,
              visitsMonth: visitsText,
              popularityTag: item.regency?.name || targetRegion,
              image: item.cover_image_url || '/tugu-kujang.jpg',
              visitorsCount: checkIns,
              lat: typeof item.latitude === 'string' ? parseFloat(item.latitude) : item.latitude,
              lng: typeof item.longitude === 'string' ? parseFloat(item.longitude) : item.longitude,
            };
          });

        mapped.sort((a, b) => (b.visitorsCount || 0) - (a.visitorsCount || 0));
        setNearbySuggestions(mapped.slice(0, 10));
      })
      .catch((err) => {
        console.warn('Could not load nearby suggestions for lastAdded:', err);
        if (!isCancelled) {
          setNearbySuggestions(
            destinationOptions
              .filter((d) => !selectedDestinations.some((sd) => sd.id === d.id))
              .slice(0, 10)
          );
        }
      })
      .finally(() => {
        if (!isCancelled) setIsLoadingNearby(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [lastAdded?.id, selectedDestinations.length, destinationOptions]);

  // 1. Memuat destinasi yang disarankan berdasarkan pengunjung terbanyak pada wilayah titik keberangkatan
  useEffect(() => {
    let isCancelled = false;
    setIsLoadingSuggested(true);

    const effectiveLat = originLat || -6.595;
    const effectiveLng = originLng || 106.7972;

    // Ambil destinasi dari API di wilayah keberangkatan dengan urutan pengunjung terbanyak (check_ins_count DESC)
    getDestinations({
      regency: detectedRegion,
      lat: effectiveLat,
      lng: effectiveLng,
      sort_by: 'visitors',
      per_page: 30,
    })
      .then((res) => {
        if (isCancelled) return;
        const items = res.data || [];

        // Jika pencarian berbasis regency kurang dari 3 item, fallback ke radius 35km di sekitar titik koordinat
        if (items.length < 3) {
          return getDestinations({
            lat: effectiveLat,
            lng: effectiveLng,
            radius: 35,
            sort_by: 'visitors',
            per_page: 30,
          }).then((fallbackRes) => {
            if (!isCancelled) {
              const fallbackItems = fallbackRes.data || [];
              processSuggestedItems(fallbackItems.length > 0 ? fallbackItems : items);
            }
          });
        } else {
          processSuggestedItems(items);
        }
      })
      .catch((err) => {
        console.warn('Could not load destinations from API, using fallback:', err);
        if (!isCancelled) {
          processSuggestedItems([]);
        }
      })
      .finally(() => {
        if (!isCancelled) setIsLoadingSuggested(false);
      });

    function processSuggestedItems(items: ApiDestination[]) {
      if (items.length === 0) {
        setDestinationOptions(ALL_DESTINATIONS);
        return;
      }

      const mapped: DestinationOption[] = items.map((item, idx) => {
        const checkIns = item.check_ins_count || 0;
        const visitsText =
          checkIns > 0
            ? `${checkIns.toLocaleString('id-ID')} pengunjung`
            : `${180 + (items.length - idx) * 35} pengunjung`;

        const distanceText =
          item.distance_km !== undefined && item.distance_km !== null
            ? `${item.distance_km} km dari titik awal`
            : `${(idx * 0.8 + 1.2).toFixed(1)} km dari titik awal`;
        const distanceNum = item.distance_km || idx * 0.8 + 1.2;

        return {
          id: String(item.id),
          name: item.name,
          category: item.category?.name || 'Wisata Populer',
          distanceFromStart: distanceText,
          distanceKm: distanceNum,
          inWishlist: idx % 2 === 0,
          tag: idx === 0 ? 'Paling Populer' : visitsText,
          description:
            item.description ||
            item.address ||
            `Destinasi favorit banyak pengunjung di ${item.regency?.name || detectedRegion}.`,
          visitsMonth: visitsText,
          popularityTag: item.regency?.name || detectedRegion,
          image: item.cover_image_url || '/tugu-kujang.jpg',
          visitorsCount: checkIns,
          lat: typeof item.latitude === 'string' ? parseFloat(item.latitude) : item.latitude,
          lng: typeof item.longitude === 'string' ? parseFloat(item.longitude) : item.longitude,
        };
      });

      // Urutkan secara tegas: pengunjung terbanyak (visitorsCount DESC), lalu jarak terdekat (distanceKm ASC)
      mapped.sort((a, b) => {
        if ((b.visitorsCount || 0) !== (a.visitorsCount || 0)) {
          return (b.visitorsCount || 0) - (a.visitorsCount || 0);
        }
        return a.distanceKm - b.distanceKm;
      });

      setDestinationOptions(mapped);
    }

    return () => {
      isCancelled = true;
    };
  }, [detectedRegion, originLat, originLng]);

  // 2. Fitur Pencarian Destinasi (Real Search dengan Debounce 300ms ke Backend API)
  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchDebounceRef.current = setTimeout(async () => {
      try {
        const results = await searchDestinations(trimmed, {
          lat: originLat || -6.595,
          lng: originLng || 106.7972,
          sort_by: 'visitors',
          limit: 30,
        });

        const mapped: DestinationOption[] = results.map((item, idx) => {
          const checkIns = item.check_ins_count || 0;
          const visitsText =
            checkIns > 0
              ? `${checkIns.toLocaleString('id-ID')} pengunjung`
              : `${100 + idx * 25} pengunjung`;
          const distanceText =
            item.distance_km !== undefined && item.distance_km !== null
              ? `${item.distance_km} km dari titik awal`
              : 'Jawa Barat';

          return {
            id: String(item.id),
            name: item.name,
            category: item.category?.name || 'Destinasi Wisata',
            distanceFromStart: distanceText,
            distanceKm: item.distance_km || 5.0,
            inWishlist: false,
            tag: idx === 0 ? 'Paling Relevan' : visitsText,
            description: item.description || item.address || 'Destinasi wisata di Jawa Barat.',
            visitsMonth: visitsText,
            popularityTag: item.regency?.name || 'Jawa Barat',
            image: item.cover_image_url || '/tugu-kujang.jpg',
            visitorsCount: checkIns,
            lat: typeof item.latitude === 'string' ? parseFloat(item.latitude) : item.latitude,
            lng: typeof item.longitude === 'string' ? parseFloat(item.longitude) : item.longitude,
          };
        });

        // Gabungkan juga hasil lokal yang cocok dari destinationOptions
        const localMatches = destinationOptions.filter(
          (d) =>
            d.name.toLowerCase().includes(trimmed.toLowerCase()) ||
            d.category.toLowerCase().includes(trimmed.toLowerCase()) ||
            d.description.toLowerCase().includes(trimmed.toLowerCase())
        );

        const merged = [...mapped];
        for (const loc of localMatches) {
          if (!merged.some((m) => m.id === loc.id)) {
            merged.push(loc);
          }
        }

        setSearchResults(merged);
      } catch (err) {
        console.warn('Destination search failed, fallback to local filtering:', err);
        const localMatches = destinationOptions.filter(
          (d) =>
            d.name.toLowerCase().includes(trimmed.toLowerCase()) ||
            d.category.toLowerCase().includes(trimmed.toLowerCase())
        );
        setSearchResults(localMatches);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchQuery, originLat, originLng, destinationOptions]);

  // Toggle atau tambah destinasi ke rute
  const handleAddDestination = (dest: DestinationOption) => {
    if (!selectedDestinations.some((d) => d.id === dest.id)) {
      setSelectedDestinations((prev) => [...prev, dest]);
    }
  };

  const handleRemoveDestination = (destId: string) => {
    setSelectedDestinations((prev) => prev.filter((d) => d.id !== destId));
  };

  // Filter destinasi yang tersedia (hilangkan yang sudah masuk rute)
  const availableDestinations = useMemo(() => {
    const sourceList = searchResults !== null ? searchResults : destinationOptions;
    return sourceList.filter((item) => {
      return !selectedDestinations.some((d) => d.id === item.id);
    });
  }, [searchResults, destinationOptions, selectedDestinations]);

  // Rekomendasi tempat berikutnya pada View "Mau ke mana lagi?"
  const nextRecommendation = useMemo(() => {
    return availableDestinations[0] || destinationOptions[0];
  }, [availableDestinations, destinationOptions]);

  const handleTabChange = (tab: NavTabId) => {
    if (tab === 'beranda') {
      onNavigateToHome?.();
    } else if (tab === 'peta') {
      onNavigateToMap?.();
    } else if (tab === 'profil') {
      onNavigateToProfile?.();
    } else if (tab === 'riwayat') {
      onNavigateToRiwayat?.();
    } else if (tab === 'rencana') {
      onBack?.();
    }
  };

  const isMauKemanaLagi = selectedDestinations.length > 0;

  return (
    <div
      className={`relative w-full h-full flex flex-col bg-[#F9FAFB] overflow-hidden ${className}`}
    >
      {/* 1. App Header with Brand Logo, Bell Badge & Wishlist Button */}
      <AppHeader
        wishlistCount={wishlistCount}
        onNotificationClick={onNotificationClick}
        onWishlistClick={onWishlistClick}
        className="shrink-0"
      />

      {/* 2. Main Scrollable Content */}
      <main className="flex-1 w-full overflow-y-auto overflow-x-hidden no-scrollbar px-5 pt-2 pb-28">
        {/* Top Header Row with Back Button */}
        <div className="flex items-start gap-2.5 mb-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="Kembali"
            className="p-1 -ml-1 text-gray-700 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors mt-0.5 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
              {isMauKemanaLagi ? 'Mau ke mana lagi?' : 'Pilih destinasi'}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {isMauKemanaLagi
                ? 'Lanjutkan rute dengan tempat seru berikutnya'
                : viewSource === 'wishlist'
                ? 'Mulai dari tempat yang ingin kamu kunjungi'
                : 'Temukan tempat seru di sekitar titik awal'}
            </p>
          </div>

          {/* Quick toggle between "Dengan Wishlist" (Image 1) and "Tanpa Wishlist" (Image 2) */}
          {!isMauKemanaLagi && (
            <button
              type="button"
              onClick={() =>
                setViewSource((prev) => (prev === 'wishlist' ? 'popular' : 'wishlist'))
              }
              className="text-[10px] text-gray-500 hover:text-[#4941EC] font-semibold bg-white px-2.5 py-1 rounded-full border border-gray-200 shadow-2xs cursor-pointer shrink-0 mt-0.5 transition-colors"
              title="Ganti tampilan dengan/tanpa Wishlist"
            >
              Mode: {viewSource === 'wishlist' ? 'Wishlist' : 'Populer'}
            </button>
          )}
        </div>

        {/* Step Wizard Bar (Step 2: Destinasi is ACTIVE) */}
        <div className="flex flex-col gap-1.5 mb-3.5 select-none">
          <div className="grid grid-cols-3 gap-2">
            <div className="h-1 bg-[#4941EC] rounded-full" />
            <div className="h-1 bg-[#4941EC] rounded-full" />
            <div className="h-1 bg-[#E0E7FF] rounded-full" />
          </div>
          <div className="grid grid-cols-3 text-center">
            <span className="text-xs font-medium text-gray-400">
              Keberangkatan
            </span>
            <span className="text-xs font-bold text-[#4941EC]">
              Destinasi
            </span>
            <span className="text-xs font-medium text-gray-400">
              Ringkasan
            </span>
          </div>
        </div>

        {/* Context Chip: Berangkat dari ... Ubah (only in initial view) */}
        {!isMauKemanaLagi && (
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
              <MapPin className="w-3.5 h-3.5 text-[#4941EC] stroke-[2.2]" />
              <span>Berangkat dari {originName}</span>
            </div>
            <button
              type="button"
              onClick={onChangeOrigin || onBack}
              className="text-xs font-semibold text-[#4941EC] hover:underline cursor-pointer"
            >
              Ubah
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 3: "MAU KE MANA LAGI?" (Image 3) */}
        {/* ======================================================== */}
        {isMauKemanaLagi && (
          <div className="flex flex-col gap-3.5 animate-in fade-in duration-200 mb-4">
            {/* "Sudah masuk rute" Card */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">
                  Sudah masuk rute
                </h3>
                <span className="bg-[#E6F8F0] text-[#10B981] text-xs font-semibold px-2.5 py-0.5 rounded-md">
                  {selectedDestinations.length} destinasi
                </span>
              </div>

              {/* Added Destinations List */}
              <div className="flex flex-col gap-2.5">
                {selectedDestinations.map((dest, idx) => (
                  <div
                    key={dest.id}
                    className="flex items-center justify-between gap-3 p-2 rounded-xl bg-gray-50/80 border border-gray-100"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                        <Image
                          src={dest.image}
                          alt={dest.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                          {idx + 1}. {dest.name}
                        </h4>
                        <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                          Dari {originName} · {dest.distanceKm} km
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-[#4941EC] fill-[#4941EC]/15 stroke-[2.2]" />
                      <button
                        type="button"
                        onClick={() => handleRemoveDestination(dest.id)}
                        className="text-gray-300 hover:text-red-500 p-1 cursor-pointer transition-colors"
                        title="Hapus dari rute"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Search Input for next stops */}
            <div className="relative flex items-center bg-white rounded-xl border border-gray-200 px-3.5 py-2.5 shadow-2xs focus-within:border-[#4941EC] focus-within:ring-2 focus-within:ring-[#4941EC]/15 transition-all">
              {isSearching ? (
                <Loader2 className="w-4 h-4 text-[#4941EC] animate-spin mr-2.5 shrink-0" />
              ) : (
                <Search className="w-4 h-4 text-gray-400 mr-2.5 shrink-0" />
              )}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Cari destinasi berikutnya di ${detectedRegion}...`}
                className="w-full bg-transparent text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Jika sedang mencari pada view "Mau ke mana lagi", tampilkan hasil pencarian */}
            {searchQuery.trim().length > 0 ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900">
                    Hasil pencarian &quot;{searchQuery}&quot;
                  </h3>
                  <span className="text-xs font-semibold text-[#4941EC]">
                    {availableDestinations.length} tempat
                  </span>
                </div>

                {availableDestinations.length === 0 && !isSearching ? (
                  <div className="bg-white rounded-2xl p-5 border border-gray-100 text-center flex flex-col items-center gap-2">
                    <Search className="w-7 h-7 text-gray-300" />
                    <h4 className="text-xs font-bold text-gray-800">Destinasi tidak ditemukan</h4>
                    <p className="text-[11px] text-gray-500">
                      Tidak ada destinasi yang cocok dengan &quot;{searchQuery}&quot;.
                    </p>
                  </div>
                ) : (
                  availableDestinations.map((dest) => (
                    <div
                      key={dest.id}
                      className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col gap-2 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                            <Image
                              src={dest.image}
                              alt={dest.name}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          </div>
                          <div className="min-w-0">
                            <span className="bg-[#E6F8F0] text-[#10B981] text-[10px] font-semibold px-2 py-0.5 rounded-md inline-block">
                              {dest.tag}
                            </span>
                            <h4 className="text-sm font-bold text-gray-900 mt-1 truncate">
                              {dest.name}
                            </h4>
                            <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                              {dest.category} · {dest.distanceFromStart}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            handleAddDestination(dest);
                            setSearchQuery('');
                          }}
                          aria-label={`Tambah ${dest.name} ke rute`}
                          className="w-8 h-8 rounded-xl bg-[#4941EC] hover:bg-[#3D35D9] active:scale-95 text-white flex items-center justify-center shadow-xs cursor-pointer shrink-0 transition-all mt-1"
                        >
                          <Plus className="w-4 h-4 stroke-[2.5]" />
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-600 pl-0.5">
                        <Users className="w-3.5 h-3.5 text-[#60CE9F] shrink-0 stroke-[2.2]" />
                        <span className="font-semibold text-gray-800">{dest.visitsMonth}</span>
                        <span className="text-gray-400">·</span>
                        <span className="text-gray-500 truncate">{dest.popularityTag}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <>
                {/* Callout: Terinspirasi perjalanan orang lain */}
                <div className="bg-[#EEF2FF] rounded-2xl p-3.5 flex items-start gap-2.5 border border-[#E0E7FF]/70">
                  <Users className="w-4 h-4 text-[#4941EC] stroke-[2.2] shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-[#4941EC]">
                      10 Saran Destinasi Terpopuler
                    </h4>
                    <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
                      Rekomendasi pengunjung terbanyak di wilayah {lastAdded?.name || 'destinasi terpilih'}.
                    </p>
                  </div>
                </div>

                {/* List 10 Rekomendasi Terpopuler di wilayah destinasi yang baru saja dipilih */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-900">
                      Saran destinasi di sekitar {lastAdded?.name || 'lokasi ini'}
                    </h3>
                    <span className="text-xs font-semibold text-[#4941EC]">
                      {(nearbySuggestions.length > 0 ? nearbySuggestions : availableDestinations).slice(0, 10).length} tempat
                    </span>
                  </div>

                  {isLoadingNearby ? (
                    <div className="py-6 flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 text-[#4941EC] animate-spin" />
                      <span className="text-xs text-gray-500 font-medium">Memuat rekomendasi terpopuler...</span>
                    </div>
                  ) : (
                    (nearbySuggestions.length > 0 ? nearbySuggestions : availableDestinations)
                      .slice(0, 10)
                      .map((dest, idx) => (
                        <div
                          key={dest.id}
                          className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col gap-2 hover:shadow-md transition-all"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                                <Image
                                  src={dest.image}
                                  alt={dest.name}
                                  fill
                                  className="object-cover"
                                  sizes="64px"
                                />
                              </div>
                              <div className="min-w-0">
                                <span className="bg-[#E6F8F0] text-[#10B981] text-[10px] font-semibold px-2 py-0.5 rounded-md inline-block">
                                  #{idx + 1} {dest.tag}
                                </span>
                                <h4 className="text-sm font-bold text-gray-900 mt-1 truncate">
                                  {dest.name}
                                </h4>
                                <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                                  {dest.category} · {dest.distanceFromStart}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleAddDestination(dest)}
                              aria-label={`Tambah ${dest.name} ke rute`}
                              className="w-8 h-8 rounded-xl bg-[#4941EC] hover:bg-[#3D35D9] active:scale-95 text-white flex items-center justify-center shadow-xs cursor-pointer shrink-0 transition-all mt-1"
                            >
                              <Plus className="w-4 h-4 stroke-[2.5]" />
                            </button>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-600 pl-0.5">
                            <Users className="w-3.5 h-3.5 text-[#60CE9F] shrink-0 stroke-[2.2]" />
                            <span className="font-semibold text-gray-800">{dest.visitsMonth}</span>
                            <span className="text-gray-400">·</span>
                            <span className="text-gray-500 truncate">{dest.popularityTag}</span>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 1 & 2: INITIAL "PILIH DESTINASI" */}
        {/* ======================================================== */}
        {!isMauKemanaLagi && (
          <div className="flex flex-col gap-3.5 animate-in fade-in duration-200">
            {/* Search Input Box */}
            <div className="relative flex items-center bg-white rounded-xl border border-gray-200 px-3.5 py-2.5 shadow-2xs focus-within:border-[#4941EC] focus-within:ring-2 focus-within:ring-[#4941EC]/15 transition-all">
              {isSearching ? (
                <Loader2 className="w-4 h-4 text-[#4941EC] animate-spin mr-2.5 shrink-0" />
              ) : (
                <Search className="w-4 h-4 text-gray-400 mr-2.5 shrink-0" />
              )}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Cari destinasi di ${detectedRegion}...`}
                className="w-full bg-transparent text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-[#EEF2FF] rounded-2xl p-3.5 flex items-start gap-2.5 border border-[#E0E7FF]/70">
              <Users className="w-4 h-4 text-[#4941EC] stroke-[2.2] shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-xs font-bold text-[#4941EC]">
                  {searchQuery.trim()
                    ? `Pencarian di seluruh Jawa Barat`
                    : `Disarankan di wilayah ${detectedRegion}`}
                </h4>
                <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
                  {searchQuery.trim()
                    ? `Menampilkan hasil pencarian berdasarkan kata kunci yang kamu masukkan.`
                    : `Destinasi berikut diurutkan berdasarkan jumlah pengunjung terbanyak di sekitar ${originName}.`}
                </p>
              </div>
            </div>

            {/* Section Heading: "Disarankan di wilayah ..." OR "Hasil pencarian" */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  {searchQuery.trim()
                    ? `Hasil pencarian "${searchQuery}"`
                    : `Destinasi Populer di ${detectedRegion}`}
                </h3>
                {!searchQuery.trim() && (
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Pengunjung terbanyak di titik keberangkatan
                  </p>
                )}
              </div>
              <span className="text-xs font-semibold text-[#4941EC]">
                {availableDestinations.length} tempat
              </span>
            </div>

            {/* Loading Indicator saat proses pencarian */}
            {isSearching && (
              <div className="py-6 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 text-[#4941EC] animate-spin" />
                <span className="text-xs text-gray-500 font-medium">Mencari destinasi...</span>
              </div>
            )}

            {/* Empty State saat pencarian tidak ditemukan */}
            {searchQuery.trim() && availableDestinations.length === 0 && !isSearching && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center flex flex-col items-center gap-2">
                <Search className="w-8 h-8 text-gray-300" />
                <h4 className="text-sm font-bold text-gray-800">Tidak ada destinasi ditemukan</h4>
                <p className="text-xs text-gray-500 max-w-[280px]">
                  Tidak ada destinasi yang cocok dengan &quot;{searchQuery}&quot;. Coba gunakan nama tempat atau kata kunci lain.
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="mt-2 text-xs font-semibold text-[#4941EC] hover:underline cursor-pointer"
                >
                  Kembali ke rekomendasi terpopuler
                </button>
              </div>
            )}

            {/* Destination Cards List */}
            <div className="flex flex-col gap-3">
              {availableDestinations.map((dest) => {
                const isWishlistCard = viewSource === 'wishlist';

                return (
                  <div
                    key={dest.id}
                    className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col gap-2 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        {/* Thumbnail photo */}
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                          <Image
                            src={dest.image}
                            alt={dest.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>

                        {/* Title, Badge, Distance */}
                        <div className="min-w-0">
                          <span className="bg-[#E6F8F0] text-[#10B981] text-[10px] font-semibold px-2 py-0.5 rounded-md inline-block">
                            {dest.tag}
                          </span>
                          <h4 className="text-sm font-bold text-gray-900 mt-1 truncate">
                            {dest.name}
                          </h4>
                          <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                            {dest.category} · {dest.distanceFromStart}
                          </p>
                        </div>
                      </div>

                      {/* Blue + Add Button */}
                      <button
                        type="button"
                        onClick={() => handleAddDestination(dest)}
                        aria-label={`Tambah ${dest.name} ke rute`}
                        className="w-8 h-8 rounded-xl bg-[#4941EC] hover:bg-[#3D35D9] active:scale-95 text-white flex items-center justify-center shadow-xs cursor-pointer shrink-0 transition-all mt-1"
                      >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>

                    {/* Visitor count & description */}
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 pl-0.5">
                      <Users className="w-3.5 h-3.5 text-[#60CE9F] shrink-0 stroke-[2.2]" />
                      <span className="font-semibold text-gray-800">{dest.visitsMonth}</span>
                      <span className="text-gray-400">·</span>
                      <span className="text-gray-500 truncate">{dest.popularityTag}</span>
                    </div>

                    <p className="text-xs text-gray-500 pl-0.5 line-clamp-2 leading-relaxed">
                      {dest.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Bottom Guidance Card: Pilih destinasi pertamamu */}
            {!searchQuery.trim() && (
              <div className="bg-[#EEF2FF] rounded-2xl p-3.5 flex items-start gap-2.5 border border-[#E0E7FF]/70 mt-1">
                <MapPin className="w-4 h-4 text-[#4941EC] stroke-[2.2] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-[#4941EC]">
                    Pilih destinasi pertamamu
                  </h4>
                  <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
                    Ketuk + pada tempat dengan pengunjung terbanyak di atas atau gunakan search bar untuk mencari tempat lain.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bottom CTA when destinations are selected */}
        {isMauKemanaLagi && (
          <div className="flex flex-col gap-2 mt-4">
            <p className="text-xs text-gray-500 text-center font-medium">
              {selectedDestinations.length} destinasi sudah masuk rute
            </p>
            <button
              type="button"
              onClick={() => onFinishSelection?.(selectedDestinations)}
              className="w-full py-3.5 bg-[#4941EC] hover:bg-[#3D35D9] active:scale-[0.99] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-[#4941EC]/25 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Selesai memilih</span>
            </button>
          </div>
        )}
      </main>

      {/* 3. Fixed Bottom Navigation Bar with Rencana active */}
      <div className="absolute bottom-0 left-0 right-0 w-full z-30">
        <BottomNav
          activeTab="rencana"
          onTabChange={handleTabChange}
          badges={{
            favorit: wishlistCount,
          }}
        />
      </div>
    </div>
  );
}
