'use client';

import React, { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  MapPin,
  X,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Map as MapIcon,
  Loader2,
  RotateCcw,
  Check,
} from 'lucide-react';
import {
  getAdminDestinations,
  createAdminDestination,
  updateAdminDestination,
  deleteAdminDestination,
} from '@/lib/api';

const CATEGORY_ID_MAP: Record<string, number> = {
  'Wisata Alam & Terbuka': 1,
  'Modern & Lifestyle': 2,
  'Publik & Edukasi': 3,
  'Rekreasi Keluarga': 4,
};

// Dynamic import for interactive Leaflet Map Picker to prevent SSR mismatches and minimize initial load latency
const AdminPoiMapPicker = dynamic(
  () => import('./AdminPoiMapPicker'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-64 sm:h-72 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center">
        <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
          <Loader2 className="w-4 h-4 animate-spin text-[#4941EC]" />
          <span>Memuat peta interaktif...</span>
        </div>
      </div>
    ),
  }
);

export interface AdminPoiItem {
  id: number;
  name: string;
  category: string;
  regency: string;
  latitude: number;
  longitude: number;
  address: string;
  status: 'published' | 'pending' | 'draft';
  coverImageUrl?: string;
}

export const WEST_JAVA_REGIONS = [
  'Kota Bandung',
  'Kab. Bandung Barat',
  'Kab. Bandung',
  'Kota Bogor',
  'Kab. Bogor',
  'Kota Cimahi',
  'Kota Depok',
  'Kota Bekasi',
  'Kab. Bekasi',
  'Kab. Garut',
  'Kab. Pangandaran',
  'Kab. Ciamis',
  'Kota Banjar',
  'Kota Tasikmalaya',
  'Kab. Tasikmalaya',
  'Kab. Kuningan',
  'Kab. Cirebon',
  'Kota Cirebon',
  'Kab. Majalengka',
  'Kab. Sumedang',
  'Kab. Indramayu',
  'Kab. Subang',
  'Kab. Purwakarta',
  'Kab. Karawang',
  'Kab. Cianjur',
  'Kab. Sukabumi',
  'Kota Sukabumi',
];

export const POI_CATEGORIES = [
  'Wisata Alam & Terbuka',
  'Modern & Lifestyle',
  'Publik & Edukasi',
  'Rekreasi Keluarga',
];

// Region center coordinates reference
const REGION_COORDS: Record<string, [number, number]> = {
  'Kota Bandung': [-6.9175, 107.6191],
  'Kab. Bandung Barat': [-6.8564, 107.6327],
  'Kab. Bandung': [-7.0253, 107.5198],
  'Kota Bogor': [-6.5971, 106.806],
  'Kab. Bogor': [-6.5518, 106.6291],
  'Kota Cimahi': [-6.8723, 107.5422],
  'Kota Depok': [-6.4025, 106.7942],
  'Kota Bekasi': [-6.2383, 106.9756],
  'Kab. Bekasi': [-6.3644, 107.1725],
  'Kab. Garut': [-7.2278, 107.9087],
  'Kab. Pangandaran': [-7.7011, 108.6548],
  'Kab. Ciamis': [-7.3274, 108.3556],
  'Kota Banjar': [-7.3696, 108.5332],
  'Kota Tasikmalaya': [-7.3274, 108.2207],
  'Kab. Tasikmalaya': [-7.3516, 108.1132],
  'Kab. Kuningan': [-6.9765, 108.4831],
  'Kab. Cirebon': [-6.7645, 108.4789],
  'Kota Cirebon': [-6.732, 108.5523],
  'Kab. Majalengka': [-6.8362, 108.2275],
  'Kab. Sumedang': [-6.8587, 107.9266],
  'Kab. Indramayu': [-6.3264, 108.32],
  'Kab. Subang': [-6.5684, 107.7602],
  'Kab. Purwakarta': [-6.5569, 107.4433],
  'Kab. Karawang': [-6.3054, 107.306],
  'Kab. Cianjur': [-6.8222, 107.1395],
  'Kab. Sukabumi': [-6.9213, 106.9272],
  'Kota Sukabumi': [-6.9277, 106.93],
};

// Rich seed dataset of 28 destinations across West Java to demonstrate multi-page pagination stability
const INITIAL_POI_DATA: AdminPoiItem[] = [
  {
    id: 1,
    name: 'Taman Hutan Raya Djuanda',
    category: 'Wisata Alam & Terbuka',
    regency: 'Kab. Bandung Barat',
    latitude: -6.8564,
    longitude: 107.6327,
    address: 'Jl. Ir. H. Juanda No.99, Ciburial, Kec. Cimenyan, Kabupaten Bandung Barat',
    status: 'published',
  },
  {
    id: 2,
    name: 'Museum Geologi Bandung',
    category: 'Publik & Edukasi',
    regency: 'Kota Bandung',
    latitude: -6.9006,
    longitude: 107.6215,
    address: 'Jl. Diponegoro No.57, Cihaur Geulis, Kec. Cibeunying Kaler, Kota Bandung',
    status: 'published',
  },
  {
    id: 3,
    name: 'Kiara Artha Park',
    category: 'Modern & Lifestyle',
    regency: 'Kota Bandung',
    latitude: -6.9152,
    longitude: 107.6433,
    address: 'Jl. Banten, Kebonwaru, Kec. Batununggal, Kota Bandung',
    status: 'published',
  },
  {
    id: 4,
    name: 'Curug Tilu Leuwi Opat',
    category: 'Wisata Alam & Terbuka',
    regency: 'Kab. Bandung Barat',
    latitude: -6.8245,
    longitude: 107.5789,
    address: 'Jl. Ciwangun Indah Camp, Cihanjuang Rahayu, Kec. Parongpong, Kabupaten Bandung Barat',
    status: 'pending',
  },
  {
    id: 5,
    name: 'Kawah Putih Ciwidey',
    category: 'Wisata Alam & Terbuka',
    regency: 'Kab. Bandung',
    latitude: -7.1662,
    longitude: 107.4021,
    address: 'Jl. Raya Soreang Ciwidey Km 25, Sugihmukti, Pasirjambu, Kab. Bandung',
    status: 'published',
  },
  {
    id: 6,
    name: 'Floating Market Lembang',
    category: 'Rekreasi Keluarga',
    regency: 'Kab. Bandung Barat',
    latitude: -6.8177,
    longitude: 107.6186,
    address: 'Jl. Grand Hotel No.33E, Lembang, Kab. Bandung Barat',
    status: 'published',
  },
  {
    id: 7,
    name: 'Saung Angklung Udjo',
    category: 'Publik & Edukasi',
    regency: 'Kota Bandung',
    latitude: -6.8978,
    longitude: 107.6552,
    address: 'Jl. Padasuka No.118, Pasirlayung, Cibeunying Kidul, Kota Bandung',
    status: 'published',
  },
  {
    id: 8,
    name: 'Kebun Raya Bogor',
    category: 'Wisata Alam & Terbuka',
    regency: 'Kota Bogor',
    latitude: -6.5976,
    longitude: 106.7995,
    address: 'Jl. Ir. H. Juanda No.13, Paledang, Kecamatan Bogor Tengah, Kota Bogor',
    status: 'published',
  },
  {
    id: 9,
    name: 'Pantai Pangandaran',
    category: 'Wisata Alam & Terbuka',
    regency: 'Kab. Pangandaran',
    latitude: -7.7011,
    longitude: 108.6548,
    address: 'Desa Pananjung, Kec. Pangandaran, Kab. Pangandaran',
    status: 'published',
  },
  {
    id: 10,
    name: 'Farmhouse Susu Lembang',
    category: 'Rekreasi Keluarga',
    regency: 'Kab. Bandung Barat',
    latitude: -6.8329,
    longitude: 107.6056,
    address: 'Jl. Raya Lembang No.108, Gudangkahuripan, Lembang, Kab. Bandung Barat',
    status: 'published',
  },
  {
    id: 11,
    name: 'Curug Cikaso',
    category: 'Wisata Alam & Terbuka',
    regency: 'Kab. Sukabumi',
    latitude: -7.3601,
    longitude: 106.6157,
    address: 'Kampung Ciniti, Desa Cibitung, Kec. Surade, Kab. Sukabumi',
    status: 'draft',
  },
  {
    id: 12,
    name: 'Alun-Alun Kota Bandung',
    category: 'Modern & Lifestyle',
    regency: 'Kota Bandung',
    latitude: -6.9218,
    longitude: 107.6074,
    address: 'Jl. Asia Afrika, Balonggede, Kec. Regol, Kota Bandung',
    status: 'published',
  },
  {
    id: 13,
    name: 'Orchid Forest Cikole',
    category: 'Wisata Alam & Terbuka',
    regency: 'Kab. Bandung Barat',
    latitude: -6.7806,
    longitude: 107.6372,
    address: 'Genteng, Cikole, Kec. Lembang, Kab. Bandung Barat',
    status: 'published',
  },
  {
    id: 14,
    name: 'Taman Safari Indonesia Bogor',
    category: 'Rekreasi Keluarga',
    regency: 'Kab. Bogor',
    latitude: -6.7115,
    longitude: 106.9497,
    address: 'Jl. Kapten Harun Kabir No.724, Cibeureum, Cisarua, Kab. Bogor',
    status: 'published',
  },
  {
    id: 15,
    name: 'Gedung Sate',
    category: 'Publik & Edukasi',
    regency: 'Kota Bandung',
    latitude: -6.9025,
    longitude: 107.6186,
    address: 'Jl. Diponegoro No.22, Citarum, Kec. Bandung Wetan, Kota Bandung',
    status: 'published',
  },
  {
    id: 16,
    name: 'Situ Bagendit',
    category: 'Wisata Alam & Terbuka',
    regency: 'Kab. Garut',
    latitude: -7.1582,
    longitude: 107.9547,
    address: 'Desa Bagendit, Kec. Banyuresmi, Kab. Garut',
    status: 'published',
  },
  {
    id: 17,
    name: 'Puncak Darajat Pass',
    category: 'Rekreasi Keluarga',
    regency: 'Kab. Garut',
    latitude: -7.2274,
    longitude: 107.7561,
    address: 'Jl. Darajat Km 14, Karyamekar, Kec. Pasirwangi, Kab. Garut',
    status: 'published',
  },
  {
    id: 18,
    name: 'Keraton Kasepuhan Cirebon',
    category: 'Publik & Edukasi',
    regency: 'Kota Cirebon',
    latitude: -6.7265,
    longitude: 108.5714,
    address: 'Jl. Kasepuhan No.43, Lemahwungkuk, Kota Cirebon',
    status: 'published',
  },
  {
    id: 19,
    name: 'Gua Sunyaragi',
    category: 'Publik & Edukasi',
    regency: 'Kota Cirebon',
    latitude: -6.7381,
    longitude: 108.5412,
    address: 'Sunyaragi, Kesambi, Kota Cirebon',
    status: 'published',
  },
  {
    id: 20,
    name: 'Situ Wanayasa',
    category: 'Wisata Alam & Terbuka',
    regency: 'Kab. Purwakarta',
    latitude: -6.6432,
    longitude: 107.5621,
    address: 'Jl. Raya Wanayasa, Kec. Wanayasa, Kab. Purwakarta',
    status: 'published',
  },
  {
    id: 21,
    name: 'Pemandian Air Panas Ciater',
    category: 'Rekreasi Keluarga',
    regency: 'Kab. Subang',
    latitude: -6.7412,
    longitude: 107.6534,
    address: 'Jl. Raya Ciater, Nagrak, Kec. Ciater, Kab. Subang',
    status: 'published',
  },
  {
    id: 22,
    name: 'Curug Cimahi / Pelangi',
    category: 'Wisata Alam & Terbuka',
    regency: 'Kota Cimahi',
    latitude: -6.7994,
    longitude: 107.5776,
    address: 'Jl. Kolonel Masturi No.325, Kertawangi, Kota Cimahi',
    status: 'published',
  },
  {
    id: 23,
    name: 'Telaga Remis',
    category: 'Wisata Alam & Terbuka',
    regency: 'Kab. Kuningan',
    latitude: -6.8123,
    longitude: 108.4121,
    address: 'Desa Kaduela, Kec. Pasawahan, Kab. Kuningan',
    status: 'published',
  },
  {
    id: 24,
    name: 'Curug Ibun Pelangi',
    category: 'Wisata Alam & Terbuka',
    regency: 'Kab. Majalengka',
    latitude: -6.8834,
    longitude: 108.2812,
    address: 'Sukadana, Kec. Argapura, Kab. Majalengka',
    status: 'published',
  },
  {
    id: 25,
    name: 'Kampung Naga',
    category: 'Publik & Edukasi',
    regency: 'Kab. Tasikmalaya',
    latitude: -7.3621,
    longitude: 108.0125,
    address: 'Desa Neglasari, Kec. Salawu, Kab. Tasikmalaya',
    status: 'published',
  },
  {
    id: 26,
    name: 'Pantai Batu Karas',
    category: 'Wisata Alam & Terbuka',
    regency: 'Kab. Pangandaran',
    latitude: -7.7471,
    longitude: 108.4982,
    address: 'Desa Batukaras, Kec. Cijulang, Kab. Pangandaran',
    status: 'published',
  },
  {
    id: 27,
    name: 'Taman Wisata Alam Gunung Pancar',
    category: 'Wisata Alam & Terbuka',
    regency: 'Kab. Bogor',
    latitude: -6.5921,
    longitude: 106.9034,
    address: 'Kampung Karang Tengah, Kec. Babakan Madang, Kab. Bogor',
    status: 'published',
  },
  {
    id: 28,
    name: 'Hutan Kota Patriot Bina Bangsa',
    category: 'Modern & Lifestyle',
    regency: 'Kota Bekasi',
    latitude: -6.2361,
    longitude: 106.9942,
    address: 'Jl. Jend. Ahmad Yani No.2, Kayuringin Jaya, Kota Bekasi',
    status: 'published',
  },
];

// Helper to compute sliding window pagination numbers
function getPageNumbers(currentPage: number, totalPages: number): (number | string)[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, '...', totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
}

export default function AdminPoiManagement() {
  const [poiList, setPoiList] = useState<AdminPoiItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRegency, setSelectedRegency] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Load destinations from backend API
  const loadDestinations = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const catId = selectedCategory !== 'all' ? CATEGORY_ID_MAP[selectedCategory] : undefined;
      const res = await getAdminDestinations({
        search: searchQuery.trim() || undefined,
        category_id: catId,
        per_page: 50,
      });
      if (res && Array.isArray(res.data) && res.data.length > 0) {
        const mapped: AdminPoiItem[] = res.data.map((d: any) => ({
          id: d.id,
          name: d.name,
          category: d.category?.name || 'Wisata Alam & Terbuka',
          regency: d.regency?.name || 'Jawa Barat',
          latitude: Number(d.latitude ?? (d.location?.coordinates ? d.location.coordinates[1] : -6.9175)),
          longitude: Number(d.longitude ?? (d.location?.coordinates ? d.location.coordinates[0] : 107.6191)),
          address: d.address || '',
          status: 'published',
          coverImageUrl: d.cover_image || d.image_url,
        }));
        setPoiList(mapped);
      } else if (res && Array.isArray(res.data) && res.data.length === 0) {
        setPoiList([]);
      } else {
        // Fallback to initial seed if backend is unreachable
        setPoiList(INITIAL_POI_DATA);
      }
    } catch (err) {
      console.error('Failed to load destinations:', err);
      setPoiList(INITIAL_POI_DATA);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    loadDestinations();
  }, [loadDestinations]);

  // Custom Dropdown Open States
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isRegencyDropdownOpen, setIsRegencyDropdownOpen] = useState(false);
  const [isLimitDropdownOpen, setIsLimitDropdownOpen] = useState(false);

  // Form Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingPoi, setEditingPoi] = useState<AdminPoiItem | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);

  // Form Inputs
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState(POI_CATEGORIES[0]);
  const [formRegency, setFormRegency] = useState(WEST_JAVA_REGIONS[0]);
  const [formLat, setFormLat] = useState<number>(-6.9175);
  const [formLng, setFormLng] = useState<number>(107.6191);
  const [formAddress, setFormAddress] = useState('');
  const [formStatus, setFormStatus] = useState<'published' | 'draft'>('published');
  const [formImageFile, setFormImageFile] = useState<File | null>(null);
  const [formImagePreview, setFormImagePreview] = useState<string | null>(null);
  const [formFileError, setFormFileError] = useState<string | null>(null);

  // Delete Dialog State
  const [deletingPoi, setDeletingPoi] = useState<AdminPoiItem | null>(null);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastDeletedPoi, setLastDeletedPoi] = useState<AdminPoiItem | null>(null);

  // Close dropdowns on outside pointer down
  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-dropdown]')) {
        setIsCategoryDropdownOpen(false);
        setIsRegencyDropdownOpen(false);
        setIsLimitDropdownOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Filtered and searched POI data
  const filteredPois = useMemo(() => {
    return poiList.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.regency.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory =
        selectedCategory === 'all' || item.category === selectedCategory;

      const matchRegency =
        selectedRegency === 'all' || item.regency === selectedRegency;

      return matchSearch && matchCategory && matchRegency;
    });
  }, [poiList, searchQuery, selectedCategory, selectedRegency]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredPois.length / itemsPerPage) || 1;
  const paginatedPois = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPois.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPois, currentPage, itemsPerPage]);

  const totalItems = filteredPois.length;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const pageNumbers = useMemo(() => {
    return getPageNumbers(currentPage, totalPages);
  }, [currentPage, totalPages]);

  // Open Form for Adding New POI
  const handleOpenAddModal = () => {
    setEditingPoi(null);
    setFormName('');
    setFormCategory(POI_CATEGORIES[0]);
    setFormRegency(WEST_JAVA_REGIONS[0]);
    const defaultCoords = REGION_COORDS[WEST_JAVA_REGIONS[0]] || [-6.9175, 107.6191];
    setFormLat(defaultCoords[0]);
    setFormLng(defaultCoords[1]);
    setFormAddress('');
    setFormStatus('published');
    setFormImageFile(null);
    setFormImagePreview(null);
    setFormFileError(null);
    setShowMapPicker(false);
    setIsFormModalOpen(true);
  };

  // Open Form for Editing existing POI
  const handleOpenEditModal = (poi: AdminPoiItem) => {
    setEditingPoi(poi);
    setFormName(poi.name);
    setFormCategory(poi.category);
    setFormRegency(poi.regency);
    setFormLat(poi.latitude);
    setFormLng(poi.longitude);
    setFormAddress(poi.address);
    setFormStatus(poi.status === 'published' ? 'published' : 'draft');
    setFormImageFile(null);
    setFormImagePreview(poi.coverImageUrl || null);
    setFormFileError(null);
    setShowMapPicker(false);
    setIsFormModalOpen(true);
  };

  // Regency Change in Form -> auto update coordinate recommendation
  const handleRegencyChange = (reg: string) => {
    setFormRegency(reg);
    if (!editingPoi && REGION_COORDS[reg]) {
      setFormLat(REGION_COORDS[reg][0]);
      setFormLng(REGION_COORDS[reg][1]);
    }
  };

  // Image Upload Handling with strict 2MB validation
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setFormFileError('Ukuran file foto melebihi batas maksimal 2MB.');
      return;
    }

    setFormFileError(null);
    setFormImageFile(file);
    const objectUrl = URL.createObjectURL(file);
    setFormImagePreview(objectUrl);
  };

  // Submit Add / Edit Form to Database
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim()) {
      showToast('Nama destinasi wajib diisi.');
      return;
    }

    setIsSaving(true);
    try {
      const catId = CATEGORY_ID_MAP[formCategory] || 1;
      if (editingPoi) {
        // Update in backend
        await updateAdminDestination(editingPoi.id, {
          name: formName.trim(),
          category_id: catId,
          address: formAddress.trim(),
          latitude: formLat,
          longitude: formLng,
        });
        setPoiList((prev) =>
          prev.map((item) =>
            item.id === editingPoi.id
              ? {
                  ...item,
                  name: formName.trim(),
                  category: formCategory,
                  regency: formRegency,
                  latitude: formLat,
                  longitude: formLng,
                  address: formAddress.trim(),
                  status: formStatus,
                  coverImageUrl: formImagePreview || item.coverImageUrl,
                }
              : item
          )
        );
        showToast(`POI "${formName.trim()}" berhasil diperbarui di database.`);
      } else {
        // Create in backend
        const created = await createAdminDestination({
          name: formName.trim(),
          category_id: catId,
          address: formAddress.trim(),
          latitude: formLat,
          longitude: formLng,
        });
        const newPoi: AdminPoiItem = {
          id: created?.id || Date.now(),
          name: formName.trim(),
          category: formCategory,
          regency: formRegency,
          latitude: formLat,
          longitude: formLng,
          address: formAddress.trim(),
          status: formStatus,
          coverImageUrl: formImagePreview || undefined,
        };
        setPoiList((prev) => [newPoi, ...prev]);
        showToast(`POI "${formName.trim()}" berhasil ditambahkan ke database.`);
      }
      setIsFormModalOpen(false);
      loadDestinations();
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan POI ke database.');
    } finally {
      setIsSaving(false);
    }
  };

  // Confirm Delete in Database
  const handleConfirmDelete = async () => {
    if (!deletingPoi) return;
    try {
      await deleteAdminDestination(deletingPoi.id);
      setLastDeletedPoi(deletingPoi);
      setPoiList((prev) => prev.filter((item) => item.id !== deletingPoi.id));
      showToast(`POI "${deletingPoi.name}" telah dihapus dari database.`);
      setDeletingPoi(null);
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus destinasi dari database.');
    }
  };

  // Undo Delete
  const handleUndoDelete = () => {
    if (lastDeletedPoi) {
      setPoiList((prev) => [lastDeletedPoi, ...prev]);
      setLastDeletedPoi(null);
      showToast(`Penghapusan POI "${lastDeletedPoi.name}" dibatalkan.`);
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedRegency('all');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification with Undo Action */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-gray-900/95 backdrop-blur-md text-white text-xs font-medium shadow-2xl border border-white/10 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-[#60CE9F] shrink-0" />
          <span>{toastMessage}</span>
          {lastDeletedPoi && (
            <button
              type="button"
              onClick={handleUndoDelete}
              className="ml-2 px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white font-semibold text-[11px] flex items-center gap-1 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Urungkan</span>
            </button>
          )}
        </div>
      )}

      {/* Page Heading */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
          Manajemen Point of Interest (POI) Destinasi Wisata
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Kelola data spasial destinasi rekreasi di 27 Kabupaten/Kota Jawa Barat
        </p>
      </div>

      {/* ========================================================================= */}
      {/* SINGLE UNIFIED CONTAINER (Filters, Actions, and Registered POI Table)     */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
        {/* Top Section */}
        <div className="p-5 sm:p-6 pb-4 space-y-4">
          {/* Row 1: Title on the left, Total POI on the right (NO background fill) */}
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 tracking-tight">
              Daftar Destinasi Terdaftar
            </h2>
          </div>
          

          {/* Row 2: Search, Category, Region on the left; Tambah POI (NO icon +) on the right */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
            {/* Left Controls: Search bar (rounded-full), Kategori (rounded-full), Daerah (rounded-full) */}
            <div className="flex flex-wrap items-center gap-2.5 flex-1 max-w-4xl">
              {/* Search bar (rounded-full) */}
              <div className="group relative flex-1 min-w-[200px] max-w-xs">
                <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-gray-400">
                  <Search className="w-4 h-4 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-focus-within:scale-115" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Cari nama destinasi/alamat..."
                  className="w-full pl-10 pr-9 py-2 rounded-full bg-[#F6F7FB] border border-transparent focus:border-gray-200 focus:bg-white text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-700 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Custom Category Dropdown (rounded-full) */}
              <div className="relative" data-dropdown>
                <button
                  type="button"
                  onClick={() => {
                    setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
                    setIsRegencyDropdownOpen(false);
                    setIsLimitDropdownOpen(false);
                  }}
                  className={`px-4 py-2 rounded-full border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    selectedCategory !== 'all'
                      ? 'bg-[#EEF2FF] text-[#4941EC] border-[#4941EC]/30'
                      : 'bg-[#F6F7FB] text-gray-700 border-transparent hover:bg-white hover:border-gray-200'
                  }`}
                >
                  <span className="truncate max-w-[140px]">
                    {selectedCategory === 'all' ? 'Semua Kategori' : selectedCategory}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                      isCategoryDropdownOpen ? 'rotate-180 text-[#4941EC]' : ''
                    }`}
                  />
                </button>

                {isCategoryDropdownOpen && (
                  <div className="absolute left-0 top-full mt-2 w-56 bg-white/95 backdrop-blur-xl border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.08)] rounded-2xl p-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory('all');
                        setIsCategoryDropdownOpen(false);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                        selectedCategory === 'all'
                          ? 'bg-[#EEF2FF] text-[#4941EC] font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>Semua Kategori</span>
                      {selectedCategory === 'all' && <Check className="w-3.5 h-3.5" />}
                    </button>
                    {POI_CATEGORIES.map((cat) => (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setIsCategoryDropdownOpen(false);
                          setCurrentPage(1);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                          selectedCategory === cat
                            ? 'bg-[#EEF2FF] text-[#4941EC] font-semibold'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="truncate">{cat}</span>
                        {selectedCategory === cat && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Custom Region / Daerah Dropdown (rounded-full) */}
              <div className="relative" data-dropdown>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegencyDropdownOpen(!isRegencyDropdownOpen);
                    setIsCategoryDropdownOpen(false);
                    setIsLimitDropdownOpen(false);
                  }}
                  className={`px-4 py-2 rounded-full border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    selectedRegency !== 'all'
                      ? 'bg-[#EEF2FF] text-[#4941EC] border-[#4941EC]/30'
                      : 'bg-[#F6F7FB] text-gray-700 border-transparent hover:bg-white hover:border-gray-200'
                  }`}
                >
                  <span className="truncate max-w-[140px]">
                    {selectedRegency === 'all' ? 'Semua Kab/Kota' : selectedRegency}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                      isRegencyDropdownOpen ? 'rotate-180 text-[#4941EC]' : ''
                    }`}
                  />
                </button>

                {isRegencyDropdownOpen && (
                  <div className="absolute left-0 top-full mt-2 w-60 max-h-64 overflow-y-auto bg-white/95 backdrop-blur-xl border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.08)] rounded-2xl p-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRegency('all');
                        setIsRegencyDropdownOpen(false);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                        selectedRegency === 'all'
                          ? 'bg-[#EEF2FF] text-[#4941EC] font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>Semua Kab/Kota</span>
                      {selectedRegency === 'all' && <Check className="w-3.5 h-3.5" />}
                    </button>
                    {WEST_JAVA_REGIONS.map((reg) => (
                      <button
                        type="button"
                        key={reg}
                        onClick={() => {
                          setSelectedRegency(reg);
                          setIsRegencyDropdownOpen(false);
                          setCurrentPage(1);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                          selectedRegency === reg
                            ? 'bg-[#EEF2FF] text-[#4941EC] font-semibold'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="truncate">{reg}</span>
                        {selectedRegency === reg && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Reset filter button if active */}
              {(selectedCategory !== 'all' || selectedRegency !== 'all' || searchQuery) && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs text-gray-400 hover:text-[#4941EC] font-medium transition-colors cursor-pointer px-2 py-1"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Right: Tambah POI Button (NO plus icon) */}
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="px-5 py-2.5 rounded-full bg-[#4941EC] hover:bg-[#3D35DA] active:scale-95 text-white text-xs sm:text-sm font-semibold shadow-[0_2px_10px_rgba(73,65,236,0.22)] transition-all duration-200 cursor-pointer self-start md:self-center shrink-0"
            >
              Tambah POI
            </button>
          </div>
        </div>

        {/* Table View (header has NO gray fill, matching the dashboard table) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-gray-700 font-semibold">
                <th className="py-3 px-5 sm:px-6">Nama Destinasi</th>
                <th className="py-3 px-3">Kategori</th>
                <th className="py-3 px-3">Kabupaten/Kota</th>
                <th className="py-3 px-3">Koordinat (Lat, Long)</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-5 sm:px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedPois.map((poi) => (
                <tr
                  key={poi.id}
                  className="hover:bg-gray-50/70 transition-colors group"
                >
                  {/* Destination Name + Icon */}
                  <td className="py-3.5 px-5 sm:px-6 font-semibold text-gray-900">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-[#EEF0FF] text-[#4941EC] flex items-center justify-center shrink-0">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate max-w-[180px] sm:max-w-[240px]">
                        {poi.name}
                      </span>
                    </div>
                  </td>

                  {/* Category Badge */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                        poi.category === 'Wisata Alam & Terbuka'
                          ? 'bg-[#EEF2FF] text-[#4941EC]'
                          : poi.category === 'Modern & Lifestyle'
                          ? 'bg-[#FEF6E7] text-[#D97706]'
                          : poi.category === 'Publik & Edukasi'
                          ? 'bg-[#ECFDF5] text-[#059669]'
                          : 'bg-[#EFF6FF] text-[#2563EB]'
                      }`}
                    >
                      {poi.category}
                    </span>
                  </td>

                  {/* Regency */}
                  <td className="py-3.5 px-3 text-gray-700 font-medium whitespace-nowrap">
                    {poi.regency}
                  </td>

                  {/* Coordinates */}
                  <td className="py-3.5 px-3 text-gray-600 font-mono text-[11px] whitespace-nowrap">
                    {poi.latitude.toFixed(4)}, {poi.longitude.toFixed(4)}
                  </td>

                  {/* Status Badge with Dot */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    {poi.status === 'published' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Publik
                      </span>
                    ) : poi.status === 'pending' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        UGC Pending
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 font-semibold text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                        Draf
                      </span>
                    )}
                  </td>

                  {/* Action Buttons: Edit & Hapus */}
                  <td className="py-3.5 px-5 sm:px-6 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(poi)}
                        className="group/btn inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-200 text-gray-700 hover:bg-[#EEF0FF] hover:text-[#4941EC] hover:border-[#4941EC]/30 text-[11px] font-semibold transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
                        title="Edit Data POI"
                      >
                        <Pencil className="w-3 h-3 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/btn:scale-125" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingPoi(poi)}
                        className="group/btn inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-200 text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-[11px] font-semibold transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
                        title="Hapus Data POI"
                      >
                        <Trash2 className="w-3 h-3 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/btn:scale-125" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {isLoading && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin text-[#4941EC] mx-auto mb-2" />
                    <span className="text-xs">Memuat destinasi dari database spasial...</span>
                  </td>
                </tr>
              )}

              {!isLoading && paginatedPois.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Search className="w-8 h-8 stroke-[1.5] text-gray-300" />
                      <p className="text-xs font-semibold text-gray-700">
                        Tidak ada data POI yang sesuai filter
                      </p>
                      <p className="text-[11px] text-gray-400">
                        Coba sesuaikan kata kunci pencarian atau ubah filter kategori/wilayah.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ========================================================================= */}
        {/* Pagination Footer: Left info, Right custom dropdown & sliding numbers    */}
        {/* ========================================================================= */}
        <div className="px-5 sm:px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600">
          {/* Left: Menampilkan ... - ... dari ... data */}
          <div className="text-gray-500 font-medium">
            {totalItems > 0 ? (
              <span>
                Menampilkan <strong className="font-semibold text-gray-900">{startItem}</strong> -{' '}
                <strong className="font-semibold text-gray-900">{endItem}</strong> dari{' '}
                <strong className="font-semibold text-gray-900">{totalItems}</strong> data destinasi
              </span>
            ) : (
              <span>Menampilkan 0 data destinasi</span>
            )}
          </div>

          {/* Right: Custom Limit Dropdown & Interactive Page Numbers */}
          <div className="flex items-center gap-3">
            {/* Custom Styled "Tampilkan: X Data" Dropdown */}
            <div className="relative" data-dropdown>
              <button
                type="button"
                onClick={() => {
                  setIsLimitDropdownOpen(!isLimitDropdownOpen);
                  setIsCategoryDropdownOpen(false);
                  setIsRegencyDropdownOpen(false);
                }}
                className="px-3 py-1.5 rounded-full bg-[#F6F7FB] border border-gray-200/80 hover:bg-white text-xs font-semibold text-gray-700 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>{itemsPerPage} / hal</span>
                <ChevronDown
                  className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${
                    isLimitDropdownOpen ? 'rotate-180 text-[#4941EC]' : ''
                  }`}
                />
              </button>

              {isLimitDropdownOpen && (
                <div className="absolute right-0 bottom-full mb-2 w-32 bg-white/95 backdrop-blur-xl border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.08)] rounded-2xl p-1 z-30 animate-in fade-in zoom-in-95 duration-150">
                  {[5, 10, 20].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => {
                        setItemsPerPage(num);
                        setIsLimitDropdownOpen(false);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                        itemsPerPage === num
                          ? 'bg-[#EEF2FF] text-[#4941EC] font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>{num} Data</span>
                      {itemsPerPage === num && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination Controls with Page Numbers */}
            <div className="flex items-center gap-1">
              {/* Prev Button */}
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                title="Halaman Sebelumnya"
                aria-label="Halaman sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page Number Buttons (responsive sliding window) */}
              <div className="hidden sm:flex items-center gap-1">
                {pageNumbers.map((p, index) => {
                  if (typeof p === 'string') {
                    return (
                      <span
                        key={`ellipsis-${index}`}
                        className="w-7 text-center text-gray-400 select-none text-xs"
                      >
                        &hellip;
                      </span>
                    );
                  }

                  const isActive = p === currentPage;
                  return (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`w-7 h-7 rounded-full text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#4941EC] text-white shadow-2xs'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              {/* Mobile compact page indicator */}
              <span className="sm:hidden text-xs font-semibold text-gray-700 px-1">
                {currentPage} / {totalPages}
              </span>

              {/* Next Button */}
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                title="Halaman Berikutnya"
                aria-label="Halaman berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Form Tambah / Edit POI Destinasi Wisata Modal                             */}
      {/* ========================================================================= */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsFormModalOpen(false)}
            aria-hidden="true"
          />

          {/* Dialog Container */}
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-10 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-100 bg-[#FBFBFE]">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 tracking-tight">
                  {editingPoi
                    ? `Edit POI Destinasi: ${editingPoi.name}`
                    : 'Form Tambah POI Destinasi Wisata'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Lengkapi data spasial dan informasi destinasi rekreasi Jawa Barat
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                aria-label="Tutup formulir"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              {/* 1. Nama Destinasi */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1.5">
                  Nama Destinasi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ketik nama destinasi wisata..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F6F7FB] border border-transparent focus:border-[#4941EC]/30 focus:bg-white text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all"
                />
              </div>

              {/* 2. Kategori Destinasi (Pills selection) */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-2">
                  Kategori Destinasi
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {POI_CATEGORIES.map((cat) => {
                    const isSelected = formCategory === cat;
                    return (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => setFormCategory(cat)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#EEF2FF] text-[#4941EC] border-[#4941EC] shadow-2xs'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Kabupaten / Kota */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1.5">
                  Kabupaten / Kota
                </label>
                <select
                  value={formRegency}
                  onChange={(e) => handleRegencyChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F6F7FB] border border-transparent focus:border-[#4941EC]/30 focus:bg-white text-xs sm:text-sm text-gray-900 outline-none transition-all cursor-pointer"
                >
                  {WEST_JAVA_REGIONS.map((reg) => (
                    <option key={reg} value={reg}>
                      {reg}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Data Spasial (Koordinat Geografis) */}
              <div className="p-4 rounded-2xl bg-[#FBFBFE] border border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#4941EC]" />
                    Data Spasial (Koordinat Geografis)
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowMapPicker(!showMapPicker)}
                    className="group inline-flex items-center gap-1.5 text-xs text-[#4941EC] font-semibold hover:underline cursor-pointer"
                  >
                    <MapIcon className="w-3.5 h-3.5 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-125" />
                    <span>{showMapPicker ? 'Tutup Peta Interaktif' : 'Buka Peta Interaktif untuk Set Pin Koordinat'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formLat}
                      onChange={(e) => setFormLat(parseFloat(e.target.value) || 0)}
                      placeholder="-6.856400"
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs font-mono text-gray-800 outline-none focus:border-[#4941EC]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formLng}
                      onChange={(e) => setFormLng(parseFloat(e.target.value) || 0)}
                      placeholder="107.632700"
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs font-mono text-gray-800 outline-none focus:border-[#4941EC]"
                    />
                  </div>
                </div>

                {/* Collapsible Interactive Map Picker */}
                {showMapPicker && (
                  <div className="pt-2 animate-in fade-in duration-300">
                    <AdminPoiMapPicker
                      lat={formLat}
                      lng={formLng}
                      onChange={(lat, lng) => {
                        setFormLat(lat);
                        setFormLng(lng);
                      }}
                    />
                  </div>
                )}
              </div>

              {/* 5. Alamat Lengkap */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1.5">
                  Alamat Lengkap
                </label>
                <textarea
                  rows={2}
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="Jl. Ir. H. Juanda No.99, Ciburial, Kec. Cimenyan, Kabupaten Bandung Barat"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F6F7FB] border border-transparent focus:border-[#4941EC]/30 focus:bg-white text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all resize-none"
                />
              </div>

              {/* 6. Foto Sampul Destinasi (Maksimal 2MB) */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1.5">
                  Foto Sampul Destinasi (Opsional, Maksimal 2MB)
                </label>
                <div className="relative border-2 border-dashed border-gray-200 hover:border-[#4941EC]/50 rounded-2xl p-4 text-center bg-[#FBFBFE] transition-colors cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center gap-1.5 text-gray-500">
                    <UploadCloud className="w-6 h-6 text-gray-400 group-hover:text-[#4941EC] transition-colors" />
                    <p className="text-xs font-semibold text-gray-700">
                      Pilih File Foto (Maksimal 2MB)
                    </p>
                    <p className="text-[10px] text-gray-400">
                      Format PNG, JPG, WebP didukung
                    </p>
                  </div>
                </div>

                {formFileError && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{formFileError}</span>
                  </p>
                )}

                {formImagePreview && (
                  <div className="mt-3 flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl border border-gray-200/80">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formImagePreview}
                      alt="Pratinjau Sampul"
                      className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                    />
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-xs font-semibold text-gray-800 truncate">
                        {formImageFile ? formImageFile.name : 'Foto sampul saat ini'}
                      </p>
                      {formImageFile && (
                        <p className="text-[10px] text-gray-400">
                          {(formImageFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormImageFile(null);
                        setFormImagePreview(null);
                      }}
                      className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* 7. Status Publikasi */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-2">
                  Status Publikasi
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      formStatus === 'published'
                        ? 'bg-emerald-50/50 border-emerald-400 ring-1 ring-emerald-400'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="publicationStatus"
                      checked={formStatus === 'published'}
                      onChange={() => setFormStatus('published')}
                      className="text-[#4941EC] focus:ring-0"
                    />
                    <div>
                      <span className="text-xs font-semibold text-gray-900 block">
                        Dipublikasikan
                      </span>
                      <span className="text-[10px] text-gray-500">
                        Aktif dan terlihat pada peta publik
                      </span>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      formStatus === 'draft'
                        ? 'bg-gray-100 border-gray-400 ring-1 ring-gray-400'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="publicationStatus"
                      checked={formStatus === 'draft'}
                      onChange={() => setFormStatus('draft')}
                      className="text-[#4941EC] focus:ring-0"
                    />
                    <div>
                      <span className="text-xs font-semibold text-gray-900 block">
                        Draf / Peninjauan
                      </span>
                      <span className="text-[10px] text-gray-500">
                        Disimpan privat sebagai draf kurasi
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#4941EC] hover:bg-[#3D35DA] active:scale-95 text-white text-xs font-semibold shadow-[0_4px_16px_rgba(73,65,236,0.25)] transition-all cursor-pointer"
                >
                  Simpan Data POI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Delete Confirmation Modal                                                 */}
      {/* ========================================================================= */}
      {deletingPoi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setDeletingPoi(null)}
            aria-hidden="true"
          />

          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 z-10 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6 stroke-[2]" />
            </div>

            <h3 className="text-base font-semibold text-gray-900 tracking-tight">
              Hapus POI Destinasi?
            </h3>
            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
              Apakah Anda yakin ingin menghapus{' '}
              <strong className="text-gray-800 font-semibold">
                &ldquo;{deletingPoi.name}&rdquo;
              </strong>
              ? Data spasial ini tidak akan ditampilkan lagi pada peta publik.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setDeletingPoi(null)}
                className="w-full py-2.5 rounded-full border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="w-full py-2.5 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                Hapus POI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
