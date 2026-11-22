# JabarPleasure: Jawa Barat Public Leisure & Entertainment Spatial Guide

Platform *Geographic Information System* (WebGIS) modern dan terpersonalisasi yang menyajikan rekomendasi tempat hiburan dan destinasi wisata di 27 Kabupaten/Kota Provinsi Jawa Barat secara interaktif dan presisi.

Aplikasi ini dibangun menggunakan arsitektur *Decoupled* (Frontend dan Backend terpisah):
- **Frontend (`fe-jabarpleasure`):** Next.js 15 (React 19), Tailwind CSS, Leaflet.js / MapLibre GL, Three.js (Timelapse 3D).
- **Backend (`be-jabarpleasure`):** Laravel 11, PHP 8.2+, REST API, Laravel Sanctum (Autentikasi Bearer Token).
- **Basis Data Spasial:** PostgreSQL 15+ dengan ekstensi **PostGIS 3+** (SRID 4326 / WGS84).

---

## 📋 Prasyarat Sistem (Prerequisites)

Sebelum melakukan instalasi, pastikan sistem pengujian Anda telah terpasang:

1. **Node.js:** Versi `18.x` atau `20.x` (LTS direkomendasikan) serta `npm` / `pnpm` / `yarn`.
2. **PHP:** Versi `>= 8.2` dengan ekstensi aktif:
   - `pdo_pgsql` & `pgsql`
   - `mbstring`, `openssl`, `curl`, `fileinfo`, `xml`, `tokenizer`
3. **Composer:** Versi `>= 2.x`.
4. **PostgreSQL:** Versi `>= 15` dengan modul ekstensi **PostGIS** terpasang.

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

### 2. Instalasi & Menjalankan Backend (`be-jabarpleasure`)

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

4. Buka file `.env` dan sesuaikan koneksi database PostgreSQL Anda:
   ```env
   DB_CONNECTION=pgsql
   DB_HOST=127.0.0.1
   DB_PORT=5432
   DB_DATABASE=JabarPleasure
   DB_USERNAME=postgres
   DB_PASSWORD=password_postgres_anda
   ```

5. Generate application key:
   ```bash
   php artisan key:generate
   ```

6. Jalankan migrasi dan seeder untuk mengisi data awal:
   ```bash
   php artisan migrate --seed
   ```
   > **Catatan Seeder:** Perintah ini akan otomatis mengisi master kategori wisata, daftar 27 Kabupaten/Kota Jawa Barat, ratusan data POI destinasi wisata awal, akun pengujian wisatawan (*Nabila Putri*), dan akun administrator (*admin123*).

7. Buat symbolic link untuk direktori storage upload:
   ```bash
   php artisan storage:link
   ```

8. Jalankan server pengembangan backend Laravel:
   ```bash
   php artisan serve
   ```
   Server backend akan berjalan di **`http://127.0.0.1:8000`**.

---

### 3. Instalasi & Menjalankan Frontend (`fe-jabarpleasure`)

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
   Pastikan isi `.env.local` adalah:
   ```env
   NEXT_PUBLIC_API_URL=/api
   NEXT_PUBLIC_SUPABASE_URL=https://nruydgxivzixylaxoced.supabase.co
   NEXT_PUBLIC_SUPABASE_BUCKET=destinations
   ```
   *(Frontend Next.js telah dikonfigurasi melalui `next.config.ts` untuk merewrite kueri `/api/*` secara otomatis menuju `http://127.0.0.1:8000/api/*`)*.

4. Jalankan server frontend:
   ```bash
   npm run dev
   ```
   Frontend Next.js akan berjalan di **`http://localhost:3000`**.

---

## 🔑 Kredensial Akun Pengujian (Testing Accounts)

Untuk mempermudah demonstrasi dan pengujian fungsionalitas aplikasi, gunakan akun bawaan yang telah disediakan oleh seeder database:

### 1. Akun Wisatawan / Pengguna Terdaftar (Role: `user`)
* **Email:** `nabila.putri@gmail.com`
* **Kata Sandi:** `password123`
* **Akses Login:** Buka `http://localhost:3000/login`
* **Fitur yang dapat diuji:**
  - Personalisasi feed rekomendasi wisata
  - Pencarian destinasi & filter spasial radius proksimitas 5 km
  - Simpan dan kelola Wishlist favorit
  - Pengajuan destinasi baru (*Suggest Destination*) jika tidak menemukan tempat yang dicari
  - Penyusunan Itinerary perjalanan 3-5 destinasi & rute jalan raya (ETA)
  - Simulasi Check-in lokasi di titik perjalanan (mendukung offline mode fallback)
  - Riwayat perjalanan, upload media jurnal, dan pemutaran ulang rute *Interactive Timelapse Replay* 3D
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
  - **Moderasi Media:** Meninjau dan menghapus foto/video dokumentasi perjalanan pengguna yang tidak pantas
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

### Skenario B: Itinerary Planner, Check-in & Timelapse Replay
1. Masuk ke tab **"Rencana"** (`/itinerary` atau `/rencana`).
2. Tentukan titik awal keberangkatan (GPS atau pilih di peta).
3. Pilih 3–5 destinasi dari Wishlist (serta tambahkan rekomendasi populer opsional).
4. Klik **"Hitung Rute & Ringkasan"** untuk melihat estimasi rute jalan (ETA) dan polyline.
5. Klik **"Mulai Perjalanan"** $\rightarrow$ Lakukan simulasi tombol **"Check-in di Sini"** pada tiap titik kunjungan.
6. Selesaikan perjalanan $\rightarrow$ Buka tab **"Riwayat"** $\rightarrow$ Klik **"Putar Ulang Perjalanan"** untuk menyaksikan animasi pergerakan rute dan sorotan foto dokumentasi 3D.

---

## ❓ Troubleshooting

| Kendala | Penyebab Umum | Solusi |
| :--- | :--- | :--- |
| `SQLSTATE[XX000]: ... extension "postgis" is not available` | Modul PostGIS belum terinstal di server PostgreSQL | Instal PostGIS di OS Anda (misal di Ubuntu: `sudo apt install postgresql-15-postgis-3`, di Windows centang PostGIS pada Stack Builder). |
| `Network Error / Failed to fetch /api/...` | Backend Laravel belum berjalan | Pastikan perintah `php artisan serve` aktif dan berjalan di `http://127.0.0.1:8000`. |
| Gambar destinasi tidak muncul | Tautan penyimpanan storage belum dibuat | Jalankan `php artisan storage:link` pada direktori `be-jabarpleasure`. |
| `403 Forbidden` saat mengakses panel `/admin` | Akun yang login tidak memiliki peran administrator | Gunakan akun `admin123` di `http://localhost:3000/admin/login`. |
