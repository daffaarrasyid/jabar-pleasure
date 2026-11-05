'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLoginForm from '@/components/admin/AdminLoginForm';
import { isAdminAuthenticated } from '@/lib/auth';

export default function AdminLoginPage() {
  const router = useRouter();

  useEffect(() => {
    // If already logged in as admin, redirect to admin dashboard
    if (isAdminAuthenticated()) {
      router.replace('/admin');
    }
  }, [router]);

  return (
    <main className="w-full min-h-screen">
      <AdminLoginForm onLoginSuccess={() => router.push('/admin')} />
    </main>
  );
}

