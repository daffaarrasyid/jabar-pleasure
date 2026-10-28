'use client';

import React, { useState } from 'react';
import MobileShell from '@/components/layout/MobileShell';
import SplashScreen from '@/components/auth/SplashScreen';
import AuthGateway from '@/components/auth/AuthGateway';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import RegisterSuccess from '@/components/auth/RegisterSuccess';
import InterestSelection from '@/components/auth/InterestSelection';
import HomeScreen from '@/components/home/HomeScreen';
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

type ScreenState =
  | 'splash'
  | 'gateway'
  | 'login'
  | 'register'
  | 'register-success'
  | 'interest-selection'
  | 'home'
  | 'top-destinations'
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
  | 'trip-showcase';

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('gateway');
  const [previousScreen, setPreviousScreen] = useState<ScreenState>('home');
  const [showSplash, setShowSplash] = useState(true);
  const [savedWishlistCount, setSavedWishlistCount] = useState<number>(4);
  const [selectedOrigin, setSelectedOrigin] = useState<string>('Stasiun Bogor');
  const [selectedTrip, setSelectedTrip] = useState<TripItem>(TRIP_HISTORY_DATA[0]);
  const [selectedDestination, setSelectedDestination] = useState<DestinationItem>(
    TRIP_HISTORY_DATA[0].destinations[0]
  );
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'info' | 'error';
  } | null>(null);

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

  const handleScreenChange = (s: ScreenState) => {
    if (s === 'splash') {
      setShowSplash(true);
    } else {
      setShowSplash(false);
      setCurrentScreen(s);
    }
  };

  const handleLoginSuccess = (userData: { email: string }) => {
    showToast(`Berhasil masuk sebagai ${userData.email}! Selamat datang kembali.`, 'success');
    setTimeout(() => {
      setCurrentScreen('home');
    }, 1000);
  };

  const handleRegisterSuccess = () => {
    setCurrentScreen('register-success');
  };

  const handleSocialAuth = (provider: 'google' | 'apple') => {
    showToast(`Menghubungkan autentikasi dengan ${provider === 'google' ? 'Google' : 'Apple'}...`, 'info');
    setTimeout(() => {
      showToast(`Autentikasi ${provider === 'google' ? 'Google' : 'Apple'} berhasil!`, 'success');
      setTimeout(() => {
        setCurrentScreen('home');
      }, 1000);
    }, 1200);
  };

  return (
    <MobileShell
      activeScreen={showSplash ? 'splash' : currentScreen}
      onScreenChange={handleScreenChange}
    >
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Screen 1: Splash Screen Overlay (Cross-fades directly revealing the underlying screen) */}
      {showSplash && (
        <SplashScreen
          autoDismissDelay={2400}
          onFinish={() => setShowSplash(false)}
        />
      )}

      {/* Screen 2: Auth Gateway / "Sudah punya akun?" (Matching Image 2) */}
      {currentScreen === 'gateway' && (
        <AuthGateway
          onLoginClick={() => setCurrentScreen('login')}
          onRegisterClick={() => setCurrentScreen('register')}
          onGoogleClick={() => handleSocialAuth('google')}
          onAppleClick={() => handleSocialAuth('apple')}
        />
      )}

      {/* Screen 3: Login Screen */}
      {currentScreen === 'login' && (
        <LoginForm
          onBack={() => setCurrentScreen('gateway')}
          onNavigateToRegister={() => setCurrentScreen('register')}
          onSuccess={handleLoginSuccess}
        />
      )}

      {/* Screen 4: Register Screen */}
      {currentScreen === 'register' && (
        <RegisterForm
          onBack={() => setCurrentScreen('gateway')}
          onNavigateToLogin={() => setCurrentScreen('login')}
          onSuccess={handleRegisterSuccess}
        />
      )}

      {/* Screen 5: Register Success Screen ("Mantapp Kamu berhasil daftar") */}
      {currentScreen === 'register-success' && (
        <RegisterSuccess
          onContinue={() => setCurrentScreen('interest-selection')}
        />
      )}

      {/* Screen 6: Interest Selection Screen ("Pilih minat kamu apa?") */}
      {currentScreen === 'interest-selection' && (
        <InterestSelection
          onContinue={() => {
            showToast('Minat Anda berhasil disimpan! Membuka Beranda...', 'success');
            setTimeout(() => {
              setCurrentScreen('home');
            }, 500);
          }}
        />
      )}

      {/* Screen 7: Home Screen (Beranda) */}
      {currentScreen === 'home' && (
        <HomeScreen
          onNavigateToMap={() => setCurrentScreen('map')}
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
          onItemClick={(item) => showToast(`Membuka destinasi ${item.name}`, 'info')}
          favoritBadgeCount={savedWishlistCount}
        />
      )}

      {/* Screen 7b: Top Destinasi View */}
      {currentScreen === 'top-destinations' && (
        <HomeScreen
          initialViewMode="top-destinations"
          onNavigateToMap={() => setCurrentScreen('map')}
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
          onItemClick={(item) => showToast(`Membuka destinasi ${item.name}`, 'info')}
          favoritBadgeCount={savedWishlistCount}
        />
      )}

      {/* Screen 8: Map View (Eksplorasi WebGIS dengan Filter, Rute & Hasil Sekitar) */}
      {currentScreen === 'map' && (
        <MapScreen
          onNavigateToHome={() => setCurrentScreen('home')}
          onNotificationClick={() => showToast('Anda memiliki 2 notifikasi belum dibaca', 'info')}
          onWishlistClick={() => {
            setPreviousScreen('map');
            setCurrentScreen('wishlist');
          }}
          onProfileClick={() => {
            setPreviousScreen('map');
            setCurrentScreen('profile');
          }}
          onNavigateToRencana={() => {
            setPreviousScreen('map');
            setCurrentScreen('itinerary');
          }}
          onNavigateToRiwayat={navigateToRiwayat}
          onSaveToWishlist={(count) => {
            setSavedWishlistCount(count);
            showToast('Destinasi berhasil disimpan ke Favorit / Wishlist!', 'success');
          }}
          favoritBadgeCount={savedWishlistCount}
        />
      )}

      {/* Screen 9: Wishlist Perjalanan (Matching Image 1 with AppHeader & BottomNav) */}
      {currentScreen === 'wishlist' && (
        <WishlistScreen
          onBack={() => setCurrentScreen(previousScreen === 'wishlist' ? 'home' : previousScreen)}
          onNotificationClick={() => showToast('Anda memiliki 2 notifikasi belum dibaca', 'info')}
          onWishlistClick={() => showToast('Anda sedang berada di halaman Wishlist', 'info')}
          onNavigateToHome={() => setCurrentScreen('home')}
          onNavigateToMap={() => setCurrentScreen('map')}
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
          onItemClick={(item) => showToast(`Membuka destinasi ${item.name}`, 'info')}
          wishlistCount={savedWishlistCount}
          activeTab={previousScreen === 'map' ? 'peta' : previousScreen === 'profile' ? 'profil' : previousScreen === 'itinerary' ? 'rencana' : 'beranda'}
        />
      )}

      {/* Screen 10: Profil Pengguna (Matching Image 2 with AppHeader & BottomNav) */}
      {currentScreen === 'profile' && (
        <ProfileScreen
          onNavigateToHome={() => setCurrentScreen('home')}
          onNavigateToMap={() => setCurrentScreen('map')}
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
          onLogout={() => {
            showToast('Anda telah keluar dari akun.', 'info');
            setCurrentScreen('gateway');
          }}
          wishlistCount={savedWishlistCount}
        />
      )}

      {/* Screen 11: Landing Rencana Perjalanan (Matching Image 1 Rencana perjalanan.png) */}
      {currentScreen === 'itinerary' && (
        <ItineraryScreen
          onNavigateToHome={() => setCurrentScreen('home')}
          onNavigateToMap={() => setCurrentScreen('map')}
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
          onViewPlan={(plan) => showToast(`Membuka rencana: ${plan.title}`, 'info')}
          wishlistCount={savedWishlistCount}
        />
      )}

      {/* Screen 12: Titik Keberangkatan (Matching Images 2 & 3 with interactive GPS toggle) */}
      {currentScreen === 'departure-location' && (
        <DepartureLocationScreen
          onBack={() => setCurrentScreen('itinerary')}
          onNavigateToHome={() => setCurrentScreen('home')}
          onNavigateToMap={() => setCurrentScreen('map')}
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

      {/* Screen 13: Pilih Destinasi & Mau ke mana lagi? (Matching Images 1, 2 & 3) */}
      {currentScreen === 'destination-selection' && (
        <DestinationSelectionScreen
          originName={selectedOrigin}
          onBack={() => setCurrentScreen('departure-location')}
          onChangeOrigin={() => setCurrentScreen('departure-location')}
          onNavigateToHome={() => setCurrentScreen('home')}
          onNavigateToMap={() => setCurrentScreen('map')}
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

      {/* Screen 14: Ringkasan Rencana (Matching Image 2 Ringkasan rencana Bogor.png) */}
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
          onNavigateToMap={() => setCurrentScreen('map')}
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

      {/* Screen 15: Rencana Tersimpan (Matching Rencana berhasil tersimpan.png) */}
      {currentScreen === 'saved-plan' && (
        <SavedPlanScreen
          originName={selectedOrigin}
          planTitle="Sehari di Bogor"
          onBackToRencana={() => setCurrentScreen('itinerary')}
          onNavigateToHome={() => setCurrentScreen('home')}
          onNavigateToMap={() => setCurrentScreen('map')}
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

      {/* Screen 16: Perjalanan Aktif (Matching Perjalanan Bogor berlangsung.png) */}
      {currentScreen === 'active-trip' && (
        <ActiveTripScreen
          originName={selectedOrigin}
          planTitle="Sehari di Bogor"
          startTime="11.30"
          onBack={() => setCurrentScreen('itinerary-summary')}
          onFinishTrip={() => {
            showToast('Perjalanan selesai dan berhasil disimpan ke Riwayat!', 'success');
            setCurrentScreen('trip-history');
          }}
          onNavigateToHome={() => setCurrentScreen('home')}
          onNavigateToMap={() => setCurrentScreen('map')}
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

      {/* Screen 17: Riwayat Perjalanan (Matching Image 1) */}
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
          onNavigateToMap={() => setCurrentScreen('map')}
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

      {/* Screen 18: Detail Perjalanan (Matching Image 2) */}
      {currentScreen === 'trip-detail' && (
        <TripDetailScreen
          trip={selectedTrip}
          onBack={() => setCurrentScreen('trip-history')}
          onSelectDestination={(dest) => {
            setSelectedDestination(dest);
            setPreviousScreen('trip-detail');
            setCurrentScreen('destination-doc');
          }}
          onNavigateToHome={() => setCurrentScreen('home')}
          onNavigateToRencana={() => {
            setPreviousScreen('trip-detail');
            setCurrentScreen('itinerary');
          }}
          onNavigateToMap={() => setCurrentScreen('map')}
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

      {/* Screen 19: Dokumentasi Destinasi (Matching Image 3) */}
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
          onNavigateToMap={() => setCurrentScreen('map')}
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

      {/* Screen 20: Lihat Perjalanan (Matching Image 4) */}
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
          onNavigateToMap={() => setCurrentScreen('map')}
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
    </MobileShell>
  );
}