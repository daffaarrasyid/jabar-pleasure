import { getAuthToken } from './auth';

/**
 * Standard API Client for JabarPleasure Backend
 */

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message?: string;
  data: T;
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ApiDestination {
  id: number;
  name: string;
  slug: string;
  osm_id: string | null;
  osm_type: string | null;
  description: string | null;
  address: string | null;
  postal_code: string | null;
  elevation: number | null;
  price_range: string | null;
  opening_hours: string | null;
  website: string | null;
  phone: string | null;
  wheelchair: string | null;
  wikidata_id: string | null;
  operator_name: string | null;
  cover_image: string | null;
  cover_image_url: string | null;
  latitude: number | null;
  longitude: number | null;
  distance_km?: number | null;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  regency?: {
    id: number;
    name: string;
  };
}

export interface ApiCategory {
  id: number;
  name: string;
  slug: string;
  icon_url: string | null;
}

export async function fetchApi<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  headers.set('Accept', 'application/json');
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = cleanEndpoint.startsWith('/api') ? cleanEndpoint : `/api${cleanEndpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({
    status: 'error',
    message: 'Gagal memproses respon dari server.',
    data: null,
  }));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

/**
 * Fetch featured destinations for Home screen ("Tempat Hiburan untuk Anda")
 */
export async function getFeaturedDestinations(params: {
  category?: string;
  lat?: number;
  lng?: number;
  limit?: number;
} = {}): Promise<ApiDestination[]> {
  const query = new URLSearchParams();
  if (params.category && params.category !== 'Semua') query.set('category', params.category);
  if (params.lat !== undefined) query.set('lat', params.lat.toString());
  if (params.lng !== undefined) query.set('lng', params.lng.toString());
  if (params.limit !== undefined) query.set('limit', params.limit.toString());

  const res = await fetchApi<ApiDestination[]>(`/destinations/featured?${query.toString()}`);
  return res.data || [];
}

/**
 * Fetch nearby destinations for Home screen ("Rekomendasi Terdekat")
 */
export async function getNearbyDestinations(params: {
  category?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  limit?: number;
} = {}): Promise<ApiDestination[]> {
  const query = new URLSearchParams();
  if (params.category && params.category !== 'Semua') query.set('category', params.category);
  if (params.lat !== undefined) query.set('lat', params.lat.toString());
  if (params.lng !== undefined) query.set('lng', params.lng.toString());
  if (params.radius !== undefined) query.set('radius', params.radius.toString());
  if (params.limit !== undefined) query.set('limit', params.limit.toString());

  const res = await fetchApi<ApiDestination[]>(`/destinations/nearby?${query.toString()}`);
  return res.data || [];
}

/**
 * Fetch paginated list of destinations (Top Destinations View / Explore)
 */
export async function getDestinations(params: {
  page?: number;
  per_page?: number;
  category?: string;
  regency?: string;
  search?: string;
  lat?: number;
  lng?: number;
} = {}): Promise<ApiResponse<ApiDestination[]>> {
  const query = new URLSearchParams();
  if (params.page !== undefined) query.set('page', params.page.toString());
  if (params.per_page !== undefined) query.set('per_page', params.per_page.toString());
  if (params.category && params.category !== 'Semua') query.set('category', params.category);
  if (params.regency) query.set('regency', params.regency);
  if (params.search) query.set('search', params.search);
  if (params.lat !== undefined) query.set('lat', params.lat.toString());
  if (params.lng !== undefined) query.set('lng', params.lng.toString());

  return await fetchApi<ApiDestination[]>(`/destinations?${query.toString()}`);
}

/**
 * Fetch categories list
 */
export async function getCategories(): Promise<ApiCategory[]> {
  const res = await fetchApi<ApiCategory[]>('/categories');
  return res.data || [];
}

/**
 * Search destinations by query keyword and optional category
 */
export async function searchDestinations(
  query: string,
  options: {
    category?: string;
    lat?: number;
    lng?: number;
    limit?: number;
  } = {}
): Promise<ApiDestination[]> {
  const params = new URLSearchParams();
  if (query.trim()) params.set('q', query.trim());
  if (options.category && options.category !== 'Semua') params.set('category', options.category);
  if (options.lat !== undefined) params.set('lat', options.lat.toString());
  if (options.lng !== undefined) params.set('lng', options.lng.toString());
  if (options.limit !== undefined) params.set('limit', options.limit.toString());

  const res = await fetchApi<ApiDestination[]>(`/destinations/search?${params.toString()}`);
  return res.data || [];
}

