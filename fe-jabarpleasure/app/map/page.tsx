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
import DestinationDetailModal, { DestinationDetailData } from '@/components/ui/DestinationDetailModal';
import { createItinerary, deleteItinerary } from '@/lib/api';

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
  const [detailDestination, setDetailDestination] = useState<DestinationDetailData | null>(null);

  // History trips persistent in-memory / local storage
  const [historyTrips, setHistoryTrips] = useState<TripItem[]>(() => {
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

  // Active itinerary & Multi-step form state
  const [activeItinerary, setActiveItinerary] = useState<any>(null);
  const [tripStartTime, setTripStartTime] = useState<string>('');
  const [formDeparture, setFormDeparture] = useState<{
    name: string;
    address: string;
    lat?: number;
    lng?: number;
    regency?: string;
    isGps: boolean;
  }>({
    name: 'Stasiun Bogor',
    address: 'Jl. Nyi Raja Permas, Bogor Tengah',
    lat: -6.595,
    lng: 106.7972,
    regency: 'Bogor',
    isGps: false,
  });
  const [formDestinations, setFormDestinations] = useState<any[]>([]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  };

  const summaryWaypoints =
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

  const summaryOriginLat =
    activeItinerary?.departure_lat ||
    activeItinerary?.route_geojson?.properties?.departure_lat ||
    formDeparture.lat ||
    -6.595;

  const summaryOriginLng =
    activeItinerary?.departure_lng ||
    activeItinerary?.route_geojson?.properties?.departure_lng ||
    formDeparture.lng ||
    106.7972;

  const summaryOriginName =
    activeItinerary?.route_geojson?.properties?.departure_name ||
    activeItinerary?.departure_name ||
    formDeparture.name ||
    'Stasiun Bogor';

  const summaryTitle =
    activeItinerary?.title ||
    (formDestinations.length > 0
      ? `Trip Seru di ${formDeparture.name}`
      : 'Sehari di Bogor');

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
          onNavigateToHome={() => router.push('/home')}
          onNotificationClick={() => showToast('Anda memiliki 2 notifikasi belum dibaca', 'info')}
          onWishlistClick={() => setCurrentScreen('wishlist')}
          onProfileClick={() => router.push('/profile')}
          onNavigateToRencana={(createdItinerary, selectedDestinations, userDeparture) => {
            if (selectedDestinations && selectedDestinations.length > 0) {
              const draftPlan = {
                origin: userDeparture || {
                  name: 'Lokasi Terkini',
                  address: 'Jawa Barat',
                  lat: -6.595,
                  lng: 106.7972,
                  regency: 'Bogor',
                  isGps: false,
                },
                destinations: selectedDestinations.map((item) => ({
                  id: String(item.id),
                  name: item.name,
                  category: item.category || 'Wisata',
                  distanceFromStart: item.distance || '1 km dari titik awal',
                  distanceKm: parseFloat(item.distance) || 1.5,
                  inWishlist: false,
                  tag: item.category || 'Wisata',
                  description: `${item.name} di ${item.regency}`,
                  visitsMonth: `${item.visitorsCount || 0} pengunjung`,
                  popularityTag: item.regency || 'Jawa Barat',
                  image: item.image || '/gedung-sate.jpg',
                  visitorsCount: item.visitorsCount,
                  lat: item.coordinates?.[0],
                  lng: item.coordinates?.[1],
                })),
                title:
                  selectedDestinations.length === 1
                    ? `Jelajah ${selectedDestinations[0].name}`
                    : `Rencana Trip di ${userDeparture?.name || 'Jawa Barat'}`,
              };
              if (typeof window !== 'undefined') {
                sessionStorage.setItem('jabarpleasure_draft_itinerary', JSON.stringify(draftPlan));
              }
              router.push('/rencana?summary=true');
            } else if (createdItinerary) {
              setActiveItinerary(createdItinerary);
              showToast('Rencana perjalanan berhasil disimpan!', 'success');
              setCurrentScreen('itinerary-summary');
            } else {
              router.push('/rencana');
            }
          }}
          onNavigateToRiwayat={() => router.push('/riwayat')}
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
          onNavigateToHome={() => router.push('/home')}
          onNavigateToMap={() => setCurrentScreen('map')}
          onNavigateToProfile={() => setCurrentScreen('profile')}
          onNavigateToRencana={() => setCurrentScreen('itinerary')}
          onNavigateToRiwayat={() => setCurrentScreen('trip-history')}
          onCreateItinerary={() => setCurrentScreen('departure-location')}
          onItemClick={(item) => setDetailDestination(item)}
          wishlistCount={favoritCount}
          activeTab="peta"
        />
      )}
      {currentScreen === 'profile' && (
        <ProfileScreen
          onNavigateToHome={() => router.push('/home')}
          onNavigateToMap={() => setCurrentScreen('map')}
          onNavigateToWishlist={() => setCurrentScreen('wishlist')}
          onWishlistClick={() => setCurrentScreen('wishlist')}
          onNotificationClick={() => showToast('Anda memiliki 2 notifikasi belum dibaca', 'info')}
          onNavigateToRencana={() => setCurrentScreen('itinerary')}
          onNavigateToRiwayat={() => setCurrentScreen('trip-history')}
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
          onNavigateToHome={() => router.push('/home')}
          onNavigateToMap={() => setCurrentScreen('map')}
          onNavigateToProfile={() => setCurrentScreen('profile')}
          onNavigateToRiwayat={() => setCurrentScreen('trip-history')}
          onWishlistClick={() => setCurrentScreen('wishlist')}
          onNotificationClick={() => showToast('Anda memiliki 2 notifikasi belum dibaca', 'info')}
          onCreatePlan={() => {
            setActiveItinerary(null);
            setCurrentScreen('departure-location');
          }}
          onViewPlan={(plan) => {
            setActiveItinerary(plan.rawItinerary || plan);
            setCurrentScreen('itinerary-summary');
          }}
          wishlistCount={favoritCount}
        />
      )}
      {currentScreen === 'departure-location' && (
        <DepartureLocationScreen
          onBack={() => setCurrentScreen('itinerary')}
          onNavigateToHome={() => router.push('/home')}
          onNavigateToMap={() => setCurrentScreen('map')}
          onNavigateToProfile={() => setCurrentScreen('profile')}
          onNavigateToRiwayat={() => setCurrentScreen('trip-history')}
          onWishlistClick={() => setCurrentScreen('wishlist')}
          onNotificationClick={() => showToast('Anda memiliki 2 notifikasi belum dibaca', 'info')}
          onNext={(location) => {
            setFormDeparture(location);
            setCurrentScreen('destination-selection');
          }}
          wishlistCount={favoritCount}
        />
      )}
      {currentScreen === 'destination-selection' && (
        <DestinationSelectionScreen
          initialSelectedDestinations={formDestinations}
          originName={formDeparture.name}
          originAddress={formDeparture.address}
          originLat={formDeparture.lat}
          originLng={formDeparture.lng}
          originRegency={formDeparture.regency}
          onBack={() => setCurrentScreen('departure-location')}
          onChangeOrigin={() => setCurrentScreen('departure-location')}
          onNavigateToHome={() => router.push('/home')}
          onNavigateToMap={() => setCurrentScreen('map')}
          onNavigateToProfile={() => setCurrentScreen('profile')}
          onNavigateToRiwayat={() => setCurrentScreen('trip-history')}
          onWishlistClick={() => setCurrentScreen('wishlist')}
          onNotificationClick={() => showToast('Anda memiliki 2 notifikasi belum dibaca', 'info')}
          onFinishSelection={(selected) => {
            setFormDestinations(selected);
            setActiveItinerary(null);
            setCurrentScreen('itinerary-summary');
          }}
          wishlistCount={favoritCount}
        />
      )}
      {currentScreen === 'itinerary-summary' && (
        <ItinerarySummaryScreen
          originName={summaryOriginName}
          originLat={summaryOriginLat}
          originLng={summaryOriginLng}
          planTitle={summaryTitle}
          waypoints={summaryWaypoints}
          onBack={() => setCurrentScreen(activeItinerary ? 'itinerary' : 'destination-selection')}
          onEditDestinations={() => setCurrentScreen('destination-selection')}
          onDeleteTrip={async () => {
            if (activeItinerary?.id) {
              try {
                await deleteItinerary(activeItinerary.id);
              } catch (e) {
                console.warn('Failed to delete itinerary from API:', e);
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
                  title: customTitle || summaryTitle,
                  departure_lat: formDeparture.lat || -6.595,
                  departure_lng: formDeparture.lng || 106.7972,
                  departure_name: formDeparture.name,
                  destinations: destIds.length > 0 ? destIds : [1],
                });
                setActiveItinerary(created);
              } catch (e) {
                console.warn('Save trip error:', e);
              }
            }
            showToast('Rencana perjalanan berhasil disimpan!', 'success');
            setCurrentScreen('saved-plan');
          }}
          onStartTrip={() => {
            const now = new Date();
            const timeStr = `${now.getHours().toString().padStart(2, '0')}.${now.getMinutes().toString().padStart(2, '0')} WIB`;
            setTripStartTime(timeStr);
            showToast('Memulai perjalanan! Membuka panduan rute...', 'info');
            setCurrentScreen('active-trip');
          }}
          onNavigateToHome={() => router.push('/home')}
          onNavigateToMap={() => setCurrentScreen('map')}
          onNavigateToProfile={() => setCurrentScreen('profile')}
          onNavigateToRiwayat={() => setCurrentScreen('trip-history')}
          onWishlistClick={() => setCurrentScreen('wishlist')}
          onNotificationClick={() => showToast('Anda memiliki 2 notifikasi belum dibaca', 'info')}
          wishlistCount={favoritCount}
        />
      )}
      {currentScreen === 'saved-plan' && (
        <SavedPlanScreen
          originName={summaryOriginName}
          originAddress={formDeparture.address}
          originLat={summaryOriginLat}
          originLng={summaryOriginLng}
          planTitle={summaryTitle}
          waypoints={summaryWaypoints}
          onBackToRencana={() => setCurrentScreen('itinerary')}
          onStartTrip={() => {
            const now = new Date();
            const timeStr = `${now.getHours().toString().padStart(2, '0')}.${now.getMinutes().toString().padStart(2, '0')} WIB`;
            setTripStartTime(timeStr);
            showToast('Memulai perjalanan! Membuka panduan rute...', 'info');
            setCurrentScreen('active-trip');
          }}
          onNavigateToHome={() => router.push('/home')}
          onNavigateToMap={() => setCurrentScreen('map')}
          onNavigateToProfile={() => setCurrentScreen('profile')}
          onNavigateToRiwayat={() => setCurrentScreen('trip-history')}
          onWishlistClick={() => setCurrentScreen('wishlist')}
          onNotificationClick={() => showToast('Anda memiliki 2 notifikasi belum dibaca', 'info')}
          wishlistCount={favoritCount}
        />
      )}
      {currentScreen === 'active-trip' && (
        <ActiveTripScreen
          originName={summaryOriginName}
          originLat={summaryOriginLat}
          originLng={summaryOriginLng}
          planTitle={summaryTitle}
          startTime={tripStartTime}
          waypoints={summaryWaypoints}
          onBack={() => setCurrentScreen('itinerary-summary')}
          onFinishTrip={(visitedCount) => {
            const count = typeof visitedCount === 'number' ? visitedCount : (summaryWaypoints?.length || 1);
            const now = new Date();
            const dateStr = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

            const newHistoryItem: TripItem = {
              id: `trip-${Date.now()}`,
              title: summaryTitle,
              category: 'Rencana Perjalanan',
              status: 'Selesai',
              duration: '1 hari',
              dateRange: dateStr,
              location: `${summaryOriginName}, Jawa Barat`,
              completedDate: dateStr,
              stats: {
                destinations: count,
                photos: 0,
                video: 0,
              },
              initials: ['JP'],
              image: (summaryWaypoints && summaryWaypoints[0] && (summaryWaypoints[0] as any).image) || '/tugu-kujang.jpg',
              destinations: (summaryWaypoints || []).slice(0, count).map((w: any, idx: number) => ({
                id: w.id,
                name: w.name,
                time: `${dateStr} • Selesai`,
                status: 'Sudah dikunjungi',
                photoCount: 0,
                image: (w as any).image || '/tugu-kujang.jpg',
                location: w.address || summaryOriginName,
                visitDate: dateStr,
                visitTime: 'Selesai',
                notes: `Kunjungan ke-${idx + 1} rencana perjalanan ${summaryTitle}`,
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
          onNavigateToHome={() => router.push('/home')}
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
          onViewTimelapse={(t) => {
            setSelectedTrip(t);
            setCurrentScreen('trip-showcase');
          }}
          onNavigateToHome={() => router.push('/home')}
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
          onNavigateToHome={() => router.push('/home')}
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
          onNavigateToHome={() => router.push('/home')}
          onNavigateToRencana={() => setCurrentScreen('itinerary')}
          onNavigateToMap={() => setCurrentScreen('map')}
          onNavigateToProfile={() => setCurrentScreen('profile')}
          onWishlistClick={() => setCurrentScreen('wishlist')}
          onNotificationClick={() => showToast('Anda memiliki 2 notifikasi belum dibaca', 'info')}
          wishlistCount={favoritCount}
        />
      )}
      {/* Destination Detail Popup Modal */}
      <DestinationDetailModal
        isOpen={!!detailDestination}
        destination={detailDestination}
        onClose={() => setDetailDestination(null)}
        onStartTrip={() => {
          setDetailDestination(null);
          setCurrentScreen('map');
        }}
        onToggleWishlist={(_, isSaved) => {
          setFavoritCount((prev) => (isSaved ? prev + 1 : Math.max(0, prev - 1)));
        }}
      />
    </MobileShell>
  );
}
