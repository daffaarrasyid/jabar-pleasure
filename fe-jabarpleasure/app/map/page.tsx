'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import MobileShell from '@/components/layout/MobileShell';
import MapScreen from '@/components/map/MapScreen';
import WishlistScreen from '@/components/wishlist/WishlistScreen';
import ProfileScreen from '@/components/profile/ProfileScreen';
import Toast from '@/components/ui/Toast';

export default function MapPage() {
  const router = useRouter();
  const [currentScreen, setCurrentScreen] = useState<'map' | 'wishlist' | 'profile'>('map');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [favoritCount, setFavoritCount] = useState<number>(4);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  };

  return (
    <MobileShell activeScreen={currentScreen}>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {currentScreen === 'map' && (
        <MapScreen
          onNavigateToHome={() => router.push('/')}
          onNotificationClick={() => showToast('Anda memiliki 2 notifikasi belum dibaca', 'info')}
          onWishlistClick={() => setCurrentScreen('wishlist')}
          onProfileClick={() => setCurrentScreen('profile')}
          onNavigateToRiwayat={() => showToast('Membuka riwayat perjalanan...', 'info')}
          onSaveToWishlist={(count) => {
            setFavoritCount(count);
            showToast('Destinasi berhasil disimpan ke Favorit / Wishlist!', 'success');
          }}
          favoritBadgeCount={favoritCount}
        />
      )}
      {currentScreen === 'wishlist' && (
        <WishlistScreen
          onBack={() => setCurrentScreen('map')}
          onNotificationClick={() => showToast('Anda memiliki 2 notifikasi belum dibaca', 'info')}
          onWishlistClick={() => showToast('Anda sedang berada di halaman Wishlist', 'info')}
          onNavigateToHome={() => router.push('/')}
          onNavigateToMap={() => setCurrentScreen('map')}
          onNavigateToProfile={() => setCurrentScreen('profile')}
          onNavigateToRencana={() => showToast('Membuka Rencana Perjalanan...', 'info')}
          onNavigateToRiwayat={() => showToast('Membuka riwayat perjalanan...', 'info')}
          onCreateItinerary={() => showToast('Menyiapkan itinerary dari 4 destinasi terpilih...', 'info')}
          onItemClick={(item) => showToast(`Membuka destinasi ${item.name}`, 'info')}
          wishlistCount={favoritCount}
          activeTab="peta"
        />
      )}
      {currentScreen === 'profile' && (
        <ProfileScreen
          onNavigateToHome={() => router.push('/')}
          onNavigateToMap={() => setCurrentScreen('map')}
          onNavigateToWishlist={() => setCurrentScreen('wishlist')}
          onWishlistClick={() => setCurrentScreen('wishlist')}
          onNotificationClick={() => showToast('Anda memiliki 2 notifikasi belum dibaca', 'info')}
          onNavigateToRencana={() => showToast('Membuka Rencana Perjalanan...', 'info')}
          onNavigateToRiwayat={() => showToast('Membuka riwayat perjalanan...', 'info')}
          onEditProfile={() => showToast('Fitur edit profil sedang disiapkan', 'info')}
          onItemClick={(title) => showToast(`Membuka menu ${title}`, 'info')}
          onLogout={() => {
            showToast('Anda telah keluar dari akun.', 'info');
            router.push('/');
          }}
          wishlistCount={favoritCount}
        />
      )}
    </MobileShell>
  );
}
