# **FRONTEND DEVELOPMENT HANDOVER SPECIFICATION (V5.3 - UPDATED)**

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
| **Versi Dokumen** | **V5.4 (Penyatuan AuthPage, Pembersihan Dead Code, & Integrasi Lighthouse CI)** |
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
     - `AuthPage.jsx` (`/auth` & `/auth/lupa-sandi`) – Tampilan login terpadu tenant & admin beserta form lupa kata sandi dalam satu bingkai kartu tetap (*persistent card shell*) tanpa kedipan unmount.
   - **Tenant Zone**:
     - **`DashboardTenant.jsx` (`/tenant/dashboard`)**: Dashboard sapaan personal, status tagihan siklus berjalan (`Tarif_Sewa` + `Hutang_Tunggakan` jika ada), dan ringkasan tunggakan akumulatif.
     - `BayarSekarang.jsx` (`/tenant/pembayaran`) – Modul pembayaran terintegrasi Midtrans Snap Gateway, Transfer Bank (BNI/Mandiri), dan QRIS Manual beserta upload bukti transfer.
     - `HistoriPembayaran.jsx` (`/tenant/histori`) – Log transaksi tenant dengan status real-time.
     - **`TunggakanAR.jsx` (`/tenant/tunggakan`)**: Rincian akumulasi tunggakan dari siklus-siklus sebelumnya yang belum lunas (bersifat berjalan, bukan snapshot historis).
     - `AkunTenant.jsx` (`/tenant/akun`) – Profil pemilik, informasi unit kios, dan ubah kata sandi.
   - **Admin Zone**:
     - `DashboardAdmin.jsx` (`/admin/dashboard`) – Summary statistik (Total Tenant, Menunggu Verifikasi, Total Dana Terkumpul), tabel status bulan ini, dan modal verifikasi cepat.
     - `VerifikasiBuktiTransfer.jsx` (`/admin/verifikasi-bukti`) – Antrean khusus verifikasi bukti transfer (Terima / Tolak dengan catatan alasan).
     - `SetoranTunai.jsx` (`/admin/setoran-tunai`) – Form loket pencatatan pembayaran tunai langsung oleh admin di kantor pengelola beserta lampiran foto fisik bukti setoran.
     - `RiwayatTransaksiAdmin.jsx` (`/admin/riwayat`) – Log seluruh transaksi lintas metode (Tunai, Transfer, QRIS, Midtrans).
     - `KetersediaanKios.jsx` (`/admin/kios`) – Tabel pemetaan unit kios (Terisi, Kosong) lengkap dengan fitur modal pendaftaran tenant baru (`createTenant`).
     - `DetailAdministrasiKios.jsx` (`/admin/detail-administrasi`) – Rincian legalitas kios (No. SP, No. PPJB, No. Sertifikat).
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
   - Penambahan aturan ENUM case-sensitive untuk status transaksi & kios (`"Lunas"`, `"Belum Bayar"`, `"Menunggu Verifikasi"`, `"Terisi"`, `"Kosong"`).
   - Penambahan spesifikasi respons error JSON terstandar dalam bahasa Indonesia formal untuk mematuhi kriteria WCAG 3.3.1 & 3.3.3.

6. **Refaktorisasi Aksesibilitas WCAG 2.2 AA (Tahap 1, 2, & 3)**:
   - Refaktorisasi 100% lengkap pada 17 halaman aplikasi mengacu pada `@wcag-audit-patterns` dan `WALKTHROUGH.md` (`ENTRY 08`). Verified 0 build errors.

---

### **0.1 Changelog V4 → V5**

Revisi skema database final (ERD v3) telah disepakati bersama tim database menggantikan dua rancangan awal (ERD 1 & ERD 2) yang saling bertentangan. Perubahan ini **mengubah model bisnis inti** dari "kontrak sewa jangka panjang" menjadi "siklus sewa bulanan", dan berdampak langsung ke struktur data yang dikonsumsi frontend. Poin-poin berikut **WAJIB** dibaca sebelum melanjutkan pengembangan atau refactor:

1. **Model Sewa Berubah Total — Siklus Bulanan, Bukan Kontrak Panjang**:
   - Satu `Sewa` kini merepresentasikan **satu siklus/bulan**, bukan satu kontrak yang berlaku bertahun-tahun. Baris `Sewa` baru dibuat setiap bulan (reset), bukan diperbarui di tempat.
   - Relasi `Sewa` ke `Tagihan` berubah dari **1:N menjadi 1:1** — setiap siklus `Sewa` menghasilkan tepat satu `Tagihan`.
   - Konsekuensi ke frontend: field `Tanggal_Mulai`/`Tanggal_Selesai` di halaman `DashboardTenant.jsx`, `AkunTenant.jsx`, dan `DetailTenantAdmin.jsx` **tidak lagi menunjukkan durasi kontrak jangka panjang**, melainkan rentang satu siklus bulan berjalan. Penamaan label di UI perlu ditinjau ulang (isu ini masih terbuka, lihat catatan tim di bawah).

2. **Konsep Tunggakan Berubah — dari Snapshot Historis Menjadi Akumulasi Berjalan**:
   - Field **"Total AR s/d Sept 2024"** yang sebelumnya berupa data historis statis **sudah tidak berlaku**. Digantikan oleh `Hutang_Tunggakan` pada tabel `Tagihan`, yang bersifat **akumulatif**: setiap `Tagihan` yang tidak lunas pada satu siklus akan menambah `Hutang_Tunggakan` pada `Tagihan` siklus berikutnya.
   - `Total_Tagihan` = `Tarif_Sewa` (bulan berjalan) + `Hutang_Tunggakan` (akumulasi dari siklus-siklus sebelumnya yang belum lunas).
   - Konsekuensi ke frontend: `TunggakanAR.jsx` perlu direfactor dari "rincian tunggakan historis" menjadi "akumulasi tunggakan berjalan".

3. **Status Keanggotaan Tenant (Baru)**:
   - Tabel `Pemilik` mendapat kolom baru `Status_Pemilik` (`"Aktif"` / `"Nonaktif"`), diubah secara manual oleh admin ketika tenant benar-benar berhenti berjualan (bukan sekadar menunggak).
   - Tenant yang menunggak tetap berstatus `Aktif` selama masih menempati kios — status ini murni menandai kelanjutan keanggotaan, bukan kepatuhan pembayaran.
   - Jika tenant lama menyewa kembali di kemudian hari, ia dicatat sebagai `Pemilik` baru (baris baru), bukan reaktivasi baris lama.
   - Konsekuensi: field lama `Pengalihan Ke` / `Tgl Dialihkan` **dihapus dari skema** — perpindahan kepemilikan kios kini otomatis tercermin lewat `Sewa` baru dengan `Id_Pemilik` berbeda untuk `Id_Kios` yang sama.

4. **Dokumen Legalitas Menjadi Generik**:
   - Field-field legalitas yang sebelumnya kolom terpisah (`No_SP`/`Tgl_SP`, `No_PPJB`/`Tgl_PPJB`, `No_Sertifikat`/`Tgl_Ambil`) kini disatukan dalam satu tabel generik `Dokumen` dengan kolom `Jenis_Dokumen` (ENUM), bersifat opsional/nullable kecuali KTP (wajib, tersimpan di `Pemilik`).
   - `Dokumen` memiliki FK opsional ke `Id_Kios` (diisi untuk dokumen per-kios seperti SP/PPJB, dikosongkan untuk dokumen per-pemilik seperti KTP) — ini penting untuk kasus **multi-kios**.
   - `Tgl_BAST` dihapus dari skema (disepakati tim database sebagai field yang tidak relevan untuk cakupan sistem pembayaran ini).

5. **Isu Terbuka (Belum Final)**:
   - Penamaan field `Tanggal_Mulai` di UI dinilai tim kurang jelas pasca perubahan model sewa jadi siklus bulanan. Perlu didiskusikan ulang penamaan yang lebih tepat.
   - Sumber data resmi (KTP, alamat, kontak tenant) sebelumnya berasal dari file Excel (`Data Kios BY LEGAL`) yang menurut lapangan **masih terdata manual dan tidak lengkap**. Migrasi data awal ke skema baru perlu proses pembersihan data sebelum go-live.

Lihat `bunsay_erd.dbml.md` (kode dbdiagram.io) untuk skema lengkap.

---

### **0.2 Changelog V5.0 → V5.1**

Pembaruan spesifikasi autentikasi & pengelolaan akun pengelola:

1. **Autentikasi Berbasis `Username` (Tenant & Admin)**:
   - Login untuk seluruh peran (`Tenant` dan `Admin`) pada `AuthPage.jsx` secara resmi menggunakan **`Username`** (bukan email).
   - Kolom `Email` ditambahkan pada `Table User` (`Email varchar(100) [not null, unique]`) khusus untuk formalitas data administrasi dan pengiriman tautan pemulihan kata sandi (`ForgotPassword.jsx`).

2. **Model Akun Pengelola Terpusat (Single Official Admin / Shared Account)**:
   - Menggunakan 1 akun resmi pengelola (`User.Username: admin`) yang dipakai bersama (*sharing account*) oleh staf operasional kantor pengelola di lantai 3 Plaza Kebun Sayur.
   - Mengeliminasi kebutuhan tabel `Admin` baru pada skema ERD sehingga database tetap efisien dan bebas overhead.
   - Pengelola tetap memiliki kontrol penuh untuk mengubah `Username`, `Email`, dan `Password` akun admin melalui Halaman Profil Admin (`/admin/akun`).

---

### **0.3 Changelog V5.1 → V5.2**

> ⚠️ **REVISI KRITIS — Mengoreksi asumsi V5.0/V5.1 tentang model pembayaran.**

Berdasarkan konfirmasi langsung dari tim database (Indri, 23 Juli 2026), asumsi pada V5.0/V5.1 bahwa **"pembayaran harus lunas sekaligus, tidak ada cicilan/pembayaran parsial"** ternyata **salah tafsir** terhadap panduan awal yang ditulis ketua tim. Faktanya di lapangan Plaza Kebun Sayur:

1. **Tenant BOLEH mencicil tunggakan** — tidak diwajibkan melunasi seluruh akumulasi sekaligus.
2. **Nominal pembayaran BEBAS** — tenant dapat membayar berapa saja (tidak harus kelipatan tarif bulanan).
3. **Alokasi otomatis FIFO (First-In-First-Out)** — sistem yang menentukan tagihan mana yang dilunasi duluan, selalu dimulai dari tagihan dengan `Periode` tertua yang belum lunas. Tenant **tidak memilih** bulan mana yang dilunasi.

**Perubahan struktural yang ditimbulkan:**

- **Relasi `Tagihan ↔ Pembayaran` berubah dari 1:1 menjadi many-to-many**, dimediasi oleh tabel junction baru **`Alokasi_Pembayaran`** (menggantikan `Tagihan_Terlunasi` dari V5.0).
- **`Pembayaran.Id_Tagihan` dihapus**, diganti `Pembayaran.Id_Pemilik` — karena satu pembayaran kini dapat menyentuh banyak tagihan sekaligus.
- **`Alokasi_Pembayaran.Nominal_Teralokasi`** (DECIMAL) — mencatat berapa rupiah persis dari satu pembayaran yang dialokasikan ke satu tagihan tertentu (mendukung alokasi parsial).
- **Status baru `"Dicicil"`** ditambahkan pada ENUM `Status_Tagihan` — untuk tagihan yang sudah dibayar sebagian tetapi belum lunas total.
- **`Total_Terbayar`** pada `Tagihan` **tidak disimpan sebagai kolom** — dihitung *on-the-fly* melalui `SUM(Alokasi_Pembayaran.Nominal_Teralokasi)` untuk menghindari risiko inkonsistensi data.
- **`Status_Tagihan` diturunkan** dari perbandingan `SUM(Nominal_Teralokasi)` vs `Total_Tagihan`:
  - `SUM = 0` → `"Belum Bayar"`
  - `0 < SUM < Total_Tagihan` → `"Dicicil"`
  - `SUM >= Total_Tagihan` → `"Lunas"`

**Konsekuensi ke frontend:**
- `BayarSekarang.jsx`: tenant memasukkan **nominal bebas** (bukan nominal tetap `Total_Tagihan`), sistem menampilkan rincian tagihan mana saja yang akan teralokasi secara FIFO.
- `TunggakanAR.jsx`: menampilkan progres cicilan per-tagihan (berapa yang sudah dibayar dari total).
- `SetoranTunai.jsx`: admin loket juga memasukkan nominal bebas, alokasi FIFO otomatis.
- `DetailKeuanganTenant.jsx`: menampilkan breakdown `Alokasi_Pembayaran` per tagihan.

### **0.4 Changelog V5.2 → V5.3**

> ⚠️ **KOREKSI OVERSIGHT — Menghilangkan metode pembayaran "QRIS Manual" yang terpisah.**

Pada V4 hingga V5.2, dokumentasi dan mock API sebelumnya mencantumkan **`"QRIS"`** sebagai metode pembayaran terpisah (dengan asumsi tenant screenshot bukti QRIS lalu upload manual seperti bukti transfer bank). Setelah ditinjau ulang bersama tim, ini adalah **kesalahan arsitektural**:

1. **QRIS sudah tercakup di dalam Midtrans Snap Gateway** — Midtrans secara native mendukung QRIS (bersama GoPay, ShopeePay, OVO, credit card, debit, dll) sebagai salah satu payment method di dalam satu gateway terpadu.
2. **Tidak perlu upload bukti untuk QRIS** — pembayaran QRIS lewat Midtrans diverifikasi otomatis oleh gateway (webhook callback), bukan diverifikasi manual oleh admin seperti Transfer Bank.
3. **Memisahkan "QRIS Manual" justru membingungkan tenant** — membuat mereka mengira ada jalur pembayaran lain di luar Midtrans, padahal tidak.

**Perubahan yang ditimbulkan:**

- **ENUM `Metode_Bayar`** direduksi dari 4 nilai menjadi **3 nilai**: `"Transfer"`, `"Tunai"`, `"Midtrans"` — **`"QRIS"` dihapus**.
- **`BayarSekarang.jsx`**: opsi radio/QRIS manual dihapus. Form pembayaran kini hanya menawarkan:
  - **Transfer Bank** (BNI/Mandiri, dengan upload bukti — verifikasi manual oleh admin)
  - **Midtrans Snap Gateway** (otomatis mencakup QRIS, e-wallet, credit card, dll — verifikasi otomatis via webhook)
- **`SetoranTunai.jsx`**: tidak terdampak (tetap hanya untuk pembayaran tunai di loket).
- **`RiwayatTransaksiAdmin.jsx`**: log transaksi hanya mencatat 3 metode (Tunai, Transfer, Midtrans). Transaksi QRIS akan tercatat sebagai `"Midtrans"` dengan metadata tambahan dari webhook (jenis e-wallet/QRIS bisa disimpan di field `Keterangan` atau field tambahan jika diperlukan).
- **Mock API** (`src/api/transactions.js`, `src/api/tenant.js`, `src/api/admin.js`): semua referensi `"QRIS"` dihapus dari data dummy dan ENUM.
- **Backend**: endpoint callback Midtrans menangani semua notifikasi pembayaran digital (termasuk QRIS) secara terpadu. Tidak ada endpoint terpisah untuk verifikasi QRIS manual.

**Catatan untuk tenant lansia:** karena QRIS kini hanya tersedia lewat Midtrans (yang butuh smartphone dengan aplikasi banking/e-wallet), tenant yang tidak memiliki smartphone tetap dapat membayar lewat **Transfer Bank** (dengan bantuan keluarga/staf) atau **Tunai di loket** kantor pengelola Lt. 3 — dua metode yang sudah tersedia sejak V4.

### **0.5 Changelog V5.3 → V5.4**

Pembaruan penyatuan komponen autentikasi, pembersihan berkas redundant, serta integrasi gate pengujian performa otomatis:

1. **Penyatuan Komponen Auth (`AuthPage.jsx`) & Eliminasi Kedipan (*Zero Flicker*)**:
   - `ForgotPassword.jsx` secara resmi dilebur ke dalam `AuthPage.jsx`. Outer card container (`Card`) dan Logo Plaza Kebun Sayur dipasang sebagai **Persistent Card Shell** yang diam 100% di DOM saat berpindah antara `/auth` dan `/auth/lupa-sandi`.
   - Menghapus file redundant `ForgotPassword.jsx` dari codebase.
   - Menambahkan tautan navigasi *"Kembali ke Beranda Utama"* pada form login `AuthPage.jsx`.

2. **Pengasahan Konfigurasi Tailwind CSS v4**:
   - Penataan urutan `@import "tailwindcss";` di baris paling atas `src/index.css` untuk kepatuhan mutlak kompiler CSS modern.
   - Verifikasi build produksi Vite 0 error & 0 warning dengan waktu kompilasi **646ms**.

3. **Integrasi Gate Audit Performa & Core Web Vitals (Lighthouse CI)**:
   - Penambahan berkas konfigurasi `lighthouserc.cjs` dan perintah `npm run lhci` / `npm run lhci:desktop`.
   - Mengukuhkan budget Core Web Vitals & skor standar: Best Practices **100/100**, Accessibility WCAG **98/100**, SEO **92/100**, TBT **0 ms**, CLS **0**.

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
* **Jumlah tenant aktif:** 250 tenant (per data awal migrasi — akan berubah seiring `Status_Pemilik` diperbarui pasca go-live)
* **Jam operasional:** 09.00–21.00 WITA  
* **Alamat mitra:** Jl. Letjen Suprapto, Batu Ilir, Kec. Balikpapan Barat, Kota Balikpapan, Kaltim 76123  
* **Nama aplikasi / brand:** Bunsay (singkatan Plaza Kebun Sayur)  
* **Warna utama:** Merah marun / merah hangat — `#8B1A1A`

> ⚠️ **Catatan Revisi V5:** Poin "Jumlah tenant aktif: 250 tenant" sebelumnya dianggap fakta statis dari proposal. Sejak revisi skema database (lihat 0.1), status keaktifan tenant kini bersifat dinamis lewat `Status_Pemilik` — 250 adalah angka awal migrasi data, bukan konstanta permanen.

---

## **2. SKEMA DATABASE (ERD v4 — FINAL)**

> Skema ini menggantikan seluruh versi sebelumnya (v1, v2, v3). ERD v4 adalah hasil revisi final yang mengoreksi asumsi keliru pada v3 tentang model pembayaran, berdasarkan konfirmasi langsung dari tim database. Kode lengkap tersedia di `bunsay_erd.dbml.md` (import ke [dbdiagram.io](https://dbdiagram.io/d) untuk visualisasi).

### **2.1 Diagram Relasi (Ringkasan)**

```
Roles 1─N User 1─1 Pemilik 1─N Dokumen (opsional: Id_Kios)
                       │
                       └─N Sewa N─1 Kios
                            │ (1─1, RESET TIAP BULAN)
                            ▼
                         Tagihan
                            │
                     Alokasi_Pembayaran (N:N, dengan Nominal_Teralokasi)
                            │
                         Pembayaran (FIFO, nominal bebas)
```

### **2.2 Struktur Tabel**

#### **1. `Roles`**
| Kolom | Tipe | Key | Keterangan |
| :--- | :--- | :--- | :--- |
| `Id_Roles` | INT | PK | |
| `Nama_Role` | VARCHAR(30) | | `"Tenant"` / `"Admin"` |

#### **2. `User`**
| Kolom | Tipe | Key | Keterangan |
| :--- | :--- | :--- | :--- |
| `Id_User` | INT | PK | |
| `Id_Roles` | INT | FK | |
| `Username` | VARCHAR(50) | UNIQUE | Identifier Login Utama (Tenant & Admin) |
| `Email` | VARCHAR(100) | UNIQUE | Formalitas Administrasi & Reset Lupa Sandi |
| `Password` | VARCHAR(255) | | Hash (bcrypt) |

> ℹ️ **Catatan Model Autentikasi (V5.1):** Login tenant dan admin 100% menggunakan `Username`. `Email` disimpan di `User` untuk keperluan formalitas administrasi dan tautan reset kata sandi (`ForgotPassword.jsx`). Akun Admin menggunakan model Single Official Admin Account (akun pengelola terpusat untuk staf kantor) yang dapat mengelola username, email, dan sandi pengelola via `/admin/akun`.

#### **3. `Pemilik`**
| Kolom | Tipe | Key | Keterangan |
| :--- | :--- | :--- | :--- |
| `Id_Pemilik` | INT | PK | |
| `Id_User` | INT | FK (1:1) | |
| `Nama` | VARCHAR(50) | | |
| `No_Telepon` | VARCHAR(255) | | Normalisasi format saat display |
| `No_KTP` | CHAR(16) | UNIQUE | |
| `Alamat` | TEXT | | |
| `Status_Pemilik` | ENUM | | `"Aktif"` / `"Nonaktif"` — lihat 0.1 poin 3 |

#### **4. `Kios`**
| Kolom | Tipe | Key | Keterangan |
| :--- | :--- | :--- | :--- |
| `Id_Kios` | INT | PK | |
| `No_Kios` | VARCHAR(10) | UNIQUE | Format: `B-1001` |
| `Lantai` | INT | | |
| `Ukuran` | VARCHAR(20) | | Contoh: `"6M"` |
| `Status` | ENUM | | `"Terisi"` / `"Kosong"` |

#### **5. `Dokumen`** *(generik, menggantikan kolom legalitas terpisah)*
| Kolom | Tipe | Key | Keterangan |
| :--- | :--- | :--- | :--- |
| `Id_Dokumen` | INT | PK | |
| `Id_Pemilik` | INT | FK | Wajib |
| `Id_Kios` | INT | FK, NULLABLE | Diisi untuk dokumen per-kios (SP, PPJB, Sertifikat); kosong untuk dokumen per-pemilik (KTP) |
| `Jenis_Dokumen` | ENUM | | `SP` / `PPJB` / `Sertifikat` / `KTP` |
| `Nomor_Dokumen` | VARCHAR(100) | NULLABLE | |
| `Tanggal` | DATE | NULLABLE | |
| `Keterangan` | TEXT | NULLABLE | Catatan bebas |

> Satu baris per jenis dokumen yang dimiliki. `Tgl_BAST` **dihapus** dari skema (disepakati tidak relevan untuk cakupan sistem pembayaran).

#### **6. `Sewa`** *(⚠️ SIKLUS BULANAN, bukan kontrak jangka panjang)*
| Kolom | Tipe | Key | Keterangan |
| :--- | :--- | :--- | :--- |
| `Id_Sewa` | INT | PK | |
| `Id_Pemilik` | INT | FK | |
| `Id_Kios` | INT | FK | |
| `Jenis_Usaha` | VARCHAR(100) | | Teks bebas |
| `Tanggal_Mulai` | DATE | | ⚠️ Penamaan UI masih didiskusikan, lihat 0.1 poin 5 |
| `Tanggal_Selesai` | DATE | | |
| `Keterangan` | TEXT | NULLABLE | |

> Baris baru dibuat tiap bulan (reset), bukan update di tempat. Tidak ada FK eksplisit ke siklus sebelumnya — ditelusuri lewat `Id_Pemilik` + `Id_Kios`, aman karena tenant yang benar-benar berhenti akan dapat `Id_Pemilik` baru saat sewa lagi.

#### **7. `Tagihan`**
| Kolom | Tipe | Key | Keterangan |
| :--- | :--- | :--- | :--- |
| `Id_Tagihan` | INT | PK | |
| `Id_Sewa` | INT | FK (1:1) | Satu Tagihan per siklus Sewa |
| `Periode` | CHAR(7) | INDEX | Format `YYYY-MM` |
| `Jatuh_Tempo` | DATE | | Tanggal 12 tiap bulan |
| `Tarif_Sewa` | DECIMAL(12,2) | | Tarif bulan berjalan saja |
| `Hutang_Tunggakan` | DECIMAL(12,2) | | Akumulasi dari `Tagihan` siklus sebelumnya yang belum lunas |
| `Total_Tagihan` | DECIMAL(12,2) | | `Tarif_Sewa` + `Hutang_Tunggakan` |
| `Status_Tagihan` | ENUM | INDEX | `"Lunas"` / `"Belum Bayar"` / `"Dicicil"` / `"Menunggu Verifikasi"` |

> Satu Tagihan per siklus Sewa (1:1, karena Sewa sudah per-bulan).
> `Hutang_Tunggakan` = akumulasi `Total_Tagihan` dari siklus Sewa sebelumnya yang masih belum Lunas (dicari via `Id_Pemilik` + `Id_Kios`).
> `Total_Tagihan` = `Tarif_Sewa` bulan ini + `Hutang_Tunggakan`.
>
> **`Total_Terbayar` TIDAK disimpan sebagai kolom** — dihitung *on-the-fly* lewat `SUM(Alokasi_Pembayaran.Nominal_Teralokasi) WHERE Id_Tagihan = Tagihan ini`, untuk menghindari risiko data tidak sinkron antara kolom tersimpan vs baris `Alokasi_Pembayaran` yang sebenarnya.
>
> `Status_Tagihan` diturunkan dari perbandingan hasil SUM itu vs `Total_Tagihan`:
> - `SUM = 0` → `"Belum Bayar"`
> - `0 < SUM < Total_Tagihan` → `"Dicicil"` *(BARU di V5.2)*
> - `SUM >= Total_Tagihan` → `"Lunas"`
>
> (Selama ada `Pembayaran` yang masih `"Menunggu"` verifikasi terkait Tagihan ini, status ditahan di `"Menunggu Verifikasi"`.)
>
> Index ditambahkan di `Periode` & `Status_Tagihan` karena keduanya jadi kolom filter utama di fitur `EksporData.jsx` dan tabel admin.

#### **8. `Pembayaran`**
| Kolom | Tipe | Key | Keterangan |
| :--- | :--- | :--- | :--- |
| `Id_Pembayaran` | INT | PK | |
| `Id_Pemilik` | INT | FK | Menggantikan `Id_Tagihan` (revisi V5.2) |
| `Tanggal_Bayar` | DATE | | |
| `Total_Bayar` | DECIMAL(12,2) | | Nominal bebas, tidak harus kelipatan bulanan |
| `Metode_Bayar` | ENUM | | `"Transfer"` / `"Tunai"` / `"Midtrans"` *(🔧 QRIS dihapus di V5.3)* |
| `Bukti_Pembayaran` | VARCHAR(255) | NULLABLE | **Hanya wajib untuk Transfer**; Midtrans & Tunai tidak perlu |
| `Verifikasi_Pembayaran` | ENUM | | `"Menunggu"` / `"Diterima"` / `"Ditolak"` |

> **TIDAK LAGI 1:1 dengan Tagihan** (revisi dari V5.0/V5.1). Tenant boleh mencicil dengan **NOMINAL BEBAS** (dikonfirmasi tim database): tidak harus pas kelipatan satu bulan tagihan.
>
> Satu `Pembayaran` dialokasikan ke satu atau lebih `Tagihan` lewat `Alokasi_Pembayaran`, memakai aturan **FIFO (First-In-First-Out)**: tagihan dengan `Periode` tertua yang belum Lunas dilunasi/dicicil duluan. Kelebihan nominal (jika ada) mengalir ke `Tagihan` berikutnya yang masih belum Lunas.
>
> `Id_Pemilik` (bukan `Id_Tagihan`) menjadi FK utama karena satu `Pembayaran` bisa menyentuh banyak `Tagihan` sekaligus.
> `Bukti_Pembayaran` nullable karena pembayaran **Midtrans** (termasuk QRIS, e-wallet, credit card via gateway) diverifikasi otomatis lewat webhook, dan pembayaran **Tunai** tidak selalu perlu upload bukti. **Hanya Transfer Bank** yang wajib upload bukti untuk verifikasi manual admin.
>
> 🔧 **Koreksi V5.3**: ENUM `"QRIS"` dihapus — pembayaran QRIS kini tercakup dalam `"Midtrans"` sebagai salah satu payment method di gateway. Tidak ada lagi jalur "QRIS Manual" terpisah.

#### **9. `Alokasi_Pembayaran`** *(BARU di V5.2 — menggantikan `Tagihan_Terlunasi`)*
| Kolom | Tipe | Key | Keterangan |
| :--- | :--- | :--- | :--- |
| `Id_Alokasi` | INT | PK | |
| `Id_Pembayaran` | INT | FK | |
| `Id_Tagihan` | INT | FK | |
| `Nominal_Teralokasi` | DECIMAL(12,2) | | Berapa rupiah dari pembayaran ini yang masuk ke tagihan ini |

> Junction table yang mencatat berapa **RUPIAH persis** dari satu `Pembayaran` yang teralokasi ke satu `Tagihan` tertentu — bukan cuma penanda lunas/tidak, karena sekarang alokasinya bisa **PARSIAL**.
>
> **WAJIB** diproses backend dengan algoritma FIFO setiap kali `Pembayaran` diverifikasi (`Verifikasi_Pembayaran = "Diterima"`):
> 1. Ambil semua `Tagihan` milik `Pemilik` itu dengan `Status_Tagihan != "Lunas"`, urutkan `Periode` tertua dulu.
> 2. Loop: alokasikan sisa nominal `Pembayaran` ke `Tagihan` tertua sampai habis atau semua `Tagihan` lunas.
> 3. Tiap alokasi dicatat sebagai satu baris di sini.
> 4. Setelah insert, hitung ulang SUM `Alokasi_Pembayaran` per `Tagihan` yang tersentuh untuk menentukan `Status_Tagihan` barunya (lihat Note di `Tagihan`).

### **2.3 Aturan Data yang Harus Dijaga**
* **Multi-kios:** Satu pemilik bisa memiliki lebih dari satu `Sewa` aktif untuk `Id_Kios` berbeda pada periode yang sama. `Dokumen.Id_Kios` memastikan dokumen legalitas tidak tercampur antar kios milik pemilik yang sama.
* **Tenant Nonaktif ≠ Tenant Menunggak:** Status `Nonaktif` hanya diubah manual oleh admin saat tenant benar-benar berhenti (bukan otomatis dari keterlambatan bayar). Tenant yang menunggak berbulan-bulan tetap `Aktif` selama masih menempati kios.
* **Tunggakan Akumulatif:** `Hutang_Tunggakan` bertambah otomatis tiap kali `Tagihan` siklus sebelumnya tidak lunas saat `Tagihan` siklus berikutnya diterbitkan. Tidak ada snapshot statis lagi — semua dihitung dari sistem berjalan.
* **Pembayaran Cicilan FIFO dengan Nominal Bebas:** Tenant boleh membayar berapa saja. Sistem mengalokasikan otomatis ke tagihan tertua dulu (FIFO). Tidak ada pilihan manual bulan mana yang dilunasi.
* **Metode Pembayaran Terpadu (V5.3):** Hanya ada 3 metode resmi — `Transfer` (upload bukti, verifikasi manual), `Tunai` (di loket), `Midtrans` (gateway otomatis, mencakup QRIS/e-wallet/credit card). Tidak ada metode "QRIS Manual" terpisah.
* **No_KTP Unique:** Constraint `UNIQUE` mencegah duplikasi data pemilik aktif dengan KTP yang sama.
* **Format Mata Uang:** Semua nilai nominal WAJIB diformat menggunakan `Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })`.

---

## **3. ARSITEKTUR RUTE DAN STRUKTUR APLIKASI**

Sistem dibagi menjadi 3 zona utama yang diatur dalam `src/App.jsx`:

### **3.1 Zona Publik (Tanpa Login)**
- **`LandingPage.jsx` (`/`)**: Menampilkan landing page publik, banner promosi, profil Plaza Kebun Sayur, direktori kios publik, serta tombol navigasi masuk (login).
- **`AuthPage.jsx` (`/auth`)**: Halaman login terpadu untuk tenant dan admin, lengkap dengan fitur pengingat sesi (remember me) dan tombol simulasi sakelar peran.
- **`ForgotPassword.jsx` (`/auth/lupa-sandi`)**: Halaman reset/lupa kata sandi. Mendukung input **Username ATAU Email** (V5.1), dengan callout bantuan menghubungi WhatsApp resmi pengelola untuk tenant yang kesulitan mengakses email.

### **3.2 Zona Tenant (Pemilik Kios)**
Diakses di bawah proteksi rute `ProtectedRoute allowedRoles={['tenant']}`:
- **`DashboardTenant.jsx` (`/tenant/dashboard`)**: Ringkasan sapaan personal, status tagihan siklus berjalan (`Tarif_Sewa` + `Hutang_Tunggakan` jika ada), dan aksi cepat bayar.
- **`BayarSekarang.jsx` (`/tenant/pembayaran`)**: Interface pembayaran dengan input **nominal bebas** (tidak harus pas `Total_Tagihan`). Sistem menampilkan preview alokasi FIFO real-time sebelum submit. Metode pembayaran yang ditawarkan:
  - **Transfer Bank** (BNI/Mandiri) — tenant upload bukti transfer, admin verifikasi manual
  - **Midtrans Snap Gateway** — mencakup QRIS, e-wallet (GoPay, OVO, ShopeePay, dll), credit/debit card, dan metode digital lainnya; verifikasi otomatis via webhook, **tidak perlu upload bukti**
  
  🔧 **Koreksi V5.3**: Opsi "QRIS Manual" (dengan upload screenshot QRIS) **dihapus** dari form ini — QRIS kini hanya tersedia lewat Midtrans.
- **`HistoriPembayaran.jsx` (`/tenant/histori`)**: Tabel/kartu riwayat transaksi pembayaran tenant lengkap dengan badge status (`Lunas`, `Dicicil`, `Menunggu Verifikasi`, `Ditolak`) dan breakdown alokasi per transaksi via `AlokasiBreakdown.jsx`.
- **`TunggakanAR.jsx` (`/tenant/tunggakan`)**: Rincian akumulasi tunggakan dari siklus-siklus `Sewa` sebelumnya yang belum lunas (bersifat berjalan, bukan snapshot historis). Menampilkan daftar `Tagihan` per periode beserta **progres cicilan** (berapa `Total_Terbayar` dari `Total_Tagihan` masing-masing, dihitung *on-the-fly* dari `Alokasi_Pembayaran`).
- **`AkunTenant.jsx` (`/tenant/akun`)**: Pengaturan profil tenant, detail unit kios yang disewa pada siklus berjalan, dan form ubah kata sandi.

### **3.3 Zona Admin (Pengelola Plaza)**
Diakses di bawah proteksi rute `ProtectedRoute allowedRoles={['admin']}`:
- **`DashboardAdmin.jsx` (`/admin/dashboard`)**: Panel utama admin berisi ringkasan statistik (Tenant Aktif, Menunggu Verifikasi, Total Dana Terkumpul), tabel tenant dengan kolom **"Status Bulan Ini"**, serta modal verifikasi cepat.
- **`VerifikasiBuktiTransfer.jsx` (`/admin/verifikasi-bukti`)**: Antrean khusus untuk memproses dan mengonfirmasi/menolak bukti transfer yang diunggah tenant (hanya untuk pembayaran metode `Transfer` — Midtrans tidak muncul di sini karena sudah otomatis terverifikasi).
- **`SetoranTunai.jsx` (`/admin/setoran-tunai`)**: Form loket pembayaran tunai langsung di kantor pengelola dengan input **nominal bebas**, preview alokasi FIFO, dan lampiran foto fisik bukti setoran (opsional).
- **`RiwayatTransaksiAdmin.jsx` (`/admin/riwayat`)**: Log seluruh transaksi sistem (Tunai, Transfer, Midtrans — 🔧 **QRIS dihapus dari daftar filter di V5.3**) beserta pencarian & filter. Transaksi QRIS tercatat sebagai `"Midtrans"` dengan metadata payment type dari webhook.
- **`KetersediaanKios.jsx` (`/admin/kios`)**: Tabel pemetaan utilitas unit kios (Lantai, No. Kios, Status, Nama Pemilik, Jenis Usaha, Catatan) dan modal pendaftaran tenant baru.
- **`DetailAdministrasiKios.jsx` (`/admin/detail-administrasi`)**: Halaman detail dokumen legalitas kios, ditarik dari tabel `Dokumen` generik (SP, PPJB, Sertifikat) yang terhubung ke `Id_Kios` spesifik. Termasuk fitur reset kata sandi tenant oleh admin (dengan password sementara & tombol salin pesan WhatsApp).
- **`DetailKeuanganTenant.jsx`**: View drill-down dari `DashboardAdmin.jsx` untuk melihat seluruh riwayat `Tagihan` dan `Pembayaran` tenant tertentu, termasuk **breakdown `Alokasi_Pembayaran`** yang menunjukkan berapa rupiah dari setiap pembayaran yang dialokasikan ke tagihan mana.
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
* **Status Pending / Tunggakan**: Orange `var(--orange)` (`#C05C00`), Orange Background `var(--orange-bg)` (`#FEF3E6`).

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

> ⚠️ **Struktur di bawah ini menggantikan seluruh versi sebelumnya.** Backend WAJIB mengikuti skema `ERD v4` final pada bab 2. Lihat `bunsay_erd.dbml.md` untuk kode DBML lengkap yang bisa langsung di-import ke [dbdiagram.io](https://dbdiagram.io/d).

### **6.1 Ringkasan Skema (lihat Bab 2 untuk detail lengkap)**

9 tabel: `Roles`, `User`, `Pemilik`, `Kios`, `Dokumen`, `Sewa`, `Tagihan`, `Pembayaran`, `Alokasi_Pembayaran`. Poin krusial yang **berbeda dari asumsi umum desain sistem sewa**:
- `Sewa` adalah siklus **bulanan** (baris baru tiap bulan), bukan kontrak jangka panjang.
- `Tagihan.Hutang_Tunggakan` bersifat **akumulatif berjalan**, bukan snapshot statis.
- **`Pembayaran` mendukung CICILAN dengan NOMINAL BEBAS** — tenant boleh membayar berapa saja, tidak harus melunasi seluruh `Total_Tagihan` sekaligus.
- **Alokasi FIFO otomatis** — backend mengalokasikan pembayaran ke tagihan tertua dulu. Tenant tidak memilih bulan mana yang dilunasi.
- `Alokasi_Pembayaran` (junction table dengan `Nominal_Teralokasi`) mencatat alokasi parsial per tagihan.
- `Total_Terbayar` dan `Status_Tagihan` dihitung *on-the-fly*, bukan disimpan sebagai kolom.
- 🔧 **Metode pembayaran hanya 3** (`Transfer`, `Tunai`, `Midtrans`) — QRIS bukan metode terpisah, melainkan salah satu payment method di dalam Midtrans (V5.3).

### **6.2 Ketentuan Kepatuhan API Backend**

1. **Aturan ENUM Case-Sensitive**:
   Frontend menggunakan perbandingan string persis. Backend wajib mengembalikan nilai ENUM dalam format huruf kapital yang tepat sesuai skema Bab 2:
   - `Status_Tagihan`: `"Lunas"`, `"Belum Bayar"`, `"Dicicil"`, `"Menunggu Verifikasi"` *(🆕 "Dicicil" ditambahkan di V5.2)*
   - `Status` (Kios): `"Terisi"`, `"Kosong"`
   - `Status_Pemilik`: `"Aktif"`, `"Nonaktif"`
   - `Verifikasi_Pembayaran`: `"Menunggu"`, `"Diterima"`, `"Ditolak"`
   - `Metode_Bayar`: `"Transfer"`, `"Tunai"`, `"Midtrans"` *(🔧 **"QRIS" dihapus di V5.3**)*

2. **Payload Upload Pembayaran** *(direvisi di V5.2 & V5.3)*:
   Endpoint `POST /tenant/payment` wajib menerima payload `multipart/form-data` dengan field:
   - `nominal_bayar` (number — **nominal bebas**, tidak harus sama dengan `Total_Tagihan` tenant; backend yang menentukan alokasi FIFO)
   - `metode_bayar` (string, sesuai ENUM di atas — **hanya `"Transfer"`, `"Tunai"`, atau `"Midtrans"`**)
   - `bukti_pembayaran` (file gambar, **wajib jika `metode_bayar` = `"Transfer"`**; opsional untuk lainnya)
   
   > ⚠️ Field `id_tagihan` **TIDAK ADA lagi** di payload (dihapus di V5.2). Backend menentukan tagihan mana yang teralokasi berdasarkan `Id_Pemilik` dari token autentikasi dan algoritma FIFO.
   > 
   > ⚠️ Pembayaran via Midtrans (termasuk QRIS, e-wallet, card) **tidak melalui endpoint ini** — Midtrans punya flow terpisah (Snap token → popup pembayaran → webhook callback ke backend). Endpoint ini hanya untuk Transfer dan Tunai.
   
3. **Endpoint Verifikasi Pembayaran & Algoritma Alokasi FIFO** *(direvisi di V5.2)*:
   Endpoint `POST /admin/verifikasi-pembayaran/:id_pembayaran` yang mengubah `Verifikasi_Pembayaran` menjadi `"Diterima"` **wajib** memicu proses berikut di backend (tidak ada logika ini di frontend):
   
   **Algoritma FIFO:**
   1. Ambil `Id_Pemilik` dari `Pembayaran` yang sedang diverifikasi.
   2. Query semua `Tagihan` milik `Pemilik` tersebut yang `Status_Tagihan != "Lunas"`, urutkan berdasarkan `Periode` ASC (tertua dulu).
   3. Inisialisasi `sisa_nominal = Pembayaran.Total_Bayar`.
   4. Loop setiap `Tagihan` (dari yang tertua):
      - Hitung `sisa_tagihan = Tagihan.Total_Tagihan - SUM(Alokasi_Pembayaran.Nominal_Teralokasi WHERE Id_Tagihan = tagihan ini)`.
      - `alokasi = MIN(sisa_nominal, sisa_tagihan)`.
      - Insert baris baru ke `Alokasi_Pembayaran` dengan `Nominal_Teralokasi = alokasi`.
      - `sisa_nominal -= alokasi`.
      - Hitung ulang `SUM` untuk tagihan ini, update `Status_Tagihan`:
        - Jika `SUM >= Total_Tagihan` → `"Lunas"`
        - Jika `0 < SUM < Total_Tagihan` → `"Dicicil"`
      - Jika `sisa_nominal <= 0`, berhenti.
   5. Jika setelah loop masih ada `sisa_nominal > 0` (semua tagihan sudah lunas tapi uang masih sisa), catat sebagai kelebihan bayar (edge case — perlu ditangani sesuai kebijakan bisnis).
   
   Tanpa langkah ini, tagihan-tagihan yang seharusnya sudah dicicil/lunas akan tetap tampil sebagai tunggakan di `TunggakanAR.jsx` dan `DetailKeuanganTenant.jsx`.

4. **Midtrans Webhook Handler** *(🆕 V5.3)*:
   Backend wajib menyediakan endpoint webhook untuk menerima notifikasi pembayaran dari Midtrans (termasuk pembayaran QRIS, e-wallet, credit card). Flow:
   - Midtrans mengirim `payment_notification` ke endpoint backend setelah tenant menyelesaikan pembayaran di popup Snap.
   - Backend memverifikasi signature Midtrans, lalu membuat baris `Pembayaran` dengan `Metode_Bayar = "Midtrans"` dan langsung `Verifikasi_Pembayaran = "Diterima"` (karena gateway sudah memverifikasi).
   - Backend menjalankan algoritma FIFO yang sama seperti di poin 3 untuk mengalokasikan pembayaran ke tagihan-tagihan tenant.
   - Tidak ada antrean verifikasi manual untuk pembayaran Midtrans — admin tidak perlu action apapun.

5. **Endpoint Ekspor Excel**:
   Endpoint `GET /admin/export` wajib mengembalikan stream biner berkas `.xlsx` dengan header HTTP:
   `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

6. **Format Respons Error Terstandar (WCAG 2.2)**:
   Setiap respons kesalahan (HTTP status 400, 422, 500) **wajib** mengembalikan JSON dengan struktur pesan Bahasa Indonesia formal yang informatif:
   ```json
   {
     "message": "Nomor KTP harus berisi 16 digit angka",
     "field": "no_ktp"
   }
   ```
