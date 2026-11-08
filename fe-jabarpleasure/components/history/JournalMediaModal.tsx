'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  X,
  MapPin,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  Video,
  Camera,
  Plus,
  Loader2,
} from 'lucide-react';
import { TripItem, DestinationItem } from '@/components/history/historyData';
import { processMediaFile, revokeMediaUrl } from '@/lib/mediaCompressor';
import { uploadJournalMedia } from '@/lib/api';

export interface UploadedMediaItem {
  id: string;
  url: string;
  name: string;
  caption: string;
  isVideo?: boolean;
  isLoading?: boolean;
  blob?: Blob;
}

export type DestinationJournalUpdate = {
  media: { url: string; caption: string; isVideo?: boolean }[];
  notes?: string;
};

interface JournalMediaModalProps {
  isOpen: boolean;
  trip: TripItem;
  onClose: () => void;
  onSaveJournal: (
    updates: Record<string, DestinationJournalUpdate>
  ) => void;
}

export default function JournalMediaModal({
  isOpen,
  trip,
  onClose,
  onSaveJournal,
}: JournalMediaModalProps) {
  const destinations =
    trip.destinations && trip.destinations.length > 0
      ? trip.destinations
      : [
          {
            id: 'dest-1',
            name: 'Taman Hutan Raya Ir. H. Djuanda',
            time: 'Checked-in 09:15',
            status: 'Sudah dikunjungi',
            photoCount: 2,
            image: '/tahura-juanda.jpg',
            location: 'Dago Pakar, Bandung',
            visitDate: '12 Jan 2025',
            visitTime: '09.15 WIB',
            notes: 'Momen pagi di Tahura',
            photos: [
              { url: '/tahura-juanda.jpg', caption: 'Kawasan Hutan Pinus' },
              { url: '/gunung-malabar.jpg', caption: 'Pemandangan Pagi' },
            ],
          },
        ];

  const [selectedDestId, setSelectedDestId] = useState<string>(destinations[0]?.id || '');

  // Media items per destination
  const [mediaByDestination, setMediaByDestination] = useState<Record<string, UploadedMediaItem[]>>({});

  // Notes/keterangan pengalaman per destination
  const [notesByDestination, setNotesByDestination] = useState<Record<string, string>>({});

  const [currentCaption, setCurrentCaption] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isUploadingToSupabase, setIsUploadingToSupabase] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize or reset when modal opens or trip changes
  useEffect(() => {
    if (!isOpen) return;

    const initialMedia: Record<string, UploadedMediaItem[]> = {};
    const initialNotes: Record<string, string> = {};

    destinations.forEach((dest) => {
      initialMedia[dest.id] = (dest.photos || []).map((p, idx) => ({
        id: `${dest.id}-photo-${idx}-${Date.now()}`,
        url: p.url,
        name: `Foto ${idx + 1}.webp`,
        caption: p.caption || '',
        isVideo: p.isVideo || false,
        isLoading: false,
      }));

      initialNotes[dest.id] = dest.notes || '';
    });

    setMediaByDestination(initialMedia);
    setNotesByDestination(initialNotes);
    setSelectedDestId(destinations[0]?.id || '');
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsUploadingToSupabase(false);
  }, [isOpen, trip]);

  if (!isOpen) return null;

  const selectedDestination: DestinationItem =
    destinations.find((d) => d.id === selectedDestId) || destinations[0];

  const currentMediaList = mediaByDestination[selectedDestId] || [];
  const currentDestNotes = notesByDestination[selectedDestId] || '';

  /**
   * Handle user choosing a photo or video
   * Immediately inserts a loading placeholder card into "Media Terlampir",
   * then performs client-side compression to WebP / WebM.
   */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const isVideoFile = file.type.startsWith('video/');

    // Initial basic check before compression
    if (isVideoFile && file.size > 10 * 1024 * 1024) {
      setErrorMessage('Ukuran video melebihi batas maksimal 10MB.');
      e.target.value = '';
      return;
    }

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const captionText = currentCaption.trim() || file.name.replace(/\.[^/.]+$/, '');

    // 1. Immediately insert placeholder card into "Media Terlampir" with loading indicator
    const placeholderItem: UploadedMediaItem = {
      id: tempId,
      url: '',
      name: file.name,
      caption: captionText,
      isVideo: isVideoFile,
      isLoading: true, // indicates currently loading/compressing
    };

    setMediaByDestination((prev) => ({
      ...prev,
      [selectedDestId]: [...(prev[selectedDestId] || []), placeholderItem],
    }));

    setCurrentCaption('');
    e.target.value = '';

    // 2. Perform compression asynchronously
    try {
      const processed = await processMediaFile(file);

      // 3. Update the placeholder card with the compressed thumbnail preview
      setMediaByDestination((prev) => ({
        ...prev,
        [selectedDestId]: (prev[selectedDestId] || []).map((item) => {
          if (item.id === tempId) {
            return {
              ...item,
              url: processed.url,
              name: processed.name,
              isVideo: processed.isVideo,
              isLoading: false,
              blob: processed.blob,
            };
          }
          return item;
        }),
      }));
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memproses dan mengompres media.');
      // Remove failed placeholder
      setMediaByDestination((prev) => ({
        ...prev,
        [selectedDestId]: (prev[selectedDestId] || []).filter((item) => item.id !== tempId),
      }));
    }
  };

  /**
   * Remove media from the attached media list
   */
  const handleRemoveMedia = (idToRemove: string) => {
    const itemToRemove = currentMediaList.find((m) => m.id === idToRemove);
    if (itemToRemove?.url) {
      revokeMediaUrl(itemToRemove.url);
    }

    setMediaByDestination((prev) => ({
      ...prev,
      [selectedDestId]: (prev[selectedDestId] || []).filter((m) => m.id !== idToRemove),
    }));
  };

  /**
   * Cancel and close modal: no upload to Supabase happens
   */
  const handleCancelAndClose = () => {
    // Revoke newly created blob URLs to prevent memory leak
    Object.values(mediaByDestination).forEach((list) => {
      list.forEach((item) => {
        if (item.blob && item.url) {
          revokeMediaUrl(item.url);
        }
      });
    });
    onClose();
  };

  /**
   * Save journal: uploads compressed media for all destinations to Supabase Storage,
   * saves notes/cerita pengalaman for all destinations, and notifies parent screen.
   */
  const handleSave = async () => {
    setIsUploadingToSupabase(true);
    setErrorMessage(null);

    try {
      const updates: Record<string, DestinationJournalUpdate> = {};

      for (const dest of destinations) {
        const destMediaList = mediaByDestination[dest.id] || [];
        const finalMediaForDest: { url: string; caption: string; isVideo?: boolean }[] = [];

        for (const item of destMediaList) {
          if (item.isLoading) continue;

          // If the item has a blob, it needs to be uploaded to Supabase Storage
          if (item.blob) {
            const formData = new FormData();
            formData.append('file', item.blob, item.name);
            formData.append('caption', item.caption || '');
            formData.append('destination_id', String(dest.id));
            formData.append('itinerary_id', String(trip.id));
            formData.append('media_type', item.isVideo ? 'video' : 'photo');

            const uploadRes = await uploadJournalMedia(formData);
            if (uploadRes && uploadRes.public_url) {
              finalMediaForDest.push({
                url: uploadRes.public_url,
                caption: item.caption,
                isVideo: item.isVideo,
              });
            } else {
              // If offline or storage direct fallback, keep local url
              finalMediaForDest.push({
                url: item.url,
                caption: item.caption,
                isVideo: item.isVideo,
              });
            }
          } else {
            // Already uploaded/saved media
            finalMediaForDest.push({
              url: item.url,
              caption: item.caption,
              isVideo: item.isVideo,
            });
          }
        }

        const notesToSave =
          notesByDestination[dest.id] !== undefined
            ? notesByDestination[dest.id]
            : (dest.notes || '');

        updates[dest.id] = {
          media: finalMediaForDest,
          notes: notesToSave,
        };
      }

      onSaveJournal(updates);
      setSuccessMessage('Dokumentasi jurnal untuk semua destinasi berhasil disimpan!');

      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal mengunggah media ke brankas Supabase.');
    } finally {
      setIsUploadingToSupabase(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 select-none"
      onClick={handleCancelAndClose}
    >
      <div
        className="bg-white rounded-3xl max-w-[440px] w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-4 pb-3 border-b border-gray-100 bg-[#FAFAFC]">
          <div>
            <h2 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#4941EC]" />
              <span>Kelola Media Jurnal</span>
            </h2>
            <p className="text-xs text-gray-500 italic mt-0.5 font-medium truncate max-w-[280px]">
              &ldquo;{trip.title}&rdquo;
            </p>
          </div>
          <button
            type="button"
            onClick={handleCancelAndClose}
            aria-label="Tutup Form Jurnal"
            className="p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {/* Section 1: Radio Selector Titik Destinasi */}
          <div>
            <label className="text-xs font-bold text-gray-800 block mb-2">
              Pilih Titik Destinasi:
            </label>
            <div className="flex flex-col gap-2">
              {destinations.map((dest, idx) => {
                const isSelected = dest.id === selectedDestId;
                const checkInText = dest.time.includes('Checked-in')
                  ? dest.time
                  : `Checked-in ${dest.visitTime || dest.time}`;

                return (
                  <button
                    key={dest.id}
                    type="button"
                    onClick={() => {
                      setSelectedDestId(dest.id);
                      setErrorMessage(null);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#4941EC] bg-[#EEF0FF]/60 shadow-xs'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    {/* Radio Circle */}
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                        isSelected
                          ? 'border-[#4941EC] bg-[#4941EC]'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>

                    <MapPin
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isSelected ? 'text-[#4941EC]' : 'text-gray-400'
                      }`}
                    />
                    <div className="flex-1 min-w-0 text-xs">
                      <span className="font-semibold text-gray-900 block truncate">
                        {idx + 1}. {dest.name}
                      </span>
                      <span className="text-[10px] text-gray-500 font-medium block">
                        ({checkInText})
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-dashed border-gray-200" />

          {/* Section 2: Media Terlampir (with loading card placeholder & delete button) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-gray-800">
                Media Terlampir untuk {selectedDestination.name}:
              </label>
              <span className="text-[11px] font-semibold text-[#4941EC]">
                {currentMediaList.length} media
              </span>
            </div>

            {/* List of Attached Media Cards */}
            {currentMediaList.length > 0 ? (
              <div className="grid grid-cols-2 gap-2.5 mb-3">
                {currentMediaList.map((item) => (
                  <div
                    key={item.id}
                    className="relative group bg-[#F8FAFC] border border-gray-200 rounded-xl overflow-hidden p-1.5 flex flex-col gap-1 shadow-2xs"
                  >
                    <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
                      {item.isLoading ? (
                        /* Loading Placeholder Card in Media Terlampir */
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-500 p-2 text-center animate-pulse">
                          <Loader2 className="w-6 h-6 text-[#4941EC] animate-spin mb-1" />
                          <span className="text-[10px] font-bold text-gray-700 leading-tight">
                            Mengompres...
                          </span>
                          <span className="text-[9px] text-gray-400">
                            {item.isVideo ? 'Memproses WebM' : 'Memproses WebP'}
                          </span>
                        </div>
                      ) : item.isVideo ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white">
                          <Video className="w-6 h-6 text-[#60CE9F]" />
                          <span className="text-[9px] font-bold mt-1">Video</span>
                        </div>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.url}
                          alt={item.caption || item.name}
                          className="w-full h-full object-cover"
                        />
                      )}

                      {/* Tombol 'X' untuk menghapus media jika user salah memilih atau membatalkan */}
                      <button
                        type="button"
                        onClick={() => handleRemoveMedia(item.id)}
                        className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-red-600 text-white rounded-md transition-colors cursor-pointer z-10"
                        title="Hapus media"
                      >
                        <Trash2 className="w-3 h-3 stroke-[2.2]" />
                      </button>
                    </div>

                    {/* Thumbnail preview only: no size or format text per request */}
                    <p
                      className="text-[10px] font-semibold text-gray-800 truncate px-0.5"
                      title={item.caption || item.name}
                    >
                      {item.caption || item.name}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200/80 rounded-xl p-3 text-center mb-3">
                <p className="text-xs text-gray-500">
                  Belum ada foto atau video terlampir untuk destinasi ini.
                </p>
              </div>
            )}

            {/* Caption Input for New Uploads */}
            <div className="mb-2.5">
              <label className="text-[11px] font-semibold text-gray-700 block mb-1">
                Keterangan / Caption Media Baru (Opsional):
              </label>
              <input
                type="text"
                value={currentCaption}
                onChange={(e) => setCurrentCaption(e.target.value)}
                placeholder="Contoh: Momen indah di spot foto favorit..."
                className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4941EC]/20 focus:border-[#4941EC] transition-all"
              />
            </div>

            {/* Upload Button */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-3 bg-[#EEF0FF] hover:bg-[#E0E4FF] text-[#4941EC] font-bold text-xs rounded-xl border border-[#4941EC]/30 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Unggah Foto/Video</span>
            </button>

            <p className="text-[10px] text-gray-400 italic text-center mt-1.5 font-medium">
              Foto otomatis dikompres ke WebP (&le;2MB) / Video WebM (&le;10MB)
            </p>
          </div>

          <div className="border-t border-dashed border-gray-200" />

          {/* Section 3: Cerita Pengalaman / Catatan Perjalanan Destinasi */}
          <div>
            <label className="text-xs font-bold text-gray-800 block mb-1">
              Catatan / Cerita Pengalaman di {selectedDestination.name}:
            </label>
            <p className="text-[10px] text-gray-500 mb-1.5">
              Ceritakan pengalaman, suasana, atau momen berkesan di tempat ini agar tersimpan di dokumentasi.
            </p>
            <textarea
              rows={3}
              value={currentDestNotes}
              onChange={(e) =>
                setNotesByDestination((prev) => ({
                  ...prev,
                  [selectedDestId]: e.target.value,
                }))
              }
              placeholder="Contoh: Udara pagi sangat sejuk, spot foto kawah sangat indah saat kabut tipis turun..."
              className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4941EC]/20 focus:border-[#4941EC] transition-all resize-none leading-relaxed"
            />
          </div>

          {/* Validation / Success Messages */}
          {errorMessage && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-[#059669] rounded-xl text-xs flex items-center gap-1.5 font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/70 flex flex-col gap-2 shrink-0">
          <button
            type="button"
            disabled={isUploadingToSupabase}
            onClick={handleSave}
            className="w-full py-3 px-4 rounded-xl bg-[#4941EC] hover:bg-[#3D35D9] active:scale-[0.99] disabled:opacity-60 text-white text-xs font-bold shadow-md shadow-[#4941EC]/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isUploadingToSupabase ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Mengunggah ke Brankas Supabase...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 stroke-[2.2]" />
                <span>Simpan Jurnal</span>
              </>
            )}
          </button>

          <button
            type="button"
            disabled={isUploadingToSupabase}
            onClick={handleCancelAndClose}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-semibold transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
