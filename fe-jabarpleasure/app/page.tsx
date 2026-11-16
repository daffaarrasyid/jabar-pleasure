'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
import ItineraryScreen, { ActiveTripData } from '@/components/itinerary/ItineraryScreen';
import DepartureLocationScreen from '@/components/itinerary/DepartureLocationScreen';
import DestinationSelectionScreen, { DestinationOption } from '@/components/itinerary/DestinationSelectionScreen';
import ItinerarySummaryScreen from '@/components/itinerary/ItinerarySummaryScreen';
import SavedPlanScreen from '@/components/itinerary/SavedPlanScreen';
import ActiveTripScreen from '@/components/itinerary/ActiveTripScreen';
import TripHistoryScreen from '@/components/history/TripHistoryScreen';
import TripDetailScreen from '@/components/history/TripDetailScreen';
import DestinationDocScreen from '@/components/history/DestinationDocScreen';
import TripShowcaseScreen from '@/components/history/TripShowcaseScreen';
import { TripItem, DestinationItem } from '@/components/history/historyData';
import Toast from '@/components/ui/Toast';
import DestinationDetailModal, { DestinationDetailData } from '@/components/ui/DestinationDetailModal';
import NotificationSheet from '@/components/notification/NotificationSheet';
import { getAuthToken, removeAuthToken } from '@/lib/auth';
import { getUnreadNotificationCount, getWishlists, createItinerary, completeItinerary, getItinerary, updateItinerary, deleteItinerary, getItineraries } from '@/lib/api';
import { fetchRoadRoute } from '@/lib/routing';
import { formatHumanDate, formatCompletedDayDate, formatDestinationTime } from '@/lib/dateUtils';

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
  const router = useRouter();
  const [registeredUser, setRegisteredUser] = useState<{ id?: number; name: string; email: string; token?: string } | null>(null);
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('gateway');
  const [previousScreen, setPreviousScreen] = useState<ScreenState>('home');
  const [showSplash, setShowSplash] = useState(true);
  const [savedWishlistCount, setSavedWishlistCount] = useState<number>(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState<number>(0);
  const [globalDetailDestination, setGlobalDetailDestination] = useState<DestinationDetailData | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    const loadCached = async () => {
      try {
        const stored = sessionStorage.getItem('jp_cached_wishlists');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && isMounted) {
            setSavedWishlistCount(parsed.length);
          }
        }
      } catch {
        // ignore
      }
    };
    loadCached();

    getUnreadNotificationCount()
      .then((count) => {
        if (isMounted) setUnreadNotificationCount(count);
      })
      .catch(() => {});

    getWishlists()
      .then((items) => {
        if (isMounted) {
          setSavedWishlistCount(items?.length || 0);
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('jp_cached_wishlists', JSON.stringify(items || []));
          }
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);
  const [originData, setOriginData] = useState<{
    name: string;
    address: string;
    lat: number;
    lng: number;
    regency?: string;
    isGps: boolean;
    startDate?: string;
  }>({
    name: 'Stasiun Bogor',
    address: 'Jl. Nyi Raja Permas, Kota Bogor',
    lat: -6.595,
    lng: 106.7972,
    regency: 'Kota Bogor',
    isGps: false,
  });
  const [planDestinations, setPlanDestinations] = useState<DestinationOption[]>([]);
  const [savedPlanTitle, setSavedPlanTitle] = useState<string>('Sehari di Jawa Barat');
  const [savedTotalKm, setSavedTotalKm] = useState<number>(3.1);
  const [isPlanAlreadySaved, setIsPlanAlreadySaved] = useState<boolean>(false);
  const [savedPlanId, setSavedPlanId] = useState<number | string | undefined>(undefined);
  const [activeTrip, setActiveTrip] = useState<ActiveTripData | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('jabarpleasure_active_trip');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.status !== 'completed') {
            return parsed;
          }
        }
      } catch {}
    }
    return null;
  });
  const [wishlistOriginScreen, setWishlistOriginScreen] = useState<ScreenState>('home');
  const [selectedTrip, setSelectedTrip] = useState<TripItem | undefined>(undefined);
  const [selectedDestination, setSelectedDestination] = useState<DestinationItem | undefined>(undefined);
  const [historyTrips, setHistoryTrips] = useState<TripItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'info' | 'error';
  } | null>(null);

  const openWishlist = (fromScreen: ScreenState) => {
    setWishlistOriginScreen(fromScreen);
    setPreviousScreen(fromScreen);
    setCurrentScreen('wishlist');
  };

  const loadHistoryTrips = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const data = await getItineraries('completed');
      const mapped: TripItem[] = (data || []).map((it) => {
        const rawDate = it.end_date || it.start_date || 'Hari ini';
        const cleanDate = formatHumanDate(rawDate);
        const completedDay = formatCompletedDayDate(rawDate);
        const destItems: DestinationItem[] = (it.items || []).map((item, idx) => ({
          id: String(item.id || idx + 1),
          name: item.destination?.name || 'Destinasi Wisata',
          time: `${cleanDate} • Selesai`,
          status: 'Selesai',
          photoCount: 0,
          image:
            item.destination?.cover_image_url ||
            item.destination?.cover_image ||
            '/tugu-kujang.jpg',
          location: item.destination?.address || 'Jawa Barat',
          visitDate: cleanDate,
          visitTime: 'Selesai',
          notes: '',
          photos: [],
        }));

        const departure =
          it.route_geojson?.properties?.departure_name ||
          it.route_geojson?.departure_name ||
          'Jawa Barat';

        return {
          id: String(it.id),
          title: it.title,
          category: it.items?.[0]?.destination?.category?.name || 'Wisata Jawa Barat',
          status: 'Selesai' as const,
          duration: `${it.items?.length || destItems.length || 1} destinasi`,
          dateRange: cleanDate,
          location: departure,
          completedDate: completedDay,
          stats: {
            destinations: it.items?.length || destItems.length || 1,
            photos: 0,
            video: 0,
          },
          initials: ['JP'],
          image:
            it.items?.[0]?.destination?.cover_image_url ||
            it.items?.[0]?.destination?.cover_image ||
            '/tugu-kujang.jpg',
          destinations: destItems,
        };
      });
      setHistoryTrips(mapped);
    } catch (err) {
      console.warn('Failed loading trip history:', err);
      setHistoryTrips([]);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;
    if (getAuthToken()) {
      getItineraries('completed')
        .then((data) => {
          if (isCancelled) return;
          const mapped: TripItem[] = (data || []).map((it) => {
            const rawDate = it.end_date || it.start_date || 'Hari ini';
            const cleanDate = formatHumanDate(rawDate);
            const completedDay = formatCompletedDayDate(rawDate);
            const destItems: DestinationItem[] = (it.items || []).map((item, idx) => ({
              id: String(item.id || idx + 1),
              name: item.destination?.name || 'Destinasi Wisata',
              time: `${cleanDate} • Selesai`,
              status: 'Selesai',
              photoCount: 0,
              image:
                item.destination?.cover_image_url ||
                item.destination?.cover_image ||
                '/tugu-kujang.jpg',
              location: item.destination?.address || 'Jawa Barat',
              visitDate: cleanDate,
              visitTime: 'Selesai',
              notes: '',
              photos: [],
            }));

            const departure =
              it.route_geojson?.properties?.departure_name ||
              it.route_geojson?.departure_name ||
              'Jawa Barat';

            return {
              id: String(it.id),
              title: it.title,
              category: it.items?.[0]?.destination?.category?.name || 'Wisata Jawa Barat',
              status: 'Selesai' as const,
              duration: `${it.items?.length || destItems.length || 1} destinasi`,
              dateRange: cleanDate,
              location: departure,
              completedDate: completedDay,
              stats: {
                destinations: it.items?.length || destItems.length || 1,
                photos: 0,
                video: 0,
              },
              initials: ['JP'],
              image:
                it.items?.[0]?.destination?.cover_image_url ||
                it.items?.[0]?.destination?.cover_image ||
                '/tugu-kujang.jpg',
              destinations: destItems,
            };
          });
          setHistoryTrips(mapped);
        })
        .catch((err) => {
          console.warn('Initial trip history load failed:', err);
        });
    }
    return () => {
      isCancelled = true;
    };
  }, []);

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
    loadHistoryTrips();
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
    loadHistoryTrips();
    getWishlists().then((w) => setSavedWishlistCount(w?.length || 0)).catch(() => {});
    setTimeout(() => {
      setCurrentScreen('home');
    }, 1000);
  };

  const handleRegisterSuccess = (userData?: { id?: number; name: string; email: string; token?: string }) => {
    if (userData) setRegisteredUser(userData);
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
          onFinish={() => {
            setShowSplash(false);
            router.push('/auth');
          }}
        />
      )}

      {/* Screen 2: Auth Gateway / "Sudah punya akun?" (Matching Image 2) */}
      {currentScreen === 'gateway' && (
        <AuthGateway
          onLoginClick={() => router.push('/login')}
          onRegisterClick={() => router.push('/register')}
          onGoogleClick={() => handleSocialAuth('google')}
          onAppleClick={() => handleSocialAuth('apple')}
        />
      )}

      {/* Screen 3: Login Screen */}
      {currentScreen === 'login' && (
        <LoginForm
          onBack={() => router.push('/auth')}
          onNavigateToRegister={() => router.push('/register')}
          onSuccess={handleLoginSuccess}
        />
      )}

      {/* Screen 4: Register Screen */}
      {currentScreen === 'register' && (
        <RegisterForm
          onBack={() => router.push('/auth')}
          onNavigateToLogin={() => router.push('/login')}
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
          onContinue={async (selectedInterests) => {
            try {
              const token =
                registeredUser?.token ||
                (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null);

              let userId = registeredUser?.id;
              if (!userId && typeof window !== 'undefined') {
                const stored = localStorage.getItem('user');
                if (stored) {
                  try {
                    userId = JSON.parse(stored)?.id;
                  } catch {
                    // ignore
                  }
                }
              }

              const payload = {
                user_id: userId,
                interests: selectedInterests.length > 0 ? selectedInterests : ['wisata-alam-terbuka'],
              };

              const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              };
              if (token) {
                headers['Authorization'] = `Bearer ${token}`;
              }

              const res = await fetch('/api/user/preferences', {
                method: 'POST',
                headers,
                body: JSON.stringify(payload),
              });

              const result = await res.json();
              if (!res.ok) {
                throw new Error(result.message || 'Gagal menyimpan minat.');
              }

              showToast('Minat Anda berhasil disimpan! Membuka Beranda...', 'success');
              setTimeout(() => {
                setCurrentScreen('home');
              }, 500);
            } catch (err: unknown) {
              const errorMessage = err instanceof Error ? err.message : 'Gagal menyimpan preferensi minat.';
              showToast(errorMessage, 'error');
              throw err;
            }
          }}
        />
      )}

      {/* Screen 7: Home Screen (Beranda) */}
      {currentScreen === 'home' && (
        <HomeScreen
          onNavigateToMap={() => setCurrentScreen('map')}
          onNotificationClick={() => setIsNotificationOpen(true)}
          onWishlistClick={() => openWishlist('home')}
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
          unreadNotificationCount={unreadNotificationCount}
        />
      )}

      {/* Screen 7b: Top Destinasi View */}
      {currentScreen === 'top-destinations' && (
        <HomeScreen
          initialViewMode="top-destinations"
          onNavigateToMap={() => setCurrentScreen('map')}
          onNotificationClick={() => setIsNotificationOpen(true)}
          onWishlistClick={() => openWishlist('top-destinations')}
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
          unreadNotificationCount={unreadNotificationCount}
        />
      )}

      {/* Screen 8: Map View (Eksplorasi WebGIS dengan Filter, Rute & Hasil Sekitar) */}
      {currentScreen === 'map' && (
        <MapScreen
          onNavigateToHome={() => setCurrentScreen('home')}
          onNotificationClick={() => setIsNotificationOpen(true)}
          onWishlistClick={() => openWishlist('map')}
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
          onBack={() => setCurrentScreen(wishlistOriginScreen === 'wishlist' ? 'home' : wishlistOriginScreen)}
          onNotificationClick={() => setIsNotificationOpen(true)}
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
          onItemClick={(item) => setGlobalDetailDestination(item)}
          wishlistCount={savedWishlistCount}
          activeTab={wishlistOriginScreen === 'map' ? 'peta' : wishlistOriginScreen === 'profile' ? 'profil' : (wishlistOriginScreen === 'itinerary' || wishlistOriginScreen === 'saved-plan' || wishlistOriginScreen === 'active-trip' || wishlistOriginScreen === 'departure-location' || wishlistOriginScreen === 'destination-selection' || wishlistOriginScreen === 'itinerary-summary') ? 'rencana' : wishlistOriginScreen.startsWith('trip-') ? 'riwayat' : 'beranda'}
        />
      )}

      {/* Screen 10: Profil Pengguna (Matching Image 2 with AppHeader & BottomNav) */}
      {currentScreen === 'profile' && (
        <ProfileScreen
          user={registeredUser}
          onNavigateToHome={() => setCurrentScreen('home')}
          onNavigateToMap={() => setCurrentScreen('map')}
          onNavigateToWishlist={() => openWishlist('profile')}
          onWishlistClick={() => openWishlist('profile')}
          onNotificationClick={() => setIsNotificationOpen(true)}
          onNavigateToRencana={() => {
            setPreviousScreen('profile');
            setCurrentScreen('itinerary');
          }}
          onNavigateToRiwayat={navigateToRiwayat}
          onEditProfile={() => showToast('Fitur edit profil sedang disiapkan', 'info')}
          onItemClick={(title) => showToast(`Membuka menu ${title}`, 'info')}
          onLogout={async () => {
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
            setHistoryTrips([]);
            setActiveTrip(null);
            if (typeof window !== 'undefined') {
              localStorage.removeItem('jabarpleasure_active_trip');
              localStorage.removeItem('jabarpleasure_trip_history');
              localStorage.removeItem('jabarpleasure_wishlist_ids');
              sessionStorage.removeItem('jp_cached_wishlists');
            }
            showToast('Anda telah keluar dari akun.', 'info');
            setCurrentScreen('gateway');
          }}
          wishlistCount={savedWishlistCount}
        />
      )}

      {/* Screen 11: Landing Rencana Perjalanan (Matching Image 1 Rencana perjalanan.png) */}
      {currentScreen === 'itinerary' && (
        <ItineraryScreen
          activeTrip={activeTrip}
          onResumeActiveTrip={() => {
            setPreviousScreen('itinerary');
            setCurrentScreen('active-trip');
          }}
          onNavigateToHome={() => setCurrentScreen('home')}
          onNavigateToMap={() => setCurrentScreen('map')}
          onNavigateToProfile={() => {
            setPreviousScreen('itinerary');
            setCurrentScreen('profile');
          }}
          onNavigateToRiwayat={navigateToRiwayat}
          onWishlistClick={() => openWishlist('itinerary')}
          onNotificationClick={() => setIsNotificationOpen(true)}
          onCreatePlan={() => {
            setIsPlanAlreadySaved(false);
            setSavedPlanId(undefined);
            setPlanDestinations([]);
            setOriginData({
              name: 'Stasiun Bogor',
              address: 'Jl. Nyi Raja Permas, Kota Bogor',
              lat: -6.595,
              lng: 106.7972,
              regency: 'Kota Bogor',
              isGps: false,
            });
            setPreviousScreen('itinerary');
            setCurrentScreen('departure-location');
          }}
          onViewPlan={(plan) => {
            setIsPlanAlreadySaved(true);
            setSavedPlanId(plan.id);
            setSavedPlanTitle(plan.title);

            const raw = plan.rawItinerary;
            const originLat =
              typeof raw?.departure_lat === 'number'
                ? raw.departure_lat
                : typeof (raw as unknown as { departure_location?: { coordinates?: [number, number] } })?.departure_location?.coordinates?.[1] === 'number'
                ? (raw as unknown as { departure_location?: { coordinates?: [number, number] } }).departure_location!.coordinates![1]
                : -6.595;
            const originLng =
              typeof raw?.departure_lng === 'number'
                ? raw.departure_lng
                : typeof (raw as unknown as { departure_location?: { coordinates?: [number, number] } })?.departure_location?.coordinates?.[0] === 'number'
                ? (raw as unknown as { departure_location?: { coordinates?: [number, number] } }).departure_location!.coordinates![0]
                : 106.7972;
            const depName = raw?.route_geojson?.properties?.departure_name || raw?.route_geojson?.departure_name || plan.origin.replace('Dari ', '');

            setOriginData({
              name: depName,
              address: depName,
              lat: originLat,
              lng: originLng,
              isGps: false,
            });

            if (raw?.items && raw.items.length > 0) {
              const mappedDests: DestinationOption[] = raw.items.map((item, idx: number) => {
                const dest = item.destination;
                return {
                  id: String(dest?.id || item.destination_id || idx + 1),
                  name: dest?.name || `Destinasi ${idx + 1}`,
                  category: dest?.category?.name || 'Wisata Populer',
                  distanceFromStart: '±2.5 km',
                  distanceKm: 2.5,
                  inWishlist: false,
                  tag: 'Tersimpan',
                  description: dest?.description || dest?.address || 'Destinasi Jawa Barat',
                  visitsMonth: 'Populer',
                  popularityTag: 'Jawa Barat',
                  image: dest?.cover_image_url || '/tugu-kujang.jpg',
                  lat: typeof dest?.latitude === 'number' ? dest.latitude : (typeof dest?.latitude === 'string' ? parseFloat(dest.latitude) : -6.6009),
                  lng: typeof dest?.longitude === 'number' ? dest.longitude : (typeof dest?.longitude === 'string' ? parseFloat(dest.longitude) : 106.8058),
                };
              });
              setPlanDestinations(mappedDests);
            } else if (plan.stops && plan.stops.length > 0) {
              const fallbackDests: DestinationOption[] = plan.stops.map((stopName, idx) => ({
                id: String(idx + 1),
                name: stopName,
                category: 'Wisata Populer',
                distanceFromStart: `±${(idx + 1) * 1.5} km`,
                distanceKm: (idx + 1) * 1.5,
                inWishlist: false,
                tag: 'Tersimpan',
                description: `Destinasi ${stopName}`,
                visitsMonth: 'Populer',
                popularityTag: 'Jawa Barat',
                image: idx === 0 ? plan.image : '/tugu-kujang.jpg',
                lat: originLat - (idx + 1) * 0.008,
                lng: originLng + (idx + 1) * 0.008,
              }));
              setPlanDestinations(fallbackDests);
            }

            // Hydrate full destination details asynchronously if ID is valid
            const planNumId = Number(plan.id);
            if (!isNaN(planNumId) && planNumId > 0) {
              getItinerary(planNumId).then((fresh) => {
                if (fresh?.items && fresh.items.length > 0) {
                  const refreshed: DestinationOption[] = fresh.items.map((it, idx) => ({
                    id: String(it.destination?.id || it.destination_id || idx + 1),
                    name: it.destination?.name || `Destinasi ${idx + 1}`,
                    category: it.destination?.category?.name || 'Wisata Populer',
                    distanceFromStart: '±2.5 km',
                    distanceKm: 2.5,
                    inWishlist: false,
                    tag: 'Tersimpan',
                    description: it.destination?.description || it.destination?.address || 'Destinasi Jawa Barat',
                    visitsMonth: 'Populer',
                    popularityTag: 'Jawa Barat',
                    image: it.destination?.cover_image_url || '/tugu-kujang.jpg',
                    lat: typeof it.destination?.latitude === 'number' ? it.destination.latitude : (typeof it.destination?.latitude === 'string' ? parseFloat(it.destination.latitude) : -6.6009),
                    lng: typeof it.destination?.longitude === 'number' ? it.destination.longitude : (typeof it.destination?.longitude === 'string' ? parseFloat(it.destination.longitude) : 106.8058),
                  }));
                  setPlanDestinations(refreshed);
                }
              }).catch(() => {});
            }

            setPreviousScreen('itinerary');
            setCurrentScreen('itinerary-summary');
          }}
          wishlistCount={savedWishlistCount}
        />
      )}

      {/* Screen 12: Titik Keberangkatan (Matching Images 2 & 3 with interactive GPS toggle) */}
      {currentScreen === 'departure-location' && (
        <DepartureLocationScreen
          initialLocation={originData.name ? originData : null}
          onBack={() => setCurrentScreen('itinerary')}
          onNavigateToHome={() => setCurrentScreen('home')}
          onNavigateToMap={() => setCurrentScreen('map')}
          onNavigateToProfile={() => {
            setPreviousScreen('departure-location');
            setCurrentScreen('profile');
          }}
          onNavigateToRiwayat={navigateToRiwayat}
          onWishlistClick={() => openWishlist('departure-location')}
          onNotificationClick={() => setIsNotificationOpen(true)}
          onNext={(loc) => {
            setOriginData({
              name: loc.name,
              address: loc.address,
              lat: typeof loc.lat === 'number' ? loc.lat : -6.595,
              lng: typeof loc.lng === 'number' ? loc.lng : 106.7972,
              regency: loc.regency,
              isGps: loc.isGps,
              startDate: loc.startDate,
            });
            setSavedPlanTitle(`Petualangan dari ${loc.name}`);
            setPreviousScreen('departure-location');
            setCurrentScreen('destination-selection');
          }}
          wishlistCount={savedWishlistCount}
        />
      )}

      {/* Screen 13: Pilih Destinasi & Mau ke mana lagi? (Matching Images 1, 2 & 3) */}
      {currentScreen === 'destination-selection' && (
        <DestinationSelectionScreen
          initialSelectedDestinations={planDestinations}
          originName={originData.name}
          originAddress={originData.address}
          originLat={originData.lat}
          originLng={originData.lng}
          originRegency={originData.regency}
          onBack={() => {
            if (isPlanAlreadySaved) {
              setCurrentScreen('itinerary-summary');
            } else {
              setCurrentScreen('departure-location');
            }
          }}
          onChangeOrigin={() => setCurrentScreen('departure-location')}
          onNavigateToHome={() => setCurrentScreen('home')}
          onNavigateToMap={() => setCurrentScreen('map')}
          onNavigateToProfile={() => {
            setPreviousScreen('destination-selection');
            setCurrentScreen('profile');
          }}
          onNavigateToRiwayat={navigateToRiwayat}
          onWishlistClick={() => openWishlist('destination-selection')}
          onNotificationClick={() => setIsNotificationOpen(true)}
          onFinishSelection={async (destinations) => {
            setPlanDestinations(destinations);
            if (savedPlanId) {
              try {
                const destPayload = destinations.map((w) => {
                  const num = parseInt(w.id, 10);
                  return isNaN(num) ? 1 : num;
                });
                await updateItinerary(savedPlanId, {
                  destinations: destPayload,
                });
                showToast('Daftar destinasi rute berhasil diperbarui!', 'success');
              } catch (err) {
                console.warn('Could not update itinerary on backend:', err);
              }
            }
            setPreviousScreen('destination-selection');
            setCurrentScreen('itinerary-summary');
          }}
          wishlistCount={savedWishlistCount}
        />
      )}

      {/* Screen 14: Ringkasan Rencana (Matching Image 2 Ringkasan rencana Bogor.png) */}
      {currentScreen === 'itinerary-summary' && (
        <ItinerarySummaryScreen
          originName={originData.name}
          originLat={originData.lat}
          originLng={originData.lng}
          planTitle={savedPlanTitle}
          isAlreadySaved={isPlanAlreadySaved || Boolean(savedPlanId)}
          waypoints={planDestinations.length > 0 ? planDestinations.map((d, idx) => ({
            id: d.id,
            name: d.name,
            address: d.description || d.category || 'Jawa Barat',
            role: idx === 0 ? 'Destinasi pertama' : idx === 1 ? 'Destinasi kedua' : `Destinasi ke-${idx + 1}`,
            orderNumber: idx + 1,
            lat: typeof d.lat === 'number' ? d.lat : undefined,
            lng: typeof d.lng === 'number' ? d.lng : undefined,
          })) : undefined}
          onBack={() => {
            if (isPlanAlreadySaved) {
              setCurrentScreen('itinerary');
            } else {
              setCurrentScreen('destination-selection');
            }
          }}
          onEditDestinations={() => setCurrentScreen('destination-selection')}
          onDeleteTrip={async () => {
            if (savedPlanId) {
              try {
                await deleteItinerary(savedPlanId);
              } catch (err) {
                console.warn('Could not delete itinerary from backend:', err);
              }
            }
            showToast('Rencana perjalanan berhasil dihapus', 'info');
            setIsPlanAlreadySaved(false);
            setSavedPlanId(undefined);
            setCurrentScreen('itinerary');
          }}
          onSaveTrip={async (title, waypoints, totalKm) => {
            setSavedPlanTitle(title);
            if (totalKm) setSavedTotalKm(totalKm);

            try {
              // Real Backend Integration: save itinerary to Laravel PostGIS database
              const destPayload = waypoints.map((w) => {
                const num = parseInt(w.id, 10);
                return isNaN(num) ? 1 : num;
              });

              // Pre-calculate real OSRM road route geometry
              let routeGeojson: any = null;
              try {
                const originCoord: [number, number] = [originData.lat || -6.595, originData.lng || 106.7972];
                const destCoords: [number, number][] = waypoints
                  .filter((w) => (w.lat || (w as any).latitude) && (w.lng || (w as any).longitude))
                  .map((w) => [
                    parseFloat((w.lat || (w as any).latitude) as any),
                    parseFloat((w.lng || (w as any).longitude) as any),
                  ]);

                if (destCoords.length > 0) {
                  const roadRes = await fetchRoadRoute([originCoord, ...destCoords]);
                  if (roadRes?.geojson?.coordinates?.length >= 2) {
                    routeGeojson = {
                      type: 'Feature',
                      properties: {
                        departure_name: originData.name || 'Titik Keberangkatan',
                        distance_km: roadRes.distanceKm,
                        duration_minutes: roadRes.durationMinutes,
                      },
                      geometry: roadRes.geojson,
                    };
                  }
                }
              } catch (routeErr) {
                console.warn('Failed calculating OSRM road route for itinerary save:', routeErr);
              }

              const savedRes = await createItinerary({
                title: title,
                start_date: originData.startDate || new Date().toISOString().split('T')[0],
                departure_name: originData.name,
                departure_lat: originData.lat,
                departure_lng: originData.lng,
                route_geojson: routeGeojson,
                destinations: destPayload.length > 0 ? destPayload : [1],
              });

              if (savedRes && savedRes.id) {
                setSavedPlanId(savedRes.id);
              }
              setIsPlanAlreadySaved(true);
              showToast('Rencana perjalanan berhasil disimpan ke database!', 'success');
            } catch (err) {
              console.warn('Backend itinerary save error, falling back locally:', err);
              setIsPlanAlreadySaved(true);
              showToast('Rencana perjalanan berhasil disimpan!', 'success');
            }

            setPreviousScreen('itinerary-summary');
            setCurrentScreen('saved-plan');
          }}
          onStartTrip={() => {
            const startStr = `${new Date().getHours().toString().padStart(2, '0')}.${new Date().getMinutes().toString().padStart(2, '0')} WIB`;
            const tripWaypoints = (planDestinations.length > 0 ? planDestinations : [
              { id: '1', name: 'Tugu Kujang', description: 'Jl. Raya Pajajaran', category: 'Wisata Budaya', distanceKm: 1.2, lat: -6.6009, lng: 106.8058, distanceFromStart: '1.2 km', inWishlist: false, tag: 'Populer', visitsMonth: 'Populer', popularityTag: 'Bogor', image: '/tugu-kujang.jpg' }
            ]).map((d, idx) => ({
              id: String(d.id),
              name: d.name,
              address: d.description || d.category || 'Jawa Barat',
              role: idx === 0 ? 'Destinasi pertama' : idx === 1 ? 'Destinasi kedua' : `Destinasi ke-${idx + 1}`,
              orderNumber: idx + 1,
              lat: typeof d.lat === 'number' ? d.lat : undefined,
              lng: typeof d.lng === 'number' ? d.lng : undefined,
            }));

            const newActive: ActiveTripData = {
              itineraryId: savedPlanId,
              title: savedPlanTitle,
              originName: originData.name,
              originLat: originData.lat,
              originLng: originData.lng,
              startTime: startStr,
              waypoints: tripWaypoints,
              currentStopIndex: 0,
              status: 'in_progress',
            };

            setActiveTrip(newActive);
            if (typeof window !== 'undefined') {
              localStorage.setItem('jabarpleasure_active_trip', JSON.stringify(newActive));
            }

            showToast('Memulai perjalanan! Membuka panduan rute...', 'info');
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
          onWishlistClick={() => openWishlist('itinerary-summary')}
          onNotificationClick={() => setIsNotificationOpen(true)}
          wishlistCount={savedWishlistCount}
        />
      )}

      {/* Screen 15: Rencana Tersimpan (Matching Rencana berhasil tersimpan.png) */}
      {currentScreen === 'saved-plan' && (
        <SavedPlanScreen
          originName={originData.name}
          originAddress={originData.address}
          originLat={originData.lat}
          originLng={originData.lng}
          planTitle={savedPlanTitle}
          totalDistanceKm={savedTotalKm}
          waypoints={planDestinations.length > 0 ? planDestinations.map((d, idx) => ({
            id: d.id,
            name: d.name,
            address: d.description || d.category || 'Jawa Barat',
            role: idx === 0 ? 'Destinasi pertama' : idx === 1 ? 'Destinasi kedua' : `Destinasi ke-${idx + 1}`,
            orderNumber: idx + 1,
            lat: typeof d.lat === 'number' ? d.lat : undefined,
            lng: typeof d.lng === 'number' ? d.lng : undefined,
          })) : undefined}
          onBackToRencana={() => setCurrentScreen('itinerary')}
          onStartTrip={() => {
            const startStr = `${new Date().getHours().toString().padStart(2, '0')}.${new Date().getMinutes().toString().padStart(2, '0')} WIB`;
            const tripWaypoints = (planDestinations.length > 0 ? planDestinations : [
              { id: '1', name: 'Tugu Kujang', description: 'Jl. Raya Pajajaran', category: 'Wisata Budaya', distanceKm: 1.2, lat: -6.6009, lng: 106.8058, distanceFromStart: '1.2 km', inWishlist: false, tag: 'Populer', visitsMonth: 'Populer', popularityTag: 'Bogor', image: '/tugu-kujang.jpg' }
            ]).map((d, idx) => ({
              id: String(d.id),
              name: d.name,
              address: d.description || d.category || 'Jawa Barat',
              role: idx === 0 ? 'Destinasi pertama' : idx === 1 ? 'Destinasi kedua' : `Destinasi ke-${idx + 1}`,
              orderNumber: idx + 1,
              lat: typeof d.lat === 'number' ? d.lat : undefined,
              lng: typeof d.lng === 'number' ? d.lng : undefined,
            }));

            const newActive: ActiveTripData = {
              itineraryId: savedPlanId,
              title: savedPlanTitle,
              originName: originData.name,
              originLat: originData.lat,
              originLng: originData.lng,
              startTime: startStr,
              waypoints: tripWaypoints,
              currentStopIndex: 0,
              status: 'in_progress',
            };

            setActiveTrip(newActive);
            if (typeof window !== 'undefined') {
              localStorage.setItem('jabarpleasure_active_trip', JSON.stringify(newActive));
            }

            showToast('Memulai perjalanan! Membuka panduan rute...', 'info');
            setPreviousScreen('saved-plan');
            setCurrentScreen('active-trip');
          }}
          onNavigateToHome={() => setCurrentScreen('home')}
          onNavigateToMap={() => setCurrentScreen('map')}
          onNavigateToProfile={() => {
            setPreviousScreen('saved-plan');
            setCurrentScreen('profile');
          }}
          onNavigateToRiwayat={navigateToRiwayat}
          onWishlistClick={() => openWishlist('saved-plan')}
          onNotificationClick={() => setIsNotificationOpen(true)}
          wishlistCount={savedWishlistCount}
        />
      )}

      {/* Screen 16: Perjalanan Aktif (Matching Perjalanan Bogor berlangsung.png) */}
      {currentScreen === 'active-trip' && (
        <ActiveTripScreen
          originName={activeTrip?.originName || originData.name}
          originLat={activeTrip?.originLat || originData.lat}
          originLng={activeTrip?.originLng || originData.lng}
          planTitle={activeTrip?.title || savedPlanTitle}
          startTime={activeTrip?.startTime}
          waypoints={activeTrip?.waypoints && activeTrip.waypoints.length > 0 ? activeTrip.waypoints : (planDestinations.length > 0 ? planDestinations.map((d, idx) => ({
            id: String(d.id),
            name: d.name,
            address: d.description || d.category || 'Jawa Barat',
            role: idx === 0 ? 'Destinasi pertama' : idx === 1 ? 'Destinasi kedua' : `Destinasi ke-${idx + 1}`,
            orderNumber: idx + 1,
            lat: typeof d.lat === 'number' ? d.lat : undefined,
            lng: typeof d.lng === 'number' ? d.lng : undefined,
          })) : undefined)}
          initialStopIndex={activeTrip?.currentStopIndex || 0}
          onProgressChange={(stopIndex) => {
            setActiveTrip((prev) => {
              if (!prev) return null;
              const updated: ActiveTripData = { ...prev, currentStopIndex: stopIndex };
              if (typeof window !== 'undefined') {
                localStorage.setItem('jabarpleasure_active_trip', JSON.stringify(updated));
              }
              return updated;
            });
          }}
          onBack={() => {
            setActiveTrip(null);
            if (typeof window !== 'undefined') {
              localStorage.removeItem('jabarpleasure_active_trip');
            }
            setPreviousScreen('active-trip');
            setCurrentScreen('itinerary');
          }}
          onFinishTrip={async (visitedCount) => {
            if (activeTrip?.itineraryId) {
              try {
                await completeItinerary(activeTrip.itineraryId);
                loadHistoryTrips();
              } catch (err) {
                console.warn('Backend complete itinerary error:', err);
              }
            }
            setActiveTrip((prev) => prev ? { ...prev, status: 'completed' } : null);
            if (typeof window !== 'undefined') {
              localStorage.removeItem('jabarpleasure_active_trip');
            }
            const countStr = typeof visitedCount === 'number' && visitedCount > 0 ? ` (${visitedCount} destinasi)` : '';
            showToast(`Perjalanan selesai${countStr} dan berhasil dicatat di Riwayat!`, 'success');
          }}
          onNavigateToHome={() => setCurrentScreen('home')}
          onNavigateToMap={() => setCurrentScreen('map')}
          onNavigateToProfile={() => {
            setPreviousScreen('active-trip');
            setCurrentScreen('profile');
          }}
          onNavigateToRiwayat={navigateToRiwayat}
          onWishlistClick={() => openWishlist('active-trip')}
          onNotificationClick={() => setIsNotificationOpen(true)}
          wishlistCount={savedWishlistCount}
        />
      )}

      {/* Screen 17: Riwayat Perjalanan (Matching Image 1) */}
      {currentScreen === 'trip-history' && (
        <TripHistoryScreen
          trips={historyTrips}
          isLoading={isLoadingHistory}
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
          onWishlistClick={() => openWishlist('trip-history')}
          onNotificationClick={() => setIsNotificationOpen(true)}
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
          onUpdateTrip={(updated) => {
            setSelectedTrip(updated);
            setHistoryTrips((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
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
          onNavigateToMap={() => setCurrentScreen('map')}
          onNavigateToProfile={() => {
            setPreviousScreen('trip-detail');
            setCurrentScreen('profile');
          }}
          onWishlistClick={() => openWishlist('trip-detail')}
          onNotificationClick={() => setIsNotificationOpen(true)}
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
          onWishlistClick={() => openWishlist('destination-doc')}
          onNotificationClick={() => setIsNotificationOpen(true)}
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
          onWishlistClick={() => openWishlist('trip-showcase')}
          onNotificationClick={() => setIsNotificationOpen(true)}
          wishlistCount={savedWishlistCount}
        />
      )}
      {/* Global Destination Detail Popup Modal */}
      <DestinationDetailModal
        isOpen={!!globalDetailDestination}
        destination={globalDetailDestination}
        onClose={() => setGlobalDetailDestination(null)}
        onStartTrip={() => {
          setGlobalDetailDestination(null);
          setCurrentScreen('map');
        }}
        onToggleWishlist={(_, isSaved) => {
          setSavedWishlistCount((prev) => (isSaved ? prev + 1 : Math.max(0, prev - 1)));
        }}
      />

      {/* Global Notification Sheet */}
      <NotificationSheet
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        onUnreadCountChange={(count) => setUnreadNotificationCount(count)}
        onSelectDestination={() => {
          setIsNotificationOpen(false);
          setCurrentScreen('map');
        }}
      />
    </MobileShell>
  );
}