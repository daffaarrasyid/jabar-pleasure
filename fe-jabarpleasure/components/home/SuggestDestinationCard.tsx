'use client';

import React from 'react';

interface SuggestDestinationCardProps {
  onOpenForm?: () => void;
  className?: string;
}

export default function SuggestDestinationCard({
  onOpenForm,
  className = '',
}: SuggestDestinationCardProps) {
  return (
    <section className={`w-full px-5 py-1 ${className}`}>
      {/* Apple-style Gradient Card with Added Height */}
      <div
        onClick={onOpenForm}
        className="relative w-full min-h-[148px] rounded-3xl bg-gradient-to-br from-[#382FDD] via-[#4941EC] to-[#6055FA] p-5 sm:p-6 text-white shadow-[0_2px_8px_rgba(73,65,236,0.22)] border border-white/20 select-none cursor-pointer group flex items-center justify-between overflow-hidden transition-all duration-300 hover:shadow-[0_12px_28px_rgba(73,65,236,0.32)] active:scale-[0.99]"
      >
        {/* Apple-style background accents: Ambient Glowing Blobs */}
        <div className="absolute -top-10 -left-10 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 right-24 w-40 h-40 rounded-full bg-[#60CE9F]/20 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-4 -translate-y-1/2 w-36 h-36 rounded-full bg-[#8B83FF]/25 blur-2xl pointer-events-none" />

        {/* Apple-style translucent dynamic wavy ribbon lines */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-25"
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

        {/* Left Side: Title & Ajukan Button */}
        <div className="relative z-10 flex flex-col justify-between items-start h-full max-w-[62%] sm:max-w-[65%] gap-3.5">
          <div className="space-y-1">
            <h3 className="text-[16px] sm:text-base font-semibold text-white tracking-tight leading-snug drop-shadow-xs">
              Tidak menemukan destinasi yang Anda mau?
            </h3>
          </div>

          {/* Clean 'Ajukan' Button without '+' Icon */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenForm?.();
            }}
            className="bg-white hover:bg-gray-50 active:scale-95 text-[#4941EC] font-bold text-xs sm:text-sm px-5 py-2 rounded-xl shadow-md shadow-black/10 transition-all duration-200 cursor-pointer inline-flex items-center justify-center tracking-wide"
          >
            Ajukan
          </button>
        </div>

        {/* Right Side: 2D Destination Vector Illustration */}
        <div className="relative z-10 shrink-0 w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center -mr-1">
          <svg
            viewBox="0 0 120 120"
            className="w-full h-full drop-shadow-md select-none pointer-events-none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="pinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF6B6B" />
                <stop offset="100%" stopColor="#EE5253" />
              </linearGradient>
              <linearGradient id="pinRing" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#FFE3E3" />
              </linearGradient>
              <linearGradient id="sunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFDF78" />
                <stop offset="100%" stopColor="#FF9F43" />
              </linearGradient>
              <linearGradient id="mountainBack" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#7E72F2" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#4941EC" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="mountainFront" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#60CE9F" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.85" />
              </linearGradient>
              <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.65" />
              </linearGradient>
              <filter id="shadowFilter" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#1E1B4B" floodOpacity="0.25" />
              </filter>
            </defs>

            {/* Glowing Backdrop Discs */}
            <circle cx="60" cy="62" r="48" fill="white" fillOpacity="0.12" />
            <circle cx="60" cy="62" r="38" fill="white" fillOpacity="0.08" />

            {/* Sun */}
            <circle cx="82" cy="38" r="13" fill="url(#sunGrad)" filter="url(#shadowFilter)" />

            {/* Back Mountain */}
            <path
              d="M25 88 L52 46 C54 43 58 43 60 46 L88 88 Z"
              fill="url(#mountainBack)"
            />

            {/* Front Mountain / Hill with Snow / Peak Accent */}
            <path
              d="M48 88 L72 52 C74 49 78 49 80 52 L105 88 Z"
              fill="url(#mountainFront)"
            />
            {/* Peak Snowcap Accent */}
            <path
              d="M72 52 L76 58 L80 55 L84 62 L80 52 Z"
              fill="white"
              fillOpacity="0.75"
            />

            {/* Floating Cloud */}
            <g fill="url(#cloudGrad)" opacity="0.9">
              <circle cx="34" cy="50" r="7.5" />
              <circle cx="44" cy="48" r="9.5" />
              <circle cx="52" cy="51" r="6.5" />
              <rect x="34" y="50" width="18" height="7.5" rx="3.75" />
            </g>

            {/* Ground / Base Plate */}
            <ellipse cx="60" cy="94" rx="42" ry="8" fill="#1E1B4B" fillOpacity="0.22" />

            {/* Scenic Route Trail */}
            <path
              d="M30 94 C 42 88, 55 98, 70 92 C 82 86, 90 92, 98 90"
              stroke="white"
              strokeWidth="2.5"
              strokeDasharray="4 3"
              strokeLinecap="round"
            />

            {/* Hero 2D Destination Pin Marker */}
            <g filter="url(#shadowFilter)" transform="translate(0, -2)">
              {/* Teardrop Pin */}
              <path
                d="M48 30 C48 18 58 8 70 8 C82 8 92 18 92 30 C92 42 76 64 72 69 C71 70 69 70 68 69 C64 64 48 42 48 30 Z"
                fill="url(#pinGrad)"
              />
              {/* Pin Inner Center Disc */}
              <circle cx="70" cy="28" r="10.5" fill="url(#pinRing)" />
              {/* Pin Center Compass Star */}
              <path
                d="M70 21 L72.2 25.8 L77 28 L72.2 30.2 L70 35 L67.8 30.2 L63 28 L67.8 25.8 Z"
                fill="#EE5253"
              />
            </g>

            {/* Twinkle Sparkles */}
            <path
              d="M20 28 L21.5 32 L25.5 33.5 L21.5 35 L20 39 L18.5 35 L14.5 33.5 L18.5 32 Z"
              fill="#FFD200"
              opacity="0.9"
            />
            <circle cx="102" cy="24" r="2.5" fill="#FFFFFF" opacity="0.8" />
            <circle cx="18" cy="70" r="2" fill="#FFFFFF" opacity="0.6" />
          </svg>
        </div>
      </div>
    </section>
  );
}
