'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGateway from '@/components/auth/AuthGateway';
import MobileShell from '@/components/layout/MobileShell';
import Toast from '@/components/ui/Toast';

export default function AuthPage() {
  const router = useRouter();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const handleSocial = (provider: 'google' | 'apple') => {
    setToast({
      message: `Menghubungkan akun dengan ${provider === 'google' ? 'Google' : 'Apple'}...`,
      type: 'info',
    });
    setTimeout(() => {
      setToast({
        message: `Pendaftaran ${provider === 'google' ? 'Google' : 'Apple'} berhasil! Mengalihkan ke Beranda...`,
        type: 'success',
      });
      setTimeout(() => router.push('/home'), 1200);
    }, 1200);
  };

  return (
    <MobileShell>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <AuthGateway
        onLoginClick={() => router.push('/login')}
        onRegisterClick={() => router.push('/register')}
        onGoogleClick={() => handleSocial('google')}
        onAppleClick={() => handleSocial('apple')}
      />
    </MobileShell>
  );
}
