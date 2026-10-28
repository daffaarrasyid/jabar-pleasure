export interface DestinationItem {
  id: string;
  name: string;
  time: string;
  status: string;
  photoCount: number;
  image: string;
  location: string;
  visitDate: string;
  visitTime: string;
  notes: string;
  photos: {
    url: string;
    caption: string;
    subCaption?: string;
  }[];
}

export interface TripItem {
  id: string;
  title: string;
  status: 'Selesai';
  duration: string;
  dateRange: string;
  location: string;
  completedDate: string;
  stats: {
    destinations: number;
    photos: number;
    video: number;
  };
  initials: string[];
  image: string;
  videoTitle?: string;
  videoSubtitle?: string;
  destinations: DestinationItem[];
}

export const TRIP_HISTORY_DATA: TripItem[] = [
  {
    id: 'bandung-trip',
    title: 'Bandung Trip',
    status: 'Selesai',
    duration: '3 hari 2 malam',
    dateRange: '10–12 Jan 2025',
    location: 'Bandung, Jawa Barat',
    completedDate: '12 Jan 2025',
    stats: {
      destinations: 5,
      photos: 12,
      video: 1,
    },
    initials: ['TP', 'FM', 'PS', 'DS', 'TH'],
    image: '/tangkuban-parahu.jpg',
    videoTitle: 'Tiga hari, banyak cerita',
    videoSubtitle: 'Video perjalanan Bandung Trip, bersama foto dan cerita yang sudah kamu masukkan.',
    destinations: [
      {
        id: 'tangkuban-perahu',
        name: 'Tangkuban Perahu',
        time: '10 Jan 2025 • 08.30',
        status: 'Sudah dikunjungi',
        photoCount: 3,
        image: '/tangkuban-parahu.jpg',
        location: 'Lembang, Jawa Barat',
        visitDate: '10 Januari 2025',
        visitTime: '08.30 – 10.30 WIB',
        notes:
          'Pagi yang sejuk di Kawah Ratu. Kabut tipis, pemandangan indah, dan foto bareng teman-teman. Salah satu momen favorit di Bandung!',
        photos: [
          {
            url: '/tangkuban-parahu.jpg',
            caption: 'Kawah Ratu',
            subCaption: 'Tangkuban Perahu',
          },
          {
            url: '/friends-crater.jpg',
            caption: 'Bersama teman',
            subCaption: 'Tangkuban Perahu',
          },
          {
            url: '/kawah-ratu.jpg',
            caption: 'Kabut pagi',
            subCaption: 'Tangkuban Perahu',
          },
        ],
      },
      {
        id: 'floating-market',
        name: 'Floating Market',
        time: '10 Jan 2025 • 13.00',
        status: 'Sudah dikunjungi',
        photoCount: 3,
        image: '/floating-market.jpg',
        location: 'Lembang, Jawa Barat',
        visitDate: '10 Januari 2025',
        visitTime: '13.00 – 15.30 WIB',
        notes:
          'Makan siang seru di atas perahu kuliner terapung dan santai menikmati angin sepoi-sepoi di tepi danau.',
        photos: [
          {
            url: '/floating-market.jpg',
            caption: 'Di tepi danau',
            subCaption: 'Floating Market',
          },
          {
            url: '/floating-market.jpg',
            caption: 'Jajan sore',
            subCaption: 'Floating Market',
          },
          {
            url: '/floating-market.jpg',
            caption: 'Naik perahu',
            subCaption: 'Floating Market',
          },
        ],
      },
      {
        id: 'puncak-sari',
        name: 'Puncak Sari',
        time: '11 Jan 2025 • 09.00',
        status: 'Sudah dikunjungi',
        photoCount: 2,
        image: '/puncak-sari.jpg',
        location: 'Bandung Barat',
        visitDate: '11 Januari 2025',
        visitTime: '09.00 – 11.30 WIB',
        notes:
          'Menikmati keindahan perbukitan teh dengan udara pagi yang menyegarkan pikiran.',
        photos: [
          {
            url: '/puncak-sari.jpg',
            caption: 'Hijau sejauh mata',
            subCaption: 'Puncak Sari',
          },
          {
            url: '/puncak-sari.jpg',
            caption: 'Momen di puncak',
            subCaption: 'Puncak Sari',
          },
        ],
      },
      {
        id: 'dusun-bambu',
        name: 'Dusun Bambu',
        time: '11 Jan 2025 • 14.00',
        status: 'Sudah dikunjungi',
        photoCount: 2,
        image: '/dusun-bambu.jpg',
        location: 'Lembang, Jawa Barat',
        visitDate: '11 Januari 2025',
        visitTime: '14.00 – 17.00 WIB',
        notes:
          'Berjalan santai di atas jembatan kayu dan menikmati pemandangan danau serta saung tradisional.',
        photos: [
          {
            url: '/dusun-bambu.jpg',
            caption: 'Pondok di danau',
            subCaption: 'Dusun Bambu',
          },
          {
            url: '/dusun-bambu.jpg',
            caption: 'Jalan santai',
            subCaption: 'Dusun Bambu',
          },
        ],
      },
      {
        id: 'taman-hutan-raya',
        name: 'Taman Hutan Raya',
        time: '12 Jan 2025 • 08.00',
        status: 'Sudah dikunjungi',
        photoCount: 2,
        image: '/tahura-juanda.jpg',
        location: 'Dago Pakar, Bandung',
        visitDate: '12 Januari 2025',
        visitTime: '08.00 – 11.00 WIB',
        notes:
          'Trekking hutan pinus yang asri sebagai penutup liburan yang sempurna di Bandung.',
        photos: [
          {
            url: '/tahura-juanda.jpg',
            caption: 'Jelajah hutan',
            subCaption: 'Taman Hutan Raya',
          },
          {
            url: '/tahura-juanda.jpg',
            caption: 'Langkah terakhir',
            subCaption: 'Taman Hutan Raya',
          },
        ],
      },
    ],
  },
  {
    id: 'lembang-weekend',
    title: 'Lembang Weekend',
    status: 'Selesai',
    duration: '2 hari 1 malam',
    dateRange: '27–28 Des 2024',
    location: 'Lembang, Jawa Barat',
    completedDate: '28 Des 2024',
    stats: {
      destinations: 4,
      photos: 8,
      video: 1,
    },
    initials: ['FL', 'GP', 'TP', 'DS'],
    image: '/gedung-sate.jpg',
    videoTitle: 'Akhir pekan di Lembang',
    videoSubtitle: 'Kompilasi momen seru liburan akhir tahun di Lembang.',
    destinations: [],
  },
  {
    id: 'subang-roadtrip',
    title: 'Subang Roadtrip',
    status: 'Selesai',
    duration: '1 hari',
    dateRange: '15 Des 2024',
    location: 'Subang, Jawa Barat',
    completedDate: '15 Des 2024',
    stats: {
      destinations: 3,
      photos: 6,
      video: 1,
    },
    initials: ['SB', 'CR', 'SP'],
    image: '/gunung-malabar.jpg',
    videoTitle: 'One Day in Subang',
    videoSubtitle: 'Jelajah air terjun dan kebun teh Subang.',
    destinations: [],
  },
];
