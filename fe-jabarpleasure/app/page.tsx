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
  | 'profile';

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('gateway');
  const [previousScreen, setPreviousScreen] = useState<ScreenState>('home');
  const [showSplash, setShowSplash] = useState(true);
  const [savedWishlistCount, setSavedWishlistCount] = useState<number>(4);
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
          onNavigateToRiwayat={() => showToast('Membuka riwayat perjalanan...', 'info')}
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
          onNavigateToRiwayat={() => showToast('Membuka riwayat perjalanan...', 'info')}
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
          onNavigateToRiwayat={() => showToast('Membuka riwayat perjalanan...', 'info')}
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
          onNavigateToRencana={() => showToast('Membuka Rencana Perjalanan...', 'info')}
          onNavigateToRiwayat={() => showToast('Membuka riwayat perjalanan...', 'info')}
          onCreateItinerary={() => showToast('Menyiapkan itinerary dari 4 destinasi terpilih...', 'info')}
          onItemClick={(item) => showToast(`Membuka destinasi ${item.name}`, 'info')}
          wishlistCount={savedWishlistCount}
          activeTab={previousScreen === 'map' ? 'peta' : previousScreen === 'profile' ? 'profil' : 'beranda'}
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
          onNavigateToRencana={() => showToast('Membuka Rencana Perjalanan...', 'info')}
          onNavigateToRiwayat={() => showToast('Membuka riwayat perjalanan...', 'info')}
          onEditProfile={() => showToast('Fitur edit profil sedang disiapkan', 'info')}
          onItemClick={(title) => showToast(`Membuka menu ${title}`, 'info')}
          onLogout={() => {
            showToast('Anda telah keluar dari akun.', 'info');
            setCurrentScreen('gateway');
          }}
          wishlistCount={savedWishlistCount}
        />
      )}
    </MobileShell>
  );
}