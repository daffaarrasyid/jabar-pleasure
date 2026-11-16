'use client';

import React from 'react';

interface FeedbackCardProps {
  onOpenFeedback?: () => void;
  className?: string;
}

export default function FeedbackCard({
  onOpenFeedback,
  className = '',
}: FeedbackCardProps) {
  return (
    <section className={`w-full px-5 py-2.5 ${className}`}>
      {/* Apple-style Gradient Card */}
      <div
        onClick={onOpenFeedback}
        className="relative w-full min-h-[148px] rounded-3xl bg-gradient-to-br from-[#1E1B4B] via-[#312E81] to-[#047857] p-5 sm:p-6 text-white shadow-[0_2px_8px_rgba(5,150,105,0.22)] border border-white/20 select-none cursor-pointer group flex items-center justify-between overflow-hidden transition-all duration-300 hover:shadow-[0_12px_28px_rgba(5,150,105,0.32)] active:scale-[0.99]"
      >
        {/* Apple-style background accents: Ambient Glowing Blobs */}
        <div className="absolute -top-10 -left-10 w-44 h-44 rounded-full bg-emerald-400/15 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 right-20 w-40 h-40 rounded-full bg-[#60CE9F]/25 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-4 -translate-y-1/2 w-36 h-36 rounded-full bg-indigo-400/20 blur-2xl pointer-events-none" />

        {/* Dynamic decorative ribbon lines */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
          viewBox="0 0 400 160"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M-20 40 C 60 10, 120 95, 200 60 C 280 25, 340 120, 420 80"
            stroke="white"
            strokeWidth="32"
            strokeLinecap="round"
            className="opacity-40"
          />
          <path
            d="M-20 95 C 75 145, 140 25, 230 65 C 320 105, 360 20, 430 45"
            stroke="white"
            strokeWidth="16"
            strokeLinecap="round"
            className="opacity-30"
          />
          <path
            d="M10 -10 C 90 60, 210 10, 290 85 C 370 160, 400 90, 440 130"
            stroke="white"
            strokeWidth="2.5"
            strokeDasharray="6 6"
            className="opacity-35"
          />
        </svg>

        {/* Left Side: Title, Subtext & Action Button */}
        <div className="relative z-10 flex flex-col justify-between items-start h-full max-w-[62%] sm:max-w-[65%] gap-3.5">
          <div className="space-y-1">
            <h3 className="text-[15px] sm:text-base font-semibold text-white tracking-tight leading-snug drop-shadow-xs">
              Punya saran atau menemukan kendala?
            </h3>
            <p className="text-[11px] sm:text-xs text-white/80 leading-relaxed line-clamp-2">
              Bantu kami menjadikan JabarPleasure lebih nyaman untuk menjelajahi Jawa Barat.
            </p>
          </div>

          {/* Clean 'Beri Masukan' Button without icon */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenFeedback?.();
            }}
            className="bg-white hover:bg-gray-50 active:scale-95 text-[#065F46] font-semibold text-xs sm:text-sm px-5 py-2 rounded-xl shadow-md shadow-black/10 transition-all duration-200 cursor-pointer inline-flex items-center justify-center tracking-wide"
          >
            Beri Masukan
          </button>
        </div>

        {/* Right Side: 2D Friendly Vector Feedback & Star Illustration */}
        <div className="relative z-10 shrink-0 w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center -mr-1">
          <svg
            viewBox="0 0 120 120"
            className="w-full h-full drop-shadow-md select-none pointer-events-none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="bubbleGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#E0F2FE" />
              </linearGradient>
              <linearGradient id="bubbleGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#60CE9F" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
              <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDE047" />
                <stop offset="100%" stopColor="#EAB308" />
              </linearGradient>
            </defs>

            {/* Back Speech Bubble */}
            <path
              d="M32 30C32 23.3726 37.3726 18 44 18H86C92.6274 18 98 23.3726 98 30V56C98 62.6274 92.6274 68 86 68H70L54 80V68H44C37.3726 68 32 62.6274 32 56V30Z"
              fill="url(#bubbleGrad1)"
              opacity="0.95"
            />
            {/* Dots inside back bubble */}
            <circle cx="52" cy="43" r="3.5" fill="#4338CA" />
            <circle cx="65" cy="43" r="3.5" fill="#4338CA" />
            <circle cx="78" cy="43" r="3.5" fill="#4338CA" />

            {/* Front Speech Bubble (Teal Emerald) */}
            <path
              d="M18 50C18 43.3726 23.3726 38 30 38H68C74.6274 38 80 43.3726 80 50V74C80 80.6274 74.6274 86 68 86H48L32 98V86H30C23.3726 86 18 80.6274 18 74V50Z"
              fill="url(#bubbleGrad2)"
            />
            {/* Heart or Smiley line inside front bubble */}
            <path
              d="M34 60C38 67 60 67 64 60"
              stroke="white"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <circle cx="39" cy="53" r="2.5" fill="white" />
            <circle cx="59" cy="53" r="2.5" fill="white" />

            {/* Floating Golden Rating Star */}
            <path
              d="M92 78L94.5 83.5L100.5 84.2L96 88.4L97.2 94.3L92 91.3L86.8 94.3L88 88.4L83.5 84.2L89.5 83.5L92 78Z"
              fill="url(#starGrad)"
              className="animate-pulse"
            />
            {/* Sparkle */}
            <circle cx="104" cy="42" r="2.5" fill="#FDE047" />
            <circle cx="24" cy="28" r="2" fill="#60CE9F" />
          </svg>
        </div>
      </div>
    </section>
  );
}
