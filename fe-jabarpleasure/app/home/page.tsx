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
import { TripItem, DestinationItem } from '@/components/history/historyData';
import Toast from '@/components/ui/Toast';
import DestinationDetailModal, { DestinationDetailData } from '@/components/ui/DestinationDetailModal';
import { getAuthToken, removeAuthToken } from '@/lib/auth';
import { createItinerary, deleteItinerary } from '@/lib/api';

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
  const [selectedDepartureLoc, setSelectedDepartureLoc] = useState<{
    name: string;
    address: string;
    lat?: number;
    lng?: number;
    regency?: string;
  }>({
    name: 'Stasiun Bogor',
    address: 'Jl. Nyi Raja Permas, Bogor Tengah',
    lat: -6.595,
    lng: 106.7972,
    regency: 'Bogor',
  });
  const [activeItinerary, setActiveItinerary] = useState<any>(null);
  const [formDestinations, setFormDestinations] = useState<any[]>([]);
  const [historyTrips, setHistoryTrips] = useState<TripItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('jabarpleasure_trip_history');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            return parsed.filter((item: TripItem) => item.id !== 'bandung-trip');
          }
        }
      } catch (e) {
        console.warn('Error reading trip history from storage:', e);
      }
    }
    return [];
  });
  const [tripStartTime, setTripStartTime] = useState<string>('');
  const [selectedTrip, setSelectedTrip] = useState<TripItem | undefined>(undefined);
  const [selectedDestination, setSelectedDestination] = useState<DestinationItem | undefined>(undefined);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'info' | 'error';
  } | null>(null);

  const homeWaypoints =
    activeItinerary?.items?.map((item: any, idx: number) => ({
      id: String(item.destination?.id || item.destination_id || idx),
      name: item.destination?.name || `Destinasi ${idx + 1}`,
      address: item.destination?.address || 'Jawa Barat',
      role:
        idx === 0
          ? 'Destinasi pertama'
          : idx === 1
          ? 'Destinasi kedua'
          : `Destinasi ke-${idx + 1}`,
      orderNumber: idx + 1,
      lat:
        typeof item.destination?.latitude === 'number'
          ? item.destination.latitude
          : parseFloat(item.destination?.latitude) || -6.595 - (idx + 1) * 0.015,
      lng:
        typeof item.destination?.longitude === 'number'
          ? item.destination.longitude
          : parseFloat(item.destination?.longitude) || 106.7972 + (idx + 1) * 0.015,
    })) ||
    (formDestinations.length > 0
      ? formDestinations.map((d: any, idx: number) => ({
          id: String(d.id),
          name: d.name,
          address: d.category || 'Jawa Barat',
          role:
            idx === 0
              ? 'Destinasi pertama'
              : idx === 1
              ? 'Destinasi kedua'
              : `Destinasi ke-${idx + 1}`,
          orderNumber: idx + 1,
          lat: d.lat || -6.595 - (idx + 1) * 0.015,
          lng: d.lng || 106.7972 + (idx + 1) * 0.015,
        }))
      : undefined);

  const homeOriginLat =
    activeItinerary?.departure_lat ||
    activeItinerary?.route_geojson?.properties?.departure_lat ||
    selectedDepartureLoc.lat ||
    -6.595;

  const homeOriginLng =
    activeItinerary?.departure_lng ||
    activeItinerary?.route_geojson?.properties?.departure_lng ||
    selectedDepartureLoc.lng ||
    106.7972;

  const homeOriginName =
    activeItinerary?.route_geojson?.properties?.departure_name ||
    activeItinerary?.departure_name ||
    selectedOrigin ||
    'Stasiun Bogor';

  const homePlanTitle =
    activeItinerary?.title ||
    (formDestinations.length > 0
      ? `Trip Seru di ${selectedOrigin}`
      : 'Sehari di Bogor');

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
          onWishlistClick={() => router.push('/wishlist')}
          onProfileClick={() => router.push('/profile')}
          onNavigateToRencana={() => router.push('/rencana')}
          onNavigateToRiwayat={() => router.push('/riwayat')}
          onItemClick={(item) => setGlobalDetailDestination(item)}
          favoritBadgeCount={savedWishlistCount}
        />
      )}

      {/* 2. Top Destinasi Full View */}
      {currentScreen === 'top-destinations' && (
        <HomeScreen
          initialViewMode="top-destinations"
          onNavigateToMap={() => router.push('/map')}
          onWishlistClick={() => router.push('/wishlist')}
          onProfileClick={() => router.push('/profile')}
          onNavigateToRencana={() => router.push('/rencana')}
          onNavigateToRiwayat={() => router.push('/riwayat')}
          onItemClick={(item) => setGlobalDetailDestination(item)}
          favoritBadgeCount={savedWishlistCount}
        />
      )}

      {/* 3. Wishlist Perjalanan */}
      {currentScreen === 'wishlist' && (
        <WishlistScreen
          onBack={() => setCurrentScreen(previousScreen === 'wishlist' ? 'home' : previousScreen)}
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
          onCreatePlan={() => {
            setActiveItinerary(null);
            setPreviousScreen('itinerary');
            setCurrentScreen('departure-location');
          }}
          onViewPlan={(plan: SavedItinerary) => {
            setActiveItinerary(plan.rawItinerary || plan);
            setPreviousScreen('itinerary');
            setCurrentScreen('itinerary-summary');
          }}
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
          onNext={(loc) => {
            setSelectedOrigin(loc.name);
            setSelectedDepartureLoc(loc);
            setPreviousScreen('departure-location');
            setCurrentScreen('destination-selection');
          }}
          wishlistCount={savedWishlistCount}
        />
      )}

      {/* 7. Pilih Destinasi */}
      {currentScreen === 'destination-selection' && (
        <DestinationSelectionScreen
          initialSelectedDestinations={formDestinations}
          originName={selectedOrigin}
          originAddress={selectedDepartureLoc.address}
          originLat={selectedDepartureLoc.lat}
          originLng={selectedDepartureLoc.lng}
          originRegency={selectedDepartureLoc.regency}
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
          onFinishSelection={(selected) => {
            setFormDestinations(selected);
            setActiveItinerary(null);
            setPreviousScreen('destination-selection');
            setCurrentScreen('itinerary-summary');
          }}
          wishlistCount={savedWishlistCount}
        />
      )}

      {/* 8. Ringkasan Rencana */}
      {currentScreen === 'itinerary-summary' && (
        <ItinerarySummaryScreen
          originName={homeOriginName}
          originLat={homeOriginLat}
          originLng={homeOriginLng}
          planTitle={homePlanTitle}
          waypoints={homeWaypoints}
          onBack={() => setCurrentScreen(activeItinerary ? 'itinerary' : 'destination-selection')}
          onEditDestinations={() => setCurrentScreen('destination-selection')}
          onDeleteTrip={async () => {
            if (activeItinerary?.id) {
              try {
                await deleteItinerary(activeItinerary.id);
              } catch (e) {
                console.warn('Failed to delete itinerary:', e);
              }
            }
            setActiveItinerary(null);
            setFormDestinations([]);
            showToast('Rencana perjalanan berhasil dihapus', 'info');
            setCurrentScreen('itinerary');
          }}
          onSaveTrip={async (customTitle) => {
            if (!activeItinerary && formDestinations.length > 0) {
              try {
                const destIds = formDestinations
                  .map((d: any) => parseInt(d.id, 10))
                  .filter((id: number) => !isNaN(id));

                const created = await createItinerary({
                  title: customTitle || homePlanTitle,
                  departure_lat: homeOriginLat,
                  departure_lng: homeOriginLng,
                  departure_name: homeOriginName,
                  destinations: destIds.length > 0 ? destIds : [1],
                });
                setActiveItinerary(created);
              } catch (e) {
                console.warn('Save trip error:', e);
              }
            }
            showToast('Rencana perjalanan berhasil disimpan!', 'success');
            setPreviousScreen('itinerary-summary');
            setCurrentScreen('saved-plan');
          }}
          onStartTrip={() => {
            const now = new Date();
            const timeStr = `${now.getHours().toString().padStart(2, '0')}.${now.getMinutes().toString().padStart(2, '0')} WIB`;
            setTripStartTime(timeStr);
            showToast('Memulai perjalanan! Membuka panduan rute...', 'info');
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
          wishlistCount={savedWishlistCount}
        />
      )}

      {/* 9. Rencana Tersimpan */}
      {currentScreen === 'saved-plan' && (
        <SavedPlanScreen
          originName={homeOriginName}
          originAddress={selectedDepartureLoc.address}
          originLat={homeOriginLat}
          originLng={homeOriginLng}
          planTitle={homePlanTitle}
          waypoints={homeWaypoints}
          onBackToRencana={() => setCurrentScreen('itinerary')}
          onStartTrip={() => {
            const now = new Date();
            const timeStr = `${now.getHours().toString().padStart(2, '0')}.${now.getMinutes().toString().padStart(2, '0')} WIB`;
            setTripStartTime(timeStr);
            showToast('Memulai perjalanan! Membuka panduan rute...', 'info');
            setPreviousScreen('saved-plan');
            setCurrentScreen('active-trip');
          }}
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
          wishlistCount={savedWishlistCount}
        />
      )}

      {/* 10. Perjalanan Aktif */}
      {currentScreen === 'active-trip' && (
        <ActiveTripScreen
          originName={homeOriginName}
          originLat={homeOriginLat}
          originLng={homeOriginLng}
          planTitle={homePlanTitle}
          startTime={tripStartTime}
          waypoints={homeWaypoints}
          onBack={() => setCurrentScreen('itinerary-summary')}
          onFinishTrip={(visitedCount) => {
            const count = typeof visitedCount === 'number' ? visitedCount : (homeWaypoints?.length || 1);
            const now = new Date();
            const dateStr = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

            const newHistoryItem: TripItem = {
              id: `trip-${Date.now()}`,
              title: homePlanTitle,
              category: 'Rencana Perjalanan',
              status: 'Selesai',
              duration: '1 hari',
              dateRange: dateStr,
              location: `${homeOriginName}, Jawa Barat`,
              completedDate: dateStr,
              stats: {
                destinations: count,
                photos: 0,
                video: 0,
              },
              initials: ['JP'],
              image: (homeWaypoints && homeWaypoints[0] && (homeWaypoints[0] as any).image) || '/tugu-kujang.jpg',
              destinations: (homeWaypoints || []).slice(0, count).map((w: any, idx: number) => ({
                id: w.id,
                name: w.name,
                time: `${dateStr} • Selesai`,
                status: 'Sudah dikunjungi',
                photoCount: 0,
                image: (w as any).image || '/tugu-kujang.jpg',
                location: w.address || homeOriginName,
                visitDate: dateStr,
                visitTime: 'Selesai',
                notes: `Kunjungan ke-${idx + 1} rencana perjalanan ${homePlanTitle}`,
                photos: [],
              })),
            };

            setHistoryTrips((prev) => {
              const updated = [newHistoryItem, ...prev];
              if (typeof window !== 'undefined') {
                try {
                  localStorage.setItem('jabarpleasure_trip_history', JSON.stringify(updated));
                } catch (e) {
                  console.warn('Error saving trip history to storage:', e);
                }
              }
              return updated;
            });

            showToast(`Perjalanan selesai (${count} destinasi) dan berhasil disimpan ke Riwayat!`, 'success');
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
          wishlistCount={savedWishlistCount}
        />
      )}

      {/* 11. Riwayat Perjalanan */}
      {currentScreen === 'trip-history' && (
        <TripHistoryScreen
          trips={historyTrips}
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
