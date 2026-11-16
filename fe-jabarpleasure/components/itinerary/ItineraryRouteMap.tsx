'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from '@/lib/leafletSetup';
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
  const pointsKey = points.map((p) => `${p[0]},${p[1]}`).join(';');

  useEffect(() => {
    if (!map || !points || points.length === 0) return;
    try {
      if (points.length === 1) {
        map.setView(points[0], 14, { animate: false });
      } else {
        const bounds = L.latLngBounds(points);
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [35, 35], maxZoom: 15, animate: false });
        }
      }
    } catch {
      // ignore
    }

    return () => {
      try {
        map.stop();
      } catch {
        // ignore
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointsKey, map]);

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

  const onRouteCalculatedRef = useRef(onRouteCalculated);
  useEffect(() => {
    onRouteCalculatedRef.current = onRouteCalculated;
  });

  // Fetch actual road network segments sequentially
  useEffect(() => {
    let isCancelled = false;

    async function loadSegments() {
      await Promise.resolve();
      if (isCancelled) return;
      setIsLoadingRoute(true);

      const allPoints: [number, number][] = [
        normalizedOrigin,
        ...normalizedWaypoints.map((w) => w.coordinates),
      ];

      if (allPoints.length < 2) {
        if (!isCancelled) {
          setSegments([]);
          setIsLoadingRoute(false);
          onRouteCalculatedRef.current?.(0, 0);
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
          onRouteCalculatedRef.current?.(totalKm, totalMins);
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

  // Marker DivIcons - Anchored mathematically at (0, 0) to prevent any zoom drift
  const originIcon = useMemo(() => {
    if (typeof window === 'undefined') return undefined;
    return L.divIcon({
      className: 'itinerary-origin-pin-container',
      html: `
        <div style="position: relative; width: 0; height: 0;">
          <div style="position: absolute; bottom: 0; left: 0; transform: translate(-50%, 0); display: flex; flex-direction: column; align-items: center; pointer-events: none; white-space: nowrap;">
            <!-- Race Checkered Flag Badge -->
            <div style="background: linear-gradient(135deg, #059669 0%, #10B981 100%); color: white; font-size: 11px; font-weight: 700; padding: 2.5px 8px; border-radius: 9999px; box-shadow: 0 4px 10px rgba(5,150,105,0.35); margin-bottom: 2px; border: 1.5px solid white; display: flex; align-items: center; gap: 4px;">
              <span style="font-size: 12px;">🏁</span>
              <span>Mulai: ${origin.name}</span>
            </div>
            <!-- Pin Icon where needle tip touches bottom at y=36 -->
            <div style="width: 28px; height: 36px; filter: drop-shadow(0 3px 6px rgba(0,0,0,0.3));">
              <svg viewBox="0 0 28 36" width="28" height="36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.268 21.732 0 14 0z" fill="#059669"/>
                <rect x="7" y="7" width="14" height="11" rx="2" fill="white" />
                <rect x="7" y="7" width="3.5" height="3.6" fill="#0F172A" />
                <rect x="10.5" y="7" width="3.5" height="3.6" fill="#FFFFFF" />
                <rect x="14" y="7" width="3.5" height="3.6" fill="#0F172A" />
                <rect x="17.5" y="7" width="3.5" height="3.6" fill="#FFFFFF" />
                <rect x="7" y="10.6" width="3.5" height="3.6" fill="#FFFFFF" />
                <rect x="10.5" y="10.6" width="3.5" height="3.6" fill="#0F172A" />
                <rect x="14" y="10.6" width="3.5" height="3.6" fill="#FFFFFF" />
                <rect x="17.5" y="10.6" width="3.5" height="3.6" fill="#0F172A" />
                <rect x="7" y="14.2" width="3.5" height="3.8" fill="#0F172A" />
                <rect x="10.5" y="14.2" width="3.5" height="3.8" fill="#FFFFFF" />
                <rect x="14" y="14.2" width="3.5" height="3.8" fill="#0F172A" />
                <rect x="17.5" y="14.2" width="3.5" height="3.8" fill="#FFFFFF" />
                <circle cx="14" cy="35" r="1" fill="#FFFFFF" />
              </svg>
            </div>
          </div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
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
      const badgeText = isPast ? `✓ ${order}. ${wp.name}` : `${order}. ${wp.name}`;

      icons[wp.id] = L.divIcon({
        className: 'itinerary-dest-pin-container',
        html: `
          <div style="position: relative; width: 0; height: 0;">
            <div style="position: absolute; bottom: 0; left: 0; transform: translate(-50%, 0); display: flex; flex-direction: column; align-items: center; pointer-events: none; white-space: nowrap;">
              <div style="background-color: ${bgColor}; color: white; font-size: 11px; font-weight: 700; padding: 2px 7px; border-radius: 9999px; box-shadow: 0 4px 10px rgba(73,65,236,0.3); margin-bottom: 2px; border: 1.5px solid white;">
                ${badgeText}
              </div>
              <div style="width: 26px; height: 34px; filter: drop-shadow(0 3px 6px rgba(0,0,0,0.3));">
                <svg viewBox="0 0 24 32" width="26" height="34" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 9.5 12 20 12 20s12-10.5 12-20c0-6.627-5.373-12-12-12z" fill="${bgColor}"/>
                  <circle cx="12" cy="11.5" r="7.5" fill="white"/>
                  <text x="12" y="15.2" text-anchor="middle" font-size="10" font-weight="800" fill="${bgColor}" font-family="system-ui, -apple-system, sans-serif">${order}</text>
                </svg>
              </div>
            </div>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });
    });

    return icons;
  }, [normalizedWaypoints, activeStopIndex]);

  return (
    <div
      className={`relative isolate z-0 w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100 border border-gray-200 shadow-xs ${className}`}
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

