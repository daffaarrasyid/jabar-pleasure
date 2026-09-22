// components/Map.tsx
'use client';

import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function Map() {
    return (
        <MapContainer
            center={[-6.914744, 107.609810]} // Koordinat tengah Jawa Barat (Bandung)
            zoom={8}
            scrollWheelZoom={true}
            className="w-full h-screen z-0" // Memanfaatkan Tailwind CSS
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
        </MapContainer>
    );
}