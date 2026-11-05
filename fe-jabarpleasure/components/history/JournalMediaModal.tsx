'use client';

import React, { useState, useRef } from 'react';
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
} from 'lucide-react';
import { TripItem, DestinationItem } from '@/components/history/historyData';

export interface UploadedMediaItem {
  id: string;
  url: string;
  name: string;
  caption: string;
  isVideo?: boolean;
}

interface JournalMediaModalProps {
  isOpen: boolean;
  trip: TripItem;
  onClose: () => void;
  onSaveJournal: (
    destinationId: string,
    newMedia: { url: string; caption: string; isVideo?: boolean }[]
  ) => void;
}

export default function JournalMediaModal({
  isOpen,
  trip,
  onClose,
  onSaveJournal,
}: JournalMediaModalProps) {
  const destinations = trip.destinations && trip.destinations.length > 0
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
        {
          id: 'dest-2',
          name: 'Museum Geologi Bandung',
          time: 'Checked-in 11:30',
          status: 'Sudah dikunjungi',
          photoCount: 1,
          image: '/gedung-sate.jpg',
          location: 'Jl. Diponegoro, Bandung',
          visitDate: '12 Jan 2025',
          visitTime: '11.30 WIB',
          notes: 'Koleksi fosil dan edukasi geologi',
          photos: [{ url: '/gedung-sate.jpg', caption: 'Gedung Utama Museum' }],
        },
        {
          id: 'dest-3',
          name: 'Kiara Artha Park',
          time: 'Checked-in 15:45',
          status: 'Sudah dikunjungi',
          photoCount: 1,
          image: '/floating-market.jpg',
          location: 'Batununggal, Bandung',
          visitDate: '12 Jan 2025',
          visitTime: '15.45 WIB',
          notes: 'Taman modern dan air mancur',
          photos: [{ url: '/floating-market.jpg', caption: 'Taman Terbuka' }],
        },
      ];

  const [selectedDestId, setSelectedDestId] = useState<string>(destinations[0]?.id || '');
  const [mediaByDestination, setMediaByDestination] = useState<Record<string, UploadedMediaItem[]>>(() => {
    const initial: Record<string, UploadedMediaItem[]> = {};
    destinations.forEach((dest) => {
      initial[dest.id] = (dest.photos || []).map((p, idx) => ({
        id: `${dest.id}-photo-${idx}`,
        url: p.url,
        name: `Foto ${idx + 1}.jpg`,
        caption: p.caption || '',
        isVideo: p.isVideo || false,
      }));
    });
    return initial;
  });

  const [currentCaption, setCurrentCaption] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const selectedDestination: DestinationItem =
    destinations.find((d) => d.id === selectedDestId) || destinations[0];

  const currentMediaList = mediaByDestination[selectedDestId] || [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const isVideoFile = file.type.startsWith('video/');

    // Validation per PRD: max 2MB for photo, 10MB for video
    const maxPhotoSize = 2 * 1024 * 1024; // 2MB
    const maxVideoSize = 10 * 1024 * 1024; // 10MB

    if (isVideoFile && file.size > maxVideoSize) {
      setErrorMessage('Ukuran video melebihi batas maksimal 10MB.');
      e.target.value = '';
      return;
    }

    if (!isVideoFile && file.size > maxPhotoSize) {
      setErrorMessage('Ukuran foto melebihi batas maksimal 2MB.');
      e.target.value = '';
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const newItem: UploadedMediaItem = {
      id: `upload-${Date.now()}`,
      url: objectUrl,
      name: file.name,
      caption: currentCaption.trim() || file.name,
      isVideo: isVideoFile,
    };

    setMediaByDestination((prev) => ({
      ...prev,
      [selectedDestId]: [...(prev[selectedDestId] || []), newItem],
    }));

    setCurrentCaption('');
    e.target.value = '';
  };

  const handleRemoveMedia = (idToRemove: string) => {
    setMediaByDestination((prev) => ({
      ...prev,
      [selectedDestId]: (prev[selectedDestId] || []).filter((m) => m.id !== idToRemove),
    }));
  };

  const handleSave = () => {
    const mediaToSave = currentMediaList.map((m) => ({
      url: m.url,
      caption: m.caption,
      isVideo: m.isVideo,
    }));

    onSaveJournal(selectedDestId, mediaToSave);
    setSuccessMessage(`Jurnal media untuk ${selectedDestination.name} berhasil disimpan!`);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 select-none"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-[440px] w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-4 pb-3 border-b border-gray-100 bg-[#FAFAFC]">
          <div>
            <h2 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#4941EC]" />
              <span>Jurnal Media Perjalanan</span>
            </h2>
            <p className="text-xs text-gray-500 italic mt-0.5 font-medium">
              &ldquo;{trip.title}&rdquo;
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Form Jurnal"
            className="p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Section 1: Radio Selector Titik Destinasi */}
          <div>
            <label className="text-xs font-bold text-gray-800 block mb-2">
              Pilih Titik Destinasi untuk Diunggah Media:
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

                    {/* Pin Icon & Name */}
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

          {/* Section 2: Media Terlampir */}
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
                    <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-gray-200">
                      {item.isVideo ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white">
                          <Video className="w-6 h-6 text-[#60CE9F]" />
                          <span className="text-[9px] font-bold mt-1">Video</span>
                        </div>
                      ) : (
                        <Image
                          src={item.url}
                          alt={item.caption || item.name}
                          fill
                          className="object-cover"
                          sizes="150px"
                        />
                      )}
                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveMedia(item.id)}
                        className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-red-600 text-white rounded-md transition-colors cursor-pointer"
                        title="Hapus media"
                      >
                        <Trash2 className="w-3 h-3 stroke-[2.2]" />
                      </button>
                    </div>

                    <p className="text-[10px] font-semibold text-gray-800 truncate px-1" title={item.caption}>
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
                Keterangan / Caption Media Baru:
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

            {/* Helper constraint text per wireframe */}
            <p className="text-[10px] text-gray-400 italic text-center mt-1.5 font-medium">
              Maksimal 2MB per foto / 10MB per video singkat
            </p>

            {/* Validation / Success Messages */}
            {errorMessage && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 text-[#059669] rounded-xl text-xs flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/70 flex flex-col gap-2 shrink-0">
          <button
            type="button"
            onClick={handleSave}
            className="w-full py-3 px-4 rounded-xl bg-[#4941EC] hover:bg-[#3D35D9] active:scale-[0.99] text-white text-xs font-bold shadow-md shadow-[#4941EC]/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4 stroke-[2.2]" />
            <span>Simpan Jurnal</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-semibold transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
