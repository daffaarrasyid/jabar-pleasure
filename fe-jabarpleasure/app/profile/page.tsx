'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MobileShell from '@/components/layout/MobileShell';
import ProfileScreen, { UserProfileData } from '@/components/profile/ProfileScreen';
import Toast from '@/components/ui/Toast';
import { removeAuthToken } from '@/lib/auth';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'info' | 'error';
  } | null>(null);

  const showToast = (
    message: string,
    type: 'success' | 'info' | 'error' = 'info'
  ) => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

        // If no token, check if user data was cached in localStorage
        if (!token) {
          const cachedUser = localStorage.getItem('user');
          if (cachedUser) {
            try {
              const parsed = JSON.parse(cachedUser);
              setUser(parsed);
            } catch (e) {
              console.warn('Failed to parse cached user:', e);
            }
          }
          setIsLoading(false);
          return;
        }

        const response = await fetch('/api/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('auth_token');
          showToast('Sesi Anda telah berakhir. Silakan masuk kembali.', 'error');
          setTimeout(() => {
            router.push('/login');
          }, 1500);
          return;
        }

        const result = await response.json();
        if (result.status === 'success' && result.data) {
          setUser(result.data);
          // Keep localStorage updated with fresh data
          localStorage.setItem('user', JSON.stringify(result.data));
        }
      } catch (err) {
        console.error('Error fetching profile from backend:', err);
        // Fallback to local storage user
        const cachedUser = localStorage.getItem('user');
        if (cachedUser) {
          try {
            setUser(JSON.parse(cachedUser));
          } catch (e) {
            console.warn(e);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  const handleLogout = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

    if (token) {
      try {
        await fetch('/api/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (err) {
        console.warn('Logout API error:', err);
      }
    }

    // Clear client storage and cookie
    removeAuthToken();

    showToast('Anda telah keluar dari akun.', 'info');
    setTimeout(() => {
      router.push('/login');
    }, 800);
  };

  return (
    <MobileShell activeScreen="profile">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <ProfileScreen
        user={user}
        wishlistCount={user?.statistics?.wishlist_count ?? 4}
        onNavigateToHome={() => router.push('/home')}
        onNavigateToMap={() => router.push('/map')}
        onNavigateToWishlist={() => showToast('Membuka halaman Wishlist', 'info')}
        onNavigateToRencana={() => router.push('/home')}
        onNavigateToRiwayat={() => router.push('/home')}
        onNotificationClick={() => showToast('Anda memiliki 2 notifikasi belum dibaca', 'info')}
        onWishlistClick={() => showToast('Membuka halaman Wishlist', 'info')}
        onEditProfile={() => showToast('Fitur edit profil sedang disiapkan', 'info')}
        onItemClick={(title) => showToast(`Membuka menu ${title}`, 'info')}
        onLogout={handleLogout}
      />
    </MobileShell>
  );
}

