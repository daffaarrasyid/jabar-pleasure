# Design System: JabarPleasure

> **Project:** JabarPleasure: Jawa Barat Public Leisure & Entertainment Spatial Guide
> **Version:** 1.0.0
> **Status:** Active
> **Last Updated:** 6 Oktober 2026

---

## 1. Design Direction

JabarPleasure dirancang sebagai platform WebGIS yang modern, bersih, dan berfokus pada kemudahan penggunaan (usability) dalam mengeksplorasi destinasi pariwisata di Jawa Barat. Desain mengutamakan pendekatan **Mobile-First** untuk memastikan kelancaran navigasi, interaksi peta, dan fitur spasial lainnya saat digunakan oleh pengguna di lapangan melalui perangkat *smartphone*.

## 2. Design Principles

1. **Utamakan Fungsi & Ruang Spasial:** Antarmuka tidak boleh menutupi peta sebagai elemen utama eksplorasi. Panel, kartu, dan filter harus bersifat *floating* (melayang) atau *collapsible* (dapat disembunyikan).
2. **Mobile-First & Tappable:** Semua tombol aksi utama (seperti *Check-in*, navigasi, dan *filter*) harus mudah dijangkau oleh ibu jari (zona *tappable* minimal 48x48px) saat dioperasikan dengan satu tangan.
3. **Personalisasi yang Halus:** Rekomendasi destinasi disajikan secara prediktif namun tidak memaksa (sugestif). Pengguna tetap memiliki kendali penuh atas eksplorasi mereka.
4. **Konsistensi Visual:** Menggunakan palet warna, tipografi, dan elemen antarmuka yang seragam di seluruh halaman aplikasi untuk mengurangi beban kognitif.

## 3. Brand & Visual Identity

Identitas visual didasarkan pada elemen alam dan pemetaan:

* **Logo:** Menggunakan ikon penanda lokasi (pin peta) dengan siluet pohon/jamur di ruang negatif bagian tengahnya.
* **Brand Vibe:** Segar, ramah, dapat diandalkan, dan berjiwa petualang.
* **Treatment Visual Utama:** Penggunaan gradien halus dari Biru ke Hijau (Teal) untuk elemen merek (seperti *splash screen* dan logo).

## 4. Color System

Berdasarkan *brand guideline* dan *mockup* yang tersedia, warna utama proyek ini adalah:

### Brand Colors

* **Primary (Blue):** `#4941EC` - Digunakan untuk tombol utama, *active states*, tautan, dan *branding* utama.
* **Secondary (Teal/Green):** `#60CE9F` - Digunakan untuk gradien merek, penanda destinasi alam, dan status sukses ( *success* ).
* **Accent (Orange/Yellow):** `#EDAD40` - Digunakan untuk *rating* bintang, peringatan ( *warning* ), dan sorotan destinasi populer.

### Neutral Colors (Rekomendasi)

* **Background:** `#F9FAFB` (Gray-50) - Latar belakang utama aplikasi agar elemen kartu (*cards*) menonjol.
* **Surface/Card:** `#FFFFFF` (White) - Latar belakang untuk kartu detail, formulir, dan *bottom sheet*.
* **Text Primary:** `#111827` (Gray-900) - Untuk *heading* dan teks utama.
* **Text Secondary:** `#6B7280` (Gray-500) - Untuk teks pendukung, *placeholder*, dan ikon tidak aktif.
* **Borders:** `#E5E7EB` (Gray-200) - Untuk garis batas elemen input dan *divider*.

### Gradient

* **Brand Gradient:** Linear gradient dari `#4941EC` (Top) ke `#60CE9F` (Bottom). Digunakan pada *splash screen* dan ornamen grafis besar.

## 5. Typography

Gunakan *font* *sans-serif* yang bersih, modern, dan sangat terbaca pada ukuran kecil (rekomendasi: **Inter**, **Plus Jakarta Sans**, atau **Poppins**).

* **Heading 1 (H1):** 24px, Bold (Untuk judul layar utama, e.g., "Mantapp", "Daftar").
* **Heading 2 (H2):** 20px, Semi-Bold (Untuk judul *section*, e.g., "Gunung terdekat untuk Anda").
* **Subtitle 1:** 16px, Medium (Untuk nama destinasi pada kartu).
* **Body 1:** 14px, Regular (Untuk deskripsi teks, *input text*).
* **Caption:** 12px, Regular (Untuk jarak km, label lokasi, label navigasi bawah).

## 6. Spacing System

Gunakan sistem *grid* berbasis **4px** untuk margin dan *padding*:

* `2xs`: 4px
* `xs`: 8px
* `sm`: 12px
* `md`: 16px (Padding standar untuk *container* mobile)
* `lg`: 24px
* `xl`: 32px
* `2xl`: 48px

## 7. Layout & Grid

* **Mobile Container:** Lebar maksimum `480px` rata tengah untuk tampilan web pada *desktop/tablet* untuk menjaga pengalaman aplikasi *mobile*.
* **Grid System:** 4 kolom untuk *mobile* dengan *gutter* 16px.
* **Layout Peta:** Peta dirender dalam kondisi layar penuh (*fullscreen background*), dengan komponen UI melayang di atasnya menggunakan metode `z-index` (*floating search bar*, *bottom navigation*, *bottom sheet*).

## 8. Responsive Design

Meskipun difokuskan pada *Mobile-First*, desain harus merespons ukuran layar yang lebih besar:

* **Mobile (Default):** `< 768px`. Peta *fullscreen*, *bottom navigation*, *bottom sheet* untuk detail lokasi.
* **Tablet/Desktop (`>= 768px`):** Layar dibagi dua. Bagian kiri/panel (30-40%) untuk navigasi, pencarian, dan *list* rekomendasi. Bagian kanan (60-70%) untuk *viewport* peta interaktif secara penuh.

## 9. Border Radius

Gaya antarmuka JabarPleasure sangat *rounded* (melengkung) dan bersahabat.

* **Pill / Full (`9999px`):** Tombol *floating*, label kategori, dan *badge*.
* **Large (`16px`):** *Card* destinasi, *input text*, *bottom sheet*, *modal*.
* **Medium (`8px`):** Ikon *background*, elemen kotak kecil.

## 10. Elevation & Shadows

* **Shadow-Sm:** Untuk *card* standar yang berada di atas latar abu-abu terang.
* **Shadow-Md:** Untuk elemen navigasi bawah (*bottom bar*) dan input pencarian yang melayang di atas peta.
* **Shadow-Lg:** Untuk *modal*, *bottom sheet* detail lokasi, dan *floating action button*.

## 11. Iconography

Gunakan *icon set* yang solid dan memiliki *outline* tebal yang konsisten (rekomendasi: **Heroicons** atau **Lucide Icons**).

* **Ukuran Default:** 24x24px untuk navigasi.
* **Ukuran Kecil:** 16x16px untuk ikon indikator pada teks (misalnya ikon lokasi di samping teks jarak).
* **Status Ikon:** Biru (`#4941EC`) untuk aktif, Abu-abu (`#6B7280`) untuk tidak aktif.

## 12. Imagery

* **Destination Photos:** Harus menggunakan *aspect ratio* yang konsisten pada *card* (misal: 1:1 atau 16:9) dengan *border-radius* atas `16px`.
* **Empty States / Onboarding Illustrations:** Gunakan gaya desain *flat* yang minimalis (seperti ilustrasi pemandangan alam).

## 13. Components

### Button

* **Purpose:** Untuk aksi primer (Daftar, Masuk, Lanjutkan, Simpan).
* **Variants:**
  * **Primary:** Latar `#4941EC`, Teks Putih, Radius *Large/Pill*.
  * **Outline:** Teks `#4941EC`, Border `#E5E7EB` (seperti tombol "Daftar dengan Google").
* **Responsive:** Lebar penuh (*full-width*) pada layar perangkat *mobile* untuk tombol aksi utama.

### Input

* **Purpose:** Formulir registrasi dan masuk.
* **Anatomy:** Label input (Biru/Primer) + *Input Field* + Ikon Kiri (opsional) + Ikon Kanan (seperti ikon 'mata' pada kata sandi).
* **States:** *Border* `#4941EC` saat aktif/ *focus*.

### Search & Filter

* **Anatomy:** *Input search* berbentuk *pill* melayang di atas peta, disertai ikon kaca pembesar dan tombol 'X' untuk membersihkan kueri. Di sampingnya terdapat tombol corong ( *filter* ) berbentuk persegi *rounded* dengan latar `#4941EC`.

### Card (Destination)

* **Purpose:** Menampilkan *Point of Interest* (POI).
* **Anatomy:** *Image cover* di bagian atas, *Badge* kategori spasial (misal: "Alam"), Judul Destinasi, Ikon Jarak + Teks (misal: "4.5 km"), serta *Rating* (Ikon Bintang + Teks, misal: "4.8" dengan warna `#EDAD40`).
* **Action:** Memicu *bottom sheet* untuk detail lebih lanjut dan rute.

### Map Components (Aturan WebGIS)

* **Map Container:** Layar penuh, menjadi dasar *layer* `z-index: 0`.
* **Markers:** Penanda titik tidak boleh berantakan. Gunakan *custom marker* (misalnya bentuk *pin drop* dengan warna sesuai kategori: `#4941EC` modern, `#60CE9F` alam).
* **Clustering:** Saat diperkecil (*zoom out*), *marker* **WAJIB** dikelompokkan (*marker clustering*) menjadi satu lingkaran berisi angka untuk menghindari penumpukan.
* **Bottom Sheet / Popup:** Saat *marker* diklik, jangan gunakan popup *default* yang kecil. Munculkan *bottom sheet* (panel geser dari bawah) pada perangkat *mobile* yang memuat informasi HTM, fasilitas, foto, tombol "Rute", tombol "Simpan", dan "Check-in".
* **Check-in Button:** Tombol aksi utama (F-08) pada *detail card* yang wajib berada di area bawah, mudah dijangkau satu tangan (NF-04).
* **Polyline/Routing (F-07):** Garis rute dari lokasi *user* ke tujuan menggunakan warna Primer `#4941EC` dengan ketebalan ( *stroke-width* ) `4-5px`.
* **Location Button (GPS):** Tombol bulat melayang (FAB) di sisi kanan bawah untuk memusatkan peta kembali ke lokasi pengguna terkini.

### Bottom Navigation

* **Anatomy:** 4 menu utama: Beranda, Peta, Favorit, Profil.
* **Active State:** Ikon berubah warna menjadi biru dengan indikator garis gradien biru melayang di atas teks.

### Category Tabs / Badges

* **Usage:** Filter kategori spasial (Semua, Alam, Modern, Kuliner, dll.).
* **Active State:** Latar biru (`#4941EC`), teks putih. *Inactive*: Latar putih, teks abu-abu.

## 14. Component States

* **Default:** Keadaan awal sesuai definisi komponen.
* **Hover:** Gelapkan warna utama sebesar 10% (untuk pengguna *desktop*).
* **Active / Pressed:** Skala komponen diturunkan menjadi `0.98` untuk umpan balik taktil.
* **Disabled:** Opasitas 50%, latar belakang abu-abu terang, warna kursor tidak diizinkan.
* **Loading:** Menampilkan *spinner* yang berputar atau teks memuat dengan titik-titik bergerak.

## 15. Forms & Validation Feedback

* **Validasi *Inline*:** Label peringatan diletakkan di sisi kanan atas *input field* (misalnya tulisan "FORMAT VALID" atau "MIN. 8 KARAKTER") dengan teks kecil berformat *uppercase*.
* **Error State:** Border input berubah merah (`#EF4444`), disertai pesan peringatan kecil di bawah input.

## 16. Loading & Skeleton

* **Map Loading:** Karena data Geospasial mungkin besar, saat memuat POI, tampilkan indikator "Memuat Peta..." yang *subtle* tanpa memblokir pergerakan *base map*.
* **Cards Loading:** Gunakan animasi *shimmering* (Skeleton UI) abu-abu terang dengan bentuk yang menyerupai `Destination Card`.

## 17. Empty States

* Saat tidak ada rekomendasi destinasi yang cocok dalam radius 5km (F-04), tampilkan ilustrasi pegunungan/taman sederhana dengan teks ramah seperti "Belum ada tempat hiburan terdeteksi di radius ini. Coba geser peta!"

## 18. Error States

* **GPS Denied:** Notifikasi peringatan (kuning/orange) apabila izin geolokasi peramban ditolak, meminta pengguna untuk mengaktifkannya agar fitur proksimitas berfungsi.
* **Offline Mode (NF-05):** Jika koneksi putus saat perjalanan (F-08), sistem tidak memunculkan pesan gagal, melainkan notifikasi *toast* netral: "Anda sedang luring. Status check-in disimpan lokal dan akan disinkronkan nanti".

## 19. Notifications & Feedback

* **Toast:** Modul *floating* melayang di sisi atas layar untuk memberi informasi keberhasilan sementara (misal: "Destinasi ditambahkan ke Rencana Perjalanan" atau media berhasil diunggah).
* **Alert Badge:** Lonceng notifikasi di sudut kanan atas dilengkapi *badge* merah bundar (misal: angka 2) untuk tanda aktivitas/pembaruan.

## 20. Animation & Motion

* **Animasi Transisi Halaman:** 200ms *ease-in-out* untuk perpindahan menu *bottom bar*.
* **Bottom Sheet:** Geser dari bawah ke atas (Slide up) saat destinasi diklik, 300ms *spring animation*.
* **Interactive Timelapse (F-10 / NF-02):** Pergerakan *marker* mobil/pengguna menyusuri *polyline* harus berjalan dengan interpolasi spasial yang halus, setidaknya **30fps** pada browser *mobile*, didukung oleh pergerakan peta ( *map panning* ) otomatis.

## 21. Accessibility

* **Warna Kontras:** Kombinasi latar belakang putih dan teks primer/sekunder memastikan kontras yang cukup untuk visibilitas di bawah terik matahari (ingat konteks *mobile web* di luar ruangan/perjalanan).
* **Ukuran Target Sentuh:** Semua elemen yang bisa diklik minimal berukuran 48x48 piksel.

## 22. Design Tokens

```css
/* Colors */
--color-primary: #4941EC;
--color-secondary: #60CE9F;
--color-accent: #EDAD40;
--color-bg-main: #F9FAFB;
--color-surface: #FFFFFF;
--color-text-primary: #111827;
--color-text-secondary: #6B7280;
--color-border: #E5E7EB;

/* Typography */
--font-sans: 'Inter', system-ui, sans-serif;

/* Spacing & Layout */
--radius-md: 8px;
--radius-lg: 16px;
--radius-pill: 9999px;
--container-mobile-max: 480px;

/* Shadows */
--shadow-card: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-floating: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
```

## 23. UI Anti-Patterns

* **TIDAK BOLEH** menggunakan pop-up standar *leaflet/mapbox* yang berukuran kecil dan sulit diklik dengan jari. Gunakan *bottom sheet*.
* **TIDAK BOLEH** menggunakan terlalu banyak warna yang bertabrakan di luar palet (Biru, Hijau, Oranye) untuk label titik POI.
* **TIDAK BOLEH** merender ratusan *marker* secara bersamaan tanpa fitur *clustering*. Ini merusak NF-02 (performa).
* **TIDAK BOLEH** meletakkan tombol krusial (Check-in, Mulai Perjalanan) di sudut atas layar (NF-04, di luar jangkauan jari).

## 24. Existing Component Policy

Jika *developer* menggunakan *framework* UI pendukung (seperti *shadcn/ui* atau *headless UI*), wajib untuk mengatur ulang ( *override* ) gaya *default*-nya agar persis mematuhi *border-radius*, warna, dan ketebalan garis sesuai Design System ini.

## 25. Design Change Policy

Perubahan pada warna utama, struktur WebGIS (metode rendering *marker*), dan perombakan arsitektur *mobile-first* tidak boleh dilakukan tanpa persetujuan Project Manager (Rifaldi) dan UI/UX Lead, karena akan berimbas langsung pada *Project Charter* dan parameter keberhasilan proyek.

## 26. Implementation Checklist

* [ ] Sistem token warna sudah dimasukkan (e.g., `tailwind.config.js`).
* [ ] Integrasi *font* utama telah aktif (Inter / Plus Jakarta Sans).
* [ ] Komponen dasar (Button, Input, Card) sesuai dengan anatomi yang diatur.
* [ ] *Plugin* *Marker Clustering* WebGIS terinstal dan aktif.
* [ ] Interaksi klik *marker* pada peta memicu *Bottom Sheet*, bukan pop-up tradisional.
* [ ] Navigasi dan antarmuka dapat dioperasikan secara penuh dalam rasio layar *mobile* (lebar max 480px).

---

## Aturan untuk AI Coding Agent

AI coding agent:

* MUST follow this Design System.
* MUST reuse existing components when applicable.
* MUST follow the defined design tokens (especially the precise hex codes provided).
* MUST maintain responsive behavior, strictly enforcing the mobile-first layouts defined.
* MUST follow accessibility requirements (tappable areas minimal 48px).
* MUST NOT introduce arbitrary colors, typography, spacing, radius, or visual patterns without justification.
* MUST NOT redesign existing UI unless explicitly instructed.
* MUST NOT introduce a new component when an existing component can reasonably be reused.
* MUST NOT modify the Design System merely to make an individual feature easier to implement unless the change is justified and explicitly approved.
* MUST implement map interaction specifically using the `Bottom Sheet` paradigm instead of traditional map popups to satisfy mobile-first constraints.