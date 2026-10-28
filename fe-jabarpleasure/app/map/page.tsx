'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import MobileShell from '@/components/layout/MobileShell';
import MapScreen from '@/components/map/MapScreen';
import WishlistScreen from '@/components/wishlist/WishlistScreen';
import ProfileScreen from '@/components/profile/ProfileScreen';
import ItineraryScreen from '@/components/itinerary/ItineraryScreen';
import DepartureLocationScreen from '@/components/itinerary/DepartureLocationScreen';
import DestinationSelectionScreen from '@/components/itinerary/DestinationSelectionScreen';
import ItinerarySummaryScreen from '@/components/itinerary/ItinerarySummaryScreen';
import SavedPlanScreen from '@/components/itinerary/SavedPlanScreen';
import ActiveTripScreen from '@/components/itinerary/ActiveTripScreen';
import TripHistoryScreen from '@/components/history/TripHistoryScreen';
import TripDetailScreen from '@/components/history/TripDetailScreen';
import DestinationDocScreen from '@/components/history/DestinationDocScreen';
import TripShowcaseScreen from '@/components/history/TripShowcaseScreen';
import { TRIP_HISTORY_DATA, TripItem, DestinationItem } from '@/components/history/historyData';
import Toast from '@/components/ui/Toast';

export default function MapPage() {
  const router = useRouter();
  const [currentScreen, setCurrentScreen] = useState<
    | 'map'
    | 'wishlist'
    | 'profile'
    | 'itinerary'
    | 'departure-location'
    | 'destination-selection'
    | 'itinerary-summary'
    | 'saved-plan'
    | 'active-trip'
    | 'trip-history'
    | 'trip-detail'
    | 'destination-doc'
    | 'trip-showcase'
  >('map');
  const [selectedTrip, setSelectedTrip] = useState<TripItem>(TRIP_HISTORY_DATA[0]);
  const [selectedDestination, setSelectedDestination] = useState<DestinationItem>(
    TRIP_HISTORY_DATA[0].destinations[0]
  );
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
          onNavigateToRencana={() => setCurrentScreen('itinerary')}
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
          onNavigateToRencana={() => setCurrentScreen('itinerary')}
          onNavigateToRiwayat={() => showToast('Membuka riwayat perjalanan...', 'info')}
          onCreateItinerary={() => setCurrentScreen('departure-location')}
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
          onNavigateToRencana={() => setCurrentScreen('itinerary')}
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
      {currentScreen === 'itinerary' && (
        <ItineraryScreen
          onNavigateToHome={() => router.push('/')}
          onNavigateToMap={() => setCurrentScreen('map')}
          onNavigateToProfile={() => setCurrentScreen('profile')}
          onNavigateToRiwayat={() => showToast('Membuka riwayat perjalanan...', 'info')}
          onWishlistClick={() => setCurrentScreen('wishlist')}
          onNotificationClick={() => showToast('Anda memiliki 2 notifikasi belum dibaca', 'info')}
          onCreatePlan={() => setCurrentScreen('departure-location')}
          onViewPlan={(plan) => showToast(`Membuka rencana: ${plan.title}`, 'info')}
          wishlistCount={favoritCount}
        />
      )}
      {currentScreen === 'departure-location' && (
        <DepartureLocationScreen
          onBack={() => setCurrentScreen('itinerary')}
          onNavigateToHome={() => router.push('/')}
          onNavigateToMap={() => setCurrentScreen('map')}
          onNavigateToProfile={() => setCurrentScreen('profile')}
          onNavigateToRiwayat={() => showToast('Membuka riwayat perjalanan...', 'info')}
          onWishlistClick={() => setCurrentScreen('wishlist')}
          onNotificationClick={() => showToast('Anda memiliki 2 notifikasi belum dibaca', 'info')}
          onNext={() => {
            setCurrentScreen('destination-selection');
          }}
          wishlistCount={favoritCount}
        />
      )}
      {currentScreen === 'destination-selection' && (
        <DestinationSelectionScreen
          originName="Stasiun Bogor"
          onBack={() => setCurrentScreen('departure-location')}
          onChangeOrigin={() => setCurrentScreen('departure-location')}
          onNavigateToHome={() => router.push('/')}
          onNavigateToMap={() => setCurrentScreen('map')}
          onNavigateToProfile={() => setCurrentScreen('profile')}
          onNavigateToRiwayat={() => showToast('Membuka riwayat perjalanan...', 'info')}
          onWishlistClick={() => setCurrentScreen('wishlist')}
          onNotificationClick={() => showToast('Anda memiliki 2 notifikasi belum dibaca', 'info')}
          onFinishSelection={() => {
            setCurrentScreen('itinerary-summary');
          }}
          wishlistCount={favoritCount}
        />
      )}
      {currentScreen === 'itinerary-summary' && (
        <ItinerarySummaryScreen
          originName="Stasiun Bogor"
          planTitle="Sehari di Bogor"
          onBack={() => setCurrentScreen('destination-selection')}
          onAddMoreDestinations={() => setCurrentScreen('destination-selection')}
          onSaveTrip={() => {
            showToast('Rencana perjalanan berhasil disimpan!', 'success');
            setCurrentScreen('saved-plan');
          }}
          onStartTrip={() => {
            showToast('Memulai perjalanan! Buka navigasi arah...', 'info');
            setCurrentScreen('active-trip');
          }}
          onNavigateToHome={() => router.push('/')}
          onNavigateToMap={() => setCurrentScreen('map')}
          onNavigateToProfile={() => setCurrentScreen('profile')}
          onNavigateToRiwayat={() => showToast('Membuka riwayat perjalanan...', 'info')}
          onWishlistClick={() => setCurrentScreen('wishlist')}
          onNotificationClick={() => showToast('Anda memiliki 2 notifikasi belum dibaca', 'info')}
          wishlistCount={favoritCount}
        />
      )}
      {currentScreen === 'saved-plan' && (
        <SavedPlanScreen
          originName="Stasiun Bogor"
          planTitle="Sehari di Bogor"
          onBackToRencana={() => setCurrentScreen('itinerary')}
          onNavigateToHome={() => router.push('/')}
          onNavigateToMap={() => setCurrentScreen('map')}
          onNavigateToProfile={() => setCurrentScreen('profile')}
          onNavigateToRiwayat={() => showToast('Membuka riwayat perjalanan...', 'info')}
          onWishlistClick={() => setCurrentScreen('wishlist')}
          onNotificationClick={() => showToast('Anda memiliki 2 notifikasi belum dibaca', 'info')}
          wishlistCount={favoritCount}
        />
      )}
      {currentScreen === 'active-trip' && (
        <ActiveTripScreen
          originName="Stasiun Bogor"
          planTitle="Sehari di Bogor"
          startTime="11.30"
          onBack={() => setCurrentScreen('itinerary-summary')}
          onFinishTrip={() => {
            showToast('Perjalanan selesai dan berhasil disimpan ke Riwayat!', 'success');
            setCurrentScreen('trip-history');
          }}
          onNavigateToHome={() => router.push('/')}
          onNavigateToMap={() => setCurrentScreen('map')}
          onNavigateToProfile={() => setCurrentScreen('profile')}
          onNavigateToRiwayat={() => setCurrentScreen('trip-history')}
          onWishlistClick={() => setCurrentScreen('wishlist')}
          onNotificationClick={() => showToast('Anda memiliki 2 notifikasi belum dibaca', 'info')}
          wishlistCount={favoritCount}
        />
      )}
      {currentScreen === 'trip-history' && (
        <TripHistoryScreen
          onSelectTrip={(trip) => {
            setSelectedTrip(trip);
            setCurrentScreen('trip-detail');
          }}
          onViewShowcase={(trip) => {
            setSelectedTrip(trip);
            setCurrentScreen('trip-showcase');
          }}
          onNavigateToHome={() => router.push('/')}
          onNavigateToRencana={() => setCurrentScreen('itinerary')}
          onNavigateToMap={() => setCurrentScreen('map')}
          onNavigateToProfile={() => setCurrentScreen('profile')}
          onWishlistClick={() => setCurrentScreen('wishlist')}
          onNotificationClick={() => showToast('Anda memiliki 2 notifikasi belum dibaca', 'info')}
          wishlistCount={favoritCount}
        />
      )}
      {currentScreen === 'trip-detail' && (
        <TripDetailScreen
          trip={selectedTrip}
          onBack={() => setCurrentScreen('trip-history')}
          onSelectDestination={(dest) => {
            setSelectedDestination(dest);
            setCurrentScreen('destination-doc');
          }}
          onNavigateToHome={() => router.push('/')}
          onNavigateToRencana={() => setCurrentScreen('itinerary')}
          onNavigateToMap={() => setCurrentScreen('map')}
          onNavigateToProfile={() => setCurrentScreen('profile')}
          onWishlistClick={() => setCurrentScreen('wishlist')}
          onNotificationClick={() => showToast('Anda memiliki 2 notifikasi belum dibaca', 'info')}
          wishlistCount={favoritCount}
        />
      )}
      {currentScreen === 'destination-doc' && (
        <DestinationDocScreen
          trip={selectedTrip}
          destination={selectedDestination}
          onBack={() => setCurrentScreen('trip-detail')}
          onViewShowcase={() => setCurrentScreen('trip-showcase')}
          onNavigateToHome={() => router.push('/')}
          onNavigateToRencana={() => setCurrentScreen('itinerary')}
          onNavigateToMap={() => setCurrentScreen('map')}
          onNavigateToProfile={() => setCurrentScreen('profile')}
          onWishlistClick={() => setCurrentScreen('wishlist')}
          onNotificationClick={() => showToast('Anda memiliki 2 notifikasi belum dibaca', 'info')}
          wishlistCount={favoritCount}
        />
      )}
      {currentScreen === 'trip-showcase' && (
        <TripShowcaseScreen
          trip={selectedTrip}
          onBack={() => setCurrentScreen('destination-doc')}
          onNavigateToHome={() => router.push('/')}
          onNavigateToRencana={() => setCurrentScreen('itinerary')}
          onNavigateToMap={() => setCurrentScreen('map')}
          onNavigateToProfile={() => setCurrentScreen('profile')}
          onWishlistClick={() => setCurrentScreen('wishlist')}
          onNotificationClick={() => showToast('Anda memiliki 2 notifikasi belum dibaca', 'info')}
          wishlistCount={favoritCount}
        />
      )}
    </MobileShell>
  );
}
