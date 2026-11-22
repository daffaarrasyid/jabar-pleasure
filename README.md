# JabarPleasure: Jawa Barat Public Leisure & Entertainment Spatial Guide

Platform *Geographic Information System* (WebGIS) modern dan terpersonalisasi yang menyajikan rekomendasi tempat hiburan dan destinasi wisata di 27 Kabupaten/Kota Provinsi Jawa Barat secara interaktif dan presisi.

Aplikasi ini dibangun menggunakan arsitektur *Decoupled* (Frontend dan Backend terpisah) dengan integrasi *Cloud Storage*:
- **Frontend (`fe-jabarpleasure`):** Next.js 15 (React 19), Tailwind CSS, Leaflet.js / MapLibre GL, Three.js (Timelapse 3D).
- **Backend (`be-jabarpleasure`):** Laravel 11, PHP 8.2+, REST API, Laravel Sanctum (Autentikasi Bearer Token).
- **Basis Data Spasial:** PostgreSQL 15+ dengan ekstensi **PostGIS 3+** (SRID 4326 / WGS84).
- **Penyimpanan Media (Cloud Storage):** **Supabase Storage Bucket (`destinations`)** digunakan untuk seluruh unggahan media (foto cover destinasi, avatar profil pengguna, bukti foto pengajuan destinasi baru, dan dokumentasi foto/video jurnal perjalanan). Aplikasi **tidak menggunakan penyimpanan lokal** untuk menjamin persistensi media terpusat di cloud.

---

## 📋 Prasyarat Sistem (Prerequisites)

Sebelum melakukan instalasi, pastikan sistem pengujian Anda telah terpasang:

1. **Node.js:** Versi `18.x` atau `20.x` (LTS direkomendasikan) serta `npm` / `pnpm` / `yarn`.
2. **PHP:** Versi `>= 8.2` dengan ekstensi aktif:
   - `pdo_pgsql` & `pgsql`
   - `mbstring`, `openssl`, `curl`, `fileinfo`, `xml`, `tokenizer`
3. **Composer:** Versi `>= 2.x`.
4. **PostgreSQL:** Versi `>= 15` dengan modul ekstensi **PostGIS** terpasang.
5. **Akun / Akses Supabase Storage:** Proyek telah terhubung ke Supabase project dengan bucket publik bernama `destinations`.

---

## 🛠️ Langkah Instalasi & Konfigurasi

### 1. Persiapan Basis Data (PostgreSQL & PostGIS)

1. Buka terminal PostgreSQL (`psql`) atau GUI Database (DBeaver / pgAdmin).
2. Buat database baru bernama `JabarPleasure`:
   ```sql
   CREATE DATABASE "JabarPleasure";
   ```
3. Aktifkan ekstensi PostGIS pada database tersebut (opsional jika user database berstatus superuser, migrasi Laravel juga akan mencoba mengeksekusinya secara otomatis):
   ```sql
   \c JabarPleasure;
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```

---

### 2. Instalasi & Konfigurasi Backend (`be-jabarpleasure`)

1. Buka terminal dan masuk ke direktori backend:
   ```bash
   cd be-jabarpleasure
   ```

2. Pasang seluruh dependensi PHP menggunakan Composer:
   ```bash
   composer install
   ```

3. Siapkan file konfigurasi environment:
   ```bash
   cp .env.example .env
   ```

4. Buka file `.env` dan sesuaikan koneksi database PostgreSQL serta kredensial Supabase Storage:
   ```env
   # Basis Data Spasial PostgreSQL & PostGIS
   DB_CONNECTION=pgsql
   DB_HOST=127.0.0.1
   DB_PORT=5432
   DB_DATABASE=JabarPleasure
   DB_USERNAME=postgres
   DB_PASSWORD=password_postgres_anda

   # Supabase Cloud Storage (Wajib untuk pengujian media & avatar)
   SUPABASE_URL=https://nruydgxivzixylaxoced.supabase.co
   SUPABASE_KEY=your_supabase_service_role_key
   SUPABASE_BUCKET=destinations
   ```
   *(Catatan: `SUPABASE_KEY` menggunakan service role key Supabase untuk memberikan hak akses upload dan delete objek secara terprogram ke bucket `destinations`)*.

5. Generate application key:
   ```bash
   php artisan key:generate
   ```

6. Jalankan migrasi dan seeder untuk mengisi data awal:
   ```bash
   php artisan migrate --seed
   ```
   > **Catatan Seeder:** Perintah ini otomatis mengisi master kategori wisata, daftar 27 Kabupaten/Kota Jawa Barat, data POI destinasi wisata awal lengkap dengan path cover Supabase, akun wisatawan pengujian (*Nabila Putri*), dan akun administrator (*admin123*).

7. Jalankan server backend:
   ```bash
   php artisan serve
   ```
   Server backend akan berjalan di **`http://127.0.0.1:8000`**.

---

### 3. Instalasi & Konfigurasi Frontend (`fe-jabarpleasure`)

1. Buka terminal baru dan masuk ke direktori frontend:
   ```bash
   cd fe-jabarpleasure
   ```

2. Pasang dependensi JavaScript / Node.js:
   ```bash
   npm install
   ```

3. Siapkan file environment frontend:
   ```bash
   cp .env.example .env.local
   ```
   Pastikan konfigurasi di `.env.local` telah sesuai:
   ```env
   NEXT_PUBLIC_API_URL=/api
   NEXT_PUBLIC_SUPABASE_URL=https://nruydgxivzixylaxoced.supabase.co
   NEXT_PUBLIC_SUPABASE_BUCKET=destinations
   ```
   *(Frontend Next.js secara otomatis merewrite kueri `/api/*` ke backend `http://127.0.0.1:8000/api/*` via `next.config.ts`, dan mengizinkan rendering aset gambar langsung dari domain `*.supabase.co`)*.

4. Jalankan server frontend:
   ```bash
   npm run dev
   ```
   Frontend Next.js akan berjalan di **`http://localhost:3000`**.

---

## ☁️ Pengujian Cloud Storage (Supabase Bucket)

Salah satu fokus pengujian pada sistem JabarPleasure adalah validasi penyimpanan berbasis **Cloud Object Storage (Supabase Bucket `destinations`)**:

1. **Unggah Foto Profil / Avatar:**
   - Masuk ke tab **Profil** (`/profile`) $\rightarrow$ klik **Edit Profil**.
   - Unggah gambar avatar baru $\rightarrow$ sistem di backend (`AvatarStorageService.php`) otomatis melakukan kompresi ke format WebP dan mengirimkannya langsung ke endpoint Supabase Storage:
     `{SUPABASE_URL}/storage/v1/object/destinations/avatars/{filename}.webp`
   - Avatar lama secara otomatis dihapus dari bucket untuk efisiensi ruang simpan.

2. **Unggah Jurnal Dokumentasi Perjalanan:**
   - Pada riwayat perjalanan selesai (`TripDetailScreen.tsx` / `DestinationDocScreen.tsx`), klik **Upload Media**.
   - Unggah foto (maksimal 2 MB) atau video (maksimal 10 MB / 15 detik).
   - Backend (`JournalMediaController.php`) memvalidasi batasan kuota media dan mengunggahnya langsung ke Supabase Storage bucket `destinations`.
   - URL publik Supabase disimpan ke database dan ditampilkan di antarmuka riwayat serta pemutar animasi 3D Timelapse.

3. **Foto Pengajuan Destinasi Baru & Katalog POI:**
   - Foto yang diajukan oleh pengguna atau admin tersimpan dengan referensi ke bucket Supabase, memastikan seluruh aset visual dapat diakses secara publik dan konsisten di berbagai perangkat tanpa ketergantungan storage lokal.

---

## 🔑 Kredensial Akun Pengujian (Testing Accounts)

Untuk mempermudah demonstrasi dan evaluasi fitur, gunakan akun bawaan hasil seeder database berikut:

### 1. Akun Wisatawan / Pengguna Terdaftar (Role: `user`)
* **Email:** `nabila.putri@gmail.com`
* **Kata Sandi:** `password123`
* **Akses Login:** Buka `http://localhost:3000/login`
* **Fitur yang dapat diuji:**
  - Personalisasi feed rekomendasi wisata berbasis minat & riwayat klik
  - Pencarian destinasi & filter spasial radius proksimitas 5 km di Jawa Barat
  - Simpan dan kelola Wishlist favorit
  - Pengajuan destinasi baru (*Suggest Destination*) jika destinasi belum terdaftar
  - Penyusunan Itinerary perjalanan 3-5 destinasi & kalkulasi rute jalan raya (ETA)
  - Simulasi Check-in lokasi di titik perjalanan (didukung *offline mode fallback* di local storage)
  - Riwayat perjalanan, upload foto/video jurnal langsung ke Supabase Bucket, dan putar ulang rute *Interactive Timelapse Replay* 3D
  - Pengiriman masukan / ulasan pengguna (Feedback)

### 2. Akun Administrator (Role: `admin`)
* **Username:** `admin123` *(atau email: `admin123@jabarpleasure.id`)*
* **Kata Sandi:** `adminganteng`
* **Akses Login Panel Admin:** Buka `http://localhost:3000/admin/login`
* **Fitur yang dapat diuji:**
  - **Overview:** Metrik analitik jumlah destinasi, pengguna, antrean verifikasi, dan grafik tren pencarian
  - **Pengajuan Destinasi (Submissions):** Memeriksa antrean usulan POI baru dari pengguna, inspeksi posisi koordinat di peta Jawa Barat, lalu memilih **Approve** (terbit ke publik) atau **Reject** (tolak dengan alasan)
  - **Katalog POI:** Tambah, edit, perbarui titik koordinat via Map Picker, dan hapus destinasi
  - **Manajemen Pengguna:** Memantau daftar pengguna, mengubah peran (`user`/`admin`), dan memblokir akun bermasalah (*Toggle Block*)
  - **Moderasi Media:** Meninjau dan menghapus foto/video dokumentasi jurnal perjalanan pengguna di Supabase jika melanggar ketentuan
  - **Manajemen Feedback:** Membaca keluhan/saran wisatawan, membalas tanggapan, dan memperbarui status penanganan

---

## 🧪 Skenario Cepat Uji Coba Penguji (Demo Walkthrough)

### Skenario A: Siklus Pengajuan & Verifikasi Destinasi (End-to-End)
1. **User Side (`/home`):**
   - Login sebagai `nabila.putri@gmail.com` atau buka halaman Beranda.
   - Pada kartu **"Tidak menemukan destinasi yang Anda mau?"**, klik tombol **"Ajukan"**.
   - Isi formulir (Nama Destinasi, Kategori, Koordinat GPS/Link GMaps, dan unggah Foto).
   - Klik **"Kirim Pengajuan"** $\rightarrow$ Pengajuan masuk status `Pending`.
2. **Admin Side (`/admin`):**
   - Buka `/admin/login` dan masuk sebagai `admin123`.
   - Pilih menu **"Pengajuan Destinasi"**.
   - Klik **"Inspeksi"** pada pengajuan baru untuk mengecek koordinat di peta.
   - Klik **"Setujui (Approve)"** $\rightarrow$ Destinasi seketika terbit di peta publik dan pengguna menerima notifikasi.

### Skenario B: Itinerary Planner, Check-in, Jurnal Cloud & Timelapse Replay
1. Masuk ke tab **"Rencana"** (`/itinerary` atau `/rencana`).
2. Tentukan titik awal keberangkatan (GPS atau pilih di peta).
3. Pilih 3–5 destinasi dari Wishlist (serta tambahkan rekomendasi populer opsional).
4. Klik **"Hitung Rute & Ringkasan"** untuk melihat estimasi rute jalan (ETA) dan polyline.
5. Klik **"Mulai Perjalanan"** $\rightarrow$ Lakukan simulasi tombol **"Check-in di Sini"** pada tiap titik kunjungan.
6. Selesaikan perjalanan $\rightarrow$ Buka tab **"Riwayat"** $\rightarrow$ Unggah foto/video jurnal ke Supabase.
7. Klik **"Putar Ulang Perjalanan"** untuk menyaksikan animasi pergerakan rute dan sorotan foto dokumentasi 3D.

---

## ❓ Troubleshooting

| Kendala | Penyebab Umum | Solusi |
| :--- | :--- | :--- |
| `SQLSTATE[XX000]: ... extension "postgis" is not available` | Modul PostGIS belum terinstal di server PostgreSQL | Instal PostGIS di OS Anda (misal di Ubuntu: `sudo apt install postgresql-15-postgis-3`, di Windows centang PostGIS pada Stack Builder). |
| `Network Error / Failed to fetch /api/...` | Backend Laravel belum berjalan | Pastikan perintah `php artisan serve` aktif dan berjalan di `http://127.0.0.1:8000`. |
| Gagal upload foto avatar / media jurnal | Kunci Supabase belum disetel di `.env` backend | Pastikan `SUPABASE_URL`, `SUPABASE_KEY` (service role), dan `SUPABASE_BUCKET=destinations` telah terisi di `be-jabarpleasure/.env`. |
| Gambar Supabase tidak muncul di frontend | Hostname Supabase belum diizinkan di Next.js | Periksa `next.config.ts`, pastikan domain `*.supabase.co` terdaftar pada `images.remotePatterns`. |
| `403 Forbidden` saat mengakses panel `/admin` | Akun yang login tidak memiliki peran administrator | Gunakan akun `admin123` di `http://localhost:3000/admin/login`. |
