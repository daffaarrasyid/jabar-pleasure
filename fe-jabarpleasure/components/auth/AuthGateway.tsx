'use client';

import React from 'react';
import BrandLogo from '@/components/ui/BrandLogo';
import NatureIllustration from '@/components/ui/NatureIllustration';
import Button from '@/components/ui/Button';
import { GoogleIcon, AppleIcon } from '@/components/ui/SocialIcons';

interface AuthGatewayProps {
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
  onGoogleClick?: () => void;
  onAppleClick?: () => void;
}

export default function AuthGateway({
  onLoginClick,
  onRegisterClick,
  onGoogleClick,
  onAppleClick,
}: AuthGatewayProps) {
  return (
    <div className="relative w-full h-full flex-1 flex flex-col justify-center items-center overflow-y-auto select-none px-6 sm:px-8 py-6 sm:py-8">
      {/* Brand Logo - Centered at Top */}
      <div className="w-full flex items-center justify-center mb-3 sm:mb-4">
        <BrandLogo
          variant="gradient"
          size="sm"
          showText
          textClassName="text-[19px] font-bold text-gray-900 tracking-tight font-sans"
        />
      </div>

      {/* Centered Main Content Wrapper */}
      <div className="w-full max-w-[380px] mx-auto my-auto flex flex-col items-center justify-center">
        {/* Center Illustration Area - Prominent Hero Size with Looping Animation */}
        <div className="w-full flex items-center justify-center mb-4 sm:mb-5">
          <NatureIllustration className="max-w-[265px] sm:max-w-[295px] drop-shadow-xs" />
        </div>

        {/* Actions Section */}
        <div className="w-full flex flex-col items-center">
          {/* Section Heading - Balanced & Harmonious */}
          <h2 className="text-[22px] sm:text-[25px] font-bold text-center text-gray-900 mb-4 tracking-tight font-sans">
            Sudah punya akun?
          </h2>

          {/* Action Buttons Group with Clean Spacing */}
          <div className="flex flex-col gap-2.5 sm:gap-3 w-full">
            {/* 1. Primary Action: Masuk -> */}
            <Button
              variant="primary"
              onClick={onLoginClick}
              rightIcon={<span className="text-lg leading-none font-medium">→</span>}
              className="text-base font-semibold shadow-xs"
            >
              Masuk
            </Button>

            {/* 2. Secondary Action: Daftar Akun Baru */}
            <Button
              variant="outline"
              onClick={onRegisterClick}
              className="text-base font-semibold"
            >
              Daftar Akun Baru
            </Button>

            {/* Divider: atau dengan */}
            <div className="relative my-1 sm:my-1.5 flex items-center justify-center">
              <div className="w-full border-t border-[#60CE9F]/70" />
              <span className="absolute bg-white px-3 text-xs sm:text-[13px] font-medium text-gray-600 font-sans">
                atau dengan
              </span>
            </div>

            {/* 3. Social: Daftar dengan Google */}
            <Button
              variant="social"
              onClick={onGoogleClick}
              leftIcon={<GoogleIcon className="w-5 h-5 shrink-0" />}
              className="text-[15px] font-medium"
            >
              Daftar dengan Google
            </Button>

            {/* 4. Social: Daftar dengan Apple */}
            <Button
              variant="social"
              onClick={onAppleClick}
              leftIcon={<AppleIcon className="w-5 h-5 text-black shrink-0" />}
              className="text-[15px] font-medium"
            >
              Daftar dengan Apple
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
