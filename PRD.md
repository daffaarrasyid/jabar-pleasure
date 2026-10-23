# Product Requirements Document (PRD)

> **Project:** JabarPleasure: Jawa Barat Public Leisure & Entertainment Spatial Guide
> **Version:** 1.0.0
> **Status:** Active
> **Last Updated:** 6 Oktober 2026

---

# 1. Product Overview

## 1.1 Product Name

JabarPleasure: Jawa Barat Public Leisure & Entertainment Spatial Guide

## 1.2 One-Line Description

Platform berbasis *Geographic Information System* (GIS) yang menyajikan rekomendasi tempat hiburan dan destinasi wisata di Jawa Barat secara interaktif, presisi, dan terpersonalisasi.

## 1.3 Problem Statement

Proyek ini dikembangkan karena:

* Terdapat ketimpangan promosi pembangunan yang membuat kunjungan wisatawan hanya terpusat pada kawasan tertentu saja, seperti Kota Bandung atau Bogor.
* Wisatawan sering kesulitan untuk menemukan destinasi yang sesuai dengan preferensi dan minat spesifik mereka.
* Banyak lokasi wisata potensial dan UMKM lokal di daerah lain yang tidak mendapatkan eksposur yang cukup.

## 1.4 Target Users

Primary users:

* **Pengunjung**: Masyarakat umum yang belum login dan membuka aplikasi.
* **User Terdaftar**: Pengguna (wisatawan) yang memiliki akun untuk menggunakan fitur personalisasi, perencanaan, dan rekam jejak perjalanan.

Secondary users:

* **Admin**: Pengelola sistem yang bertugas menyetujui pengajuan lokasi baru, mengelola dashboard analitik, dan memoderasi media pengguna.

## 1.5 Product Goal

The primary goal of this product is:

> Mendorong pemerataan eksposur pariwisata di seluruh Provinsi Jawa Barat dengan memfasilitasi eksplorasi wisatawan melalui antarmuka peta digital interaktif serta sistem rekomendasi cerdas yang beradaptasi dengan perilaku pengguna.

---

# 2. Product Scope

## 2.1 In Scope

The current product scope includes:

* Ekstraksi dan integrasi data spasial untuk pemetaan *Point of Interest* (POI) destinasi di seluruh 27 Kabupaten/Kota Jawa Barat.
* Pencarian lokasi wisata berdasarkan filter kategori dan radius jarak proksimitas spasial (5km).
* Sistem rekomendasi tempat hiburan yang dipersonalisasi berdasarkan perilaku pengguna (*behavior* riwayat klik) dan *onboarding*.
* Pembuatan *Itinerary Planner* harian, penyediaan *Polyline routing*, kalkulasi ETA, dan fitur *check-in* titik perjalanan.
* Fitur *Media Journaling* dan *Interactive Timelapse Replay* animasi rute perjalanan.
* Dashboard moderasi konten, analitik tren kategori wisata, dan penyetujuan data spasial baru bagi Administrator.

## 2.2 Out of Scope

The following are explicitly outside the current scope:

* Pengembangan sistem atau fitur transaksi keuangan (pembayaran).
* Sistem reservasi dan pemesanan tiket wisata (*ticketing*).
* Pemetaan atau pencarian destinasi wisata yang berada di luar wilayah administratif Provinsi Jawa Barat.

**Agents MUST NOT implement out-of-scope functionality unless explicitly instructed by the user.**

---

# 3. Core Features

## 3.1 Pencarian & Filter Spasial (F-04)

**Purpose**

Membantu pengguna menemukan destinasi pariwisata terdekat dengan batasan radius tertentu secara mudah dan akurat.

**User Story**

> As a User Terdaftar, I want to melakukan pencarian berdasarkan kategori destinasi dan memfilternya dalam radius jarak 5km, so that saya dapat segera menemukan tempat hiburan di sekeliling saya secara spesifik.

**Requirements**

* Sistem memungkinkan pencarian spesifik berdasarkan kategori destinasi wisata.
* Sistem memiliki kemampuan untuk menghitung filter proksimitas dalam radius 5km di seluruh wilayah 27 Kabupaten/Kota Jawa Barat.

**Acceptance Criteria**

* [ ] Hasil pencarian destinasi dibatasi ketat untuk lokasi yang berjarak maksimal 5km dari titik lokasi pengguna.
* [ ] Lokasi POI yang ditampilkan dipastikan berada dalam peta area Jawa Barat.

---

## 3.2 Personalisasi Rekomendasi (F-03)

**Purpose**

Memberikan pengalaman eksplorasi otomatis yang menyesuaikan dengan gaya wisata masing-masing pengguna.

**User Story**

> As a User Terdaftar, I want to melihat section khusus "Tempat Hiburan untuk Anda", so that saya dapat secara instan menemukan rekomendasi tempat yang cocok dengan riwayat aktivitas saya.

**Requirements**

* Sistem harus mampu menyajikan rekomendasi *Personalized Feed* secara otomatis di halaman peta utama.
* Kalkulasi rekomendasi bersumber dari data awal yang dipilih saat *onboarding* pengguna baru.
* Sistem wajib mengadaptasi rekomendasi dengan melacak *behavior* berdasarkan riwayat klik pengguna pada destinasi wisata.

**Acceptance Criteria**

* [ ] Sistem membaca dan menyimpan pilihan pengguna pada fitur survei *onboarding*.
* [ ] *Behavior analytics* secara aktif melacak dan mencatat riwayat pencarian destinasi pengguna.
* [ ] *Section* rekomendasi menampilkan lokasi yang akurat dengan pembobotan *behavior* pengguna tersebut.

---

## 3.3 Itinerary Planner & Rekomendasi Destinasi Populer (F-06 & F-15)

**Purpose**

Memudahkan wisatawan menyusun rencana kunjungan rute destinasi mereka dengan menyertakan saran berbasis pengalaman keramaian ( *crowd-based* ).

**User Story**

> As a User Terdaftar, I want to menyusun Rencana Perjalanan menggunakan lokasi favorit saya, so that saya dapat melihat rute kunjungannya dan menerima saran tambahan terkait destinasi populer di sekitarnya.

**Requirements**

* Sistem mengizinkan pengguna untuk memasukkan 3-5 tempat wisata dari keranjang *Wishlist* ke dalam rencana *Itinerary Planner*.
* Sistem mengaktifkan tampilan "Rekomendasi Destinasi Populer" dengan membaca data frekuensi *Check-in* tertinggi dari pengguna lain (F-15).
* Kehadiran saran destinasi *crowd-based* bersifat opsional; pengguna tidak dipaksa untuk menambahkannya ke dalam rutenya.

**Acceptance Criteria**

* [ ] *Itinerary planner* dapat menyimpan 3 hingga 5 entitas destinasi per siklus perjalanan.
* [ ] Daftar saran destinasi menampilkan lokasi secara berurutan sesuai jumlah rekam *check-in* terbanyak.
* [ ] Proses perhitungan rute ETA (F-07) dapat dilanjutkan terlepas dari pengguna menekan tombol penambahan rekomendasi atau tidak.

---

# 4. User Flows

## 4.1 Alur Eksplorasi & Rencana Perjalanan

```text
[Mulai: Buka Aplikasi]
   ↓
[Sudah punya akun?]
  ↙ (Tidak)            ↘ (Ya)
[F-01: Registrasi]       ↓
  ↓                      ↓
[F-01: Login] ←←←←←←←←←←←
   ↓
[Login pertama kali?]
  ↙ (Ya)                                   ↘ (Tidak)
[F-02: Onboarding Preference]                ↓
   ↓                                         ↓
[Beranda Aplikasi] ←←←←←←←←←←←←←←←←←←←←←←←←←←
   ↓
[F-03: Tampilkan Rekomendasi 'Tempat Hiburan untuk Anda']
   ↓
[F-04: Pencarian & Filter Spasial (kategori + radius 5km)]
   ↓
[Lihat Detail Destinasi di Peta]
   ↓
[Tertarik simpan?]
  ↙ (Ya)                           ↘ (Tidak)
[F-05: Simpan ke Wishlist]           ↓
  ↓                                  ↓
  →→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→
   ↓
[F-06: Buka Itinerary Planner]
   ↓
[Pilih 3-5 Destinasi dari Wishlist]
   ↓
[F-15: Sistem tampilkan Rekomendasi Destinasi Populer]
   ↓
[Tambahkan rekomendasi ke rencana?]
  ↙ (Ya, opsional)                  ↘ (Tidak, lanjut saja)
[Tambahkan destinasi terpilih]        ↓
  ↓                                   ↓
  →→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→
   ↓
[F-07: Sistem hitung Routing & ETA antar destinasi]
   ↓
[Mulai Perjalanan]
```

*(Direpresentasikan berdasarkan Diagram Alur User)*.

## 4.2 Alur Aktivitas Pelaksanaan Perjalanan (Check-in & Jurnal)

```text
[Mulai Perjalanan]
   ↓
[Menuju Destinasi]
   ↓
[F-08: Check-in di Lokasi (simpan koordinat & timestamp)]
   ↓
[Upload dokumentasi sekarang?]
  ↙ (Ya)                                   ↘ (Nanti saja)
[F-09: Upload Media Journaling]              ↓
  ↓                                          ↓
[Masih ada destinasi berikutnya di itinerary?] ←
  ↙ (Ya)                           ↘ (Tidak)
[Menuju Destinasi berikutnya]      [Perjalanan Selesai]
                                     ↓
                                   [Buka Menu Histori Perjalanan]
                                     ↓
                                   [Ada check-in tanpa dokumentasi?]
                                     ↙ (Ya)                                   ↘ (Tidak)
                                   [F-09: Lengkapi Media Journaling]            ↓
                                     ↓                                          ↓
                                     →→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→
                                     ↓
                                   [Mau putar ulang rute?]
                                     ↙ (Ya)                                   ↘ (Tidak)
                                   [F-10: Interactive Timelapse Replay]       [Selesai]
                                     ↓                                          ↑
                                     →→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→
```

*(Direpresentasikan berdasarkan Diagram Alur User)*.

---

# 5. Functional Requirements

| ID | Requirement | Priority |
| --- | --- | --- |
| F-01 | Autentikasi & Akun: Sistem form registrasi, login, dan validasi pengguna. | Must |
| F-02 | Onboarding Preference: Kuesioner survei minat pengguna saat *login* awal. | Must |
| F-03 | Personalisasi Rekomendasi: Modul analisis data *onboarding* dan *behavior* riwayat. | Must |
| F-04 | Pencarian & Filter Spasial: Filter lokasi radius 5km di Jabar. | Must |
| F-05 | Wishlist Destinasi: Sistem penyimpanan koleksi favorit. | Must |
| F-06 | Itinerary Planner: Pembuatan jadwal dari 3-5 destinasi dari Wishlist. | Must |
| F-07 | Routing & Kalkulasi ETA: Pemanggilan API Routing dan penggambaran *Polyline* di atas peta. | Must |
| F-08 | Check-in Perjalanan: Sistem log pencatatan koordinat GPS dan *timestamp* lokasi. | Should |
| F-11 | Pengajuan Destinasi Baru: Formulir penginputan koordinat dan informasi POI dari pengguna. | Should |
| F-12 | Validasi Data Spasial POI: *Interface* *Approve/Reject* pada *dashboard* Admin. | Must |
| F-13 | Dashboard Analitik Behavior: Grafik agregat pencarian sistem bagi Admin. | Should |
| F-14 | Moderasi Media & Pengguna: Logika API untuk memblokir akun dan menghapus media ilegal. | Should |
| F-15 | Rekomendasi Destinasi Populer: Sistem peringkasan agregasi jumlah check-in pengguna pada modul Itinerary. | Should |
| F-09 | Media Journaling: Sistem pengunggah *file* dan relasi penyimpanan media foto/video. | Could |
| F-10 | Interactive Timelapse Replay: Modul animasi *marker* di atas *basemap* (Leaflet.js) secara berkelanjutan. | Could |

*(Prioritas diklasifikasikan dengan pertimbangan catatan risiko batas MVP dari dokumen manajerial proyek)*.

---

# 6. Non-Functional Requirements

## Kinerja (Performance)

* **NF-02**: Komponen animasi pergerakan *marker timelapse* rute (F-10) harus berjalan mulus mencapai 30fps ketika diakses melalui *browser* HP.
* **NF-02**: Operasi pada kueri analitik dashboard (F-13) tidak diperbolehkan menghambat atau memperlambat respons koneksi API utama lebih dari batas maksimum 3 detik.
* Avoid unnecessary API requests.
* Avoid unnecessary rendering or computation.

## Keamanan (Security)

* **NF-01**: Seluruh sandi pengguna wajib dienkripsi dan disimpan dalam format *Hash*.
* **NF-01**: Endpoint rute *Dashboard Admin* (F-12, F-13, F-14) harus diproteksi dengan otorisasi JWT atau mekanisme *Role-Based Access Control* (RBAC) tingkat tinggi.
* **NF-01**: Setiap akses ilegal dari pengguna tanpa peran berhak ke panel Admin wajib digagalkan dan mengembalikan status respon `403 Forbidden`.
* Validate user input.
* Never expose secrets or credentials in source code.

## Kapasitas (Capacity)

* **NF-03**: Kebutuhan ruang simpan *Media Journaling* (F-09) dibatasi secara ketat di server aplikasi, dengan batas atas 2MB untuk media Foto, dan maksimal 10MB (kurang lebih durasi 15 detik) untuk media Video.

## Kebergunaan (Usability)

* **NF-04**: Seluruh rancangan interaktif antarmuka WebGIS harus menggunakan pendekatan prinsip *Mobile-First*.
* **NF-04**: Penempatan antarmuka seperti pop-up informasi (*detail card*) dan tombol "Check-in" harus berada pada zona tap yang mudah dijangkau dengan operasi satu tangan (*tappable*).

## Keandalan (Reliability)

* **NF-05**: Sistem dilengkapi *Offline Mode*. Jika koneksi internet pengguna terputus saat berada di area perjalanan pegunungan/pantai, data koordinat dan status "Check-in" ditahan ke dalam memori *Local Storage* *browser*, kemudian harus secara otomatis disinkronkan (*sync*) kembali ke server ketika ketersediaan sinyal internet membaik.

---

# 7. Data Requirements

The product requires the following major data entities:

## Akun / Entitas Pengguna (Users)

* Autentikasi sandi Hash pengguna (Pengunjung/Admin)
* Atribut rekaman hasil *Onboarding Preference Survey*
* Indikator status *Role-Based Access* (Admin / User Terdaftar)

## Data Destinasi & Spasial (Point of Interest)

* Titik spasial (Koordinat Geometri lokasi POI destinasi)
* Atribut Data: Kategori lokasi, nama destinasi, operasional, dll.
* Log pengajuan koordinat destinasi wisata baru (Status *Pending/Approved*)

## Entitas Aktivitas dan Perilaku (Behavior & Journey)

* Tabel `log_behavior` yang mencatat frekuensi pencarian terbanyak dan tren riwayat klik pengguna
* Entitas penyusunan Itinerary Planner dan keranjang daftar `Wishlist`
* Tabel `journeys` untuk mencatat metrik rute, koordinat rekaman `Check-in`, serta lampiran URL penyimpanan `Media Journaling` (foto/video pengguna)

---

# 8. Error & Edge Cases

The product must properly handle:

* **Autentikasi Invalid**: Ketika pengguna memicu kelas partisi invalid (seperti mengisi kata sandi yang salah pada form *login*), sistem harus menampilkan *handling error* yang sesuai.
* **Pelanggaran Batasan Otorisasi**: Akses tidak sah dari entitas `User Terdaftar` biasa menuju tautan URL administratif harus secara tegas di-*intercept* dengan status kesalahan API.
* **Batas Media Melampaui Kuota**: Pengguna dihalangi dan menerima notifikasi peringatan spesifik ketika mencoba melakukan unggahan *Media Journaling* berformat Video > 10MB atau Foto > 2MB.
* **Kegagalan Jaringan Geospasial**: Pengamanan integritas data lokasi ketika sinyal 4G/5G menghilang saat tombol *check-in* ditekan.
* **Kebebasan Pengabaian Rekomendasi**: Dalam modul *Itinerary Planner*, algoritma pengarah rute *Polyline* dilarang mengalami kendala atau memaksa henti (error) ketika pengguna (User Terdaftar) membiarkan / tidak menambahkan rekomendasi populer (*Crowd-based check-in*) ke dalam urutan perjalanannya.
* Loading states and missing data gracefully handled based on general practices.

---

# 9. UX Principles

The product should feel:

* *Responsive* dan sangat *Mobile-First* saat mengoperasikan peta interaktif.
* *Tappable*, sehingga tombol krusial aksi geografis mudah dieksekusi satu tangan tanpa memecah konsentrasi perjalanan pengguna.
* Bersifat opsional dan mendukung (*Sugestif*), terutama pada fitur rekomendasi JabarPleasure; tidak memaksa arah interaksi *behavioral* pengguna secara utuh.

---

# 10. Success Criteria

The product is considered successful when:

* Aplikasi mampu meninjau akurasi letak pemetaan visual titik POI di permukaan WebGIS secara teliti dan informatif.
* Kinerja *routing* ETA dan kueri analitik behavior (pencarian radius/data dashboard) merespons metrik eksekusi secara efisien (responsivitas kueri API tinggi/ < 3 detik).
* Aplikasi memberikan *user experience* dan perenderan antarmuka peta serta animasi dengan stabilitas yang kuat.
* Implementasi integrasi *Point of Interest* dan rilis aplikasi versi akhir terjadi sesuai target waktu secara tepat di tanggal *deadline* pada 14 Desember 2026.

---

# 11. Constraints

The project has the following constraints:

* **Technology constraint**: Sistem informasi hanya boleh disusun dan terintegrasi menggunakan perpaduan WebGIS ekosistem *decoupled* API yang diputuskan (React/Next.js UI, Node.js/Laravel, dan fondasi *engine* PostgreSQL+PostGIS).
* **Geographic constraint**: Sistem, algoritma rekomendasi, dan filter pencarian radius jarak secara eksklusif dikunci ketat hanya meliputi 27 lingkup Kabupaten dan Kota dalam Provinsi Jawa Barat.
* **Time constraint**: Target komitmen *timeline milestone* rilis penyelesaian peluncuran final produk ditenggat pada kalender 14 Desember 2026.
* **Budget constraint**: Ketersediaan total kerangka Rencana Anggaran Biaya proyek adalah Rp 10.050.000,- yang dialokasikan menyeluruh ke tim pengembang.

---

# 12. Open Questions

Items that are not yet decided:

* **Kalkulasi Jalur Rute Peta (Routing Network)**: Apakah fungsi perhitungan parameter ETA jarak tempuh perjalanan akan bergantung pada API Routing servis pihak ketiga yang sudah jadi (seperti OSRM/Google Maps API), atau memandatkan penyiapan konfigurasi arsitektur jaringan mandiri (*road network*) di ekosistem pgRouting basis data internal proyek?.
* **Eksistensi Fitur Berkinerja Tinggi**: Terkait mitigasi ruang gerak *scope creep*, apakah kelengkapan integrasi animasi 30fps fungsi *Interactive Timelapse Replay* dan ukuran unggah file *Media Journaling* akan direvisi (*downgrade*) atau dibiarkan untuk menjaga kesinambungan beban kerja Front-end Developer?.

Agents MUST NOT make major product decisions based on assumptions when an open question affects architecture, security, data, or core user flow.

---

# 13. Change Log

| Version | Date | Change |
| --- | --- | --- |
| 1.0.0 | 6 Oktober 2026 | Pembentukan inisiasi Product Requirements Document (PRD) versi dasar berdasarkan ekstraksi Project Charter, diagram antarmuka pengguna, serta SRS Requirement Geospasial. |