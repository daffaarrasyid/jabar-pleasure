'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import RegisterForm from '@/components/auth/RegisterForm';
import RegisterSuccess from '@/components/auth/RegisterSuccess';
import InterestSelection from '@/components/auth/InterestSelection';
import MobileShell from '@/components/layout/MobileShell';
import Toast from '@/components/ui/Toast';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'success' | 'interests'>('form');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [registeredUser, setRegisteredUser] = useState<{
    id?: number;
    name: string;
    email: string;
    token?: string;
  } | null>(null);

  const handleSuccess = (userData: { id?: number; name: string; email: string; token?: string }) => {
    setRegisteredUser(userData);
    setToast({
      message: `Pendaftaran berhasil! Akun ${userData.email} siap digunakan.`,
      type: 'success',
    });
    setStep('success');
  };

  const handleSaveInterests = async (selectedInterests: string[]) => {
    const token =
      registeredUser?.token ||
      (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null);

    let userId = registeredUser?.id;
    if (!userId && typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          userId = parsed?.id;
        } catch {
          // ignore JSON parse error
        }
      }
    }

    const payload = {
      user_id: userId,
      interests: selectedInterests.length > 0 ? selectedInterests : ['wisata-alam-terbuka'],
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch('/api/user/preferences', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Save preferences failed:', result);
      throw new Error(result.message || 'Gagal menyimpan preferensi minat.');
    }

    // Successfully saved preferences into database!
    router.push('/home');
  };

  return (
    <MobileShell activeScreen="register">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {step === 'form' && (
        <RegisterForm
          onBack={() => router.push('/auth')}
          onNavigateToLogin={() => router.push('/login')}
          onSuccess={handleSuccess}
        />
      )}
      {step === 'success' && (
        <RegisterSuccess onContinue={() => setStep('interests')} />
      )}
      {step === 'interests' && (
        <InterestSelection onContinue={handleSaveInterests} />
      )}
    </MobileShell>
  );
}
