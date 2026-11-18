'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import MobileShell from '@/components/layout/MobileShell';
import { TripItem, DestinationItem } from '@/components/history/historyData';
import Toast from '@/components/ui/Toast';
import { getItineraries } from '@/lib/api';
import { getAuthToken, removeAuthToken, getUserTripHistoryKey } from '@/lib/auth';
import { formatHumanDate, formatCompletedDayDate, formatDestinationTime } from '@/lib/dateUtils';

const TripHistoryScreen = dynamic(() => import('@/components/history/TripHistoryScreen'), { ssr: false });
const TripDetailScreen = dynamic(() => import('@/components/history/TripDetailScreen'), { ssr: false });
const DestinationDocScreen = dynamic(() => import('@/components/history/DestinationDocScreen'), { ssr: false });
const TripShowcaseScreen = dynamic(() => import('@/components/history/TripShowcaseScreen'), { ssr: false });

function RiwayatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tripIdParam = searchParams.get('tripId');

  const [currentScreen, setCurrentScreen] = useState<
    | 'trip-history'
    | 'trip-detail'
    | 'destination-doc'
    | 'trip-showcase'
  >('trip-history');

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [favoritCount, setFavoritCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // History trips persistent in local storage
  const [historyTrips, setHistoryTrips] = useState<TripItem[]>([]);

  const [selectedTrip, setSelectedTrip] = useState<TripItem | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<DestinationItem | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      removeAuthToken();
      router.replace('/auth');
    }
  }, [router]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  };

  // Automatically restore trip-detail screen when returning from timelapse page via ?tripId=...
  useEffect(() => {
    if (!tripIdParam || historyTrips.length === 0) return;

    const cleanParam = tripIdParam.trim().replace(/^trip-/, '');
    const matched = historyTrips.find(
      (t) =>
        t.id === tripIdParam ||
        t.id === `trip-${cleanParam}` ||
        t.id.replace(/^trip-/, '') === cleanParam
    );

    if (matched) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedTrip(matched);
      setCurrentScreen('trip-detail');
    }
  }, [tripIdParam, historyTrips]);

  // Check and sync completed itineraries from backend on mount (Strictly User-Scoped)
  useEffect(() => {
    let isCancelled = false;

    const loadHistory = async () => {
      const userKey = getUserTripHistoryKey();
      let cachedTrips: TripItem[] = [];

      // 1. Read cached trips strictly for the current authenticated user
      if (typeof window !== 'undefined') {
        try {
          // Permanently purge legacy shared key that caused cross-account leaks
          localStorage.removeItem('jabarpleasure_trip_history');

          const storedWishlist = sessionStorage.getItem('jp_cached_wishlists');
          if (storedWishlist) {
            const parsedW = JSON.parse(storedWishlist);
            if (Array.isArray(parsedW) && !isCancelled) setFavoritCount(parsedW.length);
          }
        } catch {
          // ignore
        }

        try {
          const stored = localStorage.getItem(userKey);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && !isCancelled) {
              cachedTrips = parsed
                .filter((item: TripItem) => item.id !== 'bandung-trip')
                .map((item: TripItem) => ({
                  ...item,
                  dateRange: formatHumanDate(item.dateRange),
                  completedDate: formatCompletedDayDate(item.completedDate),
                  destinations: (item.destinations || []).map((d) => ({
                    ...d,
                    time: formatDestinationTime(d.time, d.visitDate),
                    visitDate: formatHumanDate(d.visitDate),
                  })),
                }));
              setHistoryTrips(cachedTrips);
              if (cachedTrips.length > 0) {
                setIsLoading(false);
              }
            }
          }
        } catch (e) {
          console.warn('Error reading user trip history from storage:', e);
        }
      }

      try {
        const completedData = await getItineraries('completed');
        if (isCancelled) return;

        const cachedMap = new Map<string, TripItem>(cachedTrips.map((t) => [t.id, t]));

        const backendTrips: TripItem[] = (completedData || []).map((itin) => {
          const itinId = `trip-${itin.id}`;
          const localTrip = cachedMap.get(itinId);

          const rawDate = itin.end_date || itin.start_date || 'Hari ini';
          const cleanDate = formatHumanDate(rawDate);
          const completedDayDate = formatCompletedDayDate(rawDate);
          const originName =
            itin.route_geojson?.properties?.departure_name ||
            itin.route_geojson?.departure_name ||
            'Bogor, Jawa Barat';

          const firstImage =
            itin.items?.[0]?.destination?.cover_image_url ||
            itin.items?.[0]?.destination?.cover_image ||
            localTrip?.image ||
            '/tugu-kujang.jpg';

          return {
            id: itinId,
            title: itin.title,
            category: 'Rencana Perjalanan',
            status: 'Selesai',
            duration:
              itin.start_date && itin.end_date && itin.start_date !== itin.end_date
                ? '2 hari 1 malam'
                : '1 hari',
            dateRange: cleanDate,
            location: originName,
            completedDate: completedDayDate,
            stats: {
              destinations: itin.items?.length || 1,
              photos: localTrip?.stats?.photos || 0,
              video: localTrip?.stats?.video || 0,
            },
            initials: ['JP'],
            image: firstImage,
            destinations: (itin.items || []).map((it, idx) => {
              const localDest = localTrip?.destinations?.[idx];
              return {
                id: String(it.destination_id || idx + 1),
                name: it.destination?.name || `Destinasi ${idx + 1}`,
                time: `${cleanDate} • Selesai`,
                status: 'Sudah dikunjungi',
                photoCount: localDest?.photoCount || 0,
                image: it.destination?.cover_image_url || it.destination?.cover_image || firstImage,
                location: it.destination?.address || originName,
                visitDate: cleanDate,
                visitTime: 'Selesai',
                notes: localDest?.notes || `Kunjungan ke-${idx + 1} rencana perjalanan ${itin.title}`,
                photos: localDest?.photos || [],
              };
            }),
          };
        });

        // Only retain local trips that explicitly match this user's scoped storage and are not yet in backend
        const remainingLocalTrips = cachedTrips.filter(
          (lt) => !backendTrips.some((bt) => bt.id === lt.id)
        );

        const verifiedUserHistory = [...backendTrips, ...remainingLocalTrips];
        setHistoryTrips(verifiedUserHistory);

        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(userKey, JSON.stringify(verifiedUserHistory));
          } catch (e) {
            console.warn('Failed saving user history to localStorage:', e);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch completed itineraries:', err);
        showToast('Gagal menyinkronkan data riwayat terbaru.', 'error');
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadHistory();

    return () => {
      isCancelled = true;
    };
  }, []);

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
          isLoading={isLoading}
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
          wishlistCount={favoritCount}
        />
      )}

      {/* 2. Detail Trip */}
      {currentScreen === 'trip-detail' && (
        <TripDetailScreen
          trip={selectedTrip || undefined}
          onBack={() => {
            router.replace('/riwayat');
            setCurrentScreen('trip-history');
          }}
          onUpdateTrip={(updated) => {
            setSelectedTrip(updated);
            setHistoryTrips((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
          }}
          onSelectDestination={(dest) => {
            const freshDest = selectedTrip?.destinations?.find((d) => d.id === dest.id) || dest;
            setSelectedDestination(freshDest);
            setCurrentScreen('destination-doc');
          }}
          onViewShowcase={() => setCurrentScreen('trip-showcase')}
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
          destination={selectedDestination || undefined}
          trip={selectedTrip || undefined}
          onBack={() => setCurrentScreen('trip-detail')}
          onUpdateTrip={(updated) => {
            setSelectedTrip(updated);
            setHistoryTrips((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
            const updatedDest = updated.destinations?.find((d) => d.id === selectedDestination?.id);
            if (updatedDest) setSelectedDestination(updatedDest);
          }}
          onNavigateToHome={() => router.push('/home')}
          onNavigateToRencana={() => router.push('/rencana')}
          onNavigateToMap={() => router.push('/map')}
          onNavigateToProfile={() => router.push('/profile')}
          onWishlistClick={() => router.push('/home?tab=wishlist')}
          wishlistCount={favoritCount}
        />
      )}

      {/* 4. Showcase Video Trip */}
      {currentScreen === 'trip-showcase' && (
        <TripShowcaseScreen
          trip={selectedTrip || undefined}
          onBack={() => setCurrentScreen('trip-detail')}
          onNavigateToHome={() => router.push('/home')}
          onNavigateToRencana={() => router.push('/rencana')}
          onNavigateToMap={() => router.push('/map')}
          onNavigateToProfile={() => router.push('/profile')}
          onWishlistClick={() => router.push('/home?tab=wishlist')}
          wishlistCount={favoritCount}
        />
      )}
    </MobileShell>
  );
}

export default function RiwayatPage() {
  return (
    <Suspense
      fallback={
        <MobileShell activeScreen="riwayat">
          <div className="w-full h-full flex items-center justify-center p-6 text-gray-400 text-xs">
            Memuat riwayat perjalanan...
          </div>
        </MobileShell>
      }
    >
      <RiwayatContent />
    </Suspense>
  );
}
