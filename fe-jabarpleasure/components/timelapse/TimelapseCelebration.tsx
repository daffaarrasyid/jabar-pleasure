'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, RotateCcw, X } from 'lucide-react';

interface TimelapseCelebrationProps {
  tripTitle?: string;
  totalStops?: number;
  totalDistanceKm?: number;
  onReplay: () => void;
  onClose: () => void;
}

export default function TimelapseCelebration({
  tripTitle = 'Perjalanan Wisata Jawa Barat',
  totalStops = 3,
  totalDistanceKm = 42,
  onReplay,
  onClose,
}: TimelapseCelebrationProps) {
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    // Animate circular loader from 0% to 100% over 1.6s
    const startTime = performance.now();
    const duration = 1600;

    let rafId: number;

    const animateLoader = (now: number) => {
      const elapsed = now - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (pct < 100) {
        rafId = requestAnimationFrame(animateLoader);
      } else {
        setIsCompleted(true);
      }
    };

    rafId = requestAnimationFrame(animateLoader);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 select-none"
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 260 }}
        className="w-full max-w-[360px] bg-white rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center relative border border-gray-100"
      >
        {/* Close Button Top-Right (Min 48x48px touch target) */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup"
          className="absolute top-3.5 right-3.5 w-12 h-12 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 active:scale-95 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Circular SVG Progress Loader */}
        <div className="relative w-28 h-28 my-3 flex items-center justify-center">
          <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
            {/* Background Track */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="stroke-gray-100"
              strokeWidth="7"
              fill="transparent"
            />
            {/* Animated Progress Ring */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke={isCompleted ? '#60CE9F' : '#4941EC'}
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-100 ease-out"
            />
          </svg>

          {/* Center Checkmark or Counter */}
          <div className="absolute inset-0 m-auto flex items-center justify-center">
            {isCompleted ? (
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 14, stiffness: 300 }}
                className="w-16 h-16 rounded-full bg-[#60CE9F] flex items-center justify-center shadow-lg shadow-[#60CE9F]/40"
              >
                <Check className="w-9 h-9 text-white stroke-[3.5]" />
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <span className="text-xl font-bold font-mono text-[#4941EC]">
                  {progress}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Title & Celebration Subtitle */}
        <h2 className="text-lg font-bold text-gray-900 mt-2">
          {isCompleted ? 'Perjalanan Selesai!' : 'Menyelesaikan Rute...'}
        </h2>
        <p className="text-xs text-gray-500 mt-1 max-w-[280px]">
          Selamat! Kamu telah berhasil menelusuri seluruh destinasi kenangan{' '}
          <span className="font-semibold text-gray-800">{tripTitle}</span>.
        </p>

        {/* Stats Summary Pills */}
        <div className="w-full grid grid-cols-2 gap-2 my-4">
          <div className="bg-[#F8FAFC] border border-gray-100 rounded-xl p-2.5 text-center">
            <span className="text-[10px] text-gray-400 font-medium block">
              Destinasi
            </span>
            <span className="text-sm font-bold text-[#4941EC]">
              {totalStops} Titik
            </span>
          </div>
          <div className="bg-[#F8FAFC] border border-gray-100 rounded-xl p-2.5 text-center">
            <span className="text-[10px] text-gray-400 font-medium block">
              Estimasi Jalur
            </span>
            <span className="text-sm font-bold text-[#60CE9F]">
              ± {totalDistanceKm} km
            </span>
          </div>
        </div>

        {/* Action Buttons (Min 48x48px touch targets) */}
        <div className="w-full flex items-center gap-2.5 mt-1">
          <button
            type="button"
            onClick={onReplay}
            className="flex-1 min-h-[48px] py-3 px-3 bg-white hover:bg-gray-50 active:scale-95 text-gray-700 font-semibold text-xs rounded-xl border border-gray-200 shadow-2xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-gray-500" />
            <span>Putar Ulang</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex-1 min-h-[48px] py-3 px-3 bg-[#4941EC] hover:bg-[#3D35D9] active:scale-95 text-white font-semibold text-xs rounded-xl shadow-md shadow-[#4941EC]/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <span>Tutup</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
