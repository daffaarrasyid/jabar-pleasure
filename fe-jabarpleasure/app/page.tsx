'use client';

// app/page.tsx
import dynamic from 'next/dynamic';

// Import dinamis untuk mematikan Server-Side Rendering pada Leaflet
const MapComponent = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center bg-gray-100">
      <p className="animate-pulse text-lg font-semibold text-gray-600">Memuat Peta Jawa Barat...</p>
    </div>
  ),
});

export default function Home() {
  return (
    <main className="relative h-screen w-full">
      {/* Nanti lo bisa menumpuk UI Sidebar atau Filter (WBS 1.4.1.3) di atas komponen ini dengan z-index */}
      <MapComponent />
    </main>
  );
}