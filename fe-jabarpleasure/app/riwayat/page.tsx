'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import MobileShell from '@/components/layout/MobileShell';
import { TripItem, DestinationItem } from '@/components/history/historyData';
import Toast from '@/components/ui/Toast';
import { getItineraries } from '@/lib/api';

const TripHistoryScreen = dynamic(() => import('@/components/history/TripHistoryScreen'), { ssr: false });
const TripDetailScreen = dynamic(() => import('@/components/history/TripDetailScreen'), { ssr: false });
const DestinationDocScreen = dynamic(() => import('@/components/history/DestinationDocScreen'), { ssr: false });
const TripShowcaseScreen = dynamic(() => import('@/components/history/TripShowcaseScreen'), { ssr: false });

export default function RiwayatPage() {
  const router = useRouter();
  const [currentScreen, setCurrentScreen] = useState<
    | 'trip-history'
    | 'trip-detail'
    | 'destination-doc'
    | 'trip-showcase'
  >('trip-history');

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [favoritCount] = useState<number>(4);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // History trips persistent in local storage
  const [historyTrips, setHistoryTrips] = useState<TripItem[]>([]);

  const [selectedTrip, setSelectedTrip] = useState<TripItem | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<DestinationItem | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  };

  // Check and merge completed itineraries from backend on mount (Stale-While-Revalidate)
  useEffect(() => {
    let isCancelled = false;

    const loadHistory = async () => {
      // 1. Read cached trips from localStorage on client mount
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('jabarpleasure_trip_history');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0 && !isCancelled) {
              setHistoryTrips(parsed.filter((item: TripItem) => item.id !== 'bandung-trip'));
              setIsLoading(false);
            }
          }
        } catch (e) {
          console.warn('Error reading trip history from storage:', e);
        }
      }

      try {
        const completedData = await getItineraries('completed');
        if (isCancelled) return;

        setHistoryTrips((prev) => {
          const currentClean = prev.filter((p) => p.id !== 'bandung-trip');
          const newItems: TripItem[] = [];

          (completedData || []).forEach((itin) => {
            const itinId = `trip-${itin.id}`;
            // If already exists in local state, do not overwrite
            if (currentClean.some((p) => p.id === itinId)) return;

            const dateStr = itin.end_date || itin.start_date || 'Hari ini';
            const originName =
              itin.route_geojson?.properties?.departure_name ||
              itin.route_geojson?.departure_name ||
              'Bogor, Jawa Barat';

            const firstImage =
              itin.items?.[0]?.destination?.cover_image_url ||
              itin.items?.[0]?.destination?.cover_image ||
              '/tugu-kujang.jpg';

            newItems.push({
              id: itinId,
              title: itin.title,
              category: 'Rencana Perjalanan',
              status: 'Selesai',
              duration:
                itin.start_date && itin.end_date && itin.start_date !== itin.end_date
                  ? '2 hari 1 malam'
                  : '1 hari',
              dateRange: dateStr,
              location: originName,
              completedDate: dateStr,
              stats: {
                destinations: itin.items?.length || 1,
                photos: 0,
                video: 0,
              },
              initials: ['JP'],
              image: firstImage,
              destinations: (itin.items || []).map((it, idx) => ({
                id: String(it.destination_id || idx + 1),
                name: it.destination?.name || `Destinasi ${idx + 1}`,
                time: `${dateStr} • Selesai`,
                status: 'Sudah dikunjungi',
                photoCount: 0,
                image: it.destination?.cover_image_url || it.destination?.cover_image || firstImage,
                location: it.destination?.address || originName,
                visitDate: dateStr,
                visitTime: 'Selesai',
                notes: `Kunjungan ke-${idx + 1} rencana perjalanan ${itin.title}`,
                photos: [],
              })),
            });
          });

          const merged = [...newItems, ...currentClean];
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('jabarpleasure_trip_history', JSON.stringify(merged));
            } catch (e) {
              console.warn('Failed saving merged history to localStorage:', e);
            }
          }
          return merged;
        });
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
          onBack={() => setCurrentScreen('trip-history')}
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
