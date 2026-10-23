import React from 'react';

interface NatureIllustrationProps {
  className?: string;
}

export default function NatureIllustration({
  className = '',
}: NatureIllustrationProps) {
  return (
    <div
      className={`relative flex items-center justify-center w-full max-w-[270px] sm:max-w-[300px] mx-auto select-none ${className}`}
      aria-label="Ilustrasi pemandangan gunung dan matahari JabarPleasure"
    >
      <svg
        viewBox="0 0 280 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto overflow-visible"
      >
        {/* Sun in the upper-right with animated rotating rays and pulsing glow */}
        <g transform="translate(202, 58)">
          {/* Animated Sun Rays - Smooth Continuous Loop */}
          <g className="animate-sun-spin" style={{ transformOrigin: '0px 0px' }}>
            {/* Ray Top */}
            <polygon points="0,-32 -5,-20 5,-20" fill="#EDAD40" />
            {/* Ray Top-Right */}
            <polygon points="23,-23 11,-18 18,-11" fill="#EDAD40" />
            {/* Ray Right */}
            <polygon points="32,0 20,-5 20,5" fill="#EDAD40" />
            {/* Ray Bottom-Right */}
            <polygon points="23,23 18,11 11,18" fill="#EDAD40" />
            {/* Ray Bottom */}
            <polygon points="0,32 5,20 -5,20" fill="#EDAD40" />
            {/* Ray Bottom-Left */}
            <polygon points="-23,23 -11,18 -18,11" fill="#EDAD40" />
            {/* Ray Left */}
            <polygon points="-32,0 -20,5 -20,-5" fill="#EDAD40" />
            {/* Ray Top-Left */}
            <polygon points="-23,-23 -18,-11 -11,-18" fill="#EDAD40" />
          </g>

          {/* Central Sun Disc with Gentle Ambient Pulse */}
          <circle
            cx="0"
            cy="0"
            r="17"
            fill="#EDAD40"
            className="animate-sun-pulse"
            style={{ transformOrigin: '0px 0px' }}
          />
        </g>

        {/* Mountain 1: Left / Background (Dark Forest Green) with looping subtle float */}
        <path
          d="M102 65
             C105 60 111 60 114 65
             L182 178
             C185 183 181 188 175 188
             L45 188
             C39 188 35 183 38 178
             Z"
          fill="#2E7D32"
          className="animate-mountain-bg"
        />

        {/* Mountain 2: Right / Foreground (Vibrant Grass Green) with looping subtle float */}
        <path
          d="M168 100
             C171 95 177 95 180 100
             L232 178
             C235 183 231 188 225 188
             L123 188
             C117 188 114 183 117 178
             Z"
          fill="#4CAF50"
          className="animate-mountain-fg"
        />
      </svg>
    </div>
  );
}

