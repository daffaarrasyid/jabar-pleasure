'use client';

import React, { useEffect, useState } from 'react';
import { getCategories } from '@/lib/api';

interface CategoryFilterProps {
  categories?: string[];
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
  className?: string;
}

const DEFAULT_CATEGORIES = [
  'Semua',
  'Wisata Alam & Terbuka',
  'Modern & Lifestyle',
  'Publik & Edukasi',
  'Rekreasi Keluarga',
];

export default function CategoryFilter({
  categories: initialCategories,
  selectedCategory = 'Semua',
  onSelectCategory,
  className = '',
}: CategoryFilterProps) {
  const [categoriesList, setCategoriesList] = useState<string[]>(
    initialCategories || DEFAULT_CATEGORIES
  );

  useEffect(() => {
    if (initialCategories && initialCategories.length > 0) {
      setCategoriesList(initialCategories);
      return;
    }

    let isMounted = true;
    getCategories()
      .then((items) => {
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

  return (
    <div className={`w-full overflow-x-auto no-scrollbar py-2 px-5 select-none ${className}`}>
      <div className="flex items-center gap-2.5 min-w-max">
        {categoriesList.map((category) => {
          const isSelected = selectedCategory === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => onSelectCategory?.(category)}
              className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all active:scale-95 cursor-pointer whitespace-nowrap ${
                isSelected
                  ? 'bg-[#4941EC] text-white shadow-[0_2px_8px_rgba(73,65,236,0.3)] font-semibold'
                  : 'bg-white text-gray-700 hover:text-gray-900 border border-gray-200/80 hover:bg-gray-50/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]'
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>
    </div>
  );
}
