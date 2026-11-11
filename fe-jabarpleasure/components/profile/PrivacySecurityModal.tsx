'use client';

import React, { useState } from 'react';
import {
  X,
  Shield,
  KeyRound,
  Eye,
  EyeOff,
  MapPin,
  CheckCircle2,
  Lock,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { getAuthToken } from '@/lib/auth';

interface PrivacySecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast?: (msg: string) => void;
}

export default function PrivacySecurityModal({
  isOpen,
  onClose,
  onSuccessToast,
}: PrivacySecurityModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // GPS Permission state
  const [gpsStatus, setGpsStatus] = useState<string>('Diizinkan (Presisi Tinggi)');
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>({
    lat: -6.9175,
    lng: 107.6191,
  });
  const [isCheckingGps, setIsCheckingGps] = useState(false);

  if (!isOpen) return null;

  const handleTestGps = () => {
    setIsCheckingGps(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsCoords({
            lat: Number(pos.coords.latitude.toFixed(4)),
            lng: Number(pos.coords.longitude.toFixed(4)),
          });
          setGpsStatus('Diizinkan (Presisi Tinggi)');
          setIsCheckingGps(false);
        },
        () => {
          setGpsStatus('Izin Lokasi Terbatas');
          setIsCheckingGps(false);
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    } else {
      setGpsStatus('Browser tidak mendukung Geolocation');
      setIsCheckingGps(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!currentPassword) {
      setErrorMsg('Masukkan kata sandi saat ini.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Kata sandi baru minimal 6 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi baru tidak cocok.');
      return;
    }

    setIsSubmitting(true);
    const token = getAuthToken();

    try {
      const res = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          new_password_confirmation: confirmPassword,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json.message || 'Gagal mengubah kata sandi.');
      }

      setSuccessMsg('Kata sandi Anda berhasil diperbarui!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onSuccessToast?.('Kata sandi berhasil diperbarui.');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat mengubah kata sandi.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-security-title"
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
              <Shield className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h2 id="privacy-security-title" className="text-base font-bold text-gray-900 leading-tight">
                Privasi dan Keamanan
              </h2>
              <p className="text-xs text-gray-500">
                Kelola kata sandi akun dan izin data geolokasi
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
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Section 1: Ubah Kata Sandi */}
          <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
            <div className="flex items-center gap-2 pb-1 border-b border-gray-100">
              <KeyRound className="w-4 h-4 text-[#4941EC]" />
              <h3 className="text-xs font-bold text-gray-900">
                Ubah Kata Sandi
              </h3>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Current Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Kata Sandi Saat Ini
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Ketik kata sandi saat ini..."
                  className="w-full pl-3.5 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#4941EC] focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Kata Sandi Baru
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter..."
                  className="w-full pl-3.5 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#4941EC] focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Konfirmasi Kata Sandi Baru
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru..."
                  className="w-full pl-3.5 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#4941EC] focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-[#4941EC] hover:bg-indigo-700 text-white text-xs font-bold shadow-sm active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-70 mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Memperbarui Sandi...</span>
                </>
              ) : (
                <span>Simpan Kata Sandi Baru</span>
              )}
            </button>
          </form>

          {/* Section 2: Izin Lokasi & GPS */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-gray-100">
              <MapPin className="w-4 h-4 text-[#4941EC]" />
              <h3 className="text-xs font-bold text-gray-900">
                Izin Akses Lokasi (GPS)
              </h3>
            </div>

            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 font-medium">Status Sensor GPS:</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  {gpsStatus}
                </span>
              </div>

              {gpsCoords && (
                <div className="text-[11px] text-gray-500 bg-white p-2.5 rounded-xl border border-gray-100 font-mono">
                  Koordinat: {gpsCoords.lat}, {gpsCoords.lng}
                </div>
              )}

              <p className="text-[11px] text-gray-400 leading-relaxed">
                JabarPleasure memerlukan akses koordinat geolokasi perangkat untuk fitur Spatial Radar, radius jarak terdekat, serta check-in rute perjalanan.
              </p>

              <button
                type="button"
                onClick={handleTestGps}
                disabled={isCheckingGps}
                className="w-full py-2 px-3 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCheckingGps ? 'animate-spin' : ''}`} />
                <span>Uji Status GPS Perangkat</span>
              </button>
            </div>
          </div>

          {/* Section 3: Keamanan Data */}
          <div className="p-3.5 bg-[#EEF2FF]/60 rounded-2xl border border-[#4941EC]/20 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#4941EC] text-white flex items-center justify-center shrink-0 mt-0.5">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900">
                Perlindungan Data & Enkripsi
              </h4>
              <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                Seluruh data akun, token autentikasi Sanctum, dan riwayat media jurnal dienkripsi secara aman sesuai standar perlindungan privasi pengguna.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex justify-end shrink-0 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold active:scale-[0.98] transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

