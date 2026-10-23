'use client';

import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MarkerData {
  id: string;
  label: string;
  coordinates: [number, number];
}

interface WebGisMapProps {
  center?: [number, number];
  zoom?: number;
  showRouteAndMarkers?: boolean;
  markers?: MarkerData[];
  onMarkerClick?: (marker: MarkerData) => void;
  className?: string;
}

const DEFAULT_CENTER: [number, number] = [-6.5982, 106.8028]; // RS PMI / Kebun Raya Bogor area

const DEFAULT_MARKERS: MarkerData[] = [
  {
    id: 'kebun-raya',
    label: 'Kebun Raya Bogor',
    coordinates: [-6.5955, 106.7972],
  },
  {
    id: 'istana-bogor',
    label: 'Istana Bogor',
    coordinates: [-6.5962, 106.8018],
  },
  {
    id: 'soto-bogor',
    label: 'Soto Bogor Mang Asep',
    coordinates: [-6.5995, 106.8060],
  },
];

// Polygonal path simulating street routing in the mockup
const ROUTE_COORDINATES: [number, number][] = [
  [-6.5955, 106.7972],
  [-6.5965, 106.7975],
  [-6.5990, 106.7980],
  [-6.6010, 106.7986],
  [-6.6006, 106.8055],
  [-6.5995, 106.8060],
  [-6.5975, 106.8025],
  [-6.5962, 106.8018],
];

// Helper to pan map when coordinates change
function MapViewUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
}

export default function WebGisMap({
  center = DEFAULT_CENTER,
  zoom = 16,
  showRouteAndMarkers = false,
  markers = DEFAULT_MARKERS,
  onMarkerClick,
  className = '',
}: WebGisMapProps) {
  const icons = useMemo(() => {
    if (typeof window === 'undefined') return {};
    const newIcons: Record<string, L.DivIcon> = {};
    markers.forEach((m) => {
      newIcons[m.id] = L.divIcon({
        className: 'custom-webgis-pin-wrapper',
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: pointer;">
            <div style="background-color: #60CE9F; color: white; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.18); white-space: nowrap; margin-bottom: 3px; font-family: Poppins, sans-serif; pointer-events: auto;">
              ${m.label}
            </div>
            <div style="width: 24px; height: 32px; filter: drop-shadow(0 3px 6px rgba(0,0,0,0.25)); pointer-events: auto;">
              <svg viewBox="0 0 24 32" width="24" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0C5.373 0 0 5.373 0 12c0 9.5 12 20 12 20s12-10.5 12-20c0-6.627-5.373-12-12-12z" fill="#3B82F6"/>
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
  }, [markers]);

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

        {/* Dynamic Route Polyline */}
        {showRouteAndMarkers && (
          <Polyline
            positions={ROUTE_COORDINATES}
            pathOptions={{
              color: '#4941EC',
              weight: 5.5,
              opacity: 0.9,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        )}

        {/* Dynamic Destination Markers with Teal Tooltip Labels */}
        {showRouteAndMarkers &&
          markers.map((marker) => {
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
    </div>
  );
}
