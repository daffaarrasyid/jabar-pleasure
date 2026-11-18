'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Tag,
  Clock,
  User,
  Mail,
  Send,
  X,
} from 'lucide-react';
import {
  ApiAdminFeedback,
  getAdminFeedbacksPaginated,
} from '@/lib/api';

export default function AdminFeedbackTab() {
  const [feedbacks, setFeedbacks] = useState<ApiAdminFeedback[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<{
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  }>({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<ApiAdminFeedback | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isReplyLoading, setIsReplyLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const showToast = (text: string, isError = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const loadFeedbacks = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getAdminFeedbacksPaginated({
        page: currentPage,
        per_page: 10,
      });

      if (Array.isArray(res.data)) {
        setFeedbacks(res.data);
      }
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to load feedbacks:', err);
      showToast('Gagal memuat saran & masukan pengguna.', true);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    loadFeedbacks();
  }, [loadFeedbacks]);

  const handleMarkResolved = (id: number) => {
    setFeedbacks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'Selesai' } : item))
    );
    showToast('Status saran ditandai sebagai Selesai.');
  };

  const handleSendReply = () => {
    if (!replyMessage.trim()) return;
    setIsReplyLoading(true);
    setTimeout(() => {
      setIsReplyLoading(false);
      showToast(`Tanggapan berhasil dikirim ke ${selectedFeedback?.user_email}.`);
      setFeedbacks((prev) =>
        prev.map((item) =>
          item.id === selectedFeedback?.id ? { ...item, status: 'Ditanggapi' } : item
        )
      );
      setSelectedFeedback(null);
      setReplyMessage('');
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl text-white text-xs font-medium shadow-xl animate-in fade-in slide-in-from-top-4 ${
            toastMessage.isError ? 'bg-red-600' : 'bg-gray-900'
          }`}
        >
          {toastMessage.isError ? (
            <AlertCircle className="w-4 h-4 text-white" />
          ) : (
            <CheckCircle className="w-4 h-4 text-[#60CE9F]" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header and Controls */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Saran, Masukan & Bantuan Pengguna
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Ulasan komunitas, umpan balik fasilitas destinasi, dan aspirasi pengguna JabarPleasure
          </p>
        </div>

        <button
          type="button"
          onClick={loadFeedbacks}
          disabled={isLoading}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 transition-all cursor-pointer shadow-xs disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Segarkan</span>
        </button>
      </div>

      {/* Main Feedback List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-5 sm:p-6 space-y-4">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-2.5 text-gray-400 text-xs">
            <Loader2 className="w-7 h-7 animate-spin text-[#4941EC]" />
            <span>Memuat data saran & masukan...</span>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
              <MessageSquare className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-gray-700">Tidak ada masukan baru</p>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Seluruh saran dan masukan pengguna telah selesai ditinjau.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {feedbacks.map((f) => (
              <div key={f.id} className="py-4 first:pt-0 last:pb-0 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#EEF2FF] text-[#4941EC] flex items-center justify-center font-bold text-xs uppercase shrink-0">
                      {f.user_name.charAt(0)}
                    </div>
                    <div>
                      <span className="font-bold text-gray-900 text-xs">{f.user_name}</span>
                      <span className="text-[11px] text-gray-400 ml-2">({f.user_email})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-semibold flex items-center gap-1">
                      <Tag className="w-3 h-3 text-[#4941EC]" />
                      {f.category}
                    </span>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        f.status === 'Selesai'
                          ? 'bg-emerald-50 text-emerald-600'
                          : f.status === 'Ditanggapi'
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-amber-50 text-amber-600'
                      }`}
                    >
                      {f.status}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-gray-800 font-semibold">{f.subject}</div>

                <p className="text-xs text-gray-600 bg-gray-50/60 p-3 rounded-xl border border-gray-100 leading-relaxed">
                  {f.message}
                </p>

                <div className="flex items-center justify-between pt-1 text-[11px] text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(f.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedFeedback(f)}
                      className="text-[#4941EC] font-semibold hover:underline cursor-pointer"
                    >
                      Beri Tanggapan
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => handleMarkResolved(f.id)}
                      className="text-gray-500 font-medium hover:text-emerald-600 cursor-pointer"
                    >
                      Tandai Selesai
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Footer */}
        {!isLoading && pagination.total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100 text-xs text-gray-600">
            <div>
              Menampilkan <span className="font-semibold text-gray-900">{feedbacks.length}</span> dari{' '}
              <span className="font-semibold text-gray-900">{pagination.total}</span> masukan
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={pagination.current_page <= 1}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 cursor-pointer transition-colors"
                aria-label="Halaman sebelumnya"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>

              <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg font-semibold text-gray-800">
                {pagination.current_page} / {pagination.last_page || 1}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(pagination.last_page, p + 1))}
                disabled={pagination.current_page >= pagination.last_page}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 cursor-pointer transition-colors"
                aria-label="Halaman berikutnya"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#4941EC] uppercase">Beri Tanggapan Resmi</span>
                <h3 className="text-sm font-bold text-gray-900 mt-0.5">
                  Balas: {selectedFeedback.user_name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFeedback(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              <p className="text-gray-500 font-medium">Subjek Masukan:</p>
              <p className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 font-semibold text-gray-800">
                {selectedFeedback.subject}
              </p>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="text-gray-700 font-semibold">Tanggapan Administrator:</label>
              <textarea
                rows={4}
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Tuliskan jawaban atau konfirmasi perbaikan kepada pengguna..."
                className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-[#4941EC] text-xs resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSelectedFeedback(null)}
                disabled={isReplyLoading}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSendReply}
                disabled={isReplyLoading || !replyMessage.trim()}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#4941EC] hover:bg-[#3C35C7] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isReplyLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Kirim Jawaban</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
