'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchRoadRoute } from '@/lib/routing';
import { Loader2 } from 'lucide-react';

export interface MapWaypoint {
  id: string;
  name: string;
  address?: string;
  lat?: number;
  lng?: number;
  orderNumber?: number;
}

interface RouteSegment {
  coordinates: [number, number][];
  distanceKm: number;
  durationMinutes: number;
}

interface ItineraryRouteMapProps {
  origin: {
    name: string;
    lat?: number;
    lng?: number;
  };
  waypoints: MapWaypoint[];
  activeStopIndex?: number; // Index destinasi yang sedang aktif dituju. Segmen < activeStopIndex berwarna abu-abu.
  onRouteCalculated?: (totalDistanceKm: number, durationMinutes: number) => void;
  className?: string;
}

// Auto bounds updater when waypoints or route coordinates update
function RouteMapBoundsUpdater({
  points,
}: {
  points: [number, number][];
}) {
  const map = useMap();
  useEffect(() => {
    if (points && points.length > 0) {
      if (points.length === 1) {
        map.setView(points[0], 14, { animate: true });
      } else {
        const bounds = L.latLngBounds(points);
        map.fitBounds(bounds, { padding: [35, 35], maxZoom: 15, animate: true });
      }
    }
  }, [points, map]);

  return null;
}

export default function ItineraryRouteMap({
  origin,
  waypoints,
  activeStopIndex = -1, // default -1: semua segmen rute aktif (#4941EC)
  onRouteCalculated,
  className = '',
}: ItineraryRouteMapProps) {
  const [segments, setSegments] = useState<RouteSegment[]>([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState<boolean>(true);

  // Normalize fallback coordinates if not provided in data
  const normalizedOrigin = useMemo<[number, number]>(() => {
    return [origin.lat || -6.595, origin.lng || 106.7972];
  }, [origin.lat, origin.lng]);

  const normalizedWaypoints = useMemo(() => {
    return waypoints.map((wp, idx) => {
      // Default offset fallback around Bogor if lat/lng missing
      const lat = wp.lat || (-6.5976 - idx * 0.012);
      const lng = wp.lng || (106.801 + (idx % 2 === 0 ? 0.01 : -0.01));
      return {
        ...wp,
        coordinates: [lat, lng] as [number, number],
      };
    });
  }, [waypoints]);

  // Fetch actual road network segments sequentially
  useEffect(() => {
    let isCancelled = false;
    setIsLoadingRoute(true);

    async function loadSegments() {
      const allPoints: [number, number][] = [
        normalizedOrigin,
        ...normalizedWaypoints.map((w) => w.coordinates),
      ];

      if (allPoints.length < 2) {
        if (!isCancelled) {
          setSegments([]);
          setIsLoadingRoute(false);
          onRouteCalculated?.(0, 0);
        }
        return;
      }

      try {
        const segmentPromises: Promise<RouteSegment>[] = [];

        for (let i = 0; i < allPoints.length - 1; i++) {
          const start = allPoints[i];
          const end = allPoints[i + 1];
          segmentPromises.push(
            fetchRoadRoute([start, end]).then((res) => ({
              coordinates: res.coordinates,
              distanceKm: res.distanceKm,
              durationMinutes: res.durationMinutes,
            }))
          );
        }

        const calculatedSegments = await Promise.all(segmentPromises);

        if (!isCancelled) {
          setSegments(calculatedSegments);
          const totalKm = Math.round(
            calculatedSegments.reduce((sum, seg) => sum + seg.distanceKm, 0) * 10
          ) / 10;
          const totalMins = calculatedSegments.reduce((sum, seg) => sum + seg.durationMinutes, 0);
          onRouteCalculated?.(totalKm, totalMins);
        }
      } catch (err) {
        console.warn('Failed to calculate road segments:', err);
      } finally {
        if (!isCancelled) {
          setIsLoadingRoute(false);
        }
      }
    }

    loadSegments();

    return () => {
      isCancelled = true;
    };
  }, [normalizedOrigin, normalizedWaypoints]);

  // Points for map bounds calculation
  const allKeyPoints = useMemo<[number, number][]>(() => {
    const points: [number, number][] = [normalizedOrigin];
    normalizedWaypoints.forEach((w) => points.push(w.coordinates));
    return points;
  }, [normalizedOrigin, normalizedWaypoints]);

  // Marker DivIcons
  const originIcon = useMemo(() => {
    if (typeof window === 'undefined') return undefined;
    return L.divIcon({
      className: 'itinerary-origin-pin',
      html: `
        <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
          <div style="background-color: #10B981; color: white; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.25); white-space: nowrap; margin-bottom: 2px;">
            Awal: ${origin.name}
          </div>
          <div style="width: 22px; height: 28px; filter: drop-shadow(0 2px 5px rgba(0,0,0,0.3));">
            <svg viewBox="0 0 24 32" width="22" height="28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C5.373 0 0 5.373 0 12c0 9.5 12 20 12 20s12-10.5 12-20c0-6.627-5.373-12-12-12z" fill="#10B981"/>
              <circle cx="12" cy="11.5" r="4.5" fill="white"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [22, 28],
      iconAnchor: [11, 28],
    });
  }, [origin.name]);

  const waypointIcons = useMemo(() => {
    if (typeof window === 'undefined') return {};
    const icons: Record<string, L.DivIcon> = {};

    normalizedWaypoints.forEach((wp, idx) => {
      const order = wp.orderNumber || idx + 1;
      const isPast = activeStopIndex !== -1 && idx < activeStopIndex;
      const isCurrent = activeStopIndex !== -1 && idx === activeStopIndex;

      const bgColor = isPast ? '#6B7280' : isCurrent ? '#4941EC' : '#4941EC';
      const badgeText = isPast ? '✓ Selesai' : `${order}. ${wp.name}`;

      icons[wp.id] = L.divIcon({
        className: 'itinerary-dest-pin',
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
            <div style="background-color: ${bgColor}; color: white; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.25); white-space: nowrap; margin-bottom: 2px;">
              ${badgeText}
            </div>
            <div style="width: 22px; height: 28px; filter: drop-shadow(0 2px 5px rgba(0,0,0,0.3));">
              <svg viewBox="0 0 24 32" width="22" height="28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0C5.373 0 0 5.373 0 12c0 9.5 12 20 12 20s12-10.5 12-20c0-6.627-5.373-12-12-12z" fill="${bgColor}"/>
                <circle cx="12" cy="11.5" r="4.5" fill="white"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [22, 28],
        iconAnchor: [11, 28],
      });
    });

    return icons;
  }, [normalizedWaypoints, activeStopIndex]);

  return (
    <div
      className={`relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100 border border-gray-200 shadow-xs ${className}`}
    >
      <MapContainer
        center={normalizedOrigin}
        zoom={13}
        className="w-full h-full"
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <RouteMapBoundsUpdater points={allKeyPoints} />

        {/* Origin Marker */}
        {originIcon && (
          <Marker position={normalizedOrigin} icon={originIcon} />
        )}

        {/* Waypoint Markers */}
        {normalizedWaypoints.map((wp) => {
          const icon = waypointIcons[wp.id];
          if (!icon) return null;
          return <Marker key={wp.id} position={wp.coordinates} icon={icon} />;
        })}

        {/* Road Network Polylines */}
        {segments.map((seg, idx) => {
          // Rule: Pada perjalanan aktif, segmen yang sudah dilalui (idx < activeStopIndex) berwarna abu-abu (#9CA3AF)
          const isPassedSegment = activeStopIndex !== -1 && idx < activeStopIndex;
          const lineColor = isPassedSegment ? '#9CA3AF' : '#4941EC';
          const lineDash = isPassedSegment ? '6, 6' : undefined;

          return (
            <Polyline
              key={`seg-${idx}-${isPassedSegment ? 'past' : 'active'}`}
              positions={seg.coordinates}
              pathOptions={{
                color: lineColor,
                weight: 5,
                opacity: 0.9,
                dashArray: lineDash,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          );
        })}
      </MapContainer>

      {/* Loading overlay when OSRM routing is being computed */}
      {isLoadingRoute && (
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-gray-200 text-[10px] text-gray-700 font-semibold flex items-center gap-1.5 shadow-xs z-[1000]">
          <Loader2 className="w-3 h-3 text-[#4941EC] animate-spin" />
          <span>Menghitung rute jalan...</span>
        </div>
      )}
    </div>
  );
}

