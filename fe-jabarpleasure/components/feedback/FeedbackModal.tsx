'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Star, Upload, FileText, CheckCircle2, Lock, AlertCircle, LogIn } from 'lucide-react';
import { FeedbackCategory, UserFeedback } from '@/lib/feedbackStorage';
import { isAuthenticated, getStoredUser } from '@/lib/auth';
import { submitUserFeedback } from '@/lib/api';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: FeedbackCategory;
  initialTripTitle?: string;
  defaultUserName?: string;
  defaultUserEmail?: string;
  onSuccess?: (feedback: UserFeedback) => void;
}

const CATEGORY_OPTIONS: { id: FeedbackCategory; label: string; desc: string }[] = [
  { id: 'feature', label: 'Usulan Fitur', desc: 'Ide & peningkatan baru' },
  { id: 'bug', label: 'Laporan Kendala', desc: 'Error atau bug aplikasi' },
  { id: 'question', label: 'Pertanyaan', desc: 'Bantuan atau info sistem' },
  { id: 'other', label: 'Ulasan & Pengalaman', desc: 'Review trip atau kesan' },
];

export default function FeedbackModal({
  isOpen,
  onClose,
  initialCategory = 'feature',
  initialTripTitle = '',
  defaultUserName = '@pengguna',
  defaultUserEmail = 'pengguna@jabarpleasure.id',
  onSuccess,
}: FeedbackModalProps) {
  const router = useRouter();
  const isLoggedIn = isAuthenticated();
  const [category, setCategory] = useState<FeedbackCategory>(initialCategory);
  const [userName, setUserName] = useState<string>(() => {
    const user = getStoredUser<{ name?: string }>();
    if (user?.name) {
      return user.name.startsWith('@') ? user.name : `@${user.name.toLowerCase().replace(/\s+/g, '_')}`;
    }
    return defaultUserName;
  });
  const [userEmail, setUserEmail] = useState<string>(() => {
    const user = getStoredUser<{ email?: string }>();
    return user?.email || defaultUserEmail;
  });
  const [tripTitle] = useState<string>(initialTripTitle);
  const [rating, setRating] = useState<number>(5);
  const [message, setMessage] = useState<string>('');
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);
  const [fileSizeErrorModal, setFileSizeErrorModal] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Strict Image Only validation
    if (!file.type.startsWith('image/')) {
      setFileSizeErrorModal('Tipe file tidak didukung. Sistem hanya menerima file gambar (JPG, PNG, WebP).');
      if (e.target) e.target.value = '';
      return;
    }

    // PRD constraint: Image <= 2MB
    if (file.size > 2 * 1024 * 1024) {
      setFileSizeErrorModal('Ukuran gambar melebihi batas 2MB. Sistem hanya menerima file gambar dengan ukuran di bawah 2MB.');
      if (e.target) e.target.value = '';
      return;
    }

    setErrorMsg(null);
    setAttachmentFile(file);
    setAttachmentName(file.name);
  };

  const handleRemoveAttachment = () => {
    setAttachmentFile(null);
    setAttachmentName(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMsg('Silakan tuliskan isi masukan atau ulasan Anda.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // If trip context exists, prepend to message
      let finalMessage = message.trim();
      if (tripTitle && !finalMessage.toLowerCase().includes(tripTitle.toLowerCase())) {
        finalMessage = `[Konteks: ${tripTitle}] ${finalMessage}`;
      }

      const subject = tripTitle
        ? `Ulasan: ${tripTitle}`
        : category === 'feature'
        ? 'Usulan Fitur Pengguna'
        : category === 'bug'
        ? 'Laporan Kendala Sistem'
        : category === 'question'
        ? 'Pertanyaan Pengguna'
        : 'Ulasan & Pengalaman Pengguna';

      // Submit directly to database table feedbacks via API
      await submitUserFeedback({
        category,
        subject,
        message: finalMessage,
        email: userEmail.trim() || undefined,
        name: userName.trim() || undefined,
        rating: category === 'other' || tripTitle ? rating : undefined,
        attachment: attachmentFile || undefined,
      });

      setIsSubmitting(false);
      setShowSuccessToast(true);

      if (onSuccess) {
        onSuccess({
          id: Date.now(),
          submitterName: userName.trim() || '@pengguna',
          submitterEmail: userEmail.trim() || 'pengguna@jabarpleasure.id',
          category,
          message: finalMessage,
          attachmentName: attachmentName || undefined,
          rating: category === 'other' || tripTitle ? rating : undefined,
          tripTitle: tripTitle || undefined,
          status: 'unread',
          date: new Date().toISOString(),
        });
      }

      // Auto close after brief success confirmation
      setTimeout(() => {
        onClose();
      }, 1600);
    } catch (err: unknown) {
      console.error('Failed to submit feedback to database:', err);
      setIsSubmitting(false);
      setErrorMsg('Gagal mengirimkan masukan ke server database. Silakan pastikan koneksi Anda stabil.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-[480px] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* iOS Drag Handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 pt-3 sm:pt-5 pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 tracking-tight">
              {tripTitle
                ? 'Ulas Perjalanan Anda'
                : category === 'other'
                ? 'Beri Ulasan & Masukan'
                : 'Kirim Saran & Masukan'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {tripTitle
                ? tripTitle
                : 'Suara Anda sangat berarti untuk kemajuan JabarPleasure'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Guest / Unauthenticated Prompt View */}
        {!isLoggedIn ? (
          <div className="py-8 px-5 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-3xl bg-[#EEF2FF] text-[#4941EC] flex items-center justify-center mb-4 shadow-xs">
              <Lock className="w-8 h-8 stroke-[2.2]" />
            </div>
            <h3 className="text-base font-bold text-gray-900 tracking-tight">
              Masuk untuk Memberikan Masukan
            </h3>
            <p className="text-xs text-gray-500 mt-2 mb-6 max-w-[320px] leading-relaxed">
              Fitur saran dan masukan aplikasi hanya dapat diakses oleh pengguna terdaftar JabarPleasure. Silakan masuk ke akun Anda terlebih dahulu.
            </p>
            <div className="w-full flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push('/login');
                }}
                className="w-full py-3 px-4 rounded-xl bg-[#4941EC] hover:bg-[#3D35D9] active:scale-[0.98] text-white text-xs font-bold shadow-md shadow-[#4941EC]/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk Sekarang</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-[0.98] text-gray-700 text-xs font-semibold transition-all cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        ) : (
          /* Scrollable Body */
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar px-5 py-4 space-y-4 text-left">
          {/* Success Banner */}
          {showSuccessToast && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-semibold">Masukan Berhasil Terkirim!</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Terima kasih atas partisipasi Anda membangun pariwisata Jawa Barat.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
              {errorMsg}
            </div>
          )}

          {/* Submitter Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Nama Pengirim
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="@username"
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-[#4941EC] focus:ring-1 focus:ring-[#4941EC] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-[#4941EC] focus:ring-1 focus:ring-[#4941EC] transition-all"
              />
            </div>
          </div>

          {/* Category Chips */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Kategori Masukan
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORY_OPTIONS.map((opt) => {
                const isSelected = category === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setCategory(opt.id)}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#4941EC] bg-[#EEF2FF] shadow-xs'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <span
                      className={`text-xs font-semibold block leading-tight ${
                        isSelected ? 'text-[#4941EC]' : 'text-gray-800'
                      }`}
                    >
                      {opt.label}
                    </span>
                    <span className="text-[10px] text-gray-400 block mt-0.5 leading-tight">
                      {opt.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Rating (Show if 'other' category or tripTitle) */}
          {(category === 'other' || tripTitle) && (
            <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-gray-800 block">
                  Rating Kepuasan
                </span>
                <span className="text-[10px] text-gray-400 block">
                  {rating === 5
                    ? 'Sangat Memuaskan ⭐⭐⭐⭐⭐'
                    : rating === 4
                    ? 'Memuaskan ⭐⭐⭐⭐'
                    : rating === 3
                    ? 'Cukup Baik ⭐⭐⭐'
                    : rating === 2
                    ? 'Kurang Memuaskan ⭐⭐'
                    : 'Perlu Perbaikan ⭐'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 cursor-pointer transition-transform hover:scale-110 active:scale-95"
                    aria-label={`Beri ${star} bintang`}
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-gray-700">
                Pesan / Saran Anda
              </label>
              <span className="text-[10px] text-gray-400">
                {message.length}/500 karakter
              </span>
            </div>
            <textarea
              rows={4}
              maxLength={500}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                category === 'bug'
                  ? 'Jelaskan kendala atau error yang Anda temukan (halaman, fitur, langkah kejadian)...'
                  : category === 'feature'
                  ? 'Bagikan usulan fitur atau peningkatan yang Anda harapkan di JabarPleasure...'
                  : category === 'question'
                  ? 'Tanyakan hal yang ingin Anda ketahui tentang penggunaan sistem WebGIS ini...'
                  : 'Bagikan pengalaman perjalanan atau penilaian Anda terhadap destinasi wisata...'
              }
              className="w-full text-xs p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-[#4941EC] focus:ring-1 focus:ring-[#4941EC] transition-all resize-none leading-relaxed"
            />
          </div>

          {/* Attachment (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Lampiran Bukti / Tangkapan Layar (Opsional)
            </label>
            {attachmentName ? (
              <div className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs">
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-4 h-4 text-[#4941EC] shrink-0" />
                  <span className="truncate text-gray-700 font-medium">{attachmentName}</span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveAttachment}
                  className="text-xs text-red-500 hover:text-red-700 cursor-pointer ml-2 shrink-0 font-medium"
                >
                  Hapus
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 p-3 border border-dashed border-gray-300 rounded-xl hover:border-[#4941EC] hover:bg-[#EEF2FF]/30 transition-colors cursor-pointer text-gray-500">
                <Upload className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-medium">Unggah Foto atau Tangkapan Layar (Maks. 2MB)</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || showSuccessToast}
              className="px-5 py-2.5 rounded-xl bg-[#4941EC] hover:bg-[#3D35D9] active:scale-95 text-white font-semibold text-xs shadow-md shadow-[#4941EC]/20 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 min-w-[120px]"
            >
              {isSubmitting ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>
                  {category === 'other' || tripTitle
                    ? 'Kirim Ulasan'
                    : 'Kirim Masukan'}
                </span>
              )}
            </button>
          </div>
        </form>
        )}
      </div>

      {/* Pop-up Validasi Ukuran File Melebihi 2MB */}
      {fileSizeErrorModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div
            className="fixed inset-0"
            onClick={() => setFileSizeErrorModal(null)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-[340px] bg-white rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200 border border-gray-100 z-10">
            <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-3.5">
              <AlertCircle className="w-7 h-7 stroke-[2.2]" />
            </div>

            <h3 className="text-base font-bold text-gray-900 tracking-tight">
              Ukuran Gambar Terlalu Besar
            </h3>

            <p className="text-xs text-gray-500 mt-2 mb-6 leading-relaxed">
              {fileSizeErrorModal}
            </p>

            <button
              type="button"
              onClick={() => setFileSizeErrorModal(null)}
              className="w-full py-2.5 px-4 rounded-xl bg-[#4941EC] hover:bg-[#3D35D9] active:scale-[0.98] text-white text-xs font-bold shadow-md shadow-[#4941EC]/20 transition-all cursor-pointer"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
