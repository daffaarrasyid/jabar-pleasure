'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import { Check } from 'lucide-react';

interface InterestSelectionProps {
  onContinue?: (selectedInterests: string[]) => Promise<void> | void;
}

// 2D Vector: Modern & Lifestyle
function ModernLifestyleVector({ className = 'w-14 h-14' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="32" cy="32" r="28" fill="#F3E8FF" />
      {/* Shopping Bag */}
      <rect x="18" y="24" width="28" height="26" rx="4" fill="#A855F7" />
      <path
        d="M26 24V18C26 14.6863 28.6863 12 32 12C35.3137 12 38 14.6863 38 18V24"
        stroke="#7E22CE"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Star sparkle accent */}
      <path
        d="M32 31L33.5 35L37.5 36.5L33.5 38L32 42L30.5 38L26.5 36.5L30.5 35L32 31Z"
        fill="#FDE047"
      />
      <circle cx="44" cy="20" r="3" fill="#EC4899" />
    </svg>
  );
}

// 2D Vector: Wisata Alam & Terbuka
function NatureVector({ className = 'w-14 h-14' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="32" cy="32" r="28" fill="#DCFCE7" />
      {/* Golden Sun */}
      <circle cx="42" cy="20" r="8" fill="#FBBF24" />
      {/* Back Mountain */}
      <path d="M12 50L28 26C29.5 24 32.5 24 34 26L52 50H12Z" fill="#34D399" />
      {/* Front Mountain */}
      <path d="M26 50L38 32C39 30.5 41 30.5 42 32L56 50H26Z" fill="#10B981" />
      {/* Pine tree */}
      <path d="M20 50L24 42H16L20 36H18L20 32L22 36H20L24 42H22L26 50H20Z" fill="#047857" />
    </svg>
  );
}

// 2D Vector: Publik & Edukasi
function EducationVector({ className = 'w-14 h-14' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="32" cy="32" r="28" fill="#E0E7FF" />
      {/* Classic Museum / Library roof */}
      <path d="M16 26L32 16L48 26H16Z" fill="#4941EC" />
      {/* Columns */}
      <rect x="18" y="27" width="5" height="17" rx="1.5" fill="#6366F1" />
      <rect x="26" y="27" width="5" height="17" rx="1.5" fill="#6366F1" />
      <rect x="33" y="27" width="5" height="17" rx="1.5" fill="#6366F1" />
      <rect x="41" y="27" width="5" height="17" rx="1.5" fill="#6366F1" />
      {/* Foundation plinth */}
      <rect x="14" y="44" width="36" height="5" rx="1.5" fill="#3730A3" />
      <circle cx="32" cy="21" r="2.5" fill="#FDE047" />
    </svg>
  );
}

// 2D Vector: Rekreasi Keluarga
function FamilyRecreationVector({ className = 'w-14 h-14' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="32" cy="32" r="28" fill="#FEF3C7" />
      {/* Ferris Wheel rim */}
      <circle cx="32" cy="30" r="16" stroke="#F59E0B" strokeWidth="2.5" strokeDasharray="3 3" />
      <circle cx="32" cy="30" r="3" fill="#B45309" />
      {/* Ferris wheel spokes */}
      <line x1="32" y1="14" x2="32" y2="46" stroke="#D97706" strokeWidth="2" />
      <line x1="16" y1="30" x2="48" y2="30" stroke="#D97706" strokeWidth="2" />
      <line x1="21" y1="19" x2="43" y2="41" stroke="#D97706" strokeWidth="2" />
      <line x1="43" y1="19" x2="21" y2="41" stroke="#D97706" strokeWidth="2" />
      {/* Colorful Pods */}
      <circle cx="32" cy="14" r="3" fill="#EF4444" />
      <circle cx="48" cy="30" r="3" fill="#3B82F6" />
      <circle cx="32" cy="46" r="3" fill="#10B981" />
      <circle cx="16" cy="30" r="3" fill="#8B5CF6" />
      {/* Stand Base */}
      <path d="M24 50L32 32L40 50" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

type InterestType = 'modern' | 'alam' | 'edukasi' | 'keluarga';

interface InterestOption {
  id: string;
  type: InterestType;
  label: string;
}

export default function InterestSelection({ onContinue }: InterestSelectionProps) {
  // 4 master categories defined by product requirements
  const options: InterestOption[] = [
    { id: 'modern-lifestyle', type: 'modern', label: 'Modern & Lifestyle' },
    { id: 'wisata-alam-terbuka', type: 'alam', label: 'Wisata Alam & Terbuka' },
    { id: 'publik-edukasi', type: 'edukasi', label: 'Publik & Edukasi' },
    { id: 'rekreasi-keluarga', type: 'keluarga', label: 'Rekreasi Keluarga' },
  ];

  // Default selection is EMPTY per requirement
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const toggleInterest = (id: string) => {
    if (errorMessage) setErrorMessage(null);
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleContinue = async () => {
    if (selectedIds.length === 0) {
      setErrorMessage('Silakan pilih minimal satu minat.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (onContinue) {
        await onContinue(selectedIds);
      }
    } catch (err: unknown) {
      const errObj = err as { message?: string } | null;
      setErrorMessage(errObj?.message || 'Gagal menyimpan minat. Silakan coba kembali.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderVector = (type: InterestType) => {
    switch (type) {
      case 'alam':
        return <NatureVector className="w-14 h-14 sm:w-16 sm:h-16" />;
      case 'modern':
        return <ModernLifestyleVector className="w-14 h-14 sm:w-16 sm:h-16" />;
      case 'edukasi':
        return <EducationVector className="w-14 h-14 sm:w-16 sm:h-16" />;
      case 'keluarga':
        return <FamilyRecreationVector className="w-14 h-14 sm:w-16 sm:h-16" />;
    }
  };

  return (
    <div className="relative w-full h-full flex-1 flex flex-col justify-center items-center overflow-y-auto select-none px-5 sm:px-7 py-6 sm:py-8">
      {/* Centered Main Content Wrapper */}
      <div className="w-full max-w-[390px] mx-auto my-auto flex flex-col items-center justify-center">
        {/* Screen Title */}
        <h1 className="text-2xl sm:text-[26px] font-semibold text-center text-gray-900 mb-6 sm:mb-7 tracking-tight font-sans">
          Pilih minat kamu apa?
        </h1>

        {/* 2x2 Square Cards Grid for the 4 Categories */}
        <div className="grid grid-cols-2 gap-3.5 sm:gap-4 w-full mb-8">
          {options.map((item) => {
            const isSelected = selectedIds.includes(item.id);

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleInterest(item.id)}
                className={`relative h-36 sm:h-40 rounded-2xl flex flex-col items-center justify-center p-3.5 text-center gap-3 transition-all duration-200 active:scale-95 cursor-pointer border-2 select-none ${
                  isSelected
                    ? 'bg-[#EEF2FF] border-[#4941EC] shadow-md ring-2 ring-[#4941EC]/20 text-[#4941EC]'
                    : 'bg-white border-gray-100 shadow-2xs hover:border-gray-200 hover:bg-slate-50 text-gray-800'
                }`}
              >
                {/* Active check pill */}
                {isSelected && (
                  <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#4941EC] text-white flex items-center justify-center shadow-xs">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
                {renderVector(item.type)}
                <span className="text-xs sm:text-[13px] font-semibold leading-tight line-clamp-2 px-1">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {errorMessage && (
          <p className="text-xs text-red-500 font-sans mb-3 text-center">{errorMessage}</p>
        )}

        {/* Primary Action Button: Lanjutkan (No Icon) */}
        <div className="w-full">
          <Button
            variant="primary"
            onClick={handleContinue}
            isLoading={isLoading}
            className="w-full h-[50px] text-base font-semibold shadow-xs rounded-xl"
          >
            Lanjutkan
          </Button>
        </div>
      </div>
    </div>
  );
}
