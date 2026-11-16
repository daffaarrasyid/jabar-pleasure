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

export const INITIAL_FEEDBACK: UserFeedback[] = [
  {
    id: 1,
    submitterName: '@julyandre',
    submitterEmail: 'julyandre@example.com',
    category: 'bug',
    date: '12/10/2026, 14:30 WIB',
    message:
      'Peta tidak merender marker saat koneksi lambat di Lembang. Mohon diperbaiki optimasi loading tile layer Leaflet.js nya agar peta tidak blank.',
    attachmentName: 'Tangkapan_Layar_Bug.jpg',
    status: 'unread',
    adminReply:
      'Terima kasih atas laporannya! Tim developer sedang mengoptimalkan kueri spasial dan caching tile peta agar lebih ringan di koneksi lambat.',
  },
  {
    id: 2,
    submitterName: '@daffa_dev',
    submitterEmail: 'daffa_dev@example.com',
    category: 'feature',
    date: '11/10/2026, 16:45 WIB',
    message:
      'Mohon tambahkan filter khusus jalur rute sepeda dan tracking elevasi kontur perbukitan Jawa Barat di menu Itinerary.',
    attachmentName: 'Usulan_Fitur_Sepeda.png',
    status: 'in_progress',
    adminReply:
      'Usulan menarik! Tim GIS sedang mengkaji integrasi layer kontur SRTM dan kurasi jalur rute gowes populer Bandung Raya.',
  },
  {
    id: 3,
    submitterName: '@rifaldi_pm',
    submitterEmail: 'rifaldi_pm@example.com',
    category: 'question',
    date: '10/10/2026, 10:15 WIB',
    message:
      'Bagaimana cara memperbarui data destinasi yang sudah di-approve oleh admin jika jam operasional tempatnya berubah?',
    status: 'resolved',
    adminReply:
      'Halo! Pengguna dapat mengajukan pembaruan informasi melalui tombol "Laporkan Perubahan Info" pada halaman detail destinasi publik.',
    repliedAt: '10/10/2026, 11:30 WIB',
  },
  {
    id: 4,
    submitterName: '@bintang_gis',
    submitterEmail: 'bintang_gis@example.com',
    category: 'bug',
    date: '09/10/2026, 08:20 WIB',
    message:
      'Bottom sheet detail destinasi di layar iPhone 13 mini terkadang tertutup oleh bilah navigasi bawah saat mode landscape.',
    attachmentName: 'Screen_Landscape_Issue.jpg',
    status: 'resolved',
    adminReply:
      'Masalah safe-area-inset-bottom telah diperbaiki pada pembaruan tata letak antarmuka mobile v2.4.',
    repliedAt: '09/10/2026, 09:15 WIB',
  },
  {
    id: 5,
    submitterName: '@citra_lestari',
    submitterEmail: 'citra.lestari@example.com',
    category: 'feature',
    date: '08/10/2026, 13:40 WIB',
    message:
      'Apakah bisa ditambahkan fitur export daftar rencana perjalanan ke format PDF ringkas atau kalender iCal agar mudah dibagikan ke teman grup wisata?',
    status: 'unread',
  },
  {
    id: 6,
    submitterName: '@eko_prasetyo',
    submitterEmail: 'eko.p@example.com',
    category: 'question',
    date: '07/10/2026, 17:05 WIB',
    message:
      'Apakah aplikasi JabarPleasure sudah mendukung unduh peta offline ketika kami sedang berkunjung ke area blank spot di Ciwidey bagian selatan?',
    status: 'unread',
  },
  {
    id: 7,
    submitterName: '@maya_safitri',
    submitterEmail: 'maya.s@example.com',
    category: 'bug',
    date: '06/10/2026, 11:12 WIB',
    message:
      'GPS geolocation di browser Chrome seluler meminta izin berulang kali setiap kali halaman peta utama di-refresh.',
    status: 'unread',
  },
  {
    id: 8,
    submitterName: '@hendra_wicaksono',
    submitterEmail: 'hendra.w@example.com',
    category: 'feature',
    date: '05/10/2026, 19:30 WIB',
    message:
      'Saran untuk menambahkan filter ramah disabilitas dan fasilitas kursi roda pada POI destinasi wisata ramah keluarga.',
    attachmentName: 'Saran_Fasilitas_Disabilitas.pdf',
    status: 'in_progress',
    adminReply:
      'Kategori fasilitas aksesibilitas ramah disabilitas sedang diinput ke atribut database POI untuk rilis berikutnya.',
  },
  {
    id: 9,
    submitterName: '@rani_kurnia',
    submitterEmail: 'rani.kurnia@example.com',
    category: 'other',
    date: '04/10/2026, 15:22 WIB',
    message:
      'Terima kasih banyak atas platform WebGIS ini! Sangat membantu keluarga kami saat liburan keliling Garut dan Tasikmalaya.',
    status: 'resolved',
    adminReply:
      'Terima kasih atas apresiasinya! Selamat menikmati keindahan wisata alam dan budaya Jawa Barat!',
    repliedAt: '04/10/2026, 16:00 WIB',
  },
  {
    id: 10,
    submitterName: '@fajar_sidik',
    submitterEmail: 'fajar.s@example.com',
    category: 'question',
    date: '03/10/2026, 09:10 WIB',
    message:
      'Apakah data koordinat lokasi wisata di JabarPleasure sudah terverifikasi dengan data resmi Dinas Pariwisata dan Kebudayaan Provinsi Jawa Barat?',
    status: 'unread',
  },
];

const FEEDBACK_STORAGE_KEY = 'jp_user_feedback_list';

export function getStoredFeedback(): UserFeedback[] {
  if (typeof window === 'undefined') return INITIAL_FEEDBACK;
  try {
    const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(INITIAL_FEEDBACK));
      return INITIAL_FEEDBACK;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // fallback
  }
  return INITIAL_FEEDBACK;
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
