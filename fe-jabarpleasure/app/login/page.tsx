'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';
import MobileShell from '@/components/layout/MobileShell';
import Toast from '@/components/ui/Toast';

export default function LoginPage() {
  const router = useRouter();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const handleSuccess = (user: { email: string }) => {
    setToast({
      message: `Berhasil masuk sebagai ${user.email}! Mengalihkan ke Beranda...`,
      type: 'success',
    });
    setTimeout(() => {
      router.push('/home');
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
      <LoginForm
        onBack={() => router.push('/auth')}
        onNavigateToRegister={() => router.push('/register')}
        onSuccess={handleSuccess}
      />
    </MobileShell>
  );
}
