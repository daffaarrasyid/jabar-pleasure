'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import MobileShell from '@/components/layout/MobileShell';
import MapScreen from '@/components/map/MapScreen';
import Toast from '@/components/ui/Toast';

export default function MapPage() {
  const router = useRouter();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [favoritCount, setFavoritCount] = useState<number>(0);

  return (
    <MobileShell activeScreen="map">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <MapScreen
        onNavigateToHome={() => router.push('/home')}
        onNotificationClick={() => setToast({ message: 'Anda memiliki 2 notifikasi belum dibaca', type: 'info' })}
        onProfileClick={() => setToast({ message: 'Membuka profil pengguna...', type: 'info' })}
        onSaveToWishlist={(count) => {
          setFavoritCount(count);
          setToast({ message: 'Destinasi berhasil disimpan ke Favorit!', type: 'success' });
        }}
        favoritBadgeCount={favoritCount}
      />
    </MobileShell>
  );
}
