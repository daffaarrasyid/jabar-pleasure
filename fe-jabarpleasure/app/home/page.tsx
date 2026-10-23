'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import MobileShell from '@/components/layout/MobileShell';
import HomeScreen from '@/components/home/HomeScreen';

export default function HomePage() {
  const router = useRouter();

  return (
    <MobileShell activeScreen="home">
      <HomeScreen
        onNavigateToMap={() => router.push('/map')}
        onNotificationClick={() => {}}
        onProfileClick={() => {}}
      />
    </MobileShell>
  );
}
