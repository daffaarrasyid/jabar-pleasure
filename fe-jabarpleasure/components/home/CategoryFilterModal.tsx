'use client';

import React, { useEffect, useState } from 'react';
import { X, Check } from 'lucide-react';
import { getCategories, ApiCategory } from '@/lib/api';

interface CategoryFilterModalProps {
  isOpen: boolean;
  selectedCategory: string;
  onClose: () => void;
  onApply: (category: string) => void;
}

const DEFAULT_CATEGORIES = [
  'Semua',
  'Wisata Alam & Terbuka',
  'Modern & Lifestyle',
  'Publik & Edukasi',
  'Rekreasi Keluarga',
];

export default function CategoryFilterModal({
  isOpen,
  selectedCategory,
  onClose,
  onApply,
}: CategoryFilterModalProps) {
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [tempSelected, setTempSelected] = useState<string>(selectedCategory);

  useEffect(() => {
    setTempSelected(selectedCategory);
  }, [selectedCategory, isOpen]);

  useEffect(() => {
    let isMounted = true;
    getCategories()
      .then((items: ApiCategory[]) => {
        if (isMounted && items && items.length > 0) {
          setCategories(['Semua', ...items.map((c) => c.name)]);
        }
      })
      .catch((err) => {
        console.warn('Could not load categories in filter modal:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-xs transition-opacity duration-300">
      {/* Click outside backdrop to dismiss */}
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom Sheet Container */}
      <div className="relative w-full max-w-[480px] bg-white rounded-t-3xl shadow-2xl p-5 pb-8 z-10 animate-in slide-in-from-bottom duration-300 max-h-[85vh] flex flex-col">
        {/* Handle Bar Indicator */}
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900 tracking-tight">
              Filter Kategori Destinasi
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Pilih kategori wisata yang ingin ditampilkan
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Tutup filter"
          >
            <X className="w-4 h-4 stroke-[2]" />
          </button>
        </div>

        {/* Categories List */}
        <div className="py-4 space-y-2 overflow-y-auto no-scrollbar flex-1">
          {categories.map((cat) => {
            const isSelected = tempSelected === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setTempSelected(cat)}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border text-sm font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#4941EC] bg-[#EEF0FF] text-[#4941EC] shadow-xs'
                    : 'border-gray-200/80 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{cat}</span>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-[#4941EC] text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-gray-100 flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setTempSelected('Semua');
              onApply('Semua');
              onClose();
            }}
            className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-100 active:scale-95 transition-all cursor-pointer"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => {
              onApply(tempSelected);
              onClose();
            }}
            className="flex-2 py-3 px-4 rounded-xl bg-[#4941EC] hover:bg-[#3C35C7] text-white text-xs font-bold shadow-md shadow-[#4941EC]/20 active:scale-95 transition-all cursor-pointer"
          >
            Terapkan Filter
          </button>
        </div>
      </div>
    </div>
  );
}

