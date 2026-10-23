'use client';

import React, { useEffect, useState } from 'react';
import BrandLogo from '@/components/ui/BrandLogo';

interface SplashScreenProps {
  onFinish?: () => void;
  autoDismissDelay?: number; // in milliseconds, 0 = no auto dismiss
}

export default function SplashScreen({
  onFinish,
  autoDismissDelay = 2400,
}: SplashScreenProps) {
  const [mounted, setMounted] = useState(false);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const mountTimer = setTimeout(() => {
      setMounted(true);
    }, 50);

    if (!autoDismissDelay || !onFinish) return () => clearTimeout(mountTimer);

    // Smoothly start fade-out after delay
    const dismissTimer = setTimeout(() => {
      setIsFading(true);
      const finishTimer = setTimeout(() => {
        onFinish();
      }, 700);
      return () => clearTimeout(finishTimer);
    }, autoDismissDelay);

    return () => {
      clearTimeout(mountTimer);
      clearTimeout(dismissTimer);
    };
  }, [autoDismissDelay, onFinish]);

  const handleSkip = () => {
    if (onFinish && !isFading) {
      setIsFading(true);
      setTimeout(onFinish, 700);
    }
  };

  return (
    <div
      onClick={handleSkip}
      className={`absolute inset-0 z-40 w-full h-full flex flex-col items-center justify-center cursor-pointer select-none transition-opacity duration-700 ease-in-out ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        background: 'linear-gradient(180deg, #4941EC 0%, #4D64E6 35%, #56A4C2 70%, #60CE9F 100%)',
      }}
      role="banner"
      aria-label="JabarPleasure Splash Screen"
    >
      <div
        className={`flex flex-col items-center justify-center px-6 text-center transition-all duration-700 ease-out ${
          mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-90 translate-y-3'
        }`}
      >
        {/* Animated Brand Logo with subtle pulse */}
        <div className="animate-splash-pulse transition-transform duration-500 drop-shadow-md">
          <BrandLogo variant="white" size="xl" />
        </div>

        {/* Brand Name */}
        <h1 className="mt-5 text-3xl sm:text-[34px] font-bold tracking-tight text-white drop-shadow-sm font-sans">
          JabarPleasure
        </h1>
      </div>
    </div>
  );
}
