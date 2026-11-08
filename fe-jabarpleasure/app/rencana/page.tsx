'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MobileShell from '@/components/layout/MobileShell';
import ItineraryScreen from '@/components/itinerary/ItineraryScreen';
import DepartureLocationScreen from '@/components/itinerary/DepartureLocationScreen';
import DestinationSelectionScreen from '@/components/itinerary/DestinationSelectionScreen';
import ItinerarySummaryScreen from '@/components/itinerary/ItinerarySummaryScreen';
import SavedPlanScreen from '@/components/itinerary/SavedPlanScreen';
import ActiveTripScreen from '@/components/itinerary/ActiveTripScreen';
import { TripItem } from '@/components/history/historyData';
import Toast from '@/components/ui/Toast';
import { createItinerary, deleteItinerary, completeItinerary } from '@/lib/api';

export default function RencanaPage() {
  const router = useRouter();
  const [currentScreen, setCurrentScreen] = useState<
    | 'itinerary'
    | 'departure-location'
    | 'destination-selection'
    | 'itinerary-summary'
    | 'saved-plan'
    | 'active-trip'
  >('itinerary');

  const [favoritCount] = useState<number>(4);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // History trips persistent in local storage
  const [, setHistoryTrips] = useState<TripItem[]>(() => {
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

  const [activeItinerary, setActiveItinerary] = useState<any>(null);
  const [draftTitle, setDraftTitle] = useState<string>('');
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

  // Deteksi draft rencana perjalanan dari halaman Map (jika diarahkan dari Maps)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const draftRaw = sessionStorage.getItem('jabarpleasure_draft_itinerary');
      if (draftRaw) {
        const draft = JSON.parse(draftRaw);
        sessionStorage.removeItem('jabarpleasure_draft_itinerary');
        if (draft.origin) {
          setFormDeparture(draft.origin);
        }
        if (draft.destinations && Array.isArray(draft.destinations)) {
          setFormDestinations(draft.destinations);
        }
        if (draft.title) {
          setDraftTitle(draft.title);
        }
        // Pastikan belum tersimpan ke database sampai user mengklik 'Simpan perjalanan'
        setActiveItinerary(null);
        setCurrentScreen('itinerary-summary');
      }
    } catch (err) {
      console.warn('Error reading draft itinerary from storage:', err);
    }
  }, []);

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
      image: item.destination?.image_url || '/gedung-sate.jpg',
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
          image: d.image || '/gedung-sate.jpg',
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
    draftTitle ||
    (formDestinations.length > 0
      ? `Trip Seru di ${formDeparture.name}`
      : 'Sehari di Bogor');

  return (
    <MobileShell activeScreen="itinerary">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* 1. Halaman Utama Rencana */}
      {currentScreen === 'itinerary' && (
        <ItineraryScreen
          onNavigateToHome={() => router.push('/home')}
          onNavigateToMap={() => router.push('/map')}
          onNavigateToProfile={() => router.push('/profile')}
          onNavigateToRiwayat={() => router.push('/riwayat')}
          onWishlistClick={() => router.push('/home?tab=wishlist')}
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

      {/* 2. Form Langkah 1: Titik Keberangkatan */}
      {currentScreen === 'departure-location' && (
        <DepartureLocationScreen
          onBack={() => setCurrentScreen('itinerary')}
          onNavigateToHome={() => router.push('/home')}
          onNavigateToMap={() => router.push('/map')}
          onNavigateToProfile={() => router.push('/profile')}
          onNavigateToRiwayat={() => router.push('/riwayat')}
          onWishlistClick={() => router.push('/home?tab=wishlist')}
          onNotificationClick={() => showToast('Anda memiliki 2 notifikasi belum dibaca', 'info')}
          onNext={(location) => {
            setFormDeparture(location);
            setCurrentScreen('destination-selection');
          }}
          wishlistCount={favoritCount}
        />
      )}

      {/* 3. Form Langkah 2: Pemilihan Destinasi */}
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
          onNavigateToMap={() => router.push('/map')}
          onNavigateToProfile={() => router.push('/profile')}
          onNavigateToRiwayat={() => router.push('/riwayat')}
          onWishlistClick={() => router.push('/home?tab=wishlist')}
          onNotificationClick={() => showToast('Anda memiliki 2 notifikasi belum dibaca', 'info')}
          onFinishSelection={(selected) => {
            setFormDestinations(selected);
            setActiveItinerary(null);
            setCurrentScreen('itinerary-summary');
          }}
          wishlistCount={favoritCount}
        />
      )}

      {/* 4. Form Langkah 3: Ringkasan Rencana */}
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
            setDraftTitle('');
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
          onNavigateToMap={() => router.push('/map')}
          onNavigateToProfile={() => router.push('/profile')}
          onNavigateToRiwayat={() => router.push('/riwayat')}
          onWishlistClick={() => router.push('/home?tab=wishlist')}
          onNotificationClick={() => showToast('Anda memiliki 2 notifikasi belum dibaca', 'info')}
          wishlistCount={favoritCount}
        />
      )}

      {/* 5. Rencana Berhasil Tersimpan */}
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
          onNavigateToMap={() => router.push('/map')}
          onNavigateToProfile={() => router.push('/profile')}
          onNavigateToRiwayat={() => router.push('/riwayat')}
          onWishlistClick={() => router.push('/home?tab=wishlist')}
          onNotificationClick={() => showToast('Anda memiliki 2 notifikasi belum dibaca', 'info')}
          wishlistCount={favoritCount}
        />
      )}

      {/* 6. Perjalanan Aktif */}
      {currentScreen === 'active-trip' && (
        <ActiveTripScreen
          originName={summaryOriginName}
          originLat={summaryOriginLat}
          originLng={summaryOriginLng}
          planTitle={summaryTitle}
          startTime={tripStartTime}
          waypoints={summaryWaypoints}
          onBack={() => setCurrentScreen('itinerary-summary')}
          onFinishTrip={async (visitedCount) => {
            const count = typeof visitedCount === 'number' ? visitedCount : (summaryWaypoints?.length || 1);
            const now = new Date();
            const dateStr = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
            const completedDateWithDay = now.toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            // Clean location: never display "Lokasi GPS Anda", use actual place name
            let cleanOrigin = summaryOriginName
              .replace(/lokasi gps anda/gi, '')
              .replace(/titik keberangkatan/gi, '')
              .trim();
            if (!cleanOrigin) {
              cleanOrigin = summaryWaypoints?.[0]?.name ? `${summaryWaypoints[0].name.split(' ')[0]}` : 'Bogor';
            }
            if (!cleanOrigin.toLowerCase().includes('jawa barat')) {
              cleanOrigin += ', Jawa Barat';
            }

            // Move plan in backend if activeItinerary exists
            if (activeItinerary?.id) {
              try {
                await completeItinerary(activeItinerary.id);
              } catch (e) {
                console.warn('Failed to mark itinerary as completed on backend:', e);
              }
            }

            const newHistoryItem: TripItem = {
              id: activeItinerary?.id ? `trip-${activeItinerary.id}` : `trip-${Date.now()}`,
              title: summaryTitle,
              category: 'Rencana Perjalanan',
              status: 'Selesai',
              duration: '1 hari',
              dateRange: dateStr,
              location: cleanOrigin,
              completedDate: completedDateWithDay,
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
                location: w.address || cleanOrigin,
                visitDate: dateStr,
                visitTime: 'Selesai',
                notes: `Kunjungan ke-${idx + 1} rencana perjalanan ${summaryTitle}`,
                photos: [],
              })),
            };

            setHistoryTrips((prev) => {
              const updated = [newHistoryItem, ...prev.filter((p) => p.id !== newHistoryItem.id)];
              if (typeof window !== 'undefined') {
                try {
                  localStorage.setItem('jabarpleasure_trip_history', JSON.stringify(updated));
                } catch (e) {
                  console.warn('Error saving trip history to storage:', e);
                }
              }
              return updated;
            });

            // Clear active plan state
            setActiveItinerary(null);
            setFormDestinations([]);
            setDraftTitle('');

            showToast(`Perjalanan selesai (${count} destinasi) dan berhasil dipindahkan ke Riwayat!`, 'success');
            router.push('/riwayat');
          }}
          onNavigateToHome={() => router.push('/home')}
          onNavigateToMap={() => router.push('/map')}
          onNavigateToProfile={() => router.push('/profile')}
          onNavigateToRiwayat={() => router.push('/riwayat')}
          onWishlistClick={() => router.push('/home?tab=wishlist')}
          onNotificationClick={() => showToast('Anda memiliki 2 notifikasi belum dibaca', 'info')}
          wishlistCount={favoritCount}
        />
      )}
    </MobileShell>
  );
}
