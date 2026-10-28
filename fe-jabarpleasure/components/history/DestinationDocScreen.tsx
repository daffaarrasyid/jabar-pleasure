'use client';

import React from 'react';
import Image from 'next/image';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  Check,
  PlayCircle,
} from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import BottomNav, { NavTabId } from '@/components/layout/BottomNav';
import { TRIP_HISTORY_DATA, TripItem, DestinationItem } from '@/components/history/historyData';

interface DestinationDocScreenProps {
  trip?: TripItem;
  destination?: DestinationItem;
  onBack?: () => void;
  onViewShowcase?: () => void;
  onNotificationClick?: () => void;
  onWishlistClick?: () => void;
  onNavigateToHome?: () => void;
  onNavigateToRencana?: () => void;
  onNavigateToMap?: () => void;
  onNavigateToProfile?: () => void;
  wishlistCount?: number;
  className?: string;
}

export default function DestinationDocScreen({
  trip = TRIP_HISTORY_DATA[0],
  destination = TRIP_HISTORY_DATA[0].destinations[0],
  onBack,
  onViewShowcase,
  onNotificationClick,
  onWishlistClick,
  onNavigateToHome,
  onNavigateToRencana,
  onNavigateToMap,
  onNavigateToProfile,
  wishlistCount = 4,
  className = '',
}: DestinationDocScreenProps) {
  const handleTabChange = (tab: NavTabId) => {
    if (tab === 'beranda') {
      onNavigateToHome?.();
    } else if (tab === 'rencana') {
      onNavigateToRencana?.();
    } else if (tab === 'peta') {
      onNavigateToMap?.();
    } else if (tab === 'profil') {
      onNavigateToProfile?.();
    } else if (tab === 'riwayat') {
      onBack?.();
    }
  };

  return (
    <div
      className={`relative w-full h-full flex flex-col bg-[#F9FAFB] overflow-hidden ${className}`}
    >
      {/* 1. App Header */}
      <AppHeader
        unreadNotifications={2}
        wishlistCount={wishlistCount}
        onNotificationClick={onNotificationClick}
        onWishlistClick={onWishlistClick}
        className="shrink-0"
      />

      {/* 2. Scrollable Body Content */}
      <main className="flex-1 w-full overflow-y-auto overflow-x-hidden no-scrollbar px-5 pt-2 pb-28">
        {/* Back Button with context breadcrumb */}
        <div className="flex items-start gap-2.5 mb-3">
          <button
            type="button"
            onClick={onBack}
            aria-label={`Kembali ke ${trip.title}`}
            className="p-1 -ml-1 text-gray-700 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors mt-0.5 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-gray-400 font-medium block">
              Kembali ke {trip.title}
            </span>
            <h1 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
              Dokumentasi Destinasi
            </h1>
          </div>
        </div>

        {/* Hero Image & Destination Info Card */}
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] mb-4">
          <div className="relative w-full aspect-[16/9] bg-gray-100">
            <Image
              src={destination.image}
              alt={destination.name}
              fill
              className="object-cover"
              sizes="440px"
              priority
            />
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                {destination.name}
              </h2>
              <span className="bg-[#D1FAE5] text-[#059669] text-xs font-semibold px-2.5 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                <Check className="w-3 h-3 stroke-[3]" />
                <span>Dikunjungi</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{destination.location} • {trip.title}</span>
            </div>
          </div>
        </div>

        {/* Catatan Kunjungan Section */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] mb-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">
              Catatan kunjungan
            </h3>
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Tersimpan</span>
            </span>
          </div>

          {/* Tanggal kunjungan */}
          <div>
            <label className="text-[11px] text-gray-500 font-medium block mb-1">
              Tanggal kunjungan
            </label>
            <div className="bg-[#F8FAFC] border border-gray-100 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-gray-500 shrink-0" />
              <span className="text-xs font-semibold text-gray-800">
                {destination.visitDate}
              </span>
            </div>
          </div>

          {/* Waktu kunjungan */}
          <div>
            <label className="text-[11px] text-gray-500 font-medium block mb-1">
              Waktu kunjungan
            </label>
            <div className="bg-[#F8FAFC] border border-gray-100 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-gray-500 shrink-0" />
              <span className="text-xs font-semibold text-gray-800">
                {destination.visitTime}
              </span>
            </div>
          </div>

          {/* Catatan perjalanan */}
          <div>
            <label className="text-[11px] text-gray-500 font-medium block mb-1">
              Catatan perjalanan
            </label>
            <div className="bg-[#F8FAFC] border border-gray-100 rounded-xl p-3">
              <p className="text-xs text-gray-700 leading-relaxed font-normal">
                {destination.notes}
              </p>
            </div>
          </div>
        </div>

        {/* Dokumentasi Kunjungan Photos Section */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] mb-4 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">
              Dokumentasi kunjungan
            </h3>
            <span className="text-xs text-[#4941EC] font-semibold">
              {destination.photos.length} foto
            </span>
          </div>

          {/* 3 Photos Grid */}
          <div className="grid grid-cols-3 gap-2">
            {destination.photos.map((item, idx) => (
              <div
                key={idx}
                className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-2xs group"
              >
                <Image
                  src={item.url}
                  alt={item.caption}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="130px"
                />
              </div>
            ))}
          </div>

          <p className="text-[11px] text-gray-500 mt-1">
            {destination.photos.length} dari {trip.stats.photos} foto {trip.title} • sudah dimasukkan
          </p>
        </div>

        {/* Action Button: Lihat Perjalanan */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onViewShowcase}
            className="w-full py-3.5 bg-[#4941EC] hover:bg-[#3D35D9] active:scale-[0.99] text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-[#4941EC]/25 transition-all cursor-pointer"
          >
            <PlayCircle className="w-4 h-4 fill-white/20 stroke-[2.2]" />
            <span>Lihat Perjalanan</span>
          </button>

          <p className="text-[11px] text-gray-500 text-center leading-relaxed">
            Lihat 1 video perjalanan dan semua dokumentasi {trip.title} yang sudah kamu masukkan.
          </p>
        </div>
      </main>

      {/* 3. Bottom Navigation Bar with Riwayat Active */}
      <div className="absolute bottom-0 left-0 right-0 w-full z-30">
        <BottomNav
          activeTab="riwayat"
          onTabChange={handleTabChange}
          badges={{
            favorit: wishlistCount,
          }}
        />
      </div>
    </div>
  );
}
