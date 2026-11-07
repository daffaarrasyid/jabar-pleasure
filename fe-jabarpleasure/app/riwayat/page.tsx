'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import MobileShell from '@/components/layout/MobileShell';
import TripHistoryScreen from '@/components/history/TripHistoryScreen';
import TripDetailScreen from '@/components/history/TripDetailScreen';
import DestinationDocScreen from '@/components/history/DestinationDocScreen';
import TripShowcaseScreen from '@/components/history/TripShowcaseScreen';
import { TRIP_HISTORY_DATA, TripItem, DestinationItem } from '@/components/history/historyData';
import Toast from '@/components/ui/Toast';

export default function RiwayatPage() {
  const router = useRouter();
  const [currentScreen, setCurrentScreen] = useState<
    | 'trip-history'
    | 'trip-detail'
    | 'destination-doc'
    | 'trip-showcase'
  >('trip-history');

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [favoritCount] = useState<number>(4);

  // History trips persistent in local storage
  const [historyTrips] = useState<TripItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('jabarpleasure_trip_history');
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.warn('Error reading trip history from storage:', e);
      }
    }
    return TRIP_HISTORY_DATA;
  });

  const [selectedTrip, setSelectedTrip] = useState<TripItem>(historyTrips[0] || TRIP_HISTORY_DATA[0]);
  const [selectedDestination, setSelectedDestination] = useState<DestinationItem>(
    (historyTrips[0] && historyTrips[0].destinations && historyTrips[0].destinations[0]) ||
    TRIP_HISTORY_DATA[0].destinations[0]
  );

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  };

  return (
    <MobileShell activeScreen="riwayat">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* 1. Riwayat Perjalanan List */}
      {currentScreen === 'trip-history' && (
        <TripHistoryScreen
          trips={historyTrips}
          onSelectTrip={(trip) => {
            setSelectedTrip(trip);
            setCurrentScreen('trip-detail');
          }}
          onViewShowcase={(trip) => {
            setSelectedTrip(trip);
            setCurrentScreen('trip-showcase');
          }}
          onNavigateToHome={() => router.push('/home')}
          onNavigateToRencana={() => router.push('/rencana')}
          onNavigateToMap={() => router.push('/map')}
          onNavigateToProfile={() => router.push('/profile')}
          onWishlistClick={() => router.push('/home?tab=wishlist')}
          onNotificationClick={() => showToast('Anda memiliki 2 notifikasi belum dibaca', 'info')}
          wishlistCount={favoritCount}
        />
      )}

      {/* 2. Detail Trip */}
      {currentScreen === 'trip-detail' && (
        <TripDetailScreen
          trip={selectedTrip}
          onBack={() => setCurrentScreen('trip-history')}
          onSelectDestination={(dest) => {
            setSelectedDestination(dest);
            setCurrentScreen('destination-doc');
          }}
          onViewShowcase={() => setCurrentScreen('trip-showcase')}
          onNotificationClick={() => showToast('Anda memiliki 2 notifikasi belum dibaca', 'info')}
          onWishlistClick={() => router.push('/home?tab=wishlist')}
          onNavigateToHome={() => router.push('/home')}
          onNavigateToRencana={() => router.push('/rencana')}
          onNavigateToMap={() => router.push('/map')}
          onNavigateToProfile={() => router.push('/profile')}
          wishlistCount={favoritCount}
        />
      )}

      {/* 3. Dokumentasi Destinasi */}
      {currentScreen === 'destination-doc' && (
        <DestinationDocScreen
          destination={selectedDestination}
          trip={selectedTrip}
          onBack={() => setCurrentScreen('trip-detail')}
          onNavigateToHome={() => router.push('/home')}
          onNavigateToRencana={() => router.push('/rencana')}
          onNavigateToMap={() => router.push('/map')}
          onNavigateToProfile={() => router.push('/profile')}
          onWishlistClick={() => router.push('/home?tab=wishlist')}
          onNotificationClick={() => showToast('Anda memiliki 2 notifikasi belum dibaca', 'info')}
          wishlistCount={favoritCount}
        />
      )}

      {/* 4. Showcase Video Trip */}
      {currentScreen === 'trip-showcase' && (
        <TripShowcaseScreen
          trip={selectedTrip}
          onBack={() => setCurrentScreen('trip-detail')}
          onNavigateToHome={() => router.push('/home')}
          onNavigateToRencana={() => router.push('/rencana')}
          onNavigateToMap={() => router.push('/map')}
          onNavigateToProfile={() => router.push('/profile')}
          onWishlistClick={() => router.push('/home?tab=wishlist')}
          onNotificationClick={() => showToast('Anda memiliki 2 notifikasi belum dibaca', 'info')}
          wishlistCount={favoritCount}
        />
      )}
    </MobileShell>
  );
}
