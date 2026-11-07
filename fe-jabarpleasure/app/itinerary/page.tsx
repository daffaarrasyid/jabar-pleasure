'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ItineraryRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/rencana');
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#F9FAFB]">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-3 border-[#4941EC] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-gray-600">Membuka Rencana Perjalanan...</p>
      </div>
    </div>
  );
}

