import React from 'react';
import {
  Mountain,
  Building2,
  Landmark,
  Palmtree,
  Utensils,
  Compass,
  LucideIcon,
} from 'lucide-react';

export interface CategoryMeta {
  icon: LucideIcon;
  fallbackImage: string;
  badgeBg: string;
  badgeText: string;
}

const CATEGORY_IMAGES: Record<string, string[]> = {
  alam: [
    '/tangkuban-parahu.jpg',
    '/gunung-malabar.jpg',
    '/tahura-juanda.jpg',
    '/kawah-ratu.jpg',
    '/puncak-sari.jpg',
  ],
  modern: [
    '/gedung-sate.jpg',
    '/botani-square.jpg',
  ],
  edukasi: [
    '/kebun-raya-bogor.jpg',
    '/tugu-kujang.jpg',
  ],
  keluarga: [
    '/floating-market.jpg',
    '/dusun-bambu.jpg',
    '/friends-crater.jpg',
  ],
  kuliner: [
    '/floating-market.jpg',
    '/botani-square.jpg',
  ],
  default: [
    '/tahura-juanda.jpg',
    '/gedung-sate.jpg',
    '/tangkuban-parahu.jpg',
    '/gunung-malabar.jpg',
  ],
};

/**
 * Returns icon, fallback image, and theme colors based on destination category name.
 */
export function getCategoryMeta(categoryName?: string, index: number = 0): CategoryMeta {
  const normalized = (categoryName || '').toLowerCase().trim();

  if (normalized.includes('alam') || normalized.includes('terbuka') || normalized.includes('gunung') || normalized.includes('pantai')) {
    const images = CATEGORY_IMAGES.alam;
    return {
      icon: Mountain,
      fallbackImage: images[index % images.length],
      badgeBg: 'bg-[#ECFDF5]',
      badgeText: 'text-[#059669]',
    };
  }

  if (normalized.includes('modern') || normalized.includes('lifestyle') || normalized.includes('mall') || normalized.includes('belanja')) {
    const images = CATEGORY_IMAGES.modern;
    return {
      icon: Building2,
      fallbackImage: images[index % images.length],
      badgeBg: 'bg-[#EEF0FF]',
      badgeText: 'text-[#4941EC]',
    };
  }

  if (normalized.includes('publik') || normalized.includes('edukasi') || normalized.includes('sejarah') || normalized.includes('museum') || normalized.includes('budaya')) {
    const images = CATEGORY_IMAGES.edukasi;
    return {
      icon: Landmark,
      fallbackImage: images[index % images.length],
      badgeBg: 'bg-[#FEF3C7]',
      badgeText: 'text-[#D97706]',
    };
  }

  if (normalized.includes('keluarga') || normalized.includes('rekreasi') || normalized.includes('taman') || normalized.includes('hiburan')) {
    const images = CATEGORY_IMAGES.keluarga;
    return {
      icon: Palmtree,
      fallbackImage: images[index % images.length],
      badgeBg: 'bg-[#F0FDF4]',
      badgeText: 'text-[#16A34A]',
    };
  }

  if (normalized.includes('kuliner') || normalized.includes('makanan') || normalized.includes('resto') || normalized.includes('cafe')) {
    const images = CATEGORY_IMAGES.kuliner;
    return {
      icon: Utensils,
      fallbackImage: images[index % images.length],
      badgeBg: 'bg-[#FFF7ED]',
      badgeText: 'text-[#EA580C]',
    };
  }

  // Default fallback
  const images = CATEGORY_IMAGES.default;
  return {
    icon: Compass,
    fallbackImage: images[index % images.length],
    badgeBg: 'bg-[#EEF0FF]',
    badgeText: 'text-[#4941EC]',
  };
}

