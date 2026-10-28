# DATABASE.md — JabarPleasure: Database Architecture & Relational Schema

Dokumen ini mendefinisikan arsitektur basis data relasional dan spasial untuk sistem **JabarPleasure (Jawa Barat Public Leisure & Entertainment Spatial Guide)**. Skema dirancang untuk mesin **PostgreSQL 15+** dengan ekstensi **PostGIS 3+** dan disesuaikan dengan konvensi penamaan **Laravel 11 / Eloquent ORM**.

---

## 1. Konvensi & Standar Rekayasa Basis Data

1. **Sistem Koordinat Spasial:** Seluruh data geometri menggunakan format referensi spasial **WGS84 (SRID 4326)**.
2. **Pengindeksan Spasial:** Setiap kolom bertipe `GEOMETRY` wajib memiliki indeks spasial berbasis **GIST** (*Generalized Search Tree*) guna menjamin pemenuhan **NF-01** (eksekusi kueri spasial $< 500\text{ ms}$).
3. **Primary Key:** Menggunakan format integer `BIGSERIAL` / `BIGINT UNSIGNED` untuk skalabilitas pertumbuhan transaksi dan log data.
4. **Audit Fields:** Setiap tabel transaksional dan master menyertakan timestamp standar Laravel (`created_at`, `updated_at`).
5. **Integritas Referensial:** Foreign Key diikat dengan *constraint cascade/restrict* yang ketat guna mencegah anomali *orphan records*.

---

## 2. Modul 1: Pengguna, Autentikasi & Preferensi (F-01, F-02, F-14, NF-01, NF-06)

### 2.1. Tabel `users`
Menyimpan data identitas kredensial pengguna terdaftar dan administrator sistem.

| Nama Kolom | Tipe Data | Modifiers | Deskripsi |
| :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | `PRIMARY KEY` | Identifier unik pengguna |
| `name` | `VARCHAR(100)` | `NOT NULL` | Nama lengkap pengguna |
| `email` | `VARCHAR(150)` | `NOT NULL, UNIQUE` | Alamat surel aktif |
| `password` | `VARCHAR(255)` | `NOT NULL` | Hash kredensial (Bcrypt / Argon2id) |
| `role` | `VARCHAR(20)` | `NOT NULL, DEFAULT 'user'` | Peran hak akses: `'user'`, `'admin'` |
| `is_blocked` | `BOOLEAN` | `NOT NULL, DEFAULT FALSE` | Flag moderasi akun bermasalah (F-14) |
| `email_verified_at` | `TIMESTAMP` | `NULLABLE` | Waktu verifikasi email |
| `created_at` | `TIMESTAMP` | `NULLABLE` | Waktu registrasi |
| `updated_at` | `TIMESTAMP` | `NULLABLE` | Waktu pembaruan data |

### 2.2. Tabel `categories`
Master kategori destinasi hiburan dan rekreasi publik.

| Nama Kolom | Tipe Data | Modifiers | Deskripsi |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | Identifier kategori |
| `name` | `VARCHAR(100)` | `NOT NULL` | Nama kategori (misal: Wisata Alam, Rekreasi Keluarga) |
| `slug` | `VARCHAR(100)` | `NOT NULL, UNIQUE` | URL slug ramah SEO |
| `icon_url` | `VARCHAR(255)` | `NULLABLE` | URL aset ikon kategori |
| `created_at` | `TIMESTAMP` | `NULLABLE` | Waktu pembuatan |
| `updated_at` | `TIMESTAMP` | `NULLABLE` | Waktu pembaruan |

### 2.3. Tabel `user_preferences`
Menyimpan riwayat survei preferensi minat awal (*onboarding preference survey* - F-02).

| Nama Kolom | Tipe Data | Modifiers | Deskripsi |
| :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | `PRIMARY KEY` | Identifier unik preferensi |
| `user_id` | `BIGINT` | `NOT NULL, FK -> users(id) ON DELETE CASCADE` | Relasi ke pengguna |
| `category_id` | `INT` | `NOT NULL, FK -> categories(id) ON DELETE CASCADE` | Kategori minat yang dipilih |
| `created_at` | `TIMESTAMP` | `NULLABLE` | Waktu penyimpanan survei |

* **Constraint Unik:** `UNIQUE (user_id, category_id)`

### 2.4. Tabel `personal_access_tokens`
Dikelola oleh Laravel Sanctum untuk manajemen autentikasi API berbasis token *bearer*.

| Nama Kolom | Tipe Data | Modifiers | Deskripsi |
| :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | `PRIMARY KEY` | Identifier token |
| `tokenable_type` | `VARCHAR(255)` | `NOT NULL` | Polimorfik tipe model (`App\Models\User`) |
| `tokenable_id` | `BIGINT` | `NOT NULL` | ID entitas pengguna |
| `name` | `VARCHAR(255)` | `NOT NULL` | Label penamaan sesi token |
| `token` | `VARCHAR(64)` | `NOT NULL, UNIQUE` | Nilai token SHA-256 terenkripsi |
| `abilities` | `TEXT` | `NULLABLE` | Lingkup hak akses API (*scopes*) |
| `last_used_at` | `TIMESTAMP` | `NULLABLE` | Waktu terakhir token digunakan |
| `expires_at` | `TIMESTAMP` | `NULLABLE` | Waktu kedaluwarsa token |
| `created_at` | `TIMESTAMP` | `NULLABLE` | Waktu pembuatan |
| `updated_at` | `TIMESTAMP` | `NULLABLE` | Waktu pembaruan |

---

## 3. Modul 2: Wilayah Administratif & Master Destinasi Spasial (F-04, F-12, NF-01, NF-04)

### 3.1. Tabel `regencies_cities`
Menampung batas administratif 27 Kabupaten/Kota di Jawa Barat untuk keperluan filter wilayah dan validasi topologi `ST_Contains`.

| Nama Kolom | Tipe Data | Modifiers | Deskripsi |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | Identifier wilayah |
| `name` | `VARCHAR(100)` | `NOT NULL` | Nama wilayah resmi (misal: "Kota Bandung") |
| `alt_name` | `VARCHAR(100)` | `NULLABLE` | Nama alternatif / sebutan populer |
| `geom` | `GEOMETRY(MultiPolygon, 4326)` | `NOT NULL` | Poligon batas administratif wilayah |
| `created_at` | `TIMESTAMP` | `NULLABLE` | Waktu input |
| `updated_at` | `TIMESTAMP` | `NULLABLE` | Waktu pembaruan |

* **Index Spasial:** `CREATE INDEX regencies_cities_geom_gist ON regencies_cities USING GIST (geom);`

### 3.2. Tabel `destinations`
Menyimpan master data Point of Interest (POI) tempat hiburan dan wisata.

| Nama Kolom | Tipe Data | Modifiers | Deskripsi |
| :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | `PRIMARY KEY` | Identifier destinasi |
| `regency_id` | `INT` | `NOT NULL, FK -> regencies_cities(id) ON DELETE RESTRICT` | Relasi wilayah administratif |
| `category_id` | `INT` | `NOT NULL, FK -> categories(id) ON DELETE RESTRICT` | Relasi kategori destinasi |
| `osm_id` | `BIGINT` | `NULLABLE` | ID OpenStreetMap sumber |
| `name` | `VARCHAR(200)` | `NOT NULL` | Nama destinasi wisata/hiburan |
| `slug` | `VARCHAR(255)` | `NOT NULL, UNIQUE` | Slug URL detail destinasi |
| `description` | `TEXT` | `NULLABLE` | Narasi deskripsi tempat |
| `address` | `TEXT` | `NULLABLE` | Alamat fisik lengkap |
| `price_range` | `VARCHAR(50)` | `NULLABLE` | Estimasi rentang tiket masuk |
| `opening_hours` | `VARCHAR(100)` | `NULLABLE` | Jadwal operasional (hari & jam) |
| `facilities` | `JSONB` | `NULLABLE` | Fasilitas tersedia (`["parkir", "musala", "toilet"]`) |
| `cover_image` | `VARCHAR(255)` | `NULLABLE` | Path file gambar sampul utama |
| `location` | `GEOMETRY(Point, 4326)` | `NOT NULL` | Koordinat titik presisi destinasi |
| `created_at` | `TIMESTAMP` | `NULLABLE` | Waktu pembuatan |
| `updated_at` | `TIMESTAMP` | `NULLABLE` | Waktu pembaruan |

* **Index Spasial:** `CREATE INDEX destinations_location_gist ON destinations USING GIST (location);`
* **Index B-Tree:** `CREATE INDEX destinations_cat_reg_idx ON destinations (category_id, regency_id);`

---

## 4. Modul 3: Perjalanan, Rute, Check-in & Media Journaling (F-05 s/d F-10, F-15, NF-03, NF-05)

### 4.1. Tabel `wishlists`
Menyimpan destinasi favorit yang ditandai oleh pengguna (F-05).

| Nama Kolom | Tipe Data | Modifiers | Deskripsi |
| :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | `PRIMARY KEY` | Identifier wishlist |
| `user_id` | `BIGINT` | `NOT NULL, FK -> users(id) ON DELETE CASCADE` | Relasi pengguna |
| `destination_id` | `BIGINT` | `NOT NULL, FK -> destinations(id) ON DELETE CASCADE` | Relasi destinasi |
| `created_at` | `TIMESTAMP` | `NULLABLE` | Waktu penambahan |

* **Constraint Unik:** `UNIQUE (user_id, destination_id)`

### 4.2. Tabel `itineraries`
Entitas rencana perjalanan yang memuat konfigurasi rute, status rencana, dan jalur Polyline.

| Nama Kolom | Tipe Data | Modifiers | Deskripsi |
| :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | `PRIMARY KEY` | Identifier itinerary |
| `user_id` | `BIGINT` | `NOT NULL, FK -> users(id) ON DELETE CASCADE` | Pembuat rencana |
| `title` | `VARCHAR(150)` | `NOT NULL` | Nama/judul perjalanan |
| `start_date` | `DATE` | `NOT NULL` | Tanggal mulai perjalanan |
| `end_date` | `DATE` | `NOT NULL` | Tanggal selesai perjalanan |
| `departure_location` | `GEOMETRY(Point, 4326)` | `NULLABLE` | Koordinat titik awal keberangkatan |
| `route_geojson` | `JSONB` | `NULLABLE` | GeoJSON polyline lintasan rute jalan & ETA |
| `status` | `VARCHAR(30)` | `NOT NULL, DEFAULT 'planned'` | Status: `'planned'`, `'active'`, `'completed'` |
| `created_at` | `TIMESTAMP` | `NULLABLE` | Waktu pembuatan rencana |
| `updated_at` | `TIMESTAMP` | `NULLABLE` | Waktu modifikasi rencana |

### 4.3. Tabel `itinerary_items`
Rincian titik-titik singgah destinasi dalam suatu itinerary.

| Nama Kolom | Tipe Data | Modifiers | Deskripsi |
| :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | `PRIMARY KEY` | Identifier item rencana |
| `itinerary_id` | `BIGINT` | `NOT NULL, FK -> itineraries(id) ON DELETE CASCADE` | Rencana induk |
| `destination_id` | `BIGINT` | `NOT NULL, FK -> destinations(id) ON DELETE RESTRICT` | Destinasi singgah |
| `visit_order` | `SMALLINT` | `NOT NULL` | Nomor urut singgah (1, 2, 3...) |
| `estimated_time_arrival`| `TIME` | `NULLABLE` | Estimasi jam kedatangan (ETA) |
| `created_at` | `TIMESTAMP` | `NULLABLE` | Waktu penambahan |
| `updated_at` | `TIMESTAMP` | `NULLABLE` | Waktu modifikasi |

### 4.4. Tabel `check_ins`
Mencatat kehadiran fisik pengguna di lokasi destinasi berbasis perbandingan GPS (F-08, F-15).

| Nama Kolom | Tipe Data | Modifiers | Deskripsi |
| :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | `PRIMARY KEY` | Identifier check-in |
| `user_id` | `BIGINT` | `NOT NULL, FK -> users(id) ON DELETE CASCADE` | Pengguna yang check-in |
| `destination_id` | `BIGINT` | `NOT NULL, FK -> destinations(id) ON DELETE CASCADE` | Destinasi yang dikunjungi |
| `itinerary_id` | `BIGINT` | `NULLABLE, FK -> itineraries(id) ON DELETE SET NULL` | Kait rute perjalanan terkait |
| `check_in_coord` | `GEOMETRY(Point, 4326)` | `NOT NULL` | Koordinat perangkat saat tombol ditekan |
| `distance_deviation` | `NUMERIC(8, 2)` | `NOT NULL` | Selisih jarak (meter) dari koordinat destinasi |
| `checked_in_at` | `TIMESTAMP` | `NOT NULL` | Waktu riil kehadiran |
| `is_synced_from_offline`| `BOOLEAN` | `NOT NULL, DEFAULT FALSE` | Indikator sinkronisasi antrean offline (NF-05) |
| `created_at` | `TIMESTAMP` | `NULLABLE` | Waktu insert ke basis data |

* **Index:** `CREATE INDEX check_ins_destination_idx ON check_ins (destination_id);` (Krusial untuk kueri agregasi F-15).

### 4.5. Tabel `journal_media`
Dokumentasi visual (foto/video pendek) dan catatan perjalanan pada titik check-in untuk fitur *timelapse replay* (F-09, F-10, NF-03).

| Nama Kolom | Tipe Data | Modifiers | Deskripsi |
| :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | `PRIMARY KEY` | Identifier media |
| `check_in_id` | `BIGINT` | `NOT NULL, FK -> check_ins(id) ON DELETE CASCADE` | Check-in terkait |
| `file_path` | `VARCHAR(255)` | `NOT NULL` | Lokasi file penyimpanan di storage |
| `media_type` | `VARCHAR(10)` | `NOT NULL` | Tipe berkas: `'photo'`, `'video'` |
| `file_size_kb` | `INT` | `NOT NULL` | Ukuran file (Foto $\le 2048$, Video $\le 10240$) |
| `caption` | `TEXT` | `NULLABLE` | Catatan/jurnal perjalanan singkat |
| `created_at` | `TIMESTAMP` | `NULLABLE` | Waktu unggah media |

---

## 5. Modul 4: Log Analitik & Rekomendasi Cerdas (F-03, F-13)

### 5.1. Tabel `user_behavior_logs`
Menampung interaksi penelusuran pengguna untuk melatih dan menyuplai mesin rekomendasi (*behavior-based scoring*) serta dashboard analitik tren admin.

| Nama Kolom | Tipe Data | Modifiers | Deskripsi |
| :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | `PRIMARY KEY` | Identifier log interaksi |
| `user_id` | `BIGINT` | `NULLABLE, FK -> users(id) ON DELETE SET NULL` | Pengguna (null jika anonim) |
| `action_type` | `VARCHAR(30)` | `NOT NULL` | Jenis aksi: `'search'`, `'view_detail'`, `'map_click'` |
| `destination_id` | `BIGINT` | `NULLABLE, FK -> destinations(id) ON DELETE CASCADE` | POI yang diinteraksikan |
| `search_query` | `VARCHAR(200)` | `NULLABLE` | String kata kunci pencarian |
| `metadata` | `JSONB` | `NULLABLE` | Payload parameter filter tambahan |
| `created_at` | `TIMESTAMP` | `NOT NULL, DEFAULT CURRENT_TIMESTAMP` | Waktu interaksi terjadi |

* **Index:** `CREATE INDEX user_behavior_action_date_idx ON user_behavior_logs (action_type, created_at);`

---

## 6. Modul 5: Crowdsourcing & Moderasi Admin (F-11, F-12)

### 6.1. Tabel `poi_submissions`
Menampung pengajuan penambahan tempat hiburan baru dari masyarakat sebelum divalidasi oleh administrator.

| Nama Kolom | Tipe Data | Modifiers | Deskripsi |
| :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | `PRIMARY KEY` | Identifier pengajuan |
| `user_id` | `BIGINT` | `NOT NULL, FK -> users(id) ON DELETE CASCADE` | Pengguna yang mengajukan |
| `category_id` | `INT` | `NOT NULL, FK -> categories(id) ON DELETE RESTRICT` | Usulan kategori |
| `regency_id` | `INT` | `NULLABLE, FK -> regencies_cities(id) ON DELETE SET NULL` | Wilayah kabupaten/kota |
| `name` | `VARCHAR(200)` | `NOT NULL` | Nama tempat yang diajukan |
| `description` | `TEXT` | `NOT NULL` | Deskripsi tempat wisata |
| `price_range` | `VARCHAR(50)` | `NULLABLE` | Usulan rentang tiket |
| `opening_hours` | `VARCHAR(100)` | `NULLABLE` | Usulan jam buka |
| `proposed_location` | `GEOMETRY(Point, 4326)` | `NOT NULL` | Titik koordinat acuan di peta |
| `evidence_image` | `VARCHAR(255)` | `NULLABLE` | Bukti fisik foto lokasi |
| `status` | `VARCHAR(20)` | `NOT NULL, DEFAULT 'pending'` | Status tinjauan: `'pending'`, `'approved'`, `'rejected'` |
| `admin_note` | `TEXT` | `NULLABLE` | Catatan penolakan/revisi admin |
| `reviewed_by` | `BIGINT` | `NULLABLE, FK -> users(id) ON DELETE SET NULL` | Admin pemeriksa |
| `reviewed_at` | `TIMESTAMP` | `NULLABLE` | Waktu peninjauan selesai |
| `created_at` | `TIMESTAMP` | `NULLABLE` | Waktu pengajuan dibuat |
| `updated_at` | `TIMESTAMP` | `NULLABLE` | Waktu pembaruan status |

* **Index Spasial:** `CREATE INDEX poi_submissions_location_gist ON poi_submissions USING GIST (proposed_location);`

---

## 7. Matriks Hubungan Relasional (Foreign Key Mapping)

```
[users] 1 ──── ∞ [user_preferences] ∞ ──── 1 [categories]
   │
   ├────── 1 ──── ∞ [wishlists] ∞ ──── 1 [destinations]
   │                                           │
   ├────── 1 ──── ∞ [itineraries]              │
   │                     │                     │
   │                     └─ 1 ── ∞ [itinerary_items]
   │                                           │
   ├────── 1 ──── ∞ [check_ins] ∞ ─────────────┘
   │                     │
   │                     └─ 1 ── ∞ [journal_media]
   │
   ├────── 1 ──── ∞ [user_behavior_logs]
   │
   └────── 1 ──── ∞ [poi_submissions]
                         │
[regencies_cities] 1 ────┴─ ∞ [destinations]
```

---

## 8. Skrip Ekstensi & Contoh Kueri Spasial Kunci

### 8.1. Mengaktifkan Ekstensi PostGIS
Dijalankan sebelum migrasi tabel pertama:
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

### 8.2. Kueri Radius Spasial Destinasi 5 km (F-04 / ST_DWithin)
```sql
SELECT 
    d.id,
    d.name,
    d.address,
    d.price_range,
    ROUND(ST_Distance(d.location, ST_SetSRID(ST_MakePoint(:user_lng, :user_lat), 4326)::geography)::numeric, 2) AS distance_meters
FROM destinations d
WHERE ST_DWithin(d.location, ST_SetSRID(ST_MakePoint(:user_lng, :user_lat), 4326)::geography, 5000)
ORDER BY distance_meters ASC;
```

### 8.3. Kueri Rekomendasi Destinasi Populer Berbasis Check-in (F-15)
```sql
SELECT 
    d.id,
    d.name,
    d.price_range,
    COUNT(c.id) AS total_checkins
FROM destinations d
LEFT JOIN check_ins c ON d.id = c.destination_id
WHERE d.regency_id = :target_regency_id
GROUP BY d.id
ORDER BY total_checkins DESC
LIMIT 5;
```

### 8.4. Validasi Titik Baru Terhadap Batas Jawa Barat (NF-04 / ST_Contains)
```sql
SELECT r.id, r.name 
FROM regencies_cities r
WHERE ST_Contains(r.geom, ST_SetSRID(ST_MakePoint(:submitted_lng, :submitted_lat), 4326))
LIMIT 1;
```