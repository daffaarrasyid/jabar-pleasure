/**
 * Authentication and Token Management Utility
 */

export function setAuthToken(token: string, user?: unknown): void {
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

export function getStoredUser<T = Record<string, unknown>>(): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('user');
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function getUserTripHistoryKey(): string {
  if (typeof window === 'undefined') return 'jabarpleasure_trip_history_guest';
  try {
    const raw = localStorage.getItem('user');
    if (raw) {
      const user = JSON.parse(raw);
      if (user?.id) return `jabarpleasure_trip_history_u${user.id}`;
      if (user?.email) return `jabarpleasure_trip_history_u${encodeURIComponent(user.email)}`;
    }
  } catch {
    // ignore
  }
  return 'jabarpleasure_trip_history_guest';
}

export function getUserActiveTripKey(): string {
  if (typeof window === 'undefined') return 'jabarpleasure_active_trip_guest';
  try {
    const raw = localStorage.getItem('user');
    if (raw) {
      const user = JSON.parse(raw);
      if (user?.id) return `jabarpleasure_active_trip_u${user.id}`;
      if (user?.email) return `jabarpleasure_active_trip_u${encodeURIComponent(user.email)}`;
    }
  } catch {
    // ignore
  }
  return 'jabarpleasure_active_trip_guest';
}

export function removeAuthToken(): void {
  if (typeof window === 'undefined') return;
  try {
    // Purge user-specific active trip if any
    const activeKey = getUserActiveTripKey();
    if (activeKey) localStorage.removeItem(activeKey);

    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('user');

    // Purge legacy un-scoped shared keys to prevent cross-account leak
    localStorage.removeItem('jabarpleasure_trip_history');
    localStorage.removeItem('jabarpleasure_active_trip');
    localStorage.removeItem('jabarpleasure_wishlist_ids');
    sessionStorage.removeItem('jp_cached_wishlists');

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

/**
 * Admin Session Utilities
 */
export function setAdminSession(token: string, user?: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('admin_token', token);
    if (user) {
      localStorage.setItem('admin_user', JSON.stringify(user));
    }
    document.cookie = `admin_token=${encodeURIComponent(token)}; path=/; max-age=2592000; SameSite=Lax`;
  } catch (err) {
    console.warn('Failed to set admin session:', err);
  }
}

export function getAdminSession(): { token: string; user: Record<string, unknown> } | null {
  if (typeof window === 'undefined') return null;
  try {
    const local = localStorage.getItem('admin_token');
    const token =
      local ||
      (document.cookie.match(/(^|;)\s*admin_token\s*=\s*([^;]+)/)?.[2]
        ? decodeURIComponent(document.cookie.match(/(^|;)\s*admin_token\s*=\s*([^;]+)/)![2])
        : null);

    if (!token) return null;

    const userRaw = localStorage.getItem('admin_user');
    const user = userRaw
      ? JSON.parse(userRaw)
      : { name: 'admin123', email: 'admin123@jabarpleasure.id', role: 'admin' };

    return { token, user };
  } catch {
    return null;
  }
}

export function removeAdminSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_user');

    const pastDate = 'Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = `admin_token=; path=/; expires=${pastDate}; max-age=0; SameSite=Lax`;
    document.cookie = `admin_token=; path=/; expires=${pastDate}; max-age=0`;
    document.cookie = `admin_token=; expires=${pastDate}; max-age=0`;
  } catch (err) {
    console.warn('Failed to remove admin session:', err);
  }
}

export function isAdminAuthenticated(): boolean {
  return !!getAdminSession();
}
