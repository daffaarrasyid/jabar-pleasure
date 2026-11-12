'use client';

import React, { useState, useRef } from 'react';
import { X, Camera, User, Phone, MapPin, Mail, Loader2, Check } from 'lucide-react';
import { UserProfileData } from './ProfileScreen';
import { getAuthToken } from '@/lib/auth';

interface EditProfileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserProfileData | null;
  onSuccess: (updatedUser: UserProfileData) => void;
  onErrorToast?: (msg: string) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop&crop=face',
];

const JABAR_CITIES = [
  'Bandung, Jawa Barat',
  'Bogor, Jawa Barat',
  'Bekasi, Jawa Barat',
  'Depok, Jawa Barat',
  'Cimahi, Jawa Barat',
  'Cirebon, Jawa Barat',
  'Sukabumi, Jawa Barat',
  'Tasikmalaya, Jawa Barat',
  'Garut, Jawa Barat',
  'Kuningan, Jawa Barat',
  'Pangandaran, Jawa Barat',
  'Subang, Jawa Barat',
  'Purwakarta, Jawa Barat',
  'Sumedang, Jawa Barat',
  'Karawang, Jawa Barat',
  'Majalengka, Jawa Barat',
  'Cianjur, Jawa Barat',
  'Indramayu, Jawa Barat',
  'Ciamis, Jawa Barat',
  'Banjar, Jawa Barat',
];

export default function EditProfileBottomSheet({
  isOpen,
  onClose,
  user,
  onSuccess,
  onErrorToast,
}: EditProfileBottomSheetProps) {
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone && user?.phone !== '-' ? user.phone : '');
  const [city, setCity] = useState(user?.city || 'Bandung, Jawa Barat');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatar_url || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.avatar_url || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Constraint: Max 2MB for photo (PRD & Security requirement)
    if (file.size > 2 * 1024 * 1024) {
      const msg = 'Ukuran file foto melebihi batas 2 MB. Proses unggah ditolak.';
      e.target.value = '';
      setErrorMsg(msg);
      onErrorToast?.(msg);
      if (typeof window !== 'undefined') {
        window.alert(msg);
      }
      return;
    }

    if (!file.type.startsWith('image/')) {
      const msg = 'Format file harus berupa gambar (JPG, PNG, atau WebP).';
      e.target.value = '';
      setErrorMsg(msg);
      onErrorToast?.(msg);
      return;
    }

    setErrorMsg(null);
    setAvatarFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleSelectPresetAvatar = (url: string) => {
    setAvatarFile(null);
    setAvatarUrl(url);
    setPreviewUrl(url);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Nama lengkap tidak boleh kosong.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const token = getAuthToken();

    try {
      let updatedData: UserProfileData | null = null;

      if (avatarFile) {
        // Send multipart form data
        const formData = new FormData();
        formData.append('name', name.trim());
        formData.append('phone', phone.trim());
        formData.append('city', city.trim());
        formData.append('avatar', avatarFile);

        const res = await fetch('/api/user/profile', {
          method: 'POST',
          headers: {
            'X-HTTP-Method-Override': 'PUT',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const msg = errData.message || 'Gagal memperbarui profil dengan foto.';
          if (res.status === 413 && typeof window !== 'undefined') {
            window.alert(msg);
          }
          throw new Error(msg);
        }

        const json = await res.json();
        updatedData = json.data;
      } else {
        // Send JSON data
        const payload: Record<string, unknown> = {
          name: name.trim(),
          phone: phone.trim(),
          city: city.trim(),
        };
        if (avatarUrl !== undefined) {
          payload.avatar_url = avatarUrl;
        }

        const res = await fetch('/api/user/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'Gagal memperbarui profil.');
        }

        const json = await res.json();
        updatedData = json.data;
      }

      if (!updatedData) {
        // Fallback construct if backend returned simple success
        updatedData = {
          ...user,
          name: name.trim(),
          phone: phone.trim(),
          city: city.trim(),
          avatar_url: previewUrl || avatarUrl,
        };
      }

      // Synchronize client cache
      try {
        const cached = localStorage.getItem('user');
        const parsed = cached ? JSON.parse(cached) : {};
        localStorage.setItem(
          'user',
          JSON.stringify({
            ...parsed,
            ...updatedData,
          })
        );
      } catch (err) {
        console.warn('LocalStorage error:', err);
      }

      onSuccess(updatedData);
      onClose();
    } catch (err: unknown) {
      console.error('Update profile error:', err);
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan profil.';
      setErrorMsg(msg);
      onErrorToast?.(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayInitials = (name.trim() || 'U')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      {/* Backdrop click to dismiss */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* Bottom Sheet Container */}
      <div className="relative w-full max-w-[480px] bg-white rounded-t-3xl shadow-2xl z-10 flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Drag Pill Handle */}
        <div className="pt-3 pb-1 flex justify-center shrink-0">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div>
            <h2 id="edit-profile-title" className="text-base font-bold text-gray-900">
              Edit Informasi Profil
            </h2>
            <p className="text-xs text-gray-500">
              Perbarui foto dan identitas akun Anda
            </p>
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

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
              {errorMsg}
            </div>
          )}

          {/* Photo Avatar Section */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-[#EEF2FF] border-2 border-[#4941EC]/30 flex items-center justify-center shadow-md">
                {previewUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={previewUrl}
                    alt="Preview Foto Profil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-[#4941EC]">
                    {displayInitials}
                  </span>
                )}
              </div>

              {/* Upload trigger button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Ganti Foto Profil"
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#4941EC] hover:bg-indigo-700 text-white flex items-center justify-center shadow-md cursor-pointer transition-transform active:scale-90"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 text-xs font-semibold text-[#4941EC] hover:underline cursor-pointer"
            >
              Unggah Foto Baru (Maks 2MB)
            </button>

            {/* Avatar presets quick pick */}
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[11px] text-gray-400">Atau pilih avatar:</span>
              <div className="flex items-center gap-1.5">
                {PRESET_AVATARS.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectPresetAvatar(url)}
                    className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-transform cursor-pointer hover:scale-105 ${
                      previewUrl === url
                        ? 'border-[#4941EC] ring-2 ring-[#4941EC]/30 scale-105'
                        : 'border-transparent'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Avatar ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Input: Nama Lengkap */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama lengkap Anda..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#4941EC] focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Input: Email (Disabled) */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Alamat Email <span className="text-gray-400 font-normal">(Tidak dapat diubah)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                disabled
                value={user?.email || '-'}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-xs text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Input: Nomor Telepon */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Nomor Telepon
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#4941EC] focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Input: Domisili / Kota */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Kota Domisili (Jawa Barat)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <MapPin className="w-4 h-4" />
              </div>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#4941EC] focus:bg-white transition-colors cursor-pointer appearance-none"
              >
                {JABAR_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 pb-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
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
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

