'use client';

import React from 'react';
import BrandLogo from '@/components/ui/BrandLogo';
import ClappingIllustration from '@/components/ui/ClappingIllustration';
import Button from '@/components/ui/Button';

interface RegisterSuccessProps {
  onContinue?: () => void;
}

export default function RegisterSuccess({ onContinue }: RegisterSuccessProps) {
  return (
    <div className="relative w-full h-full flex-1 flex flex-col justify-center items-center overflow-y-auto select-none px-6 sm:px-8 py-6 sm:py-8">
      {/* Brand Logo - Centered at Top */}
      <div className="w-full flex items-center justify-center mb-4 sm:mb-6">
        <BrandLogo
          variant="gradient"
          size="sm"
          showText
          textClassName="text-[19px] font-bold text-gray-900 tracking-tight font-sans"
        />
      </div>

      {/* Main Success Content - Perfectly Centered in Viewport */}
      <div className="w-full max-w-[380px] mx-auto my-auto flex flex-col items-center justify-center">
        {/* Animated Clapping Hands Illustration */}
        <div className="w-full flex items-center justify-center mb-6 sm:mb-8">
          <ClappingIllustration className="max-w-[230px] sm:max-w-[250px]" />
        </div>

        {/* Heading & Subtitle matching Mockup */}
        <div className="text-center mb-8 sm:mb-9">
          <h1 className="text-3xl sm:text-[34px] font-bold text-gray-900 tracking-tight font-sans">
            Mantapp
          </h1>
          <p className="text-base sm:text-[17px] text-gray-600 font-medium font-sans mt-2">
            Kamu berhasil daftar
          </p>
        </div>

        {/* Action Button: Lanjutkan -> */}
        <div className="w-full">
          <Button
            variant="primary"
            onClick={onContinue}
            rightIcon={<span className="text-lg leading-none font-medium">→</span>}
            className="w-full h-[50px] text-base font-semibold shadow-xs rounded-xl"
          >
            Lanjutkan
          </Button>
        </div>
      </div>
    </div>
  );
}
