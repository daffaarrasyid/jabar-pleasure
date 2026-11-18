'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from '@/lib/leafletSetup';
import 'leaflet/dist/leaflet.css';
import { Compass } from 'lucide-react';

interface DepartureMapPickerProps {
  initialCenter?: [number, number];
  selectedCoords?: [number, number] | null;
  onSelectCoords: (lat: number, lng: number, placeName?: string) => void;
  isGpsActive?: boolean;
  className?: string;
}

// Bounding box for West Java (Provinsi Jawa Barat)
// South: -8.0, West: 106.3, North: -5.8, East: 108.9
const JABAR_BOUNDS: L.LatLngBoundsExpression = [
  [-8.05, 106.35], // Southwest
  [-5.85, 108.85], // Northeast
];

const DEFAULT_JABAR_CENTER: [number, number] = [-6.9175, 107.6191]; // Kota Bandung

function MapEventsHandler({
  onMapClick,
}: {
  onMapClick: (lat: number, lng: number) => void;
}) {
  const map = useMapEvents({
    click(e) {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;

      // Check if within West Java bounds
      if (lat >= -8.1 && lat <= -5.8 && lng >= 106.3 && lng <= 108.9) {
        map.flyTo(e.latlng, Math.max(map.getZoom(), 13), {
          animate: true,
          duration: 0.5,
        });
        onMapClick(lat, lng);
      }
    },
  });

  return null;
}

function MapCenterUpdater({ center }: { center?: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, Math.max(map.getZoom(), 13), {
        animate: true,
        duration: 0.6,
      });
    }
  }, [center, map]);
  return null;
}

export default function DepartureMapPicker({
  initialCenter = DEFAULT_JABAR_CENTER,
  selectedCoords,
  onSelectCoords,
  isGpsActive = false,
  className = '',
}: DepartureMapPickerProps) {
  const [currentCoords, setCurrentCoords] = useState<[number, number] | null>(
    selectedCoords || null
  );
  const [prevSelectedCoords, setPrevSelectedCoords] = useState<[number, number] | null>(
    selectedCoords || null
  );
  if (selectedCoords !== prevSelectedCoords) {
    setPrevSelectedCoords(selectedCoords || null);
    if (selectedCoords) {
      setCurrentCoords(selectedCoords);
    }
  }

  const [isReverseGeocoding, setIsReverseGeocoding] = useState<boolean>(false);

  // Race/Start Custom Flag Pin Icon - Mathematically anchored at (0, 0)
  const flagMarkerIcon = L.divIcon({
    className: 'departure-picker-pin-container',
    html: `
      <div style="position: relative; width: 0; height: 0;">
        <div style="position: absolute; bottom: 0; left: 0; transform: translate(-50%, 0); display: flex; flex-direction: column; align-items: center; pointer-events: none; white-space: nowrap;">
          <div style="background-color: #10B981; color: white; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; box-shadow: 0 4px 10px rgba(0,0,0,0.25); margin-bottom: 2px; display: flex; align-items: center; gap: 4px; border: 1.5px solid white;">
            <span>🏁 Titik Mulai</span>
          </div>
          <div style="width: 28px; height: 34px; filter: drop-shadow(0 3px 6px rgba(0,0,0,0.3));">
            <svg viewBox="0 0 32 38" width="28" height="34" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 22 16 22s16-10 16-22C32 7.163 24.837 0 16 0z" fill="#10B981"/>
              <!-- Checkered flag graphic inside pin -->
              <rect x="9" y="8" width="4" height="4" fill="white" />
              <rect x="13" y="8" width="4" height="4" fill="#1E293B" />
              <rect x="17" y="8" width="4" height="4" fill="white" />
              <rect x="9" y="12" width="4" height="4" fill="#1E293B" />
              <rect x="13" y="12" width="4" height="4" fill="white" />
              <rect x="17" y="12" width="4" height="4" fill="#1E293B" />
              <rect x="9" y="16" width="4" height="4" fill="white" />
              <rect x="13" y="16" width="4" height="4" fill="#1E293B" />
              <rect x="17" y="16" width="4" height="4" fill="white" />
              <path d="M8 7v14" stroke="white" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </div>
        </div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });

  const handleMapClick = async (lat: number, lng: number) => {
    setCurrentCoords([lat, lng]);
    setIsReverseGeocoding(true);

    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (res.ok) {
        const json = await res.json();
        const addr = json.address || {};
        const placeName =
          addr.amenity ||
          addr.tourism ||
          addr.building ||
          addr.road ||
          addr.suburb ||
          addr.village ||
          addr.city_district ||
          addr.city ||
          addr.county ||
          'Titik Peta Terpilih';
        onSelectCoords(lat, lng, placeName);
      } else {
        onSelectCoords(lat, lng, `Titik Koordinat (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
      }
    } catch {
      onSelectCoords(lat, lng, `Titik Koordinat (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  return (
    <div
      className={`relative isolate z-0 w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100 border border-gray-200 shadow-xs ${className}`}
    >
      <MapContainer
        center={initialCenter}
        zoom={isGpsActive ? 14 : 10}
        maxBounds={JABAR_BOUNDS}
        maxBoundsViscosity={1.0}
        minZoom={8}
        maxZoom={18}
        className="w-full h-full z-10"
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <MapCenterUpdater center={initialCenter} />
        <MapEventsHandler onMapClick={handleMapClick} />

        {currentCoords && (
          <Marker position={currentCoords} icon={flagMarkerIcon} />
        )}
      </MapContainer>

      {/* Floating Info Pill: Instruction */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-20 pointer-events-none flex justify-center">
        <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-200/90 shadow-md flex items-center gap-1.5 text-[11px] font-semibold text-gray-800">
          <Compass className="w-3.5 h-3.5 text-[#4941EC] shrink-0 animate-spin" style={{ animationDuration: '6s' }} />
          <span>
            {isReverseGeocoding
              ? 'Mendapatkan nama lokasi...'
              : 'Ketuk pada peta Jawa Barat untuk memilih titik'}
          </span>
        </div>
      </div>

      {/* Bounding Box Boundary Indicator Badge */}
      <div className="absolute bottom-2.5 right-2.5 z-20 pointer-events-none">
        <span className="bg-gray-900/70 backdrop-blur-xs text-white text-[9px] font-medium px-2 py-0.5 rounded-md">
          Batas Wilayah Jawa Barat Terkunci
        </span>
      </div>
    </div>
  );
}
