'use client';

import React from 'react';
import { ArrowLeft, Loader2, Navigation } from 'lucide-react';

interface TimelapseSkeletonProps {
  onBack?: () => void;
}

export default function TimelapseSkeleton({ onBack }: TimelapseSkeletonProps) {
  return (
    <div className="relative w-full h-full min-h-screen bg-[#0B0F19] flex flex-col justify-between overflow-hidden select-none">
      {/* Background Simulation / Pulse Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#4941EC_1px,transparent_1px)] [background-size:24px_24px] opacity-20 animate-pulse" />

      {/* Top Header */}
      <div className="relative z-20 flex items-center justify-between p-4 bg-gradient-to-b from-[#0B0F19]/90 via-[#0B0F19]/40 to-transparent">
        <button
          type="button"
          onClick={onBack}
          aria-label="Kembali"
          className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center">
          <div className="h-4 w-32 bg-white/20 rounded-md animate-pulse mb-1" />
          <div className="h-3 w-20 bg-white/10 rounded-md animate-pulse" />
        </div>

        <div className="w-12 h-12" />
      </div>

      {/* Center 3D Loading Beacon */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-3">
        <div className="relative w-16 h-16 rounded-full bg-[#4941EC]/30 flex items-center justify-center border border-[#4941EC]/50 shadow-[0_0_30px_rgba(73,65,236,0.5)]">
          <Navigation className="w-8 h-8 text-[#4941EC] animate-bounce" />
          <Loader2 className="absolute inset-0 m-auto w-16 h-16 text-[#60CE9F] animate-spin opacity-40" />
        </div>
        <p className="text-white/90 text-sm font-semibold tracking-wide">
          Menyiapkan Flyover 3D...
        </p>
        <span className="text-white/50 text-xs">
          Mengunduh rute, elevasi & media kenangan
        </span>
      </div>

      {/* Bottom Skeleton Card */}
      <div className="relative z-20 p-5 bg-gradient-to-t from-[#0B0F19]/90 via-[#0B0F19]/50 to-transparent flex flex-col gap-2">
        <div className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex items-center gap-3 animate-pulse">
          <div className="w-12 h-12 rounded-xl bg-white/20 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-white/20 rounded w-3/4" />
            <div className="h-3 bg-white/10 rounded w-1/2" />
          </div>
        </div>
      </div>
    </div>
  );
}
