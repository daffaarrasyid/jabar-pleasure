/**
 * User Reference Location Persistence and Geolocation Helper
 */

export interface StoredLocation {
  name: string;
  lat: number;
  lng: number;
  mode: 'gps' | 'manual';
  regency?: string;
}

export const DEFAULT_LOCATION: StoredLocation = {
  name: 'Kota Bandung',
  lat: -6.9175,
  lng: 107.6191,
  mode: 'manual',
  regency: 'Kota Bandung',
};

const STORAGE_KEY = 'jp_reference_location';

export function getStoredUserLocation(): StoredLocation {
  if (typeof window === 'undefined') return DEFAULT_LOCATION;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_LOCATION;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.lat === 'number' &&
      typeof parsed.lng === 'number' &&
      typeof parsed.name === 'string'
    ) {
      return {
        name: parsed.name,
        lat: parsed.lat,
        lng: parsed.lng,
        mode: parsed.mode === 'gps' ? 'gps' : 'manual',
        regency: parsed.regency || parsed.name,
      };
    }
  } catch {
    // ignore
  }
  return DEFAULT_LOCATION;
}

export function setStoredUserLocation(location: StoredLocation): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
    // Clear old cached feed so that new location content loads freshly
    sessionStorage.removeItem('jp_cached_featured');
    sessionStorage.removeItem('jp_cached_nearby');
  } catch {
    // ignore
  }
}

/**
 * Robust two-tier geolocation acquisition.
 * 1. Tries high accuracy first (for mobile GPS devices).
 * 2. If it times out or is unavailable (common on desktop/laptops),
 *    automatically retries with coarse accuracy (IP/Wi-Fi positioning).
 */
export function acquireDeviceCoordinates(options?: {
  timeoutMs?: number;
}): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      return reject(new Error('Browser tidak mendukung geolokasi.'));
    }

    const highTimeout = options?.timeoutMs ?? 6000;

    // Step 1: High accuracy attempt
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (firstError) => {
        // Step 2: Fallback to coarse accuracy if high accuracy timed out or failed
        if (
          firstError.code === firstError.TIMEOUT ||
          firstError.code === firstError.POSITION_UNAVAILABLE
        ) {
          navigator.geolocation.getCurrentPosition(
            (secondPos) => {
              resolve({
                lat: secondPos.coords.latitude,
                lng: secondPos.coords.longitude,
              });
            },
            (secondError) => {
              reject(secondError);
            },
            {
              enableHighAccuracy: false,
              timeout: 15000,
              maximumAge: 300000,
            }
          );
        } else {
          // Permission denied or other fatal error
          reject(firstError);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: highTimeout,
        maximumAge: 60000,
      }
    );
  });
}

