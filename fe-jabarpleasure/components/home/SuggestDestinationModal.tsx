'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  X,
  Upload,
  CheckCircle2,
  MapPin,
  Link2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { getCategories, ApiCategory } from '@/lib/api';

interface SuggestDestinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userCoords?: { lat: number; lng: number } | null;
  onSuccess?: (destinationName: string) => void;
}

const DEFAULT_CATEGORIES = [
  'Wisata Alam & Terbuka',
  'Modern & Lifestyle',
  'Publik & Edukasi',
  'Rekreasi Keluarga',
  'Kuliner & Hiburan',
];

export default function SuggestDestinationModal({
  isOpen,
  onClose,
  userCoords,
  onSuccess,
}: SuggestDestinationModalProps) {
  // Form State
  const [destinationName, setDestinationName] = useState('');
  const [categoryList, setCategoryList] = useState<string[]>(DEFAULT_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<string>(DEFAULT_CATEGORIES[0]);
  const [locationMethod, setLocationMethod] = useState<'gps' | 'gmaps'>('gps');
  const [gmapsUrl, setGmapsUrl] = useState('');

  // GPS state - manual coords override if user explicitly refreshes
  const [manualCoords, setManualCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isRefreshingGps, setIsRefreshingGps] = useState(false);

  // Status & Validation
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  const categoryScrollRef = useRef<HTMLDivElement>(null);

  // Active coordinates: prioritizes manual refreshed coords, then userCoords prop, then fallback
  const activeLat = manualCoords?.lat ?? userCoords?.lat ?? -6.9175;
  const activeLng = manualCoords?.lng ?? userCoords?.lng ?? 107.6191;

  // Fetch categories from API on load
  useEffect(() => {
    let isMounted = true;
    getCategories()
      .then((items: ApiCategory[]) => {
        if (isMounted && items && items.length > 0) {
          const names = items.map((c) => c.name).filter((name) => name !== 'Semua');
          if (names.length > 0) {
            setCategoryList(names);
            setSelectedCategory(names[0]);
          }
        }
      })
      .catch((err) => {
        console.warn('Could not load categories in suggest modal:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Function to refresh GPS position
  const handleRefreshGps = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      setIsRefreshingGps(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setManualCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setIsRefreshingGps(false);
        },
        (err) => {
          console.warn('GPS refresh failed:', err.message);
          setIsRefreshingGps(false);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }
  };

  // Horizontal scroll controls for categories
  const handleScrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = direction === 'left' ? -140 : 140;
      categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = destinationName.trim();
    if (!trimmedName) {
      setErrorMessage('Mohon ketik nama tempat hiburan/wisata terlebih dahulu.');
      return;
    }

    if (locationMethod === 'gmaps') {
      const trimmedUrl = gmapsUrl.trim();
      if (!trimmedUrl) {
        setErrorMessage('Mohon masukkan tautan (link) Google Maps lokasi destinasi.');
        return;
      }
      if (!trimmedUrl.includes('maps') && !trimmedUrl.includes('goo.gl')) {
        setErrorMessage('Format link Google Maps tidak valid. Contoh: https://maps.app.goo.gl/xxxxxx');
        return;
      }
    }

    setIsSubmitting(true);

    // Save to localStorage so data is client-persisted
    try {
      const existing = JSON.parse(
        localStorage.getItem('jabarpleasure_user_suggested_destinations') || '[]'
      );
      const newSubmission = {
        id: Date.now(),
        name: trimmedName,
        category: selectedCategory,
        locationMethod,
        coordinates: locationMethod === 'gps' ? { lat: activeLat, lng: activeLng } : null,
        gmapsUrl: locationMethod === 'gmaps' ? gmapsUrl.trim() : null,
        status: 'pending_review',
        submittedAt: new Date().toISOString(),
      };
      existing.unshift(newSubmission);
      localStorage.setItem(
        'jabarpleasure_user_suggested_destinations',
        JSON.stringify(existing)
      );
    } catch (err) {
      console.warn('Could not persist submission to localStorage:', err);
    }

    // Simulate swift submission feedback
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmittedSuccess(true);
      onSuccess?.(trimmedName);
    }, 600);
  };

  const handleModalClose = () => {
    setDestinationName('');
    setGmapsUrl('');
    setErrorMessage(null);
    setIsSubmittedSuccess(false);
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs transition-opacity duration-300 p-0 sm:p-4">
      {/* Click outside backdrop to dismiss */}
      <div
        className="absolute inset-0"
        onClick={handleModalClose}
        aria-hidden="true"
      />

      {/* Modal / Bottom Sheet Container */}
      <div className="relative w-full max-w-[480px] bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl p-5 sm:p-6 z-10 animate-in slide-in-from-bottom duration-300 max-h-[92vh] flex flex-col overflow-hidden border border-gray-100">
        {/* Handle Bar Indicator (Mobile only) */}
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-3 sm:hidden shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
              Form Ajukan Destinasi Baru
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Bantu kembangkan titik wisata Jawa Barat yang belum terdaftar
            </p>
          </div>
          <button
            type="button"
            onClick={handleModalClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Tutup formulir"
          >
            <X className="w-4 h-4 stroke-[2]" />
          </button>
        </div>

        {/* Success Feedback View */}
        {isSubmittedSuccess ? (
          <div className="py-8 px-2 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-[#60CE9F]/15 text-[#60CE9F] flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 stroke-[2.2]" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">
              Pengajuan Lokasi Berhasil!
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-2 max-w-[320px] leading-relaxed">
              Terima kasih! Rekomendasi destinasi{' '}
              <strong className="text-gray-900">&ldquo;{destinationName}&rdquo;</strong> telah berhasil
              kami terima dan akan ditinjau oleh tim kurator sebelum dirilis ke peta JabarPleasure.
            </p>

            <button
              type="button"
              onClick={handleModalClose}
              className="mt-6 w-full h-12 bg-[#4941EC] hover:bg-[#3C35C7] text-white text-sm font-semibold rounded-xl shadow-[0_4px_12px_rgba(73,65,236,0.25)] transition-all active:scale-[0.98] cursor-pointer"
            >
              Selesai
            </button>
          </div>
        ) : (
          /* Form Content */
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar pt-4 pb-2 space-y-4">
            {/* Error Banner */}
            {errorMessage && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Field 1: Nama Tempat Hiburan/Wisata */}
            <div className="space-y-1.5">
              <label
                htmlFor="destination-name"
                className="block text-xs font-bold text-gray-900 tracking-tight"
              >
                Nama Tempat Hiburan/Wisata:
              </label>
              <input
                id="destination-name"
                type="text"
                value={destinationName}
                onChange={(e) => setDestinationName(e.target.value)}
                placeholder="Ketik nama lokasi destinasi..."
                className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-gray-50/70 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-[#4941EC] focus:ring-2 focus:ring-[#4941EC]/20 transition-all"
                autoFocus
              />
            </div>

            {/* Field 2: Kategori Destinasi (Horizontal Carousel) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-gray-900 tracking-tight">
                  Kategori Destinasi:
                </label>
                {/* Scroll arrows navigation */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleScrollCategories('left')}
                    className="p-1 text-gray-400 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                    aria-label="Geser kategori ke kiri"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScrollCategories('right')}
                    className="p-1 text-gray-400 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                    aria-label="Geser kategori ke kanan"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable category pills matching wireframe (^ Wisata Alam ... Modern/Lifestyle Edukasi ^) */}
              <div
                ref={categoryScrollRef}
                className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 select-none"
              >
                {categoryList.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all active:scale-95 cursor-pointer shrink-0 border ${
                        isSelected
                          ? 'bg-[#4941EC] text-white border-[#4941EC] shadow-[0_2px_8px_rgba(73,65,236,0.3)]'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Field 3: Penentuan Lokasi Destinasi (GPS vs Google Maps) */}
            <div className="space-y-2.5 pt-1">
              <label className="block text-xs font-bold text-gray-900 tracking-tight">
                Penentuan Lokasi Destinasi:
              </label>

              {/* Option 1: Gunakan Titik Koordinat Ini (Realtime GPS) */}
              <div
                onClick={() => setLocationMethod('gps')}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  locationMethod === 'gps'
                    ? 'border-[#4941EC] bg-[#EEF0FF]/40 ring-1 ring-[#4941EC]/30'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <input
                    type="radio"
                    id="loc-gps"
                    name="locationMethod"
                    checked={locationMethod === 'gps'}
                    onChange={() => setLocationMethod('gps')}
                    className="mt-0.5 text-[#4941EC] focus:ring-[#4941EC] cursor-pointer"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="loc-gps"
                      className="text-xs font-bold text-gray-900 cursor-pointer block"
                    >
                      Gunakan Titik Koordinat Ini (Realtime GPS)
                    </label>

                    {/* Coordinates Subtext matching wireframe */}
                    <div className="flex items-center justify-between mt-1 text-[11px] text-gray-600">
                      <span className="flex items-center gap-1 font-mono text-gray-700">
                        <MapPin className="w-3.5 h-3.5 text-[#4941EC] shrink-0" />
                        Lat: {activeLat.toFixed(4)}, Long: {activeLng.toFixed(4)} (Akurasi Presisi)
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRefreshGps();
                        }}
                        disabled={isRefreshingGps}
                        className="text-[10px] font-semibold text-[#4941EC] hover:underline flex items-center gap-1 cursor-pointer"
                        title="Deteksi ulang lokasi perangkat"
                      >
                        <RefreshCw
                          className={`w-3 h-3 ${isRefreshingGps ? 'animate-spin' : ''}`}
                        />
                        <span>{isRefreshingGps ? 'Mendeteksi...' : 'Perbarui'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Option 2: Masukkan Link Google Maps */}
              <div
                onClick={() => setLocationMethod('gmaps')}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  locationMethod === 'gmaps'
                    ? 'border-[#4941EC] bg-[#EEF0FF]/40 ring-1 ring-[#4941EC]/30'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <input
                    type="radio"
                    id="loc-gmaps"
                    name="locationMethod"
                    checked={locationMethod === 'gmaps'}
                    onChange={() => setLocationMethod('gmaps')}
                    className="mt-0.5 text-[#4941EC] focus:ring-[#4941EC] cursor-pointer"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="loc-gmaps"
                      className="text-xs font-bold text-gray-900 cursor-pointer block"
                    >
                      Masukkan Link Google Maps
                    </label>

                    {/* Link Input Box */}
                    <div className="mt-2 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Link2 className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="url"
                        value={gmapsUrl}
                        onChange={(e) => {
                          setGmapsUrl(e.target.value);
                          if (locationMethod !== 'gmaps') setLocationMethod('gmaps');
                        }}
                        placeholder="https://maps.app.goo.gl/xxxxxx"
                        className="w-full h-10 pl-8 pr-3 rounded-lg border border-gray-200 bg-white text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#4941EC] focus:ring-1 focus:ring-[#4941EC]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons: Kirim Pengajuan Lokasi & Batal */}
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-[#4941EC] hover:bg-[#3C35C7] text-white text-xs sm:text-sm font-bold rounded-xl shadow-[0_4px_12px_rgba(73,65,236,0.25)] transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                <Upload className="w-4 h-4 stroke-[2.2]" />
                <span>{isSubmitting ? 'Mengirim Pengajuan...' : 'Kirim Pengajuan Lokasi'}</span>
              </button>

              <button
                type="button"
                onClick={handleModalClose}
                className="w-full h-11 bg-white hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-semibold rounded-xl border border-gray-200 transition-colors cursor-pointer"
              >
                Batal
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
