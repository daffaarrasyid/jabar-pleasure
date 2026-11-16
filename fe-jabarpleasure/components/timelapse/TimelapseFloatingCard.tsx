'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  PlayCircle,
  ChevronRight,
  Camera,
  CheckCircle2,
} from 'lucide-react';
import { TimelapseStop } from '@/lib/api';

interface TimelapseFloatingCardProps {
  stop: TimelapseStop | null;
  stopIndex: number;
  totalStops: number;
  screenPos: { x: number; y: number } | null;
  onAdvance: () => void;
  autoAdvanceSeconds?: number;
}

export default function TimelapseFloatingCard({
  stop,
  stopIndex,
  totalStops,
  screenPos,
  onAdvance,
  autoAdvanceSeconds = 5,
}: TimelapseFloatingCardProps) {
  const [timeLeft, setTimeLeft] = useState(autoAdvanceSeconds);
  const [isPaused, setIsPaused] = useState(false);
  const onAdvanceRef = useRef(onAdvance);

  useEffect(() => {
    onAdvanceRef.current = onAdvance;
  }, [onAdvance]);

  useEffect(() => {
    if (!stop) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTimeLeft(autoAdvanceSeconds);
    setIsPaused(false);
  }, [stop, autoAdvanceSeconds]);

  useEffect(() => {
    if (!stop || isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimeout(() => onAdvanceRef.current(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [stop, isPaused]);

  if (!stop) return null;

  const hasMedia = Array.isArray(stop.media) && stop.media.length > 0;
  const firstMedia = hasMedia ? stop.media[0] : null;

  // Safe fallback if screenPos is not yet calculated
  const cardStyle: React.CSSProperties = screenPos
    ? {
        position: 'absolute',
        left: `${screenPos.x}px`,
        top: `${screenPos.y - 22}px`,
        transform: 'translate(-50%, -100%)',
        zIndex: 50,
      }
    : {
        position: 'fixed',
        left: '50%',
        top: '35%',
        transform: 'translate(-50%, -50%)',
        zIndex: 50,
      };

  return (
    <AnimatePresence>
      <motion.div
        key={`stop-card-${stop.id}-${stopIndex}`}
        initial={{ opacity: 0, scale: 0.65, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.75, y: 10 }}
        transition={{ type: 'spring', damping: 24, stiffness: 320 }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={cardStyle}
        className="w-[290px] sm:w-[320px] select-none pointer-events-auto"
      >
        {/* Main Floating Card Container */}
        <div className="relative bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_18px_42px_rgba(0,0,0,0.38)] border border-white/60 overflow-hidden flex flex-col">
          {/* Top Banner (Photo or Compact Icon Header) */}
          {hasMedia ? (
            <div className="relative w-full h-28 bg-gray-900 overflow-hidden">
              {firstMedia?.type === 'video' ? (
                <div className="relative w-full h-full flex items-center justify-center bg-gray-950 text-white">
                  <PlayCircle className="w-10 h-10 text-[#60CE9F] drop-shadow-md" />
                  <span className="absolute bottom-2 left-2 text-[10px] bg-black/60 px-2 py-0.5 rounded text-white font-semibold">
                    Video Kenangan
                  </span>
                </div>
              ) : (
                <Image
                  src={firstMedia?.url || '/tugu-kujang.jpg'}
                  alt={stop.name}
                  fill
                  className="object-cover"
                  sizes="320px"
                  priority
                />
              )}

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

              {/* Badges on Media */}
              <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                <span className="bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Camera className="w-3 h-3 text-[#60CE9F]" />
                  <span>{stop.media.length} media</span>
                </span>
                <span className="bg-[#4941EC]/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                  Stop {stopIndex + 1}/{totalStops}
                </span>
              </div>

              {/* Caption Preview */}
              {firstMedia?.caption && (
                <p className="absolute bottom-2 left-3 right-3 text-[11px] text-white/95 font-medium truncate drop-shadow-md">
                  &ldquo;{firstMedia.caption}&rdquo;
                </p>
              )}
            </div>
          ) : (
            <div className="p-3 bg-gradient-to-r from-[#EEF2FF] to-[#E0E7FF] border-b border-[#4941EC]/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#4941EC] text-white flex items-center justify-center shadow-xs">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-[#4941EC] block leading-tight">
                    {stop.category || 'Destinasi Wisata'}
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium">
                    Pemberhentian ke-{stopIndex + 1}
                  </span>
                </div>
              </div>
              <span className="bg-white/80 text-[#4941EC] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#4941EC]/20 shadow-2xs">
                {stopIndex + 1}/{totalStops}
              </span>
            </div>
          )}

          {/* Card Body */}
          <div className="p-3.5 flex flex-col gap-2">
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-semibold text-[#60CE9F] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/50 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-[#60CE9F]" />
                  <span>Sudah Sampai</span>
                </span>
              </div>
              <h3 className="text-sm font-bold text-gray-900 truncate" title={stop.name}>
                {stop.name}
              </h3>
            </div>

            {/* Action Row */}
            <div className="flex items-center justify-between pt-1 border-t border-gray-100">
              <span className="text-[10px] text-gray-400 font-medium">
                Lanjut dalam <span className="font-mono font-bold text-gray-700">{timeLeft}s</span>
              </span>

              <button
                type="button"
                onClick={onAdvance}
                aria-label="Lanjut Perjalanan"
                className="min-h-[44px] px-3.5 bg-[#4941EC] hover:bg-[#3D35D9] active:scale-95 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-[#4941EC]/30 transition-all cursor-pointer"
              >
                <span>Lanjut</span>
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Auto-Advance Bottom Scrubber Bar */}
          <div className="w-full h-1 bg-gray-100 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#4941EC] to-[#60CE9F] transition-all duration-1000 ease-linear"
              style={{ width: `${((autoAdvanceSeconds - timeLeft) / autoAdvanceSeconds) * 100}%` }}
            />
          </div>
        </div>

        {/* Downward Speech Bubble Caret pointing directly to the map pin */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/95 rotate-45 border-r border-b border-gray-200/60 shadow-xs pointer-events-none" />
      </motion.div>
    </AnimatePresence>
  );
}
