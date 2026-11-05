'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WishlistPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/home?tab=wishlist');
  }, [router]);

  return (
    <div className="w-full h-screen flex items-center justify-center bg-[#F9FAFB]">
      <div className="w-8 h-8 rounded-full border-2 border-[#4941EC] border-t-transparent animate-spin" />
    </div>
  );
}

