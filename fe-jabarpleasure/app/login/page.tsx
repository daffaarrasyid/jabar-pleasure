'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import AdminLoginForm from '@/components/admin/AdminLoginForm';

export default function LoginPage() {
  const router = useRouter();

  return (
    <main className="w-full min-h-screen">
      <AdminLoginForm onLoginSuccess={() => router.push('/admin')} />
    </main>
  );
}
