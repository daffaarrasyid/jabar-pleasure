'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import {
  ArrowLeft,
  Search,
  CheckCircle2,
  AlertCircle,
  MapPin,
  ChevronRight,
  RotateCcw,
  X,
  Calendar,
  Bell,
  Compass,
  Loader2,
} from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import BottomNav, { NavTabId } from '@/components/layout/BottomNav';

const DepartureMapPicker = dynamic(
  () => import('@/components/itinerary/DepartureMapPicker'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl bg-gray-100 flex items-center justify-center text-xs text-gray-400 animate-pulse border border-gray-200">
        Memuat peta pemilih titik awal...
      </div>
    ),
  }
);

interface GeocodedResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  name?: string;
}

interface DepartureLocationScreenProps {
  initialLocation?: {
    name: string;
    address: string;
    lat?: number;
    lng?: number;
    regency?: string;
  } | null;
  onBack?: () => void;
  onNext?: (location: {
    name: string;
    address: string;
    lat?: number;
    lng?: number;
    regency?: string;
    isGps: boolean;
    startDate?: string;
  }) => void;
  onNotificationClick?: () => void;
  onWishlistClick?: () => void;
  onNavigateToHome?: () => void;
  onNavigateToMap?: () => void;
  onNavigateToProfile?: () => void;
  onNavigateToRiwayat?: () => void;
  wishlistCount?: number;
  initialGpsActive?: boolean;
  className?: string;
}

// 6 Top Popular Hubs in West Java across major regions
const POPULAR_JABAR_HUBS = [
  {
    name: 'Stasiun Bogor',
    address: 'Jl. Nyi Raja Permas, Kota Bogor',
    lat: -6.595,
    lng: 106.7972,
    regency: 'Kota Bogor',
  },
  {
    name: 'Stasiun Bandung',
    address: 'Jl. Stasiun Barat, Kebon Jeruk, Kota Bandung',
    lat: -6.9147,
    lng: 107.6025,
    regency: 'Kota Bandung',
  },
  {
    name: 'Terminal Baranangsiang',
    address: 'Jl. Raya Pajajaran, Bogor Timur, Kota Bogor',
    lat: -6.6068,
    lng: 106.8088,
    regency: 'Kota Bogor',
  },
  {
    name: 'Stasiun Cirebon (Kejaksan)',
    address: 'Jl. Siliwangi, Kebonbaru, Kota Cirebon',
    lat: -6.7063,
    lng: 108.5556,
    regency: 'Kota Cirebon',
  },
  {
    name: 'Terminal Leuwipanjang',
    address: 'Jl. Soekarno Hatta, Situsaeur, Kota Bandung',
    lat: -6.9458,
    lng: 107.5939,
    regency: 'Kota Bandung',
  },
  {
    name: 'Alun-Alun Garut',
    address: 'Jl. Ahmad Yani, Garut Kota, Kab. Garut',
    lat: -7.2148,
    lng: 107.9044,
    regency: 'Kabupaten Garut',
  },
];

export default function DepartureLocationScreen({
  initialLocation,
  onBack,
  onNext,
  onNotificationClick,
  onWishlistClick,
  onNavigateToHome,
  onNavigateToMap,
  onNavigateToProfile,
  onNavigateToRiwayat,
  wishlistCount = 0,
  initialGpsActive = false,
  className = '',
}: DepartureLocationScreenProps) {
  // State 1: GPS Active or Inactive
  const [isGpsActive, setIsGpsActive] = useState<boolean>(initialGpsActive);
  const [isActivatingGps, setIsActivatingGps] = useState<boolean>(false);

  // State 2: Search input text
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<GeocodedResult[]>([]);
  const [isSearchingGeocode, setIsSearchingGeocode] = useState<boolean>(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState<boolean>(false);

  // State 3: Selected location
  const [selectedLocation, setSelectedLocation] = useState<{
    name: string;
    address: string;
    lat?: number;
    lng?: number;
    regency?: string;
  } | null>(initialLocation || null);

  // State 4: Optional departure date
  const [departureDate, setDepartureDate] = useState<string>('');
  const [enableDeviceNotification, setEnableDeviceNotification] = useState<boolean>(false);
  const [notifPermissionStatus, setNotifPermissionStatus] = useState<string>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });
  const [notifFeedbackMsg, setNotifFeedbackMsg] = useState<string | null>(null);

  // State 5: Map View vs Hubs View tab
  const [viewTab, setViewTab] = useState<'map' | 'hubs'>('map');

  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search for West Java locations via Nominatim
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      return;
    }

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    searchDebounceRef.current = setTimeout(async () => {
      setIsSearchingGeocode(true);
      try {
        const queryWithJabar = `${searchQuery.trim()}, Jawa Barat`;
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          queryWithJabar
        )}&countrycodes=id&viewbox=106.35,-5.85,108.85,-8.05&bounded=1&limit=5`;

        const res = await fetch(url, { headers: { Accept: 'application/json' } });
        if (res.ok) {
          const data: GeocodedResult[] = await res.json();
          setSearchResults(data);
          setShowSearchDropdown(data.length > 0);
        }
      } catch (err) {
        console.warn('Geocoding search failed:', err);
      } finally {
        setIsSearchingGeocode(false);
      }
    }, 400);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchQuery]);

  const handleActivateGps = () => {
    setIsActivatingGps(true);
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsGpsActive(true);
          setIsActivatingGps(false);
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setSelectedLocation({
            name: 'Lokasi Terkini Anda',
            address: `Koordinat GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
            lat: lat,
            lng: lng,
            regency: 'Jawa Barat',
          });
          setSearchQuery('');
          setViewTab('map');
        },
        () => {
          setIsGpsActive(false);
          setIsActivatingGps(false);
          alert('GPS tidak dapat diakses atau timeout. Anda tetap dapat memilih titik langsung dari peta atau mengetik alamat di pencarian.');
        },
        { timeout: 7000, enableHighAccuracy: false }
      );
    } else {
      setTimeout(() => {
        setIsGpsActive(false);
        setIsActivatingGps(false);
        alert('Perangkat tidak mendukung geolokasi GPS. Silakan tentukan lokasi titik awal Anda melalui peta Jawa Barat atau form pencarian.');
      }, 500);
    }
  };

  const handleDeactivateGps = () => {
    setIsGpsActive(false);
    setSelectedLocation(null);
    setSearchQuery('');
  };

  const handleSelectSearchResult = (result: GeocodedResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const cleanName = result.display_name.split(',')[0].trim();

    setSelectedLocation({
      name: cleanName,
      address: result.display_name,
      lat: lat,
      lng: lng,
      regency: 'Jawa Barat',
    });
    setSearchQuery(cleanName);
    setShowSearchDropdown(false);
    setViewTab('map');
  };

  const handleSelectCoordsFromMap = (lat: number, lng: number, placeName?: string) => {
    const name = placeName || `Titik Peta (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    setSelectedLocation({
      name: name,
      address: `Titik koordinat di Jawa Barat: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      lat: lat,
      lng: lng,
      regency: 'Jawa Barat',
    });
    setSearchQuery(name);
  };

  const handleToggleDeviceNotification = async (checked: boolean) => {
    setEnableDeviceNotification(checked);
    if (!checked) return;

    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        setNotifFeedbackMsg('Pengingat HP aktif! Notifikasi akan muncul saat H-1 dan Hari-H.');
        setTimeout(() => setNotifFeedbackMsg(null), 3500);
      } else if (Notification.permission !== 'denied') {
        const perm = await Notification.requestPermission();
        setNotifPermissionStatus(perm);
        if (perm === 'granted') {
          setNotifFeedbackMsg('Izin notifikasi disetujui! Pengingat akan muncul di HP Anda.');
          setTimeout(() => setNotifFeedbackMsg(null), 3500);
          try {
            new Notification('JabarPleasure', {
              body: 'Pengingat perjalanan berhasil diaktifkan untuk petualangan Anda!',
              icon: '/icons/icon-192x192.png',
            });
          } catch {
            // ignore
          }
        } else {
          setNotifFeedbackMsg('Izin notifikasi tidak diberikan. Pengingat hanya akan tersimpan di dalam aplikasi.');
          setTimeout(() => setNotifFeedbackMsg(null), 3500);
        }
      } else {
        setNotifFeedbackMsg('Izin notifikasi diblokir di peramban ini. Anda tetap menerima notifikasi di tab Bantuan.');
        setTimeout(() => setNotifFeedbackMsg(null), 3500);
      }
    }
  };

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

  const handleNextStep = () => {
    if (!selectedLocation) {
      if (searchQuery.trim()) {
        const customLoc = {
          name: searchQuery.trim(),
          address: `Lokasi manual di Jawa Barat (${searchQuery.trim()})`,
          lat: -6.9175,
          lng: 107.6191,
          regency: 'Jawa Barat',
          isGps: false,
          startDate: departureDate || undefined,
        };
        onNext?.(customLoc);
        return;
      }
      alert('Silakan tentukan titik awal keberangkatan Anda terlebih dahulu (ketuk pada peta, gunakan GPS, atau pilih lokasi).');
      return;
    }

    onNext?.({
      ...selectedLocation,
      isGps: isGpsActive,
      startDate: departureDate || undefined,
    });
  };

  const currentCenter: [number, number] = selectedLocation?.lat && selectedLocation?.lng
    ? [selectedLocation.lat, selectedLocation.lng]
    : isGpsActive
    ? [-6.595, 106.7972]
    : [-6.9175, 107.6191]; // Bandung default

  const todayStr = new Date().toISOString().split('T')[0];

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
            aria-label="Kembali ke Rencana"
            className="p-1 -ml-1 text-gray-700 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors mt-0.5 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-lg font-semibold text-gray-900 tracking-tight">
              Titik keberangkatan
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {isGpsActive
                ? 'Dari mana petualanganmu dimulai?'
                : 'Pilih lokasi lewat peta atau ketik alamat di Jawa Barat'}
            </p>
          </div>

          {/* Quick toggle to test both states directly */}
          <button
            type="button"
            onClick={() => (isGpsActive ? handleDeactivateGps() : handleActivateGps())}
            className="text-[10px] text-gray-500 hover:text-[#4941EC] flex items-center gap-1 font-medium bg-white px-2.5 py-1 rounded-full border border-gray-200 shadow-2xs cursor-pointer shrink-0 mt-0.5"
            title="Klik untuk beralih mode GPS Aktif / Nonaktif"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>GPS: {isGpsActive ? 'Aktif' : 'Nonaktif'}</span>
          </button>
        </div>

        {/* Step Wizard Bar (3 steps: Keberangkatan, Destinasi, Ringkasan) */}
        <div className="flex flex-col gap-1.5 mb-3.5 select-none">
          <div className="grid grid-cols-3 gap-2">
            <div className="h-1 bg-[#4941EC] rounded-full transition-all" />
            <div className="h-1 bg-[#E0E7FF] rounded-full transition-all" />
            <div className="h-1 bg-[#E0E7FF] rounded-full transition-all" />
          </div>
          <div className="grid grid-cols-3 text-center">
            <span className="text-xs font-semibold text-[#4941EC]">
              Keberangkatan
            </span>
            <span className="text-xs font-medium text-gray-400">
              Destinasi
            </span>
            <span className="text-xs font-medium text-gray-400">
              Ringkasan
            </span>
          </div>
        </div>

        {/* Realtime Search Input Box */}
        <div className="relative mb-3">
          <div className="relative flex items-center bg-white rounded-xl border border-gray-200 px-3.5 py-2.5 shadow-2xs focus-within:border-[#4941EC] focus-within:ring-2 focus-within:ring-[#4941EC]/15 transition-all">
            {isSearchingGeocode ? (
              <Loader2 className="w-4 h-4 text-[#4941EC] animate-spin mr-2.5 shrink-0" />
            ) : (
              <Search className="w-4 h-4 text-gray-400 mr-2.5 shrink-0" />
            )}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                setSearchQuery(val);
                if (!val.trim() || val.length < 3) {
                  setSearchResults([]);
                  setShowSearchDropdown(false);
                }
              }}
              placeholder="Cari alamat, gedung, atau titik di Jawa Barat..."
              className="w-full bg-transparent text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setShowSearchDropdown(false);
                }}
                className="text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer ml-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Autocomplete Search Dropdown */}
          {showSearchDropdown && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden z-30 divide-y divide-gray-50 max-h-56 overflow-y-auto animate-in fade-in">
              {searchResults.map((res) => (
                <button
                  key={res.place_id}
                  type="button"
                  onClick={() => handleSelectSearchResult(res)}
                  className="w-full p-3 text-left hover:bg-[#EEF2FF]/60 transition-colors flex items-start gap-2.5 cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-[#4941EC] shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">
                      {res.display_name.split(',')[0]}
                    </p>
                    <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">
                      {res.display_name}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View Switcher: Interactive Map vs Hubs List */}
        <div className="flex items-center gap-2 mb-3 select-none">
          <button
            type="button"
            onClick={() => setViewTab('map')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              viewTab === 'map'
                ? 'bg-[#4941EC] text-white shadow-xs'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Peta Interaktif Jabar</span>
          </button>
          <button
            type="button"
            onClick={() => setViewTab('hubs')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              viewTab === 'hubs'
                ? 'bg-[#4941EC] text-white shadow-xs'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Titik Populer</span>
          </button>
        </div>

        {/* TAB 1: PETA INTERAKTIF LEAFLET (DENGAN BOUNDING BOX JAWA BARAT) */}
        {viewTab === 'map' && (
          <div className="mb-3.5 animate-in fade-in duration-200">
            <DepartureMapPicker
              initialCenter={currentCenter}
              selectedCoords={selectedLocation?.lat && selectedLocation?.lng ? [selectedLocation.lat, selectedLocation.lng] : null}
              onSelectCoords={handleSelectCoordsFromMap}
              isGpsActive={isGpsActive}
            />
          </div>
        )}

        {/* TAB 2: DAFTAR TITIK POPULER JAWA BARAT */}
        {viewTab === 'hubs' && (
          <div className="mb-3.5 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs divide-y divide-gray-100 overflow-hidden">
              {POPULAR_JABAR_HUBS.map((hub) => (
                <button
                  key={hub.name}
                  type="button"
                  onClick={() => {
                    setSelectedLocation(hub);
                    setSearchQuery(hub.name);
                    setViewTab('map');
                  }}
                  className="w-full p-3 flex items-center justify-between hover:bg-gray-50/80 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#E6F8F0] text-[#10B981] flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">
                        {hub.name}
                      </p>
                      <p className="text-[10px] text-gray-500 truncate">
                        {hub.address}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selected Location Card Display */}
        {selectedLocation && (
          <div className="bg-white rounded-2xl p-3.5 border-2 border-[#4941EC] shadow-sm flex flex-col gap-2 mb-3.5 transition-all">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#10B981] flex items-center justify-center shrink-0 text-sm">
                  🏁
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-900">
                    {selectedLocation.name}
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed line-clamp-2">
                    {selectedLocation.address}
                  </p>
                </div>
              </div>
              <CheckCircle2 className="w-5 h-5 text-[#4941EC] fill-[#4941EC]/15 stroke-[2.2] shrink-0" />
            </div>

            <div className="flex items-center justify-between pl-10.5 pt-1 border-t border-gray-50">
              <span className="bg-[#E6F8F0] text-[#059669] text-[10px] font-semibold px-2 py-0.5 rounded-md inline-block">
                {isGpsActive ? 'Lokasi GPS terdeteksi' : 'Titik awal terpilih'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedLocation(null);
                  setSearchQuery('');
                }}
                className="text-[11px] text-gray-400 hover:text-red-500 font-medium cursor-pointer"
              >
                Ganti titik
              </button>
            </div>
          </div>
        )}

        {/* GPS Inactive Alert (If GPS is off, guide user that they can still proceed) */}
        {!isGpsActive && !selectedLocation && (
          <div className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-2xs mb-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900">GPS sedang nonaktif</p>
                <p className="text-[10px] text-gray-500">Ketuk peta untuk menentukan titik awal.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleActivateGps}
              disabled={isActivatingGps}
              className="px-3 py-1.5 rounded-xl border border-[#4941EC] text-[#4941EC] hover:bg-[#EEF2FF] text-[11px] font-semibold transition-colors cursor-pointer shrink-0"
            >
              {isActivatingGps ? 'Mendeteksi...' : 'Aktifkan GPS'}
            </button>
          </div>
        )}

        {/* Optional Departure Date & Real Device Reminder Section */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs mb-3.5 space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#4941EC] shrink-0" />
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900">
              Tanggal Rencana Keberangkatan (Opsional)
            </h3>
          </div>

          <p className="text-[11px] text-gray-500 leading-relaxed">
            Jika merencanakan di masa depan, sistem dapat mengirimkan pengingat H-1 dan Hari-H langsung ke perangkat Anda.
          </p>

          <input
            type="date"
            min={todayStr}
            value={departureDate}
            onChange={(e) => {
              setDepartureDate(e.target.value);
              if (e.target.value && notifPermissionStatus === 'default') {
                handleToggleDeviceNotification(true);
              }
            }}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-[#4941EC] text-xs font-medium text-gray-900 cursor-pointer"
          />

          {departureDate && (
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <label htmlFor="device-notif-toggle" className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                <Bell className="w-3.5 h-3.5 text-[#4941EC]" />
                <span>Kirim pengingat H-1 & Hari-H ke HP</span>
              </label>
              <input
                id="device-notif-toggle"
                type="checkbox"
                checked={enableDeviceNotification}
                onChange={(e) => handleToggleDeviceNotification(e.target.checked)}
                className="w-4 h-4 accent-[#4941EC] rounded cursor-pointer"
              />
            </div>
          )}

          {notifFeedbackMsg && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{notifFeedbackMsg}</span>
            </div>
          )}
        </div>

        {/* 3. Bottom CTA Button: Lanjut pilih destinasi */}
        <button
          type="button"
          onClick={handleNextStep}
          disabled={!selectedLocation && !searchQuery.trim()}
          className={`w-full py-3.5 bg-[#4941EC] hover:bg-[#3D35D9] active:scale-[0.99] text-white font-semibold text-sm rounded-xl flex items-center justify-center shadow-md shadow-[#4941EC]/25 transition-all cursor-pointer ${
            !selectedLocation && !searchQuery.trim() ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <span>Lanjut pilih destinasi</span>
        </button>
      </main>

      {/* 4. Fixed Bottom Navigation Bar with Rencana active */}
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
