'use client';

import React, { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { getTripTimelapse, TimelapseData } from '@/lib/api';
import { fetchRoadRoute } from '@/lib/routing';
import TimelapseSkeleton from '@/components/timelapse/TimelapseSkeleton';
import { AlertCircle, ArrowLeft, RotateCcw } from 'lucide-react';

// Dynamically import 3D Player with ssr: false (MapLibre requires WebGL and browser window context)
const Timelapse3DPlayer = dynamic(
  () => import('@/components/timelapse/Timelapse3DPlayer'),
  {
    ssr: false,
    loading: () => <TimelapseSkeleton />,
  }
);

export default function TripTimelapsePage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params?.id as string;

  const [timelapseData, setTimelapseData] = useState<TimelapseData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchTimelapse = useCallback(async () => {
    if (!tripId) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await getTripTimelapse(tripId);
      if (data && data.stops && data.stops.length > 0) {
        // If route_polyline is missing or straight lines between stops, enhance with OSRM road network
        if (
          !data.route_polyline ||
          !data.route_polyline.coordinates ||
          data.route_polyline.coordinates.length <= data.stops.length + 1
        ) {
          try {
            const waypoints = data.stops.map(
              (s) => [s.coordinates[1], s.coordinates[0]] as [number, number]
            );
            if (waypoints.length >= 2) {
              const roadRes = await fetchRoadRoute(waypoints);
              if (roadRes?.geojson?.coordinates?.length >= 2) {
                data.route_polyline = {
                  type: 'LineString',
                  coordinates: roadRes.geojson.coordinates,
                };
              }
            }
          } catch (routeFallbackErr) {
            console.warn('Fallback OSRM road route fetch in timelapse page failed:', routeFallbackErr);
          }
        }
        setTimelapseData(data);
      } else {
        setErrorMessage('Data rute perjalanan tidak ditemukan atau belum memiliki koordinat lengkap.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memuat animasi 3D perjalanan.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }, [tripId]);

  const handleBack = useCallback(() => {
    if (tripId) {
      router.push(`/riwayat?tripId=${encodeURIComponent(tripId)}`);
    } else {
      router.push('/riwayat');
    }
  }, [router, tripId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTimelapse();
  }, [fetchTimelapse]);

  if (isLoading) {
    return <TimelapseSkeleton onBack={handleBack} />;
  }

  if (errorMessage || !timelapseData) {
    return (
      <div className="relative w-full h-full min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-rose-500" />
        </div>
        <h2 className="text-white text-base font-bold mb-1">
          Gagal Memuat 3D Timelapse
        </h2>
        <p className="text-white/60 text-xs max-w-sm mb-6 leading-relaxed">
          {errorMessage || 'Rencana perjalanan ini belum memiliki data koordinat rute yang valid.'}
        </p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="min-h-[48px] px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-semibold text-xs border border-white/20 transition-all cursor-pointer flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>

          <button
            type="button"
            onClick={fetchTimelapse}
            className="min-h-[48px] px-5 py-2.5 rounded-xl bg-[#4941EC] hover:bg-[#3D35D9] active:scale-95 text-white font-semibold text-xs shadow-md shadow-[#4941EC]/30 transition-all cursor-pointer flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Coba Lagi</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen overflow-hidden bg-[#0B0F19]">
      <Timelapse3DPlayer
        data={timelapseData}
        onBack={handleBack}
      />
    </div>
  );
}
