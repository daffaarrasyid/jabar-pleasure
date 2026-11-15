'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom iOS style pin icon
const customPoiPinIcon = L.divIcon({
  className: 'custom-poi-marker',
  html: `
    <div style="
      width: 28px;
      height: 28px;
      background: #4941EC;
      border: 2.5px solid white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 4px 14px rgba(73,65,236,0.45);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

interface AdminPoiMapPickerProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
}

function MapClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      const newLat = parseFloat(e.latlng.lat.toFixed(6));
      const newLng = parseFloat(e.latlng.lng.toFixed(6));
      onChange(newLat, newLng);
    },
  });
  return null;
}

function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom(), { duration: 0.6 });
  }, [center, map]);
  return null;
}

export default function AdminPoiMapPicker({ lat, lng, onChange }: AdminPoiMapPickerProps) {
  const position: [number, number] = [lat || -6.9175, lng || 107.6191];

  return (
    <div className="w-full h-64 sm:h-72 rounded-2xl overflow-hidden border border-gray-200 relative shadow-inner z-0">
      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onChange={onChange} />
        <MapRecenter center={position} />
        <Marker
          position={position}
          icon={customPoiPinIcon}
          draggable={true}
          eventHandlers={{
            dragend: (e) => {
              const marker = e.target;
              const newPos = marker.getLatLng();
              onChange(parseFloat(newPos.lat.toFixed(6)), parseFloat(newPos.lng.toFixed(6)));
            },
          }}
        />
      </MapContainer>
      <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-200/80 text-[11px] font-medium text-gray-700 shadow-xs flex items-center justify-between pointer-events-none z-[1000]">
        <span>Klik pada peta atau seret pin untuk memindahkan titik</span>
        <span className="font-mono text-[#4941EC] font-semibold">
          {lat.toFixed(6)}, {lng.toFixed(6)}
        </span>
      </div>
    </div>
  );
}
