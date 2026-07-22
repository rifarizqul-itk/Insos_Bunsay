# **FRONTEND DEVELOPMENT HANDOVER SPECIFICATION (V4 - UPDATED)**

## **Website Digitalisasi Pembayaran Sewa Kios**
### **Plaza Kebun Sayur Balikpapan**

| Informasi | Detail |
| :--- | :--- |
| **Ditujukan untuk** | LLM / Developer penerus implementasi front-end & back-end website |
| **Mitra** | Plaza Kebun Sayur Balikpapan |
| **Tim Pengembang** | Clara, Armansyah, Dawwas, Elsya, Indriani, Rifa, Patra, Tika, Dhia, Yael — Sistem Informasi & Aktuaria, ITK 2026 |
| **Dosen Pembimbing** | Hendy Indrawan Sunardi, S.Kom., M.Eng. |
| **Kontak Mitra** | 0811-5901-119 / info.plazabunsay@gmail.com |
| **Program** | Inovasi Sosial — Institut Teknologi Kalimantan, 2026 |
| **Versi Dokumen** | **V4.0 (Update Kodebase Final Frontend)** |
| **Terakhir Diperbarui** | Juli 2026 |

---

## **0. RIWAYAT PERUBAHAN HANDOVER & IMPLEMENTASI (CHANGELOG V3 → V4)**

Berikut adalah rangkuman resmi perubahan, penambahan fitur, serta penyempurnaan arsitektur yang telah diimplementasikan dalam codebase frontend `plaza-kebun-sayur-payment`:

1. **Pembaruan Tech Stack & Environment**:
   - Migrasi dan penyesuaian ke **React 18** (`^18.3.1`), **Vite 8** (`^8.1.0`), **Tailwind CSS v4** (`@tailwindcss/vite` & `@import "tailwindcss"`), **React Router v7** (`^7.16.0`), dan **@iconify/react** (`^6.0.2`).
   - Pendekatan Arah Estetika Teradopsi: **Modern Civic Precision** (DFII Score: 12.8 - *Excellent*).
   - Font visual utama menggunakan **Plus Jakarta Sans** via Google Fonts dengan konfigurasi hirarki ketat (*tight tracking* pada heading, *tabular-nums* pada data keuangan, *wide uppercase* pada label mikro), ukuran teks dasar minimum **15px** dan input **16px** (mencegah auto-zoom di iOS Safari).

2. **Pengembangan Sistem Rute & Komponen Halaman (Total 17 Halaman)**:
   - **Public Zone**:
     - `LandingPage.jsx` (`/`) – Halaman publik utama dengan informasi mitra, direktori kios, dan CTA login.
     - `AuthPage.jsx` (`/auth`) – Tampilan login terpadu tenant & admin dengan opsi remember-me.
     - `ForgotPassword.jsx` (`/auth/lupa-sandi`) – Formulir pemulihan kata sandi.
   - **Tenant Zone**:
     - `DashboardTenant.jsx` (`/tenant/dashboard`) – Dashboard sapaan personal, status service charge, dan ringkasan tunggakan.
     - `BayarSekarang.jsx` (`/tenant/pembayaran`) – Modul pembayaran terintegrasi Midtrans Snap Gateway, Transfer Bank (BNI/Mandiri), dan QRIS Manual beserta upload bukti transfer.
     - `HistoriPembayaran.jsx` (`/tenant/histori`) – Log transaksi tenant dengan status real-time.
     - `TunggakanAR.jsx` (`/tenant/tunggakan`) – Rincian tunggakan historis AR s/d Sept 2024, progres pelunasan, dan riwayat cicilan.
     - `AkunTenant.jsx` (`/tenant/akun`) – Profil pemilik, informasi unit kios, dan ubah kata sandi.
   - **Admin Zone**:
     - `DashboardAdmin.jsx` (`/admin/dashboard`) – Summary statistik (Total Tenant, Menunggu Verifikasi, Total Dana Terkumpul), tabel status bulan ini, dan modal verifikasi cepat.
     - `VerifikasiBuktiTransfer.jsx` (`/admin/verifikasi-bukti`) – Antrean khusus verifikasi bukti transfer (Terima / Tolak dengan catatan alasan).
     - `SetoranTunai.jsx` (`/admin/setoran-tunai`) – Form loket pencatatan pembayaran tunai langsung oleh admin di kantor pengelola beserta lampiran foto fisik bukti setoran.
     - `RiwayatTransaksiAdmin.jsx` (`/admin/riwayat`) – Log seluruh transaksi lintas metode (Tunai, Transfer, QRIS, Midtrans).
     - `KetersediaanKios.jsx` (`/admin/kios`) – Tabel pemetaan unit kios (Terisi, Kosong, Perlu Validasi) lengkap dengan fitur modal pendaftaran tenant baru (`createTenant`).
     - `DetailAdministrasiKios.jsx` (`/admin/detail-administrasi`) – Rincian legalitas kios (No. SP, No. PPJB, Tgl. BAST, No. Sertifikat, dan Histori Pengalihan Kepemilikan).
     - `DetailKeuanganTenant.jsx` – Drill-down view detail keuangan dan transaksi per tenant (diakses langsung dari `DashboardAdmin.jsx`).
     - `DetailTenantAdmin.jsx` – View detail tenant tambahan untuk kebutuhan manajemen admin.
     - `EksporData.jsx` (`/admin/ekspor`) – Halaman khusus ekspor rekap data transaksi dan kios ke file Excel `.xlsx` dengan filter periode bulan/tahun.

3. **Arsitektur State Global (React Context API)**:
   - **`AuthContext.jsx`**: Mengelola status autentikasi (`isLoggedIn`), peran (`tenant` / `admin`), data profil user, serta mekanisme persistensi di `localStorage` (remember-me) atau `sessionStorage`.
   - **`TransactionContext.jsx`**: Mengelola antrean verifikasi bukti transfer (`antrean`) dan log transaksi terpusat (`riwayat`), lengkap dengan handler `prosesVerifikasi`, `tambahAntrean`, dan `tambahRiwayat`.
   - **`UIContext.jsx`**: Mengelola sistem notifikasi Toast global (`addToast`, `removeToast`) serta props pemicu bayar cepat (`setBayar`).
   - **`useApi.js`**: Custom hook standar untuk mengisolasi logika fetching data asinkron, loading state, error state, dan fungsi `refetch`.

4. **Desain Responsif Hybrid & Aksesibilitas (WCAG 2.2 AA)**:
   - **Navigation System**: Navigasi bawah (`BottomNav.jsx`) pada perangkat seluler (< 768px) yang secara dinamis menyesuaikan menu berdasarkan peran (`adminItems` vs `tenantItems`). Navigasi desktop berupa Sidebar tetap (`Sidebar.jsx` & `SidebarAdmin.jsx`) selebar 240px.
   - **Reflow Tabel Responsif**: Penggunaan atribut HTML `data-label` pada elemen `<td>` dan rule CSS `@media (max-width: 768px)` di `index.css` yang secara otomatis mentransformasi tabel kaku menjadi kartu bertumpuk di layar smartphone.
   - **Aksesibilitas Sentuh**: Semua tombol dan elemen interaktif dijamin memiliki ukuran minimal `44px x 44px` (`min-height: 44px`) serta efek tekan `transform: scale(0.97)` untuk kenyamanan pengguna lansia/dewasa (usia 40+).
   - **Shared UI Components Teraksesibel**: Penggunaan `Icon.jsx` (`aria-hidden="true"`), `Table.jsx` (`<caption>`, `aria-label`, `scope="col"`, `<th scope="row">`), dan `FormField.jsx` (`htmlFor` + `id`, `aria-describedby`, `aria-invalid`) di seluruh 17 halaman.
   - **Global Navigation & Status**: Pemasangan Skip Link (`#main-app`), `document.title` dinamis rute, restorasi fokus modal, dan `role="status"` / `aria-live="polite"` pada toast & tombol aksi.

5. **Spesifikasi Integrasi Mock API & Backend**:
   - Pemisahan berkas API di `src/api/` (`admin.js`, `tenant.js`, `transactions.js`, `client.js`).
   - Penambahan aturan ENUM case-sensitive untuk status transaksi & kios (`"Lunas"`, `"Belum Bayar"`, `"Menunggu Verifikasi"`, `"Terisi"`, `"Kosong"`, `"Perlu Validasi"`).
   - Penambahan spesifikasi respons error JSON terstandar dalam bahasa Indonesia formal untuk mematuhi kriteria WCAG 3.3.1 & 3.3.3.

6. **Refaktorisasi Aksesibilitas WCAG 2.2 AA (Tahap 1, 2, & 3)**:
   - Refaktorisasi 100% lengkap pada 17 halaman aplikasi mengacu pada `@wcag-audit-patterns` dan `WALKTHROUGH.md` (`ENTRY 08`). Verified 0 build errors.

---

## **1. KONTEKS PROYEK**

### **1.1 Latar Belakang dan Tujuan**
Plaza Kebun Sayur Balikpapan adalah pusat perbelanjaan di Jalan Letjen Suprapto, Batu Ilir, Balikpapan Barat, Kalimantan Timur. Plaza ini menaungi 250 tenant aktif yang terdiri dari pedagang kerajinan, perhiasan, emas, fashion, aksesori, oleh-oleh, dan produk khas Kalimantan Timur. Jam operasional plaza ini berlangsung dari pukul 09.00 hingga 21.00 WITA setiap hari.  
Sistem pembayaran saat ini masih manual. Tenant wajib datang ke kantor pengelola di lantai 3 untuk membayar sewa, sangat bergantung pada jam operasional kantor, dan rentan terhadap kehilangan bukti pembayaran. Tujuan proyek ini adalah memigrasikan proses tersebut ke website digital yang menghubungkan tenant dan pengelola secara praktis dan efisien.

### **1.2 Target Keberhasilan dari Proposal**
* Minimal 80% tenant berhasil menggunakan sistem secara mandiri.  
* Rata-rata waktu proses pembayaran turun dari 30 menit (manual) menjadi 5 menit per transaksi.  
* Data pembayaran seluruh tenant tercatat terpusat dan dapat direkap otomatis.  
* Transparansi status pembayaran secara real-time antara tenant dan pengelola.

### **1.3 Yang TIDAK Boleh Diubah**
**PENTING:** Semua informasi berikut adalah fakta dari proposal dan data kios yang bersifat mutlak dan tidak boleh diubah:
* **Jumlah tenant aktif:** 250 tenant  
* **Jam operasional:** 09.00–21.00 WITA  
* **Alamat mitra:** Jl. Letjen Suprapto, Batu Ilir, Kec. Balikpapan Barat, Kota Balikpapan, Kaltim 76123  
* **Nama aplikasi / brand:** Bunsay (singkatan Plaza Kebun Sayur)  
* **Warna utama:** Merah marun / merah hangat — `#8B1A1A`

---

## **2. DATA KIOS DAN STRUKTUR DATABASE**

### **2.1 Struktur File Excel Sumber**
File Excel `Data Kios BY LEGAL ( update 26 April 2025 ).xlsx` dan `Data_Kios_BY_LEGAL_versi_MARKDOWN.md` di folder `CONTEXT/` adalah source of truth (sumber kebenaran tunggal) untuk data tenant. File ini terdiri dari beberapa sheet/bagian:
* **Lt1, Lt2, Lt3:** Data kios per lantai, masing-masing berisi daftar tenant dan field lengkap.  
* **Sheet sertifikat:** Data status pengambilan sertifikat.  
* **Sheet sewa kios:** Data terkait sewa dan perjanjian legal.

### **2.2 Field Data Setiap Tenant (dari Excel)**
**Catatan Penting:** Semua nilai tanggal di Excel menggunakan format date serial (angka integer). Konversi terlebih dahulu ke format tanggal yang terbaca manusia sebelum ditampilkan di UI.

| Nama Field | Contoh Nilai | Catatan |
| :--- | :--- | :--- |
| **Nama** | Hj. Yuliana | Nama pemilik kios |
| **No Kios** | B-1001 | Format: huruf blok - nomor (ex: B-1001, B-1002) |
| **Total AR s/d Sept 2024** | 13.219.998 | Nilai 0 = lunas, nilai > 0 = ada tunggakan historis |
| **Alamat** | Jl. Adil Makmur... | Alamat lengkap pemilik kios |
| **No KTP** | 175102.460772.0005 | Nomor KTP pemilik |
| **No Telepon** | 0812-5564-593 | Format bervariasi, lakukan normalisasi saat display |
| **No SP / Tgl SP** | 423 / 39574 | Nomor dan tanggal Surat Perjanjian (format Excel date serial) |
| **No PPJB / Tgl PPJB** | 423 / 39574 | Nomor dan tanggal Perjanjian Pengikatan Jual Beli |
| **Tgl BAST** | 40297 | Tanggal Berita Acara Serah Terima (format Excel date serial) |
| **Uk (Ukuran)** | 6M / 12M | Ukuran kios dalam meter persegi |
| **Jenis Usaha** | Kerajinan, Emas, Perhiasan | Kategori usaha yang dijalankan di kios |
| **No Sertifikat / Tgl Ambil** | 422 / 41011 | Nomor sertifikat dan tanggal pengambilan |
| **Pengalihan Ke** | Eva Tauresea | Nama penerima kios jika dialihkan. Jika kosong = tidak dialihkan |
| **Tgl Dialihkan** | 40331 | Tanggal pengalihan kios |
| **Keterangan** | Sertifikat diambil BPD Syariah | Catatan bebas, termasuk status sertifikat |

### **2.3 Aturan Data yang Harus Dijaga**
* **Multi-kios:** Satu tenant bisa memiliki lebih dari satu nomor kios (contoh: Hj. Yuliana memegang B-1001 dan B-1002).  
* **Histori Pengalihan:** Histori pengalihan kios harus tersimpan — jangan hapus data lama saat kios berpindah pemilik.  
* **Field Total AR:** Merupakan data historis hingga September 2024. Data pembayaran baru harus dihitung dari sistem berjalan.  
* **Format Mata Uang:** Semua nilai nominal WAJIB diformat menggunakan `Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })`.

---

## **3. ARSITEKTUR RUTE DAN STRUKTUR APLIKASI**

Sistem dibagi menjadi 3 zona utama yang diatur dalam `src/App.jsx`:

### **3.1 Zona Publik (Tanpa Login)**
- **`LandingPage.jsx` (`/`)**: Menampilkan landing page publik, banner promosi, profil Plaza Kebun Sayur, direktori kios publik, serta tombol navigasi masuk (login).
- **`AuthPage.jsx` (`/auth`)**: Halaman login terpadu untuk tenant dan admin, lengkap dengan fitur pengingat sesi (remember me) dan tombol simulasi sakelar peran.
- **`ForgotPassword.jsx` (`/auth/lupa-sandi`)**: Halaman reset/lupa kata sandi.

### **3.2 Zona Tenant (Pemilik Kios)**
Diakses di bawah proteksi rute `ProtectedRoute allowedRoles={['tenant']}`:
- **`DashboardTenant.jsx` (`/tenant/dashboard`)**: Ringkasan sapaan personal, status service charge bulan berjalan, status tunggakan AR historis, dan aksi cepat bayar.
- **`BayarSekarang.jsx` (`/tenant/pembayaran`)**: Interface pembayaran multi-metode (Midtrans Snap Automated, Transfer Bank BNI/Mandiri manual dengan upload bukti, dan QRIS).
- **`HistoriPembayaran.jsx` (`/tenant/histori`)**: Tabel/kartu riwayat transaksi pembayaran tenant lengkap dengan badge status (`Lunas`, `Menunggu Verifikasi`, `Tertolak`).
- **`TunggakanAR.jsx` (`/tenant/tunggakan`)**: Informasi rincian cicilan piutang/tunggakan historis s/d September 2024, progres pelunasan, dan formulir bayar cicilan.
- **`AkunTenant.jsx` (`/tenant/akun`)**: Pengaturan profil tenant, detail unit kios yang disewa, dan form ubah kata sandi.

### **3.3 Zona Admin (Pengelola Plaza)**
Diakses di bawah proteksi rute `ProtectedRoute allowedRoles={['admin']}`:
- **`DashboardAdmin.jsx` (`/admin/dashboard`)**: Panel utama admin berisi ringkasan statistik (Tenant Aktif, Menunggu Verifikasi, Total Dana Terkumpul), tabel tenant dengan kolom **"Status Bulan Ini"**, serta modal verifikasi cepat.
- **`VerifikasiBuktiTransfer.jsx` (`/admin/verifikasi-bukti`)**: Antrean khusus untuk memproses dan mengonfirmasi/menolak bukti transfer yang diunggah tenant.
- **`SetoranTunai.jsx` (`/admin/setoran-tunai`)**: Form loket pembayaran tunai langsung di kantor pengelola dengan lampiran foto bukti fisik.
- **`RiwayatTransaksiAdmin.jsx` (`/admin/riwayat`)**: Log seluruh transaksi sistem (Tunai, Transfer, QRIS, Midtrans) beserta pencarian & filter.
- **`KetersediaanKios.jsx` (`/admin/kios`)**: Tabel pemetaan utilitas unit kios (Lantai, No. Kios, Status, Nama Pemilik, Jenis Usaha, Catatan) dan modal pendaftaran tenant baru.
- **`DetailAdministrasiKios.jsx` (`/admin/detail-administrasi`)**: Halaman detail legalitas administrasi kios (No. SP, No. PPJB, Tgl BAST, No. Sertifikat, dan Histori Pengalihan).
- **`DetailKeuanganTenant.jsx`**: View drill-down dari `DashboardAdmin.jsx` untuk melihat seluruh riwayat transaksi & tunggakan tenant tertentu secara komprehensif.
- **`EksporData.jsx` (`/admin/ekspor`)**: Panel ekspor rekapitulasi data transaksi dan kios ke file Excel `.xlsx`.

---

## **4. DESIGN SYSTEM DAN PANDUAN VISUAL**

Seluruh variabel desain didefinisikan dalam `src/index.css` menggunakan CSS Variables dan Tailwind CSS v4 `@theme`:

### **4.1 Token Warna CSS**
* **Merah Marun (Primary Brand)**: `var(--red)` (`#8B1A1A`), Dark `#6B1414`, Red-50 `#FDF2F2`, Red-100 `#FADADD`.
* **Latar Belakang Netral**: Krem `var(--cream)` (`#FBF7F2`), Warm Gray `var(--warm-gray)` (`#F5F0EB`).
* **Border**: `var(--border)` (`#E8E0D8`).
* **Teks Utama**: Primary `var(--text)` (`#1A1410`), Secondary `var(--text-2)` (`#5C4F46`), Muted `var(--text-3)` (`#7B6A5E`).
* **Status Lunas / Terisi**: Green `var(--green)` (`#1A6B3A`), Green Background `var(--green-bg)` (`#E8F5EE`).
* **Status Pending / Perlu Validasi / Tunggakan**: Orange `var(--orange)` (`#C05C00`), Orange Background `var(--orange-bg)` (`#FEF3E6`).

### **4.2 Tipografi & Aksesibilitas Teks**
* **Font Family**: `'Plus Jakarta Sans', sans-serif`.
* **Ukuran Body Teks**: Minimum **15px** (demi kenyamanan mata pengguna usia 40 tahun ke atas).
* **Ukuran Form Input**: Minimum **16px** (mencegah perilaku auto-zoom otomatis oleh iOS Safari pada smartphone).

### **4.3 Aturan Anti-Vibe-Coded Design**
* Dilarang keras menggunakan emoji dekoratif pada elemen formal UI.
* Dilarang menggunakan soft glow drop-shadow bertumpuk berlebihan. Gunakan `box-shadow: 0 2px 12px rgba(139, 26, 26, 0.08)`.
* Dilarang menggunakan istilah CTA kasual ("Cus Bayar", "Gas Login"). Wajib menggunakan Bahasa Indonesia formal ("Bayar Sekarang", "Masuk Akun", "Simpan Setoran Tunai").
* Dilarang menggunakan visual dashboard crypto/fintech yang gelap atau terlalu futuristik.

---

## **5. STRATEGI UI HYBRID & WCAG 2.2 AA COMPLIANCE**

### **5.1 Sisi Tenant (Mobile-First Approach)**
* **Layout**: Menggunakan navigasi bawah (`BottomNav.jsx`) tetap pada mobile (< 768px). Pada desktop (≥ 768px), navigasi disembunyikan dan dialihkan ke Sidebar tetap.
* **Reflow (WCAG 1.4.10)**: Seluruh formulir pembayaran dan dashboard tenant mengalir secara vertikal pada lebar viewport 320px tanpa scroll horizontal.

### **5.2 Sisi Admin (Desktop-First Approach)**
* **Layout**: Sidebar kiri selebar 240px (`SidebarAdmin.jsx`) *always visible* di desktop. Pada layar seluler (< 768px), sidebar disembunyikan ke dalam hamburger menu drawer.
* **Reflow Tabel Data (`index.css`)**: Pada layar sempit (< 768px), tabel admin (Daftar Tenant & Ketersediaan Kios) secara otomatis bertransformasi menjadi stacked cards menggunakan atribut `data-label` pada elemen `<td>`.

### **5.3 Standar Aksesibilitas Interaksi (WCAG 2.2)**
* **Ukuran Target Sentuh (Touch Target)**: Semua tombol (`button`), input (`input`, `select`), dan tautan (`a`) wajib memiliki tinggi minimum **44px** (`min-height: 44px`).
* **Umpan Balik Sentuh**: Semua elemen interaktif memiliki efek tekan `transform: scale(0.97)` via kelas `active-feedback`.
* **Focus Ring**: Elemen interaktif menampilkan indicator outline yang jelas (`outline: 3px solid #1A1410`) saat difokuskan menggunakan navigasi keyboard (WCAG 2.4.7).

---

## **6. PANDUAN INTEGRASI HANDOVER BACKEND & DATABASE**

### **6.1 Struktur Database Minimal yang Direkomendasikan**

#### **1. Tabel `tenants`**
| Kolom | Tipe | Keterangan |
| :--- | :--- | :--- |
| `id` | INT / UUID | Primary key |
| `nama` | VARCHAR | Nama pemilik kios |
| `email` | VARCHAR | Email login tenant |
| `password_hash` | VARCHAR | Hash kata sandi (bcrypt) |
| `no_ktp` | VARCHAR | Nomor KTP pemilik |
| `alamat` | TEXT | Alamat lengkap pemilik |
| `no_telepon` | VARCHAR | Nomor telepon |
| `jenis_usaha` | VARCHAR | Jenis usaha (Kerajinan, Fashion, Emas, dll) |

#### **2. Tabel `kios`**
| Kolom | Tipe | Keterangan |
| :--- | :--- | :--- |
| `id` | INT / UUID | Primary key |
| `nomor_kios` | VARCHAR | Contoh: `"B-1001"` |
| `lantai` | VARCHAR | `"Lt. 1"`, `"Lt. 2"`, `"Lt. 3"` |
| `status` | ENUM | `"Terisi"`, `"Kosong"`, `"Perlu Validasi"` *(case-sensitive)* |
| `tenant_id` | INT / UUID | Foreign key ke `tenants.id` (nullable) |
| `ukuran` | VARCHAR | Contoh: `"6M"` |
| `no_sp` | VARCHAR | Nomor dan tanggal Surat Perjanjian |
| `no_ppjb` | VARCHAR | Nomor dan tanggal PPJB |
| `tgl_bast` | DATE | Tanggal Berita Acara Serah Terima |
| `no_sertifikat` | VARCHAR | Nomor sertifikat & tanggal ambil |
| `catatan` | TEXT | Catatan administrasi |

#### **3. Tabel `transactions`**
| Kolom | Tipe | Keterangan |
| :--- | :--- | :--- |
| `id` | INT / UUID | Primary key (e.g. `"TRX-1090"`) |
| `tenant_id` | INT / UUID | Foreign key ke `tenants.id` |
| `jenis_tagihan` | ENUM | `"Service Charge"`, `"Tunggakan AR"` |
| `nominal` | DECIMAL | Nominal pembayaran |
| `metode` | ENUM | `"Transfer Manual"`, `"Midtrans"`, `"Tunai"`, `"QRIS"` |
| `status` | ENUM | `"Lunas"`, `"Menunggu Verifikasi"`, `"Tertolak"` *(case-sensitive)* |
| `waktu` | TIMESTAMP | Waktu transaksi |
| `bukti` | VARCHAR | Path/filename bukti transfer / foto setoran tunai |
| `alasan_tolak` | TEXT | Catatan jika status `"Tertolak"` |

### **6.2 Ketentuan Kepatuhan API Backend**

1. **Aturan ENUM Case-Sensitive**:
   Frontend menggunakan perbandingan string persis. Backend wajib mengembalikan status dalam format huruf kapital yang tepat: `"Lunas"`, `"Menunggu Verifikasi"`, `"Tertolak"`, `"Terisi"`, `"Kosong"`, `"Perlu Validasi"`.

2. **Payload Upload Pembayaran**:
   Endpoint `POST /tenant/payment` wajib menerima payload `multipart/form-data` dengan field:
   - `jenis_tagihan` (string)
   - `nominal` (number)
   - `metode` (string: `transfer_manual` atau `midtrans_gateway`)
   - `bukti_transfer` (file gambar, wajib jika `metode` = `transfer_manual`)

3. **Endpoint Ekspor Excel**:
   Endpoint `GET /admin/export` wajib mengembalikan stream biner berkas `.xlsx` dengan header HTTP:
   `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

4. **Format Respons Error Terstandar (WCAG 2.2)**:
   Setiap respons kesalahan (HTTP status 400, 422, 500) **wajib** mengembalikan JSON dengan struktur pesan Bahasa Indonesia formal yang informatif:
   ```json
   {
     "message": "Nomor KTP harus berisi 16 digit angka",
     "field": "no_ktp"
   }
   ```