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

  const handleSuccess = () => {
    setStep('success');
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
        <InterestSelection
          onContinue={() => {
            router.push('/home');
          }}
        />
      )}
    </MobileShell>
  );
}
