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
    isVideo?: boolean;
  }[];
}

export interface TripItem {
  id: string;
  title: string;
  category?: string;
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

/**
 * Empty default history list. Real history data is loaded from the database
 * and persistent local storage when users complete actual trips.
 */
export const TRIP_HISTORY_DATA: TripItem[] = [];
