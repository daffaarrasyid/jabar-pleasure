/**
 * feedbackStorage.ts
 * Shared feedback & user reviews persistence for JabarPleasure WebGIS
 * Allows client touchpoints (Home, Trip History, Profile) and Admin to stay synced.
 */

export type FeedbackCategory = 'bug' | 'feature' | 'question' | 'other';
export type FeedbackStatus = 'unread' | 'in_progress' | 'resolved';

export interface UserFeedback {
  id: number;
  submitterName: string;
  submitterEmail: string;
  category: FeedbackCategory;
  date: string;
  message: string;
  attachmentName?: string;
  attachmentUrl?: string;
  status: FeedbackStatus;
  adminReply?: string;
  repliedAt?: string;
  rating?: number; // 1-5 optional for reviews
  tripTitle?: string; // optional trip context
}

export const INITIAL_FEEDBACK: UserFeedback[] = [];

const DUMMY_SUBMITTERS = new Set([
  '@julyandre',
  '@daffa_dev',
  '@rifaldi_pm',
  '@bintang_gis',
  '@citra_lestari',
  '@eko_prasetyo',
  '@maya_safitri',
  '@hendra_wicaksono',
  '@rani_kurnia',
  '@fajar_sidik',
]);

const FEEDBACK_STORAGE_KEY = 'jp_user_feedback_list';

export function getStoredFeedback(): UserFeedback[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const realItems = parsed.filter(
        (item) => item && !DUMMY_SUBMITTERS.has(item.submitterName) && item.id > 100
      );
      if (realItems.length !== parsed.length) {
        if (realItems.length === 0) {
          localStorage.removeItem(FEEDBACK_STORAGE_KEY);
        } else {
          localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(realItems));
        }
      }
      return realItems;
    }
  } catch {
    // fallback
  }
  return [];
}

export function saveFeedback(
  newFeedback: Omit<UserFeedback, 'id' | 'date' | 'status'> & {
    id?: number;
    date?: string;
    status?: FeedbackStatus;
  }
): UserFeedback {
  const currentList = getStoredFeedback();
  
  // Format current date: e.g. "16/10/2026, 08:30 WIB"
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const mins = String(now.getMinutes()).padStart(2, '0');
  const formattedDate = newFeedback.date || `${day}/${month}/${year}, ${hours}:${mins} WIB`;

  const newId = currentList.length > 0 ? Math.max(...currentList.map((f) => f.id)) + 1 : 1;

  const createdItem: UserFeedback = {
    id: newFeedback.id || newId,
    submitterName: newFeedback.submitterName,
    submitterEmail: newFeedback.submitterEmail,
    category: newFeedback.category,
    date: formattedDate,
    message: newFeedback.message,
    attachmentName: newFeedback.attachmentName,
    attachmentUrl: newFeedback.attachmentUrl,
    status: newFeedback.status || 'unread',
    adminReply: newFeedback.adminReply,
    repliedAt: newFeedback.repliedAt,
    rating: newFeedback.rating,
    tripTitle: newFeedback.tripTitle,
  };

  const updatedList = [createdItem, ...currentList];

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(updatedList));
      window.dispatchEvent(new Event('jabarpleasure_feedback_updated'));
    } catch {
      // ignore
    }
  }

  return createdItem;
}

export function updateFeedback(id: number, updates: Partial<UserFeedback>): void {
  const currentList = getStoredFeedback();
  const updatedList = currentList.map((item) => {
    if (item.id === id) {
      return { ...item, ...updates };
    }
    return item;
  });

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(updatedList));
      window.dispatchEvent(new Event('jabarpleasure_feedback_updated'));
    } catch {
      // ignore
    }
  }
}

export function deleteFeedback(id: number): void {
  const currentList = getStoredFeedback();
  const updatedList = currentList.filter((item) => item.id !== id);

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(updatedList));
      window.dispatchEvent(new Event('jabarpleasure_feedback_updated'));
    } catch {
      // ignore
    }
  }
}
