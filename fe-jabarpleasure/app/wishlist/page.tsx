'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import MobileShell from '@/components/layout/MobileShell';
import WishlistScreen from '@/components/wishlist/WishlistScreen';
import DestinationDetailModal, { DestinationDetailData } from '@/components/ui/DestinationDetailModal';
import Toast from '@/components/ui/Toast';

export default function WishlistPage() {
  const router = useRouter();
  const [selectedDestinationForDetail, setSelectedDestinationForDetail] = useState<DestinationDetailData | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  };

  return (
    <MobileShell activeScreen="home">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <WishlistScreen
        onBack={() => router.push('/home')}
        onNavigateToHome={() => router.push('/home')}
        onNavigateToMap={() => router.push('/map')}
        onNavigateToProfile={() => router.push('/profile')}
        onNavigateToRencana={() => router.push('/rencana')}
        onNavigateToRiwayat={() => router.push('/riwayat')}
        onCreateItinerary={() => router.push('/rencana')}
        onWishlistClick={() => showToast('Anda sedang berada di halaman Wishlist', 'info')}
        onItemClick={(item) => setSelectedDestinationForDetail(item)}
      />

      {/* Detail Destinasi Modal Popup */}
      <DestinationDetailModal
        isOpen={!!selectedDestinationForDetail}
        destination={selectedDestinationForDetail}
        onClose={() => setSelectedDestinationForDetail(null)}
        isWishlisted={true}
        onToggleWishlist={(dest, isSaved) => {
          showToast(
            isSaved
              ? `"${dest.name}" disimpan ke Wishlist!`
              : `"${dest.name}" dihapus dari Wishlist.`,
            isSaved ? 'success' : 'info'
          );
        }}
      />
    </MobileShell>
  );
}
