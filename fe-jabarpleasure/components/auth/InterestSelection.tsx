'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';

interface InterestSelectionProps {
  onContinue?: (selectedInterests: string[]) => void;
}

// Custom crisp vector icons matching the design mockup precisely
function NatureTentIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M19 20 12 4 5 20" />
      <path d="M12 4v16" />
      <path d="m9 20 3-7 3 7" />
      <path d="M3 20h18" />
    </svg>
  );
}

function CulinaryDishIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 17h18" />
      <path d="M5 17a7 7 0 0 1 14 0" />
      <path d="M12 10V7" />
      <path d="M10 7h4" />
      <path d="M7 20h10" />
    </svg>
  );
}

function ModernMicIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m13 11-8.5 8.5a2.12 2.12 0 1 0 3 3L16 14" />
      <circle cx="17" cy="7" r="4.5" />
      <path d="m19 5 2-2" />
      <path d="m21 9 2-1" />
      <path d="m15 3 1-2" />
    </svg>
  );
}

interface InterestOption {
  id: string;
  type: 'alam' | 'kuliner' | 'modern';
  label: string;
}

export default function InterestSelection({ onContinue }: InterestSelectionProps) {
  // 8 rows x 3 columns matching the exact mockup
  const options: InterestOption[] = Array.from({ length: 8 }).flatMap((_, rowIndex) => [
    { id: `alam-${rowIndex}`, type: 'alam', label: 'Alam' },
    { id: `kuliner-${rowIndex}`, type: 'kuliner', label: 'Kuliner' },
    { id: `modern-${rowIndex}`, type: 'modern', label: 'Modern' },
  ]);

  // Initially select row 4 "Alam" to match the provided mockup visual
  const [selectedIds, setSelectedIds] = useState<string[]>(['alam-3']);

  const toggleInterest = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    if (onContinue) {
      onContinue(selectedIds);
    }
  };

  const renderIcon = (type: 'alam' | 'kuliner' | 'modern', isSelected: boolean) => {
    const iconClass = `w-4 h-4 shrink-0 transition-colors ${
      isSelected ? 'text-white' : 'text-[#4941EC]'
    }`;

    switch (type) {
      case 'alam':
        return <NatureTentIcon className={iconClass} />;
      case 'kuliner':
        return <CulinaryDishIcon className={iconClass} />;
      case 'modern':
        return <ModernMicIcon className={iconClass} />;
    }
  };

  return (
    <div className="relative w-full h-full flex-1 flex flex-col justify-center items-center overflow-y-auto select-none px-5 sm:px-7 py-6 sm:py-8">
      {/* Centered Main Content Wrapper */}
      <div className="w-full max-w-[390px] mx-auto my-auto flex flex-col items-center justify-center">
        {/* Screen Title matching Mockup */}
        <h1 className="text-2xl sm:text-[26px] font-bold text-center text-gray-900 mb-6 sm:mb-7 tracking-tight font-sans">
          Pilih minat kamu apa?
        </h1>

        {/* 3-Column Grid of Interest Chips matching Mockup */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 w-full mb-8 sm:mb-9">
          {options.map((item) => {
            const isSelected = selectedIds.includes(item.id);

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleInterest(item.id)}
                className={`h-[44px] rounded-xl flex items-center justify-center gap-1.5 px-2.5 transition-all duration-150 active:scale-95 cursor-pointer font-sans text-xs sm:text-[13px] font-semibold border ${
                  isSelected
                    ? 'bg-[#4941EC] border-[#4941EC] text-white shadow-xs'
                    : 'bg-white border-gray-100 text-gray-800 hover:bg-slate-50/80 hover:border-gray-200'
                }`}
              >
                {renderIcon(item.type, isSelected)}
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Primary Action Button: Lanjutkan -> */}
        <div className="w-full">
          <Button
            variant="primary"
            onClick={handleContinue}
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
