'use client';

import React, { useState } from 'react';
import { Compass, X, Locate, ChevronRight, MapPin } from 'lucide-react';

export const JABAR_PRESET_CITIES = [
  { name: 'Kota Bandung', lat: -6.9175, lng: 107.6191 },
  { name: 'Kota Bogor', lat: -6.595, lng: 106.7972 },
  { name: 'Lembang', lat: -6.8166, lng: 107.6166 },
  { name: 'Kota Cirebon', lat: -6.732, lng: 108.5523 },
  { name: 'Sukabumi', lat: -6.9277, lng: 106.93 },
  { name: 'Kota Bekasi', lat: -6.2383, lng: 106.9756 },
  { name: 'Garut', lat: -7.2278, lng: 107.9087 },
  { name: 'Depok', lat: -6.4025, lng: 106.7942 },
];

export interface LocationReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationMode: 'gps' | 'manual';
  activeLocationName: string;
  onSelectGps: () => void;
  onSelectPresetCity: (city: { name: string; lat: number; lng: number }) => void;
  onManualAddressSubmit: (address: string) => Promise<boolean | void> | void;
  isGeocoding?: boolean;
}

export default function LocationReferenceModal({
  isOpen,
  onClose,
  locationMode,
  activeLocationName,
  onSelectGps,
  onSelectPresetCity,
  onManualAddressSubmit,
  isGeocoding = false,
}: LocationReferenceModalProps) {
  const [manualInput, setManualInput] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    onManualAddressSubmit(manualInput.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200 select-none">
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
            onClick={onClose}
            aria-label="Tutup modal lokasi"
            className="w-8 h-8 rounded-full hover:bg-gray-100 text-gray-400 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Pilihan 1: Gunakan Lokasi Saat Ini (GPS) */}
        <button
          type="button"
          onClick={onSelectGps}
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
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-gray-700">
            Tulis Nama Alamat / Tempat di Jawa Barat:
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Contoh: Jl. Dago, Bandung atau Lembang"
              className="w-full text-xs py-2.5 pl-3 pr-20 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#4941EC] focus:bg-white outline-none text-gray-800 placeholder-gray-400 transition-all font-normal"
            />
            <button
              type="submit"
              disabled={isGeocoding || !manualInput.trim()}
              className="absolute right-1.5 px-3 py-1.5 bg-[#4941EC] hover:bg-[#3C35C7] disabled:bg-gray-300 text-white text-xs font-semibold rounded-lg transition-all active:scale-95 cursor-pointer shadow-xs"
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
                locationMode === 'manual' && activeLocationName.includes(city.name);

              return (
                <button
                  key={city.name}
                  type="button"
                  onClick={() => onSelectPresetCity(city)}
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
  );
}

