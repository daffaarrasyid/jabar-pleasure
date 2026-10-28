'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';

interface InterestSelectionProps {
  onContinue?: (selectedInterests: string[]) => Promise<void> | void;
}

// Crisp vector icons matching the design mockup precisely
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

function ModernLifestyleIcon({ className = 'w-4 h-4' }: { className?: string }) {
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

function EducationIcon({ className = 'w-4 h-4' }: { className?: string }) {
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
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
      <path d="M6 6h10" />
      <path d="M6 10h10" />
    </svg>
  );
}

function FamilyRecreationIcon({ className = 'w-4 h-4' }: { className?: string }) {
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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

  // Pre-select 'wisata-alam-terbuka' initially to match the mockup visual
  const [selectedIds, setSelectedIds] = useState<string[]>(['wisata-alam-terbuka']);
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
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyimpan minat. Silakan coba kembali.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderIcon = (type: InterestType, isSelected: boolean) => {
    const iconClass = `w-4 h-4 shrink-0 transition-colors ${
      isSelected ? 'text-white' : 'text-[#4941EC]'
    }`;

    switch (type) {
      case 'alam':
        return <NatureTentIcon className={iconClass} />;
      case 'modern':
        return <ModernLifestyleIcon className={iconClass} />;
      case 'edukasi':
        return <EducationIcon className={iconClass} />;
      case 'keluarga':
        return <FamilyRecreationIcon className={iconClass} />;
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

        {/* 2-Column Grid for the 4 Categories, Preserving Original Chip Styling */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 w-full mb-8 sm:mb-9">
          {options.map((item) => {
            const isSelected = selectedIds.includes(item.id);

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleInterest(item.id)}
                className={`h-[48px] rounded-xl flex items-center justify-center gap-1.5 px-2.5 transition-all duration-150 active:scale-95 cursor-pointer font-sans text-xs sm:text-[13px] font-semibold border ${
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

        {errorMessage && (
          <p className="text-xs text-red-500 font-sans mb-3 text-center">{errorMessage}</p>
        )}

        {/* Primary Action Button: Lanjutkan -> */}
        <div className="w-full">
          <Button
            variant="primary"
            onClick={handleContinue}
            isLoading={isLoading}
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
