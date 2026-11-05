'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MobileShell from '@/components/layout/MobileShell';
import HomeScreen from '@/components/home/HomeScreen';
import WishlistScreen from '@/components/wishlist/WishlistScreen';
import ProfileScreen, { UserProfileData } from '@/components/profile/ProfileScreen';
import ItineraryScreen, { SavedItinerary } from '@/components/itinerary/ItineraryScreen';
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
import DestinationDetailModal, { DestinationDetailData } from '@/components/ui/DestinationDetailModal';
import { getAuthToken, removeAuthToken } from '@/lib/auth';

type HomeScreenState =
  | 'home'
  | 'top-destinations'
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
  | 'trip-showcase';

function getScreenFromTab(tab: string | null): HomeScreenState {
  if (tab === 'rencana' || tab === 'itinerary') return 'itinerary';
  if (tab === 'riwayat' || tab === 'history') return 'trip-history';
  if (tab === 'wishlist' || tab === 'favorit') return 'wishlist';
  if (tab === 'profil' || tab === 'profile') return 'profile';
  return 'home';
}

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  const [lastTabParam, setLastTabParam] = useState<string | null>(tabParam);
  const [screenOverride, setScreenOverride] = useState<HomeScreenState | null>(null);

  if (tabParam !== lastTabParam) {
    setLastTabParam(tabParam);
    setScreenOverride(getScreenFromTab(tabParam));
  }

  const currentScreen = screenOverride ?? getScreenFromTab(tabParam);
  const setCurrentScreen = (s: HomeScreenState) => setScreenOverride(s);

  const [previousScreen, setPreviousScreen] = useState<HomeScreenState>('home');
  const [savedWishlistCount, setSavedWishlistCount] = useState<number>(4);
  const [globalDetailDestination, setGlobalDetailDestination] = useState<DestinationDetailData | null>(null);
  const [selectedOrigin, setSelectedOrigin] = useState<string>('Stasiun Bogor');
  const [selectedTrip, setSelectedTrip] = useState<TripItem>(TRIP_HISTORY_DATA[0]);
  const [selectedDestination, setSelectedDestination] = useState<DestinationItem>(
    TRIP_HISTORY_DATA[0].destinations[0]
  );
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'info' | 'error';
  } | null>(null);

  // Synchronously load logged-in user profile from localStorage
  const [userProfile] = useState<UserProfileData | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('user');
        if (stored) return JSON.parse(stored);
      } catch {
        // ignore
      }
    }
    return null;
  });

  const showToast = (
    message: string,
    type: 'success' | 'info' | 'error' = 'info'
  ) => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  };

  const navigateToRiwayat = () => {
    setPreviousScreen(currentScreen);
    setCurrentScreen('trip-history');
  };

  const handleLogout = async () => {
    const token = getAuthToken();
    if (token) {
      try {
        await fetch('/api/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (err) {
        console.warn('Logout error:', err);
      }
    }
    removeAuthToken();
    showToast('Anda telah keluar dari akun.', 'info');
    setTimeout(() => {
      router.push('/login');
    }, 600);
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

      {/* 1. Beranda (Home Overview) */}
      {currentScreen === 'home' && (
        <HomeScreen
          onNavigateToMap={() => router.push('/map')}
          onNotificationClick={() => showToast('Anda memiliki 2 notifikasi belum dibaca', 'info')}
          onWishlistClick={() => {
            setPreviousScreen('home');
            setCurrentScreen('wishlist');
          }}
          onProfileClick={() => {
            setPreviousScreen('home');
            setCurrentScreen('profile');
          }}
          onNavigateToRencana={() => {
            setPreviousScreen('home');
            setCurrentScreen('itinerary');
          }}
          onNavigateToRiwayat={navigateToRiwayat}
          onItemClick={(item) => setGlobalDetailDestination(item)}
          favoritBadgeCount={savedWishlistCount}
        />
      )}

      {/* 2. Top Destinasi Full View */}
      {currentScreen === 'top-destinations' && (
        <HomeScreen
          initialViewMode="top-destinations"
          onNavigateToMap={() => router.push('/map')}
          onNotificationClick={() => showToast('Anda memiliki 2 notifikasi belum dibaca', 'info')}
          onWishlistClick={() => {
            setPreviousScreen('top-destinations');
            setCurrentScreen('wishlist');
          }}
          onProfileClick={() => {
            setPreviousScreen('top-destinations');
            setCurrentScreen('profile');
          }}
          onNavigateToRencana={() => {
            setPreviousScreen('top-destinations');
            setCurrentScreen('itinerary');
          }}
          onNavigateToRiwayat={navigateToRiwayat}
          onItemClick={(item) => setGlobalDetailDestination(item)}
          favoritBadgeCount={savedWishlistCount}
        />
      )}

      {/* 3. Wishlist Perjalanan */}
      {currentScreen === 'wishlist' && (
        <WishlistScreen
          onBack={() => setCurrentScreen(previousScreen === 'wishlist' ? 'home' : previousScreen)}
          onNotificationClick={() => showToast('Anda memiliki 2 notifikasi belum dibaca', 'info')}
          onWishlistClick={() => showToast('Anda sedang berada di halaman Wishlist', 'info')}
          onNavigateToHome={() => setCurrentScreen('home')}
          onNavigateToMap={() => router.push('/map')}
          onNavigateToProfile={() => {
            setPreviousScreen('wishlist');
            setCurrentScreen('profile');
          }}
          onNavigateToRencana={() => {
            setPreviousScreen('wishlist');
            setCurrentScreen('itinerary');
          }}
          onNavigateToRiwayat={navigateToRiwayat}
          onCreateItinerary={() => {
            setPreviousScreen('wishlist');
            setCurrentScreen('departure-location');
          }}
          onItemClick={(item) =>
            setGlobalDetailDestination({
              id: item.id,
              name: item.name,
              category: item.category,
              location: item.location,
              image: item.image,
              rating: item.rating,
              wishlistCount: 1245,
              visitCount: 890,
            })
          }
          wishlistCount={savedWishlistCount}
          activeTab={previousScreen === 'profile' ? 'profil' : previousScreen === 'itinerary' ? 'rencana' : 'beranda'}
        />
      )}

      {/* 4. Profil Pengguna */}
      {currentScreen === 'profile' && (
        <ProfileScreen
          user={userProfile}
          onNavigateToHome={() => setCurrentScreen('home')}
          onNavigateToMap={() => router.push('/map')}
          onNavigateToWishlist={() => {
            setPreviousScreen('profile');
            setCurrentScreen('wishlist');
          }}
          onWishlistClick={() => {
            setPreviousScreen('profile');
            setCurrentScreen('wishlist');
          }}
          onNotificationClick={() => showToast('Anda memiliki 2 notifikasi belum dibaca', 'info')}
          onNavigateToRencana={() => {
            setPreviousScreen('profile');
            setCurrentScreen('itinerary');
          }}
          onNavigateToRiwayat={navigateToRiwayat}
          onEditProfile={() => showToast('Fitur edit profil sedang disiapkan', 'info')}
          onItemClick={(title) => showToast(`Membuka menu ${title}`, 'info')}
          onLogout={handleLogout}
          wishlistCount={savedWishlistCount}
        />
      )}

      {/* 5. Landing Rencana Perjalanan (Itinerary) */}
      {currentScreen === 'itinerary' && (
        <ItineraryScreen
          onNavigateToHome={() => setCurrentScreen('home')}
          onNavigateToMap={() => router.push('/map')}
          onNavigateToProfile={() => {
            setPreviousScreen('itinerary');
            setCurrentScreen('profile');
          }}
          onNavigateToRiwayat={navigateToRiwayat}
          onWishlistClick={() => {
            setPreviousScreen('itinerary');
            setCurrentScreen('wishlist');
          }}
          onNotificationClick={() => showToast('Anda memiliki 2 notifikasi belum dibaca', 'info')}
          onCreatePlan={() => {
            setPreviousScreen('itinerary');
            setCurrentScreen('departure-location');
          }}
          onViewPlan={(plan: SavedItinerary) => showToast(`Membuka rencana: ${plan.title}`, 'info')}
          wishlistCount={savedWishlistCount}
        />
      )}

      {/* 6. Titik Keberangkatan */}
      {currentScreen === 'departure-location' && (
        <DepartureLocationScreen
          onBack={() => setCurrentScreen('itinerary')}
          onNavigateToHome={() => setCurrentScreen('home')}
          onNavigateToMap={() => router.push('/map')}
          onNavigateToProfile={() => {
            setPreviousScreen('departure-location');
            setCurrentScreen('profile');
          }}
          onNavigateToRiwayat={navigateToRiwayat}
          onWishlistClick={() => {
            setPreviousScreen('departure-location');
            setCurrentScreen('wishlist');
          }}
          onNotificationClick={() => showToast('Anda memiliki 2 notifikasi belum dibaca', 'info')}
          onNext={(loc) => {
            setSelectedOrigin(loc.name);
            setPreviousScreen('departure-location');
            setCurrentScreen('destination-selection');
          }}
          wishlistCount={savedWishlistCount}
        />
      )}

      {/* 7. Pilih Destinasi */}
      {currentScreen === 'destination-selection' && (
        <DestinationSelectionScreen
          originName={selectedOrigin}
          onBack={() => setCurrentScreen('departure-location')}
          onChangeOrigin={() => setCurrentScreen('departure-location')}
          onNavigateToHome={() => setCurrentScreen('home')}
          onNavigateToMap={() => router.push('/map')}
          onNavigateToProfile={() => {
            setPreviousScreen('destination-selection');
            setCurrentScreen('profile');
          }}
          onNavigateToRiwayat={navigateToRiwayat}
          onWishlistClick={() => {
            setPreviousScreen('destination-selection');
            setCurrentScreen('wishlist');
          }}
          onNotificationClick={() => showToast('Anda memiliki 2 notifikasi belum dibaca', 'info')}
          onFinishSelection={() => {
            setPreviousScreen('destination-selection');
            setCurrentScreen('itinerary-summary');
          }}
          wishlistCount={savedWishlistCount}
        />
      )}

      {/* 8. Ringkasan Rencana */}
      {currentScreen === 'itinerary-summary' && (
        <ItinerarySummaryScreen
          originName={selectedOrigin}
          planTitle="Sehari di Bogor"
          onBack={() => setCurrentScreen('destination-selection')}
          onAddMoreDestinations={() => setCurrentScreen('destination-selection')}
          onSaveTrip={() => {
            showToast('Rencana perjalanan berhasil disimpan!', 'success');
            setPreviousScreen('itinerary-summary');
            setCurrentScreen('saved-plan');
          }}
          onStartTrip={() => {
            showToast('Memulai perjalanan! Buka navigasi arah...', 'info');
            setPreviousScreen('itinerary-summary');
            setCurrentScreen('active-trip');
          }}
          onNavigateToHome={() => setCurrentScreen('home')}
          onNavigateToMap={() => router.push('/map')}
          onNavigateToProfile={() => {
            setPreviousScreen('itinerary-summary');
            setCurrentScreen('profile');
          }}
          onNavigateToRiwayat={navigateToRiwayat}
          onWishlistClick={() => {
            setPreviousScreen('itinerary-summary');
            setCurrentScreen('wishlist');
          }}
          onNotificationClick={() => showToast('Anda memiliki 2 notifikasi belum dibaca', 'info')}
          wishlistCount={savedWishlistCount}
        />
      )}

      {/* 9. Rencana Tersimpan */}
      {currentScreen === 'saved-plan' && (
        <SavedPlanScreen
          originName={selectedOrigin}
          planTitle="Sehari di Bogor"
          onBackToRencana={() => setCurrentScreen('itinerary')}
          onNavigateToHome={() => setCurrentScreen('home')}
          onNavigateToMap={() => router.push('/map')}
          onNavigateToProfile={() => {
            setPreviousScreen('saved-plan');
            setCurrentScreen('profile');
          }}
          onNavigateToRiwayat={navigateToRiwayat}
          onWishlistClick={() => {
            setPreviousScreen('saved-plan');
            setCurrentScreen('wishlist');
          }}
          onNotificationClick={() => showToast('Anda memiliki 2 notifikasi belum dibaca', 'info')}
          wishlistCount={savedWishlistCount}
        />
      )}

      {/* 10. Perjalanan Aktif */}
      {currentScreen === 'active-trip' && (
        <ActiveTripScreen
          originName={selectedOrigin}
          planTitle="Sehari di Bogor"
          startTime="11.30"
          onBack={() => setCurrentScreen('itinerary-summary')}
          onFinishTrip={(visitedCount) => {
            const countStr = typeof visitedCount === 'number' && visitedCount > 0 ? ` (${visitedCount} destinasi tercapai)` : '';
            showToast(`Perjalanan selesai${countStr} dan berhasil disimpan ke Riwayat!`, 'success');
            setCurrentScreen('trip-history');
          }}
          onNavigateToHome={() => setCurrentScreen('home')}
          onNavigateToMap={() => router.push('/map')}
          onNavigateToProfile={() => {
            setPreviousScreen('active-trip');
            setCurrentScreen('profile');
          }}
          onNavigateToRiwayat={navigateToRiwayat}
          onWishlistClick={() => {
            setPreviousScreen('active-trip');
            setCurrentScreen('wishlist');
          }}
          onNotificationClick={() => showToast('Anda memiliki 2 notifikasi belum dibaca', 'info')}
          wishlistCount={savedWishlistCount}
        />
      )}

      {/* 11. Riwayat Perjalanan */}
      {currentScreen === 'trip-history' && (
        <TripHistoryScreen
          onSelectTrip={(trip) => {
            setSelectedTrip(trip);
            setPreviousScreen('trip-history');
            setCurrentScreen('trip-detail');
          }}
          onViewShowcase={(trip) => {
            setSelectedTrip(trip);
            setPreviousScreen('trip-history');
            setCurrentScreen('trip-showcase');
          }}
          onNavigateToHome={() => setCurrentScreen('home')}
          onNavigateToRencana={() => {
            setPreviousScreen('trip-history');
            setCurrentScreen('itinerary');
          }}
          onNavigateToMap={() => router.push('/map')}
          onNavigateToProfile={() => {
            setPreviousScreen('trip-history');
            setCurrentScreen('profile');
          }}
          onWishlistClick={() => {
            setPreviousScreen('trip-history');
            setCurrentScreen('wishlist');
          }}
          onNotificationClick={() => showToast('Anda memiliki 2 notifikasi belum dibaca', 'info')}
          wishlistCount={savedWishlistCount}
        />
      )}

      {/* 12. Detail Perjalanan */}
      {currentScreen === 'trip-detail' && (
        <TripDetailScreen
          trip={selectedTrip}
          onBack={() => setCurrentScreen('trip-history')}
          onSelectDestination={(dest) => {
            setSelectedDestination(dest);
            setPreviousScreen('trip-detail');
            setCurrentScreen('destination-doc');
          }}
          onViewTimelapse={(t) => {
            setSelectedTrip(t);
            setPreviousScreen('trip-detail');
            setCurrentScreen('trip-showcase');
          }}
          onNavigateToHome={() => setCurrentScreen('home')}
          onNavigateToRencana={() => {
            setPreviousScreen('trip-detail');
            setCurrentScreen('itinerary');
          }}
          onNavigateToMap={() => router.push('/map')}
          onNavigateToProfile={() => {
            setPreviousScreen('trip-detail');
            setCurrentScreen('profile');
          }}
          onWishlistClick={() => {
            setPreviousScreen('trip-detail');
            setCurrentScreen('wishlist');
          }}
          onNotificationClick={() => showToast('Anda memiliki 2 notifikasi belum dibaca', 'info')}
          wishlistCount={savedWishlistCount}
        />
      )}

      {/* 13. Dokumentasi Destinasi */}
      {currentScreen === 'destination-doc' && (
        <DestinationDocScreen
          trip={selectedTrip}
          destination={selectedDestination}
          onBack={() => setCurrentScreen('trip-detail')}
          onViewShowcase={() => {
            setPreviousScreen('destination-doc');
            setCurrentScreen('trip-showcase');
          }}
          onNavigateToHome={() => setCurrentScreen('home')}
          onNavigateToRencana={() => {
            setPreviousScreen('destination-doc');
            setCurrentScreen('itinerary');
          }}
          onNavigateToMap={() => router.push('/map')}
          onNavigateToProfile={() => {
            setPreviousScreen('destination-doc');
            setCurrentScreen('profile');
          }}
          onWishlistClick={() => {
            setPreviousScreen('destination-doc');
            setCurrentScreen('wishlist');
          }}
          onNotificationClick={() => showToast('Anda memiliki 2 notifikasi belum dibaca', 'info')}
          wishlistCount={savedWishlistCount}
        />
      )}

      {/* 14. Showcase Perjalanan */}
      {currentScreen === 'trip-showcase' && (
        <TripShowcaseScreen
          trip={selectedTrip}
          onBack={() => {
            setCurrentScreen(previousScreen === 'trip-history' ? 'trip-history' : 'destination-doc');
          }}
          onNavigateToHome={() => setCurrentScreen('home')}
          onNavigateToRencana={() => {
            setPreviousScreen('trip-showcase');
            setCurrentScreen('itinerary');
          }}
          onNavigateToMap={() => router.push('/map')}
          onNavigateToProfile={() => {
            setPreviousScreen('trip-showcase');
            setCurrentScreen('profile');
          }}
          onWishlistClick={() => {
            setPreviousScreen('trip-showcase');
            setCurrentScreen('wishlist');
          }}
          onNotificationClick={() => showToast('Anda memiliki 2 notifikasi belum dibaca', 'info')}
          wishlistCount={savedWishlistCount}
        />
      )}

      {/* Global Destination Detail Modal Popup */}
      <DestinationDetailModal
        isOpen={!!globalDetailDestination}
        destination={globalDetailDestination}
        onClose={() => setGlobalDetailDestination(null)}
        onStartTrip={() => {
          setGlobalDetailDestination(null);
          router.push('/map');
        }}
        onToggleWishlist={(_, isSaved) => {
          setSavedWishlistCount((prev) => (isSaved ? prev + 1 : Math.max(0, prev - 1)));
        }}
      />
    </MobileShell>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <MobileShell activeScreen="home">
          <div className="w-full h-full flex items-center justify-center bg-[#F9FAFB]">
            <div className="w-8 h-8 rounded-full border-2 border-[#4941EC] border-t-transparent animate-spin" />
          </div>
        </MobileShell>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
