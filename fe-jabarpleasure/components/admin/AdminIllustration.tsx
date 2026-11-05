'use client';

import React from 'react';

interface AdminIllustrationProps {
  className?: string;
}

export default function AdminIllustration({ className = '' }: AdminIllustrationProps) {
  return (
    <div className={`relative w-full max-w-[420px] aspect-square flex items-center justify-center select-none ${className}`}>
      {/* Background radial gradient glow */}
      <div className="absolute inset-0 bg-radial from-[#60CE9F]/20 via-[#4941EC]/10 to-transparent rounded-full blur-2xl pointer-events-none" />

      {/* SVG Vector Artwork */}
      <svg
        viewBox="0 0 500 500"
        className="w-full h-full drop-shadow-md overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="skyGrad" x1="250" y1="40" x2="250" y2="340" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#EEF2FF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#E0F2FE" stopOpacity="0.3" />
          </linearGradient>

          <linearGradient id="mountainFar" x1="100" y1="180" x2="400" y2="360" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#4941EC" />
          </linearGradient>

          <linearGradient id="mountainMid" x1="50" y1="220" x2="450" y2="400" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          <linearGradient id="teaHills" x1="250" y1="280" x2="250" y2="450" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#60CE9F" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>

          <linearGradient id="gedungGrad" x1="250" y1="180" x2="250" y2="340" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F1F5F9" />
          </linearGradient>

          <filter id="shadowGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#4941EC" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Circular Sky Horizon Backdrop */}
        <circle cx="250" cy="250" r="195" fill="url(#skyGrad)" stroke="#E0E7FF" strokeWidth="2" />

        {/* Spatial Grid Lines (Subtle WebGIS Touch) */}
        <g stroke="#C7D2FE" strokeWidth="1" strokeDasharray="4 6" opacity="0.6">
          <circle cx="250" cy="250" r="140" fill="none" />
          <circle cx="250" cy="250" r="80" fill="none" />
          <line x1="55" y1="250" x2="445" y2="250" />
          <line x1="250" y1="55" x2="250" y2="445" />
        </g>

        {/* Floating Clouds with CSS animation */}
        <g className="animate-pulse" style={{ animationDuration: '6s' }} opacity="0.85">
          {/* Cloud 1 */}
          <path
            d="M120 130 C120 118 132 108 145 110 C152 98 170 98 178 110 C188 110 198 118 198 130 C198 140 188 148 176 148 L134 148 C122 148 120 140 120 130 Z"
            fill="#FFFFFF"
            filter="url(#shadowGlow)"
          />
          {/* Cloud 2 */}
          <path
            d="M310 115 C310 105 320 96 331 98 C337 88 353 88 360 98 C369 98 377 105 377 115 C377 124 369 131 358 131 L322 131 C312 131 310 124 310 115 Z"
            fill="#FFFFFF"
            filter="url(#shadowGlow)"
          />
        </g>

        {/* Far Volcanic Mountains (Tangkuban Parahu Silhouette) */}
        <path
          d="M60 330 Q160 210 250 200 Q340 210 440 330 Z"
          fill="url(#mountainFar)"
          opacity="0.85"
        />

        {/* Crater Flat Ridge (Tangkuban Parahu Flat Top Characteristic) */}
        <path
          d="M200 206 L300 206 L320 230 L180 230 Z"
          fill="#4338CA"
          opacity="0.6"
        />

        {/* Mid Mountain Ridges */}
        <path
          d="M55 350 Q130 250 220 270 Q310 250 445 350 Z"
          fill="url(#mountainMid)"
          opacity="0.9"
        />

        {/* Foreground Rolling Tea Hills (Perkebunan Teh Ciwidey / Lembang) */}
        <path
          d="M55 380 Q150 290 250 330 Q350 300 445 390 L445 445 L55 445 Z"
          fill="url(#teaHills)"
        />

        {/* Contour Terraces on Tea Hills */}
        <g stroke="#059669" strokeWidth="2" opacity="0.4" fill="none">
          <path d="M70 395 Q170 330 260 360 Q340 330 430 405" />
          <path d="M90 415 Q180 360 270 385 Q350 360 420 425" />
        </g>

        {/* Gedung Sate Monument Centerpiece */}
        <g transform="translate(195, 220)" filter="url(#shadowGlow)">
          {/* Main White Palace Base */}
          <rect x="15" y="60" width="80" height="40" rx="4" fill="url(#gedungGrad)" stroke="#CBD5E1" strokeWidth="1.5" />
          {/* Windows row */}
          <rect x="25" y="70" width="10" height="15" rx="2" fill="#4941EC" opacity="0.75" />
          <rect x="42" y="70" width="10" height="15" rx="2" fill="#4941EC" opacity="0.75" />
          <rect x="59" y="70" width="10" height="15" rx="2" fill="#4941EC" opacity="0.75" />
          <rect x="75" y="70" width="10" height="15" rx="2" fill="#4941EC" opacity="0.75" />

          {/* Roof Tier 1 */}
          <path d="M10 60 L100 60 L85 45 L25 45 Z" fill="#334155" />
          {/* Tower Middle */}
          <rect x="40" y="25" width="30" height="20" rx="2" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.2" />
          <rect x="50" y="30" width="10" height="12" rx="2" fill="#4941EC" opacity="0.8" />

          {/* Roof Tier 2 */}
          <path d="M35 25 L75 25 L65 14 L45 14 Z" fill="#1E293B" />

          {/* Iconic Skewer Needle & Balls (Tusuk Sate Ornamen 6 Bulatan) */}
          <line x1="55" y1="14" x2="55" y2="-12" stroke="#EDAD40" strokeWidth="2.5" strokeLinecap="round" />
          {/* 6 Decorative Orbs */}
          {[0, 3, 6, 9, 12, 15].map((offset, i) => (
            <circle key={i} cx="55" cy={12 - offset} r="2.2" fill="#EDAD40" stroke="#B45309" strokeWidth="0.5" />
          ))}
          {/* Top Pinnacle Star */}
          <circle cx="55" cy="-14" r="3.5" fill="#FBBF24" />
        </g>

        {/* Animated Map Pin Markers (WebGIS Themed) */}
        {/* Pin 1: Tangkuban Parahu (Top-Left) */}
        <g transform="translate(130, 180)" className="animate-bounce" style={{ animationDuration: '3s' }}>
          <path
            d="M15 0 C6.7 0 0 6.7 0 15 C0 26.2 15 42 15 42 C15 42 30 26.2 30 15 C30 6.7 23.3 0 15 0 Z"
            fill="#4941EC"
          />
          <circle cx="15" cy="14" r="6" fill="#FFFFFF" />
          <circle cx="15" cy="14" r="3" fill="#4941EC" />
        </g>

        {/* Pin 2: Kawah Putih / Ciwidey (Right-Mid) */}
        <g transform="translate(340, 240)" className="animate-bounce" style={{ animationDuration: '3.6s', animationDelay: '0.8s' }}>
          <path
            d="M15 0 C6.7 0 0 6.7 0 15 C0 26.2 15 42 15 42 C15 42 30 26.2 30 15 C30 6.7 23.3 0 15 0 Z"
            fill="#60CE9F"
          />
          <circle cx="15" cy="14" r="6" fill="#FFFFFF" />
          <circle cx="15" cy="14" r="3" fill="#059669" />
        </g>

        {/* Pin 3: Curug / Nature (Far-Left) */}
        <g transform="translate(90, 280)" className="animate-bounce" style={{ animationDuration: '4.2s', animationDelay: '1.4s' }}>
          <path
            d="M12 0 C5.4 0 0 5.4 0 12 C0 21 12 33 12 33 C12 33 24 21 24 12 C24 5.4 18.6 0 12 0 Z"
            fill="#EDAD40"
          />
          <circle cx="12" cy="11" r="4.5" fill="#FFFFFF" />
          <circle cx="12" cy="11" r="2.5" fill="#D97706" />
        </g>

        {/* Spatial Radar Pulse Wave */}
        <circle cx="250" cy="270" r="16" fill="none" stroke="#4941EC" strokeWidth="2" className="animate-ping" opacity="0.4" />
      </svg>
    </div>
  );
}

