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
  check_ins_count?: number | null;
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
  radius?: number;
  sort_by?: 'visitors' | 'popular' | 'distance' | 'default';
} = {}): Promise<ApiResponse<ApiDestination[]>> {
  const query = new URLSearchParams();
  if (params.page !== undefined) query.set('page', params.page.toString());
  if (params.per_page !== undefined) query.set('per_page', params.per_page.toString());
  if (params.category && params.category !== 'Semua') query.set('category', params.category);
  if (params.regency) query.set('regency', params.regency);
  if (params.search) query.set('search', params.search);
  if (params.lat !== undefined) query.set('lat', params.lat.toString());
  if (params.lng !== undefined) query.set('lng', params.lng.toString());
  if (params.radius !== undefined) query.set('radius', params.radius.toString());
  if (params.sort_by) query.set('sort_by', params.sort_by);

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
    sort_by?: 'visitors' | 'popular' | 'distance';
  } = {}
): Promise<ApiDestination[]> {
  const params = new URLSearchParams();
  if (query.trim()) params.set('q', query.trim());
  if (options.category && options.category !== 'Semua') params.set('category', options.category);
  if (options.lat !== undefined) params.set('lat', options.lat.toString());
  if (options.lng !== undefined) params.set('lng', options.lng.toString());
  if (options.limit !== undefined) params.set('limit', options.limit.toString());
  if (options.sort_by) params.set('sort_by', options.sort_by);

  const res = await fetchApi<ApiDestination[]>(`/destinations/search?${params.toString()}`);
  return res.data || [];
}

export interface ApiItineraryItem {
  id: number;
  itinerary_id: number;
  destination_id: number;
  visit_order: number;
  estimated_time_arrival?: string | null;
  destination?: ApiDestination;
}

export interface ApiItinerary {
  id: number;
  user_id: number;
  title: string;
  start_date: string;
  end_date: string;
  departure_lat?: number | null;
  departure_lng?: number | null;
  route_geojson?: any;
  status: string;
  created_at: string;
  updated_at?: string;
  items?: ApiItineraryItem[];
}

export interface CreateItineraryPayload {
  title: string;
  start_date?: string;
  end_date?: string;
  departure_lat?: number;
  departure_lng?: number;
  departure_name?: string;
  route_geojson?: any;
  status?: string;
  destinations: (number | { id: number; estimated_time_arrival?: string })[];
}

/**
 * Fetch list of user's saved itineraries
 */
export async function getItineraries(status?: string): Promise<ApiItinerary[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  try {
    const res = await fetchApi<ApiItinerary[]>(`/itineraries${query}`);
    return res.data || [];
  } catch {
    // Fallback to public route if unauthenticated
    try {
      const res = await fetchApi<ApiItinerary[]>(`/itineraries-public${query}`);
      return res.data || [];
    } catch {
      return [];
    }
  }
}

/**
 * Fetch a single itinerary by ID
 */
export async function getItinerary(id: number): Promise<ApiItinerary | null> {
  const res = await fetchApi<ApiItinerary>(`/itineraries/${id}`);
  return res.data || null;
}

/**
 * Save / Create a new itinerary in database
 */
export async function createItinerary(payload: CreateItineraryPayload): Promise<ApiItinerary> {
  try {
    const res = await fetchApi<ApiItinerary>('/itineraries', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  } catch (err: any) {
    // Try public fallback route if auth failed
    const res = await fetchApi<ApiItinerary>('/itineraries-public', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  }
}

/**
 * Delete an itinerary by ID
 */
export async function deleteItinerary(id: number): Promise<boolean> {
  const res = await fetchApi(`/itineraries/${id}`, {
    method: 'DELETE',
  });
  return res.status === 'success';
}

/**
 * Mark an itinerary as completed (moves from Rencana to Riwayat)
 */
export async function completeItinerary(id: number | string): Promise<ApiItinerary | null> {
  try {
    const res = await fetchApi<ApiItinerary>(`/itineraries/${id}/complete`, {
      method: 'POST',
    });
    return res.data;
  } catch {
    try {
      const res = await fetchApi<ApiItinerary>(`/itineraries-public/${id}/complete`, {
        method: 'POST',
      });
      return res.data;
    } catch {
      return null;
    }
  }
}

export interface ApiJournalUploadResponse {
  id: number;
  check_in_id: number;
  file_path: string;
  public_url: string;
  media_type: 'photo' | 'video';
  file_size_kb: number;
  caption?: string;
  destination_id?: number | string;
  itinerary_id?: number | string;
  created_at: string;
}

/**
 * Upload compressed media (WebP/WebM) to Supabase Storage via backend
 */
export async function uploadJournalMedia(formData: FormData): Promise<ApiJournalUploadResponse | null> {
  try {
    const res = await fetchApi<ApiJournalUploadResponse>('/journal/upload', {
      method: 'POST',
      body: formData,
    });
    return res.data;
  } catch (err) {
    console.error('Failed to upload journal media:', err);
    return null;
  }
}

/**
 * Get media items attached to an itinerary
 */
export async function getItineraryJournal(itineraryId: number | string): Promise<any[]> {
  try {
    const res = await fetchApi<any[]>(`/itineraries/${itineraryId}/journal`);
    return res.data || [];
  } catch {
    try {
      const res = await fetchApi<any[]>(`/itineraries-public/${itineraryId}/journal`);
      return res.data || [];
    } catch {
      return [];
    }
  }
}

/*
|--------------------------------------------------------------------------
| Wishlist API Endpoints
|--------------------------------------------------------------------------
*/

export interface ApiWishlist {
  id: number;
  user_id: number;
  destination_id: number;
  created_at?: string;
  destination?: ApiDestination;
}

/**
 * Fetch all wishlists of current user
 */
export async function getWishlists(): Promise<ApiWishlist[]> {
  try {
    const res = await fetchApi<ApiWishlist[]>('/wishlists');
    return res.data || [];
  } catch {
    try {
      const res = await fetchApi<ApiWishlist[]>('/wishlists-public');
      return res.data || [];
    } catch {
      return [];
    }
  }
}

/**
 * Toggle add / remove a destination in user's wishlist
 */
export async function toggleWishlist(
  destinationId: number | string
): Promise<{ is_wishlisted: boolean; destination_id: number; message?: string }> {
  const id = typeof destinationId === 'string' ? parseInt(destinationId, 10) : destinationId;
  try {
    const res = await fetchApi<{ is_wishlisted: boolean; destination_id: number; message?: string }>(
      '/wishlists/toggle',
      {
        method: 'POST',
        body: JSON.stringify({ destination_id: id }),
      }
    );
    return res.data;
  } catch {
    const res = await fetchApi<{ is_wishlisted: boolean; destination_id: number; message?: string }>(
      '/wishlists-public/toggle',
      {
        method: 'POST',
        body: JSON.stringify({ destination_id: id }),
      }
    );
    return res.data;
  }
}

/**
 * Remove a destination from wishlist
 */
export async function deleteWishlist(
  destinationId: number | string
): Promise<boolean> {
  const id = typeof destinationId === 'string' ? parseInt(destinationId, 10) : destinationId;
  try {
    const res = await fetchApi(`/wishlists/${id}`, {
      method: 'DELETE',
    });
    return res.status === 'success';
  } catch {
    const res = await fetchApi(`/wishlists-public/${id}`, {
      method: 'DELETE',
    });
    return res.status === 'success';
  }
}

/**
 * App In-App Notification Interfaces & Methods
 */
export interface AppNotification {
  id: number;
  user_id: number;
  type: 'submission_approved' | 'submission_rejected' | 'new_destination';
  title: string;
  message: string;
  data: {
    submission_id?: number;
    destination_id?: number;
    destination_name?: string;
    slug?: string;
    name?: string;
    status?: string;
    admin_note?: string | null;
    cover_image?: string | null;
    category?: string | null;
    regency?: string | null;
  } | null;
  read_at: string | null;
  created_at: string;
}

/**
 * Fetch notifications list for current user
 */
export async function getNotifications(unreadOnly = false): Promise<{
  notifications: AppNotification[];
  unreadCount: number;
}> {
  const qs = unreadOnly ? '?unread_only=1' : '';
  try {
    const res = await fetchApi<AppNotification[]>(`/notifications${qs}`);
    return {
      notifications: res.data || [],
      unreadCount: (res as any).unread_count || 0,
    };
  } catch {
    try {
      const res = await fetchApi<AppNotification[]>(`/notifications-public${qs}`);
      return {
        notifications: res.data || [],
        unreadCount: (res as any).unread_count || 0,
      };
    } catch {
      return {
        notifications: [],
        unreadCount: 0,
      };
    }
  }
}

/**
 * Fetch unread notification count for badge
 */
export async function getUnreadNotificationCount(): Promise<number> {
  try {
    const res = await fetchApi<{ unread_count: number }>('/notifications/unread-count');
    return res.data?.unread_count ?? (res as any).unread_count ?? 0;
  } catch {
    try {
      const res = await fetchApi<{ unread_count: number }>('/notifications-public/unread-count');
      return res.data?.unread_count ?? (res as any).unread_count ?? 0;
    } catch {
      return 0;
    }
  }
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(id: number | string): Promise<{ unreadCount: number }> {
  try {
    const res = await fetchApi(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
    return { unreadCount: (res as any).unread_count ?? 0 };
  } catch {
    const res = await fetchApi(`/notifications-public/${id}/read`, {
      method: 'PATCH',
    });
    return { unreadCount: (res as any).unread_count ?? 0 };
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<boolean> {
  try {
    const res = await fetchApi('/notifications/read-all', {
      method: 'POST',
    });
    return res.status === 'success';
  } catch {
    const res = await fetchApi('/notifications-public/read-all', {
      method: 'POST',
    });
    return res.status === 'success';
  }
}

/**
 * Submit a POI destination suggestion (User action)
 */
export async function submitPoiDestination(payload: {
  name: string;
  category_name?: string;
  category_id?: number;
  latitude: number;
  longitude: number;
  description?: string;
  price_range?: string;
  opening_hours?: string;
  evidence_image?: string;
}): Promise<any> {
  try {
    const res = await fetchApi('/submissions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  } catch {
    const res = await fetchApi('/submissions-public', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  }
}

/**
 * Get POI submissions for admin inspection
 */
export async function getAdminSubmissions(status?: string): Promise<any[]> {
  const qs = status ? `?status=${status}` : '';
  try {
    const res = await fetchApi<any[]>(`/admin/submissions${qs}`);
    return res.data || [];
  } catch {
    try {
      const res = await fetchApi<any[]>(`/admin/submissions-public${qs}`);
      return res.data || [];
    } catch {
      return [];
    }
  }
}

/**
 * Approve submission (Admin action - triggers confirmation & broadcast notifications)
 */
export async function approveSubmission(id: number | string, adminNote?: string): Promise<any> {
  try {
    const res = await fetchApi(`/admin/submissions/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ admin_note: adminNote }),
    });
    return res.data;
  } catch {
    const res = await fetchApi(`/admin/submissions-public/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ admin_note: adminNote }),
    });
    return res.data;
  }
}

/**
 * Reject submission (Admin action - triggers confirmation notification to submitter)
 */
export async function rejectSubmission(id: number | string, adminNote?: string): Promise<any> {
  try {
    const res = await fetchApi(`/admin/submissions/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ admin_note: adminNote }),
    });
    return res.data;
  } catch {
    const res = await fetchApi(`/admin/submissions-public/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ admin_note: adminNote }),
    });
    return res.data;
  }
}

