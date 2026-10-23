'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import SplashScreen from '@/components/auth/SplashScreen';
import MobileShell from '@/components/layout/MobileShell';

export default function SplashPage() {
  const router = useRouter();

  return (
    <MobileShell>
      <SplashScreen
        autoDismissDelay={3000}
        onFinish={() => router.push('/auth')}
      />
    </MobileShell>
  );
}
