'use client';

import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Polyline, useMap } from 'react-leaflet';
import { Locate } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface MarkerData {
  id: string;
  label: string;
  category?: string;
  coordinates: [number, number];
}

interface WebGisMapProps {
  center?: [number, number];
  zoom?: number;
  userLocation?: { lat: number; lng: number } | null;
  radiusKm?: number;
  markers?: MarkerData[];
  selectedMarkerId?: string | null;
  routeCoordinates?: [number, number][];
  onMarkerClick?: (marker: MarkerData) => void;
  onRecenter?: () => void;
  className?: string;
}

const DEFAULT_CENTER: [number, number] = [-6.9175, 107.6191]; // Default: Kota Bandung

// Helper to pan map smoothly when center changes
function MapViewUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 0.8 });
  }, [center, zoom, map]);
  return null;
}

// Helper to fit map bounds when a route polyline is active
function MapRouteBoundsUpdater({ routeCoordinates }: { routeCoordinates?: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (routeCoordinates && routeCoordinates.length >= 2) {
      const bounds = L.latLngBounds(routeCoordinates);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15, animate: true });
    }
  }, [routeCoordinates, map]);
  return null;
}

export default function WebGisMap({
  center = DEFAULT_CENTER,
  zoom = 13,
  userLocation,
  radiusKm = 10,
  markers = [],
  selectedMarkerId,
  routeCoordinates,
  onMarkerClick,
  onRecenter,
  className = '',
}: WebGisMapProps) {
  // User Location Pulse Icon
  const userIcon = useMemo(() => {
    if (typeof window === 'undefined') return undefined;
    return L.divIcon({
      className: 'user-gps-pulse-marker',
      html: `
        <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 28px; height: 28px; border-radius: 9999px; background-color: rgba(73, 65, 236, 0.3); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; width: 14px; height: 14px; border-radius: 9999px; background-color: #4941EC; border: 2.5px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.35);"></div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  }, []);

  // Destination Markers Icons
  const icons = useMemo(() => {
    if (typeof window === 'undefined') return {};
    const newIcons: Record<string, L.DivIcon> = {};
    markers.forEach((m) => {
      const isSelected = selectedMarkerId === m.id;
      const badgeBg = isSelected ? '#4941EC' : '#60CE9F';
      const pinColor = isSelected ? '#4941EC' : '#3B82F6';

      newIcons[m.id] = L.divIcon({
        className: 'custom-webgis-pin-wrapper',
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: pointer;">
            <div style="background-color: ${badgeBg}; color: white; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.2); white-space: nowrap; margin-bottom: 2px; font-family: Inter, sans-serif; pointer-events: auto;">
              ${m.label}
            </div>
            <div style="width: 24px; height: 32px; filter: drop-shadow(0 3px 6px rgba(0,0,0,0.25)); pointer-events: auto;">
              <svg viewBox="0 0 24 32" width="24" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0C5.373 0 0 5.373 0 12c0 9.5 12 20 12 20s12-10.5 12-20c0-6.627-5.373-12-12-12z" fill="${pinColor}"/>
                <circle cx="12" cy="11.5" r="4.5" fill="white"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });
    });
    return newIcons;
  }, [markers, selectedMarkerId]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        zoomControl={false}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapViewUpdater center={center} zoom={zoom} />

        {/* Internal Route Polyline (Rencana Perjalanan) */}
        {routeCoordinates && routeCoordinates.length >= 2 && (
          <>
            <Polyline
              positions={routeCoordinates}
              pathOptions={{
                color: '#4941EC',
                weight: 4.5,
                opacity: 0.9,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            <MapRouteBoundsUpdater routeCoordinates={routeCoordinates} />
          </>
        )}

        {/* User Location Marker & Proximity Radius Circle */}
        {userLocation && userIcon && (
          <>
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon} />
            <Circle
              center={[userLocation.lat, userLocation.lng]}
              radius={radiusKm * 1000}
              pathOptions={{
                color: '#4941EC',
                fillColor: '#4941EC',
                fillOpacity: 0.08,
                weight: 1.8,
                dashArray: '4, 6',
              }}
            />
          </>
        )}

        {/* Dynamic Destination Markers */}
        {markers.map((marker) => {
          const icon = icons[marker.id];
          if (!icon) return null;
          return (
            <Marker
              key={marker.id}
              position={marker.coordinates}
              icon={icon}
              eventHandlers={{
                click: () => onMarkerClick?.(marker),
              }}
            />
          );
        })}
      </MapContainer>

      {/* Floating GPS Re-center Button */}
      {onRecenter && (
        <button
          type="button"
          onClick={onRecenter}
          aria-label="Pusatkan ke lokasi saya"
          className="absolute bottom-24 right-4 z-10 w-11 h-11 bg-white hover:bg-gray-50 text-[#4941EC] rounded-full shadow-[0_4px_14px_rgba(0,0,0,0.15)] border border-gray-200 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
        >
          <Locate className="w-5 h-5 stroke-[2.2]" />
        </button>
      )}
    </div>
  );
}
