'use client';

import React, { useEffect, useState } from 'react';
import { Filter, Check, Plus } from 'lucide-react';
import { getCategories, ApiCategory } from '@/lib/api';

export const DEFAULT_MAP_CATEGORIES = [
  'Semua',
  'Wisata Alam & Terbuka',
  'Modern & Lifestyle',
  'Publik & Edukasi',
  'Rekreasi Keluarga',
];

interface MapExplorationFilterProps {
  categories?: string[];
  selectedCategory?: string;
  selectedCategories?: string[];
  onToggleCategory?: (category: string) => void;
  radius?: number; // 1 | 10 | 25
  onChangeRadius?: (radius: number) => void;
  onReset?: () => void;
  className?: string;
}

const RADIUS_STEPS = [1, 10, 25];

export default function MapExplorationFilter({
  categories: initialCategories,
  selectedCategory = 'Semua',
  selectedCategories,
  onToggleCategory,
  radius = 10,
  onChangeRadius,
  onReset,
  className = '',
}: MapExplorationFilterProps) {
  const [categoriesList, setCategoriesList] = useState<string[]>(
    initialCategories || DEFAULT_MAP_CATEGORIES
  );

  useEffect(() => {
    if (initialCategories && initialCategories.length > 0) {
      setCategoriesList(initialCategories);
      return;
    }

    let isMounted = true;
    getCategories()
      .then((items: ApiCategory[]) => {
        if (isMounted && items && items.length > 0) {
          const names = ['Semua', ...items.map((c) => c.name)];
          setCategoriesList(names);
        }
      })
      .catch((err) => {
        console.warn('Failed to load categories from API, using default list:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [initialCategories]);

  const isCategorySelected = (cat: string) => {
    if (selectedCategories && selectedCategories.length > 0) {
      return selectedCategories.includes(cat);
    }
    return selectedCategory === cat;
  };

  return (
    <div
      className={`bg-white rounded-2xl p-4 shadow-[0_8px_24px_rgba(0,0,0,0.08)] border border-gray-100 select-none animate-in fade-in slide-in-from-top-3 duration-200 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-900 stroke-[2.4] fill-gray-900" />
          <h3 className="text-sm font-bold text-gray-900 tracking-tight">
            Filter Eksplorasi
          </h3>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="bg-[#60CE9F] hover:bg-[#4EB789] text-white text-[11px] font-semibold px-3 py-1 rounded-md transition-all active:scale-95 cursor-pointer shadow-xs"
        >
          Reset
        </button>
      </div>

      {/* Destinasi Kategori Section */}
      <div className="mb-3">
        <span className="block text-xs text-gray-600 font-medium mb-2">
          Kategori Wisata
        </span>
        <div className="flex flex-wrap gap-1.5">
          {categoriesList.map((category) => {
            const isSelected = isCategorySelected(category);
            return (
              <button
                key={category}
                type="button"
                onClick={() => onToggleCategory?.(category)}
                className={`flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95 cursor-pointer border ${
                  isSelected
                    ? 'bg-[#4941EC] border-[#4941EC] text-white shadow-xs'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-[#4941EC] hover:text-[#4941EC]'
                }`}
              >
                {isSelected ? (
                  <Check className="w-3.5 h-3.5 stroke-[2.6]" />
                ) : (
                  <Plus className="w-3.5 h-3.5 stroke-[2.4]" />
                )}
                <span>{category}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Jangkauan Radius Section */}
      <div>
        <span className="block text-xs text-gray-600 font-medium mb-2">
          Jangkauan Radius dari Titik Anda
        </span>

        {/* Custom Segmented Radius Slider */}
        <div className="relative px-2 pt-1 pb-4">
          {/* Background Grey Bar */}
          <div className="absolute top-2.5 left-2 right-2 h-1 bg-gray-200 rounded-full" />

          {/* Active Blue Progress Fill */}
          <div
            className="absolute top-2.5 left-2 h-1 bg-[#4941EC] rounded-full transition-all duration-300"
            style={{
              width:
                radius <= 1 ? '0%' : radius <= 10 ? '50%' : '100%',
            }}
          />

          {/* Stop Points */}
          <div className="relative flex justify-between items-center z-10">
            {RADIUS_STEPS.map((step) => {
              const isActive = step <= radius;
              const isCurrent = step === radius;
              return (
                <button
                  key={step}
                  type="button"
                  onClick={() => onChangeRadius?.(step)}
                  className="flex flex-col items-center group cursor-pointer focus:outline-none"
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                      isActive
                        ? 'border-[#4941EC] bg-white group-hover:scale-110'
                        : 'border-gray-300 bg-white group-hover:border-gray-400'
                    } ${isCurrent ? 'ring-2 ring-[#4941EC]/30 scale-110 bg-[#4941EC]/20' : ''}`}
                  />
                  <span
                    className={`text-[11px] mt-1.5 font-medium transition-colors ${
                      isCurrent
                        ? 'text-gray-900 font-bold'
                        : 'text-gray-500'
                    }`}
                  >
                    {step} km
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
