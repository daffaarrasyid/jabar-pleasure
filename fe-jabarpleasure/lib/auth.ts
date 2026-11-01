/**
 * Authentication and Token Management Utility
 */

export function setAuthToken(token: string, user?: any): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('auth_token', token);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
    // Set cookie with 30 days max-age
    document.cookie = `auth_token=${encodeURIComponent(token)}; path=/; max-age=2592000; SameSite=Lax`;
  } catch (err) {
    console.warn('Failed to set auth token:', err);
  }
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const local = localStorage.getItem('auth_token');
    if (local) return local;

    const match = document.cookie.match(/(^|;)\s*auth_token\s*=\s*([^;]+)/);
    return match ? decodeURIComponent(match[2]) : null;
  } catch {
    return null;
  }
}

export function removeAuthToken(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('user');

    // Thoroughly delete the auth_token cookie across potential path and domain variations
    const pastDate = 'Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = `auth_token=; path=/; expires=${pastDate}; max-age=0; SameSite=Lax`;
    document.cookie = `auth_token=; path=/; expires=${pastDate}; max-age=0`;
    document.cookie = `auth_token=; expires=${pastDate}; max-age=0`;
  } catch (err) {
    console.warn('Failed to remove auth token:', err);
  }
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

