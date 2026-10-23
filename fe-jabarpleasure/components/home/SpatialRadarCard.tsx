'use client';

import React from 'react';

interface SpatialRadarCardProps {
  title?: string;
  radiusLabel?: string;
  latitude?: string;
  longitude?: string;
  className?: string;
}

export default function SpatialRadarCard({
  title = 'Spatial Radar - Jawa Barat',
  radiusLabel = 'Radius 50km',
  latitude = '-6.9175',
  longitude = '107.6191',
  className = '',
}: SpatialRadarCardProps) {
  return (
    <section className={`w-full px-5 py-2.5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-base font-bold text-gray-900 tracking-tight">
          {title}
        </h2>
        <span className="text-xs text-gray-500 font-medium">
          {radiusLabel}
        </span>
      </div>

      {/* Blue Gradient Radar Card */}
      <div className="relative w-full h-[98px] rounded-2xl bg-gradient-to-r from-[#4941EC] via-[#4840EB] to-[#5950F6] overflow-hidden p-4 shadow-[0_4px_16px_rgba(73,65,236,0.22)] select-none flex flex-col justify-between">
        {/* Subtle decorative background grid pattern */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* Spatial Radar SVG Curve / Wave */}
        <div className="relative w-full h-12 flex items-center">
          <svg
            viewBox="0 0 340 50"
            className="w-full h-full overflow-visible"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Dashed wave path matching mockup */}
            <path
              d="M 10 38 L 45 32 L 80 18 L 115 28 L 150 42 L 185 30 L 220 14 L 255 18 L 290 28 L 330 38"
              stroke="white"
              strokeWidth="2"
              strokeDasharray="4 4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-95"
            />

            {/* Glowing radar nodes on vertices */}
            {[
              { cx: 80, cy: 18 },
              { cx: 150, cy: 42 },
              { cx: 220, cy: 14 },
              { cx: 255, cy: 18 },
            ].map((pt, i) => (
              <g key={i}>
                <circle cx={pt.cx} cy={pt.cy} r="4" fill="white" className="opacity-90" />
                <circle cx={pt.cx} cy={pt.cy} r="7" fill="white" className="opacity-30 animate-ping" />
              </g>
            ))}
          </svg>
        </div>

        {/* Coordinates Footer */}
        <div className="flex justify-end items-center z-10">
          <span className="text-[11px] font-sans font-medium text-white/95 tracking-wider">
            LAT: {latitude}, LNG: {longitude}
          </span>
        </div>
      </div>
    </section>
  );
}
