'use client';

import React from 'react';

interface RouteMapIllustrationProps {
  originName?: string;
  activeStopIndex?: number; // 0 = heading to stop 1, 1 = heading to stop 2, etc.
  className?: string;
}

export default function RouteMapIllustration({
  originName = 'Stasiun Bogor',
  activeStopIndex = 0,
  className = '',
}: RouteMapIllustrationProps) {
  return (
    <div
      className={`relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden bg-[#EDF3EE] border border-emerald-100/60 shadow-xs select-none ${className}`}
    >
      <svg
        viewBox="0 0 400 240"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Defs for gradients & filters */}
        <defs>
          <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4941EC" />
            <stop offset="100%" stopColor="#3730A3" />
          </linearGradient>
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.1" />
          </filter>
        </defs>

        {/* 1. Base Terrain & Grid Background */}
        <rect width="400" height="240" fill="#EDF3ED" />

        {/* 2. Meandering Ciliwung River (East / Right side) */}
        <path
          d="M 290 0 
             C 280 40, 340 70, 310 110 
             C 285 145, 335 180, 315 240
             L 340 240
             C 360 180, 310 145, 335 110
             C 365 70, 305 40, 315 0 Z"
          fill="#D4EAF7"
          opacity="0.85"
        />

        {/* 3. Kebun Raya Bogor (Center Soft Green Zone) */}
        <rect
          x="140"
          y="35"
          width="145"
          height="115"
          rx="32"
          fill="#D6E8D4"
          stroke="#C8DEC5"
          strokeWidth="1.5"
        />
        {/* Kebun Raya Bogor Label */}
        <text
          x="212"
          y="98"
          textAnchor="middle"
          fill="#52796F"
          fontSize="11"
          fontWeight="600"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          Kebun Raya Bogor
        </text>

        {/* 4. City Road Network (White clean road grid surrounding Kebun Raya) */}
        {/* Outer Loop Road: Jl. Ir. H. Juanda, Jl. Jalak Harupat, Jl. Pajajaran */}
        <rect
          x="75"
          y="45"
          width="225"
          height="125"
          rx="18"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="16"
          strokeLinejoin="round"
        />
        <rect
          x="75"
          y="45"
          width="225"
          height="125"
          rx="18"
          fill="none"
          stroke="#E2E8F0"
          strokeWidth="1"
          strokeLinejoin="round"
        />

        {/* Cross road to Stasiun Bogor */}
        <line
          x1="40"
          y1="80"
          x2="90"
          y2="80"
          stroke="#FFFFFF"
          strokeWidth="14"
          strokeLinecap="round"
        />

        {/* East road leading to Botani Square */}
        <path
          d="M 290 120 L 335 120"
          stroke="#FFFFFF"
          strokeWidth="14"
          strokeLinecap="round"
        />

        {/* 5. Active Blue Route Line */}
        {/* Path: Stasiun Bogor (85, 80) -> down to (85, 170) -> right to (305, 170) -> up to Tugu Kujang (305, 125) -> right to Botas (340, 125) */}
        <path
          d="M 85 80 
             L 85 168 
             Q 85 170 87 170
             L 303 170 
             Q 305 170 305 168
             L 305 125 
             L 325 125"
          fill="none"
          stroke="url(#routeGrad)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#shadow)"
        />

        {/* 6. Origin Node: Stasiun Bogor */}
        <circle cx="85" cy="80" r="7" fill="#4941EC" stroke="#FFFFFF" strokeWidth="2.5" />
        <text
          x="72"
          y="68"
          textAnchor="start"
          fill="#334155"
          fontSize="10"
          fontWeight="600"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          {originName}
        </text>

        {/* 7. Stop 1 Node: Tugu Kujang */}
        <g transform="translate(293, 113)">
          <rect
            x="0"
            y="0"
            width="26"
            height="26"
            rx="8"
            fill={activeStopIndex >= 1 ? '#10B981' : '#4941EC'}
            stroke="#FFFFFF"
            strokeWidth="2"
            filter="url(#shadow)"
          />
          <text
            x="13"
            y="17"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="12"
            fontWeight="bold"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            {activeStopIndex >= 1 ? '✓' : '1'}
          </text>
        </g>

        {/* Stop 1 & Botas Label below */}
        <text
          x="306"
          y="186"
          textAnchor="middle"
          fill="#334155"
          fontSize="10"
          fontWeight="600"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          Tugu Kujang · Botas
        </text>

        {/* 8. Stop 2 Node: Botani Square (Botas) */}
        <g transform="translate(328, 114)">
          <rect
            x="0"
            y="0"
            width="24"
            height="24"
            rx="7"
            fill={activeStopIndex >= 2 ? '#10B981' : activeStopIndex === 1 ? '#4941EC' : '#D1FAE5'}
            stroke="#FFFFFF"
            strokeWidth="2"
            filter="url(#shadow)"
          />
          <text
            x="12"
            y="16"
            textAnchor="middle"
            fill={activeStopIndex >= 2 || activeStopIndex === 1 ? '#FFFFFF' : '#059669'}
            fontSize="11"
            fontWeight="bold"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            {activeStopIndex >= 2 ? '✓' : '2'}
          </text>
        </g>
      </svg>

      {/* Floating Badge at bottom-left */}
      <div className="absolute bottom-2.5 left-2.5 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-gray-200/60 shadow-2xs">
        <span className="text-[10px] font-semibold text-gray-600 tracking-tight">
          Ilustrasi rute · Bogor Tengah
        </span>
      </div>
    </div>
  );
}
