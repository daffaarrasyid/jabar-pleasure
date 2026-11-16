'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MobileShell from '@/components/layout/MobileShell';
import ItineraryScreen, { ActiveTripData } from '@/components/itinerary/ItineraryScreen';
import DepartureLocationScreen from '@/components/itinerary/DepartureLocationScreen';
import DestinationSelectionScreen from '@/components/itinerary/DestinationSelectionScreen';
import ItinerarySummaryScreen from '@/components/itinerary/ItinerarySummaryScreen';
import SavedPlanScreen from '@/components/itinerary/SavedPlanScreen';
import ActiveTripScreen from '@/components/itinerary/ActiveTripScreen';
import { TripItem } from '@/components/history/historyData';
import Toast from '@/components/ui/Toast';
import { createItinerary, deleteItinerary, completeItinerary } from '@/lib/api';
import { fetchRoadRoute } from '@/lib/routing';
import { getAuthToken, removeAuthToken, getUserTripHistoryKey, getUserActiveTripKey } from '@/lib/auth';

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

  const [favoritCount, setFavoritCount] = useState<number>(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // History trips persistent in local storage
  const [, setHistoryTrips] = useState<TripItem[]>([]);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      removeAuthToken();
      router.replace('/auth');
    }
  }, [router]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const stored = sessionStorage.getItem('jp_cached_wishlists');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) setFavoritCount(parsed.length);
        }
      } catch {
        // ignore
      }

      try {
        localStorage.removeItem('jabarpleasure_trip_history');
        const userKey = getUserTripHistoryKey();
        const storedHistory = localStorage.getItem(userKey);
        if (storedHistory) {
          const parsed = JSON.parse(storedHistory);
          if (Array.isArray(parsed)) {
            setHistoryTrips(parsed.filter((item: TripItem) => item.id !== 'bandung-trip'));
          }
        }
      } catch (e) {
        console.warn('Error reading trip history from storage:', e);
      }
    };
    loadData();
  }, []);

  const [activeItinerary, setActiveItinerary] = useState<any>(null);
  const [activeTrip, setActiveTrip] = useState<ActiveTripData | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(getUserActiveTripKey());
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse active trip from storage:', e);
      }
    }
    return null;
  });
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
    const loadDraft = async () => {
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
    };
    loadDraft();
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
          activeTrip={activeTrip}
          onResumeActiveTrip={() => setCurrentScreen('active-trip')}
          onNavigateToHome={() => router.push('/home')}
          onNavigateToMap={() => router.push('/map')}
          onNavigateToProfile={() => router.push('/profile')}
          onNavigateToRiwayat={() => router.push('/riwayat')}
          onWishlistClick={() => router.push('/home?tab=wishlist')}
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

                // Pre-calculate real OSRM road route geometry so backend stores exact road network
                let routeGeojson: any = null;
                try {
                  const originCoord: [number, number] = [formDeparture.lat || -6.595, formDeparture.lng || 106.7972];
                  const destCoords: [number, number][] = formDestinations
                    .filter((d: any) => (d.latitude || d.lat) && (d.longitude || d.lng))
                    .map((d: any) => [
                      parseFloat(d.latitude || d.lat),
                      parseFloat(d.longitude || d.lng),
                    ]);

                  if (destCoords.length > 0) {
                    const roadRes = await fetchRoadRoute([originCoord, ...destCoords]);
                    if (roadRes?.geojson?.coordinates?.length >= 2) {
                      routeGeojson = {
                        type: 'Feature',
                        properties: {
                          departure_name: formDeparture.name || 'Titik Keberangkatan',
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

                const created = await createItinerary({
                  title: customTitle || summaryTitle,
                  departure_lat: formDeparture.lat || -6.595,
                  departure_lng: formDeparture.lng || 106.7972,
                  departure_name: formDeparture.name,
                  route_geojson: routeGeojson,
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
            const newActive: ActiveTripData = {
              itineraryId: activeItinerary?.id,
              title: summaryTitle,
              originName: summaryOriginName,
              originLat: summaryOriginLat,
              originLng: summaryOriginLng,
              startTime: timeStr,
              waypoints: summaryWaypoints || [],
              currentStopIndex: 0,
              status: 'in_progress',
            };
            setActiveTrip(newActive);
            if (typeof window !== 'undefined') {
              localStorage.setItem(getUserActiveTripKey(), JSON.stringify(newActive));
            }
            showToast('Memulai perjalanan! Membuka panduan rute...', 'info');
            setCurrentScreen('active-trip');
          }}
          onNavigateToHome={() => router.push('/home')}
          onNavigateToMap={() => router.push('/map')}
          onNavigateToProfile={() => router.push('/profile')}
          onNavigateToRiwayat={() => router.push('/riwayat')}
          onWishlistClick={() => router.push('/home?tab=wishlist')}
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
            const newActive: ActiveTripData = {
              itineraryId: activeItinerary?.id,
              title: summaryTitle,
              originName: summaryOriginName,
              originLat: summaryOriginLat,
              originLng: summaryOriginLng,
              startTime: timeStr,
              waypoints: summaryWaypoints || [],
              currentStopIndex: 0,
              status: 'in_progress',
            };
            setActiveTrip(newActive);
            if (typeof window !== 'undefined') {
              localStorage.setItem(getUserActiveTripKey(), JSON.stringify(newActive));
            }
            showToast('Memulai perjalanan! Membuka panduan rute...', 'info');
            setCurrentScreen('active-trip');
          }}
          onNavigateToHome={() => router.push('/home')}
          onNavigateToMap={() => router.push('/map')}
          onNavigateToProfile={() => router.push('/profile')}
          onNavigateToRiwayat={() => router.push('/riwayat')}
          onWishlistClick={() => router.push('/home?tab=wishlist')}
          wishlistCount={favoritCount}
        />
      )}

      {/* 6. Perjalanan Aktif */}
      {currentScreen === 'active-trip' && (
        <ActiveTripScreen
          originName={activeTrip?.originName || summaryOriginName}
          originLat={activeTrip?.originLat || summaryOriginLat}
          originLng={activeTrip?.originLng || summaryOriginLng}
          planTitle={activeTrip?.title || summaryTitle}
          startTime={activeTrip?.startTime || tripStartTime}
          waypoints={activeTrip?.waypoints && activeTrip.waypoints.length > 0 ? activeTrip.waypoints : (summaryWaypoints || [])}
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
            if (activeTrip?.status === 'completed') {
              setActiveTrip(null);
              setActiveItinerary(null);
              setFormDestinations([]);
              setDraftTitle('');
              if (typeof window !== 'undefined') {
                localStorage.removeItem(getUserActiveTripKey());
              }
            }
            setCurrentScreen('itinerary');
          }}
          onFinishTrip={async (visitedCount) => {
            const currentWps = activeTrip?.waypoints && activeTrip.waypoints.length > 0 ? activeTrip.waypoints : (summaryWaypoints || []);
            const count = typeof visitedCount === 'number' ? visitedCount : (currentWps?.length || 1);
            const now = new Date();
            const dateStr = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
            const completedDateWithDay = now.toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            // Clean location: never display "Lokasi GPS Anda", use actual place name
            let cleanOrigin = (activeTrip?.originName || summaryOriginName)
              .replace(/lokasi gps anda/gi, '')
              .replace(/titik keberangkatan/gi, '')
              .trim();
            if (!cleanOrigin) {
              cleanOrigin = currentWps?.[0]?.name ? `${currentWps[0].name.split(' ')[0]}` : 'Bogor';
            }
            if (!cleanOrigin.toLowerCase().includes('jawa barat')) {
              cleanOrigin += ', Jawa Barat';
            }

            // Move plan in backend if activeItinerary exists or activeTrip?.itineraryId
            const itId = activeItinerary?.id || activeTrip?.itineraryId;
            if (itId) {
              try {
                await completeItinerary(itId);
              } catch (e) {
                console.warn('Failed to mark itinerary as completed on backend:', e);
              }
            }

            const newHistoryItem: TripItem = {
              id: itId ? `trip-${itId}` : `trip-${Date.now()}`,
              title: activeTrip?.title || summaryTitle,
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
              image: (currentWps && currentWps[0] && (currentWps[0] as any).image) || '/tugu-kujang.jpg',
              destinations: (currentWps || []).slice(0, count).map((w: any, idx: number) => ({
                id: w.id,
                name: w.name,
                time: `${dateStr} • Selesai`,
                status: 'Sudah dikunjungi',
                photoCount: 0,
                image: (w as any).image || '/tugu-kujang.jpg',
                location: w.address || cleanOrigin,
                visitDate: dateStr,
                visitTime: 'Selesai',
                notes: `Kunjungan ke-${idx + 1} rencana perjalanan ${activeTrip?.title || summaryTitle}`,
                photos: [],
              })),
            };

            setHistoryTrips((prev) => {
              const updated = [newHistoryItem, ...prev.filter((p) => p.id !== newHistoryItem.id)];
              if (typeof window !== 'undefined') {
                try {
                  const userKey = getUserTripHistoryKey();
                  localStorage.setItem(userKey, JSON.stringify(updated));
                } catch (e) {
                  console.warn('Error saving trip history to storage:', e);
                }
              }
              return updated;
            });

            // Mark activeTrip completed and remove from storage so it won't show in "Sedang Berjalan"
            setActiveTrip((prev) => (prev ? { ...prev, status: 'completed' } : null));
            if (typeof window !== 'undefined') {
              localStorage.removeItem(getUserActiveTripKey());
            }

            showToast(`Perjalanan selesai (${count} destinasi) dan berhasil dipindahkan ke Riwayat!`, 'success');
          }}
          onNavigateToHome={() => router.push('/home')}
          onNavigateToMap={() => router.push('/map')}
          onNavigateToProfile={() => router.push('/profile')}
          onNavigateToRiwayat={() => router.push('/riwayat')}
          onWishlistClick={() => router.push('/home?tab=wishlist')}
          wishlistCount={favoritCount}
        />
      )}
    </MobileShell>
  );
}
