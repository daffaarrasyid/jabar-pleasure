'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MobileShell from '@/components/layout/MobileShell';
import ProfileScreen, { UserProfileData } from '@/components/profile/ProfileScreen';
import Toast from '@/components/ui/Toast';
import { getAuthToken, removeAuthToken } from '@/lib/auth';

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
    let isMounted = true;

    const fetchUserProfile = async () => {
      const token = getAuthToken();

      // If no token, check if user session exists or redirect
      if (!token) {
        if (typeof window !== 'undefined') {
          const cachedUser = localStorage.getItem('user');
          if (cachedUser) {
            try {
              const parsed = JSON.parse(cachedUser);
              if (isMounted) setUser(parsed);
            } catch (e) {
              console.warn('Failed to parse cached user:', e);
            }
          } else {
            showToast('Silakan masuk terlebih dahulu untuk melihat profil Anda.', 'info');
            setTimeout(() => {
              if (isMounted) router.push('/login');
            }, 800);
          }
        }
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          removeAuthToken();
          if (isMounted) {
            showToast('Sesi Anda telah berakhir. Silakan masuk kembali.', 'error');
            setTimeout(() => {
              router.push('/login');
            }, 1200);
          }
          return;
        }

        const result = await response.json();
        if (result.status === 'success' && result.data && isMounted) {
          setUser(result.data);
          try {
            localStorage.setItem('user', JSON.stringify(result.data));
          } catch (storageErr) {
            console.warn('LocalStorage error:', storageErr);
          }
        }
      } catch (err) {
        console.error('Error fetching profile from backend:', err);
        // Fallback to local storage user
        if (typeof window !== 'undefined') {
          const cachedUser = localStorage.getItem('user');
          if (cachedUser && isMounted) {
            try {
              setUser(JSON.parse(cachedUser));
            } catch (e) {
              console.warn(e);
            }
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchUserProfile();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleLogout = async () => {
    const token = getAuthToken();

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

    // Completely purge client cookie and storage
    removeAuthToken();

    showToast('Anda telah keluar dari akun.', 'info');
    setTimeout(() => {
      router.push('/login');
    }, 600);
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
        isLoading={isLoading}
        wishlistCount={user?.statistics?.wishlist_count ?? 0}
        onNavigateToHome={() => router.push('/home')}
        onNavigateToMap={() => router.push('/map')}
        onNavigateToWishlist={() => router.push('/wishlist')}
        onNavigateToRencana={() => router.push('/rencana')}
        onNavigateToRiwayat={() => router.push('/riwayat')}
        onWishlistClick={() => router.push('/wishlist')}
        onEditProfile={() => showToast('Fitur edit profil sedang disiapkan', 'info')}
        onItemClick={(title) => showToast(`Membuka menu ${title}`, 'info')}
        onLogout={handleLogout}
      />
    </MobileShell>
  );
}
