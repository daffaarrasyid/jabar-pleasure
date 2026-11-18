'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Loader2, MapPin, Tag, Building2, Coins, Clock, Image, AlignLeft } from 'lucide-react';
import { ApiCategory, ApiDestination } from '@/lib/api';

interface AdminPoiModalProps {
  isOpen: boolean;
  destination: ApiDestination | null; // null for Create, populated for Edit
  categories: ApiCategory[];
  onClose: () => void;
  onSave: (payload: any, isEdit: boolean) => Promise<void>;
  isLoading?: boolean;
}

export default function AdminPoiModal({
  isOpen,
  destination,
  categories,
  onClose,
  onSave,
  isLoading = false,
}: AdminPoiModalProps) {
  const isEdit = !!destination;

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<number>(1);
  const [regencyId, setRegencyId] = useState<number>(1);
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [latitude, setLatitude] = useState<string>('-6.9175');
  const [longitude, setLongitude] = useState<string>('107.6191');
  const [coverImage, setCoverImage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (destination) {
      setName(destination.name || '');
      setCategoryId(destination.category?.id || 1);
      setRegencyId(destination.regency?.id || 1);
      setDescription(destination.description || '');
      setAddress(destination.address || '');
      setPriceRange(destination.price_range || '');
      setOpeningHours(destination.opening_hours || '');
      setLatitude(destination.latitude ? String(destination.latitude) : '-6.9175');
      setLongitude(destination.longitude ? String(destination.longitude) : '107.6191');
      setCoverImage(destination.cover_image || destination.cover_image_url || '');
    } else {
      setName('');
      setCategoryId(categories[0]?.id || 1);
      setRegencyId(1);
      setDescription('');
      setAddress('');
      setPriceRange('Gratis / Menyesuaikan');
      setOpeningHours('08:00 - 17:00 WIB');
      setLatitude('-6.9175');
      setLongitude('107.6191');
      setCoverImage('');
    }
    setErrorMessage(null);
  }, [destination, categories, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMessage('Nama destinasi wajib diisi.');
      return;
    }

    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);

    if (isNaN(latNum) || isNaN(lngNum)) {
      setErrorMessage('Koordinat Latitude dan Longitude harus berupa angka yang valid.');
      return;
    }

    if (latNum < -9 || latNum > -5 || lngNum < 105 || lngNum > 110) {
      setErrorMessage('Koordinat berada di luar wilayah administratif Jawa Barat (Lat: -5 s/d -9, Lng: 105 s/d 110).');
      return;
    }

    const payload = {
      name: trimmedName,
      category_id: Number(categoryId),
      regency_id: Number(regencyId) || 1,
      description: description.trim() || undefined,
      address: address.trim() || undefined,
      price_range: priceRange.trim() || 'Gratis / Menyesuaikan',
      opening_hours: openingHours.trim() || 'Setiap Hari',
      latitude: latNum,
      longitude: lngNum,
      cover_image: coverImage.trim() || undefined,
    };

    try {
      await onSave(payload, isEdit);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyimpan data destinasi.');
    }
  };

  const setPresetBandung = () => {
    setLatitude('-6.9175');
    setLongitude('107.6191');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="absolute inset-0" onClick={isLoading ? undefined : onClose} aria-hidden="true" />

      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 bg-gray-50/50 shrink-0">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#4941EC] bg-[#EEF0FF] px-2 py-0.5 rounded-md">
              {isEdit ? 'Perbarui Data POI' : 'Tambah POI Baru'}
            </span>
            <h3 className="text-base font-bold text-gray-900 mt-1">
              {isEdit ? `Edit: ${destination?.name}` : 'Tambah Destinasi Wisata Baru'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 font-medium">
              {errorMessage}
            </div>
          )}

          {/* Name */}
          <div className="space-y-1.5">
            <label className="font-semibold text-gray-700 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#4941EC]" />
              Nama Destinasi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Kawah Putih Ciwidey"
              className="w-full bg-[#F6F8FB] border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#4941EC] focus:bg-white transition-all"
            />
          </div>

          {/* Category & Regency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-gray-700 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#4941EC]" />
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className="w-full bg-[#F6F8FB] border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:border-[#4941EC] focus:bg-white transition-all"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-gray-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#60CE9F]" />
                ID Wilayah Regency
              </label>
              <input
                type="number"
                value={regencyId}
                onChange={(e) => setRegencyId(Number(e.target.value))}
                className="w-full bg-[#F6F8FB] border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:border-[#4941EC] focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <label className="font-semibold text-gray-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-gray-500" />
              Alamat Lengkap
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Contoh: Jl. Raya Soreang Ciwidey Km 25, Bandung"
              className="w-full bg-[#F6F8FB] border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#4941EC] focus:bg-white transition-all"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="font-semibold text-gray-700 flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5 text-gray-500" />
              Deskripsi Wisata
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi singkat mengenai pesona dan fasilitas destinasi..."
              className="w-full bg-[#F6F8FB] border border-gray-200 rounded-xl p-3 text-xs text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#4941EC] focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Coordinates (Latitude & Longitude) */}
          <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-800 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#4941EC]" />
                Koordinat Geometri Spasial (SRID 4326) <span className="text-red-500">*</span>
              </span>
              <button
                type="button"
                onClick={setPresetBandung}
                className="text-[11px] text-[#4941EC] hover:underline cursor-pointer font-medium"
              >
                Gunakan Pusat Bandung
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-gray-500 font-medium">Latitude</label>
                <input
                  type="text"
                  required
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="-6.9175"
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono text-gray-900 outline-none focus:border-[#4941EC]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-gray-500 font-medium">Longitude</label>
                <input
                  type="text"
                  required
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="107.6191"
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono text-gray-900 outline-none focus:border-[#4941EC]"
                />
              </div>
            </div>
          </div>

          {/* Price Range & Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-gray-700 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-[#EDAD40]" />
                Rentang Harga Tiket
              </label>
              <input
                type="text"
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                placeholder="Contoh: Rp 20.000 - Rp 50.000"
                className="w-full bg-[#F6F8FB] border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#4941EC] focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-gray-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#60CE9F]" />
                Jam Operasional
              </label>
              <input
                type="text"
                value={openingHours}
                onChange={(e) => setOpeningHours(e.target.value)}
                placeholder="Contoh: 08:00 - 17:00 WIB"
                className="w-full bg-[#F6F8FB] border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#4941EC] focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Cover Image URL */}
          <div className="space-y-1.5">
            <label className="font-semibold text-gray-700 flex items-center gap-1.5">
              <Image className="w-3.5 h-3.5 text-gray-500" />
              URL Gambar Sampul (Opsional)
            </label>
            <input
              type="text"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://... atau path gambar"
              className="w-full bg-[#F6F8FB] border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#4941EC] focus:bg-white transition-all"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#4941EC] hover:bg-[#3C35C7] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
              <span>{isEdit ? 'Simpan Perubahan' : 'Terbitkan Destinasi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

