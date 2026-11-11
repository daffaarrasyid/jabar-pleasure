'use client';

import React, { useState } from 'react';
import { X, Check, SlidersHorizontal, Loader2, Compass, Sparkles } from 'lucide-react';
import { getAuthToken } from '@/lib/auth';

interface TravelPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPreferences?: Array<{ id?: number; name?: string; slug?: string }>;
  onSuccess?: (preferences: Array<{ id?: number; name?: string; slug?: string }>) => void;
}

const CATEGORY_OPTIONS = [
  {
    id: 'wisata-alam',
    name: 'Wisata Alam & Terbuka',
    icon: '🌲',
    desc: 'Pegunungan, Curug, Kebun Teh, Danau',
  },
  {
    id: 'modern-lifestyle',
    name: 'Modern & Lifestyle',
    icon: '☕',
    desc: 'Kafe Estetik, Rooftop, Tempat Nongkrong',
  },
  {
    id: 'rekreasi-keluarga',
    name: 'Rekreasi Keluarga',
    icon: '🎡',
    desc: 'Taman Hiburan, Waterpark, Kebun Binatang',
  },
  {
    id: 'sejarah-budaya',
    name: 'Sejarah & Budaya',
    icon: '🏛️',
    desc: 'Museum, Bangunan Bersejarah, Cagar Budaya',
  },
  {
    id: 'publik-edukasi',
    name: 'Publik & Edukasi',
    icon: '📚',
    desc: 'Taman Kota, Ruang Publik Terbuka, Galeri',
  },
  {
    id: 'kuliner-belanja',
    name: 'Kuliner & Belanja',
    icon: '🍲',
    desc: 'Pusat Kuliner Khas Sunda, Oleh-oleh',
  },
];

const TRAVEL_STYLES = [
  { id: 'healing', label: 'Santai & Healing', desc: 'Tidak terburu-buru, fokus relaksasi' },
  { id: 'adventure', label: 'Petualang & Outdoor', desc: 'Jelajah alam, trekking & eksplorasi' },
  { id: 'backpacker', label: 'Hemat / Backpacker', desc: 'Ramah kantong & efisiensi budget' },
  { id: 'family', label: 'Keluarga & Nyaman', desc: 'Aman untuk anak-anak & lansia' },
];

const getInitialCategories = (prefs?: Array<{ id?: number; name?: string; slug?: string }>) => {
  if (prefs && prefs.length > 0) {
    const slugs = prefs.map((p) => p.slug || p.name || '').filter(Boolean);
    const matched = CATEGORY_OPTIONS.filter((cat) =>
      slugs.some(
        (s) =>
          s.toLowerCase().includes(cat.id.replace('-', ' ')) ||
          cat.name.toLowerCase().includes(s.toLowerCase()) ||
          s === cat.id
      )
    ).map((c) => c.id);

    if (matched.length > 0) return matched;
  }

  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem('user_travel_preferences');
      if (cached) return JSON.parse(cached);
    } catch {
      // ignore
    }
  }

  return ['wisata-alam', 'modern-lifestyle'];
};

const EMPTY_PREFERENCES: Array<{ id?: number; name?: string; slug?: string }> = [];

export default function TravelPreferencesModal({
  isOpen,
  onClose,
  currentPreferences = EMPTY_PREFERENCES,
  onSuccess,
}: TravelPreferencesModalProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() =>
    getInitialCategories(currentPreferences)
  );
  const [selectedStyle, setSelectedStyle] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('user_travel_style') || 'healing';
      } catch {
        return 'healing';
      }
    }
    return 'healing';
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleCategory = (catId: string) => {
    setErrorMsg(null);
    setSelectedCategories((prev) => {
      if (prev.includes(catId)) {
        if (prev.length <= 1) {
          setErrorMsg('Pilih minimal satu kategori minat wisata favorit Anda.');
          return prev;
        }
        return prev.filter((id) => id !== catId);
      } else {
        return [...prev, catId];
      }
    });
  };

  const handleSave = async () => {
    if (selectedCategories.length === 0) {
      setErrorMsg('Pilih minimal satu kategori wisata.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const token = getAuthToken();

    try {
      // 1. Submit to backend API /api/user/preferences
      const res = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          interests: selectedCategories,
        }),
      });

      const json = await res.json().catch(() => ({}));

      // Cache locally
      try {
        localStorage.setItem('user_travel_preferences', JSON.stringify(selectedCategories));
        localStorage.setItem('user_travel_style', selectedStyle);
      } catch (err) {
        console.warn('LocalStorage error:', err);
      }

      onSuccess?.(
        json.data?.preferences ||
          selectedCategories.map((c) => ({
            slug: c,
            name: CATEGORY_OPTIONS.find((item) => item.id === c)?.name || c,
          }))
      );
      onClose();
    } catch (err: unknown) {
      console.warn('Preferences save warning:', err);
      // Fallback cache and success
      try {
        localStorage.setItem('user_travel_preferences', JSON.stringify(selectedCategories));
        localStorage.setItem('user_travel_style', selectedStyle);
      } catch {
        // ignore
      }
      onSuccess?.(
        selectedCategories.map((c) => ({
          slug: c,
          name: CATEGORY_OPTIONS.find((item) => item.id === c)?.name || c,
        }))
      );
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="travel-prefs-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-[480px] bg-white rounded-t-3xl shadow-2xl z-10 flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Drag Pill Handle */}
        <div className="pt-3 pb-1 flex justify-center shrink-0">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EEF2FF] text-[#4941EC] flex items-center justify-center shrink-0">
              <SlidersHorizontal className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h2 id="travel-prefs-title" className="text-base font-bold text-gray-900 leading-tight">
                Preferensi Perjalanan
              </h2>
              <p className="text-xs text-gray-500">
                Pilih kategori dan gaya perjalanan favorit Anda
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
              {errorMsg}
            </div>
          )}

          {/* Section 1: Minat Kategori Wisata */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#4941EC]" />
                Kategori Wisata Favorit
              </span>
              <span className="text-[11px] text-[#4941EC] font-medium">
                {selectedCategories.length} dipilih
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {CATEGORY_OPTIONS.map((cat) => {
                const isSelected = selectedCategories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer active:scale-[0.99] ${
                      isSelected
                        ? 'border-[#4941EC] bg-[#EEF2FF]/60 shadow-xs'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl shrink-0">{cat.icon}</span>
                      <div>
                        <div className="font-semibold text-xs text-gray-900 leading-snug">
                          {cat.name}
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          {cat.desc}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-[#4941EC] text-white shadow-xs'
                          : 'border border-gray-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Gaya Perjalanan */}
          <div>
            <span className="text-xs font-bold text-gray-900 block mb-2.5 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#4941EC]" />
              Gaya Perjalanan (Travel Persona)
            </span>

            <div className="grid grid-cols-2 gap-2.5">
              {TRAVEL_STYLES.map((style) => {
                const isSelected = selectedStyle === style.id;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer active:scale-[0.98] ${
                      isSelected
                        ? 'border-[#4941EC] bg-[#EEF2FF]/70 ring-1 ring-[#4941EC]'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-semibold text-xs text-gray-900">
                      {style.label}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1 leading-tight">
                      {style.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 flex gap-3 shrink-0 bg-white">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex-1 py-3 px-4 rounded-xl bg-[#4941EC] hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Simpan Preferensi</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

