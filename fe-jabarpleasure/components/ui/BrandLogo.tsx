'use client';

import React, { useState } from 'react';

interface BrandLogoProps {
  variant?: 'white' | 'gradient' | 'primary';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textClassName?: string;
  className?: string;
  imageSrc?: string; // Optional custom image path
}

export default function BrandLogo({
  variant = 'gradient',
  size = 'md',
  showText = false,
  textClassName = '',
  className = '',
  imageSrc,
}: BrandLogoProps) {
  // Dimension tokens
  const sizeMap = {
    sm: { width: 34, height: 42, iconSize: 'w-[34px] h-[42px]', textSize: 'text-lg' },
    md: { width: 48, height: 60, iconSize: 'w-[48px] h-[60px]', textSize: 'text-xl' },
    lg: { width: 88, height: 110, iconSize: 'w-[88px] h-[110px]', textSize: 'text-2xl font-bold' },
    xl: { width: 120, height: 150, iconSize: 'w-[120px] h-[150px]', textSize: 'text-3xl font-bold' },
  };

  const currentSize = sizeMap[size];
  const uniqueId = React.useId().replace(/:/g, '');

  const [imageSrcToUse, setImageSrcToUse] = useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    const candidates = imageSrc
      ? [imageSrc]
      : variant === 'white'
        ? ['/logo-white.svg', '/logo.svg']
        : ['/logo.svg'];

    const checkCandidates = async () => {
      for (const src of candidates) {
        const exists = await new Promise<boolean>((resolve) => {
          const testImg = new window.Image();
          testImg.onload = () => resolve(true);
          testImg.onerror = () => resolve(false);
          testImg.src = src;
        });

        if (exists && active) {
          setImageSrcToUse(src);
          return;
        }
      }
      if (active) {
        setImageSrcToUse(null);
      }
    };

    checkCandidates();

    return () => {
      active = false;
    };
  }, [imageSrc, variant]);

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div className={`relative shrink-0 flex items-center justify-center ${currentSize.iconSize}`}>
        {/* Render custom logo image if available, else render precision vector SVG */}
        {imageSrcToUse ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageSrcToUse}
            alt="JabarPleasure Logo"
            className="w-full h-full object-contain"
          />
        ) : (
          /* Graceful Fallback: High-fidelity Vector SVG with negative space tree */
          <svg
            viewBox="0 0 100 125"
            className="w-full h-full drop-shadow-sm overflow-visible"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id={`brandGrad-${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4941EC" />
                <stop offset="100%" stopColor="#60CE9F" />
              </linearGradient>

              <mask id={`pinMask-${uniqueId}`}>
                <rect width="100" height="125" fill="black" />
                {/* Pin outer body */}
                <path
                  d="M50 8
                     C27.909 8 10 25.909 10 48
                     C10 65.5 28 89 44 112
                     C45.5 114.2 48.5 114.2 50 112
                     C50 112 56 112 56 112
                     C72 89 90 65.5 90 48
                     C90 25.909 72.091 8 50 8 Z"
                  fill="white"
                />

                {/* Tree Canopy cutout in negative space */}
                <path
                  d="M50 32
                     C50 32 40 46 36 54
                     C32.5 61 36 67 43 67
                     L46 67
                     L44 86
                     L56 86
                     L54 67
                     L57 67
                     C64 67 67.5 61 64 54
                     C60 46 50 32 50 32 Z"
                  fill="black"
                />

                {/* Bottom notch cutout */}
                <path
                  d="M44 86
                     L56 86
                     L56 118
                     L44 118 Z"
                  fill="black"
                />
              </mask>
            </defs>

            <rect
              width="100"
              height="125"
              mask={`url(#pinMask-${uniqueId})`}
              fill={
                variant === 'white'
                  ? '#FFFFFF'
                  : variant === 'primary'
                    ? '#4941EC'
                    : `url(#brandGrad-${uniqueId})`
              }
            />
          </svg>
        )}
      </div>

      {showText && (
        <span
          className={`font-bold tracking-tight font-sans ${variant === 'white' ? 'text-white' : 'text-gray-900'
            } ${textClassName || currentSize.textSize}`}
        >
          JabarPleasure
        </span>
      )}
    </div>
  );
}
