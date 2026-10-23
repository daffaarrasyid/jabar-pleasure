'use client';

import React from 'react';

interface ClappingIllustrationProps {
  className?: string;
  imageSrc?: string;
}

export default function ClappingIllustration({
  className = '',
  imageSrc = '/clapping.png',
}: ClappingIllustrationProps) {
  return (
    <div
      className={`relative flex items-center justify-center w-full max-w-[210px] sm:max-w-[230px] mx-auto select-none aspect-square ${className}`}
      aria-label="Ilustrasi tepuk tangan berhasil daftar JabarPleasure"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc}
        alt="Mantapp Kamu berhasil daftar"
        className="w-full h-full object-contain animate-clapping-bounce drop-shadow-md select-none pointer-events-none"
      />
    </div>
  );
}
