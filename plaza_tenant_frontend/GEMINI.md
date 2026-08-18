# **FRONTEND & BACKEND DEVELOPMENT HANDOVER SPECIFICATION (V6.0 - MONOREPO & FULL DATABASE RELEASE)**

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
| **Versi Dokumen** | **V6.0 (Migrasi Monorepo, System RBAC, Audit Trail, & Dynamic Event Notifications)** |
| **Terakhir Diperbarui** | Agustus 2026 |

---

## **0. RIWAYAT PERUBAHAN HANDOVER & ARSITEKTUR (CHANGELOG V5.4 → V6.0)**

Berikut adalah rangkuman resmi pembaruan arsitektur monorepo, sistem RBAC, audit trail, serta notifikasi dinamis yang telah terimplementasi 100% pada codebase:

1. **Migrasi Arsitektur Monorepo (npm Workspaces)**:
   Aplikasi telah dikonversi dari Single Page Application (SPA) tunggal menjadi struktur **Monorepo Berbasis Paket Shared**:
   - **`apps/tenant-app`**: Portal khusus Tenant (`tenant.bunsay.id` / port 3000).
   - **`apps/admin-app`**: Konsol khusus Admin & Superadmin (`admin.bunsay.id` / port 3001).
   - **`packages/shared-core`**: Paket shared logika bisnis, algoritma alokasi FIFO (`allocatePaymentFIFO`), utility ekspor Excel (`exportExcel.js`), dan pembungkus API HTTP Client (`client.js`).
   - **`packages/shared-ui`**: Paket shared Design System UI (`Button`, `Card`, `FormField`, `Table`, `Modal`, `Badge`, `Toast`, `ErrorBoundary`, `AlokasiBreakdown`, `FIFOPreview`).

2. **Backend Architecture & Database Migration (`plaza_tenant_backend`)**:
   - Framework **Laravel 11+** dengan **Sanctum Dual-Domain Authentication** & HttpOnly Refresh Cookies.
   - **Pencegahan Duplicate Constraint**: Removal unique constraints di `tagihan` dan `pembayaran` untuk mendukung transaksi ganda per sewa dan pembayaran cicilan.
   - **Tabel Baru `activity_logs`**: Mencatat otomatis seluruh tindakan sensitif admin (*Siapa, Kapan, Modul, Jenis Aksi, Deskripsi, IP Address*).
   - **Tabel Baru `notifications`**: Menyimpan notifikasi event-driven real-time untuk Tenant dan Admin.
   - **Pembaruan Tabel `user` (RBAC)**: Kolom `nama_lengkap`, `email`, `sub_role`, `permissions` (JSON), dan `status_aktif`.
   - **Pembaruan Tabel `pembayaran`**: Kolom `catatan_admin`, `teks_sanggahan`, dan `bukti_sanggahan`.

3. **Sistem Otorisasi Bertingkat (RBAC & Superadmin Panel)**:
   - Eliminasi akun admin bersama. Setiap pengelola menggunakan akun staf individu (`superadmin`, `admin`, `kasir_lisa`, `auditor_budi`).
   - Halaman **Kelola Akun Staf Pengelola** di `akun-admin.jsx` khusus Superadmin dengan **Role Presets** (*Superadmin*, *Preset Kasir*, *Preset Auditor*, *Preset Admin Kios*) dan **Permission Matrix Checkboxes**.
   - Guard otorisasi navigasi sidebar dinamis pada `SidebarAdmin.jsx` yang memfilter menu sesuai hak akses staf.

4. **Sistem Notifikasi Dinamis (Event-Driven)**:
   - Eliminasi notifikasi hardcoded. Menyediakan endpoint `GET /notifications` dan `PUT /notifications/read-all`.
   - Backend memicu notifikasi otomatis saat verifikasi pembayaran (`Diterima`/`Ditolak`) dan pengajuan sanggahan tenant.
   - Dropdown notifikasi di `Topbar.jsx` (Admin & Tenant) dengan badge angka unread counter real-time dan aksi "Tandai Semua Dibaca".

5. **Siklus Pembayaran, Penolakan, Sanggahan, & UX Kasir**:
   - Modal konfirmasi verifikasi dengan alasan penolakan wajib & opsi ubah keputusan di *Riwayat Terproses*.
   - Form sanggahan tenant (teks alasan wajib, foto bukti perbaikan opsional).
   - UX Loket setoran tunai kasir (auto-fetch tagihan aktif, info lunas emerald, tombol alih otomatis + pop-up instan ke verifikasi untuk status *Menunggu Verifikasi*).
   - Pengurutan tabel (*Sortable Tables*) di seluruh aplikasi Tenant & Admin.
   - Pendaftaran sewa baru khusus **Dropdown Kios Kosong** dan tombol **Akhiri Masa Sewa** (status otomatis kembali `Kosong`).
   - **Integritas Audit Keuangan**: Penghapusan tombol edit status manual pada `detail-keuangan-tenant.jsx` sehingga status 100% terkalkulasi otomatis dari transaksi SQL.

---

## **1. KONTEKS PROYEK & ATURAN BISNIS**

### **1.1 Latar Belakang dan Tujuan**
Plaza Kebun Sayur Balikpapan adalah pusat perbelanjaan di Balikpapan Barat yang menaungi 250 tenant aktif. Sistem ini bertujuan memigrasikan proses pembayaran sewa kios dari manual di lantai 3 ke sistem digital terintegrasi yang efisien, transparan, dan terstruktur.

### **1.2 Aturan Bisnis Inti**
1. **Model Sewa Bulanan**: Baris `Sewa` mewakili siklus 1 bulan dan menghasilkan tepat 1 `Tagihan`.
2. **Entitas Pemilik Kios**: Pengelola mencatat 1 penanggung jawab resmi per kios terdaftar.
3. **Pembayaran Cicilan FIFO**: Tenant dapat membayar berapa saja (nominal bebas). Sistem mengalokasikan pembayaran ke tagihan tertua yang belum lunas secara otomatis (First-In-First-Out).
4. **Metode Pembayaran Resmi**:
   - `Transfer`: Upload foto resi transfer bank, diverifikasi manual oleh admin kasir.
   - `Tunai`: Pencatatan pembayaran tunai di loket pengelola lantai 3 oleh kasir.
   - `Midtrans`: Gateway otomatis mencakup QRIS, e-wallet, & kartu kredit (verifikasi otomatis via webhook).

---

## **2. SKEMA DATABASE LENGKAP (ERD V6 - 11 TABEL SQL)**

Berikut adalah rincian lengkap 11 tabel SQL yang digunakan oleh backend `plaza_tenant_backend`:

```
Roles (1)───(N) User (1)───(1) Pemilik (1)───(N) Dokumen
                                  │
                                  └───(N) Sewa (N)───(1) Kios
                                            │
                                            └───(1) Tagihan
                                                      │
                                             Alokasi_Pembayaran (N:N)
                                                      │
                                            Pembayaran (FIFO)

ActivityLog (Audit Trail Log)
Notification (Real-time Event Notifications)
```

### **2.1 Rincian Struktur Tabel Database SQL**

#### **1. `Roles`**
| Kolom | Tipe Data | Key | Keterangan |
| :--- | :--- | :--- | :--- |
| `Id_Roles` | INT | PK | `1` = Admin, `2` = Tenant |
| `Nama_Role` | VARCHAR(30) | | `"Admin"` / `"Tenant"` |

#### **2. `User` (Auth & RBAC)**
| Kolom | Tipe Data | Key | Keterangan |
| :--- | :--- | :--- | :--- |
| `Id_User` | INT | PK | Auto Increment |
| `Id_Roles` | INT | FK | Relasi ke `Roles.Id_Roles` |
| `Username` | VARCHAR(50) | UNIQUE | Identifier Login Utama (Tenant & Admin) |
| `Password` | VARCHAR(255) | | Hash Password (Bcrypt) |
| `nama_lengkap` | VARCHAR(100) | | Nama Lengkap Pengelola / Tenant |
| `email` | VARCHAR(100) | UNIQUE | Email Resmi Pemulihan |
| `sub_role` | VARCHAR(30) | | `superadmin`, `kasir`, `auditor`, `admin_kios`, `custom` |
| `permissions` | JSON | | Array Permission Keys RBAC |
| `status_aktif` | BOOLEAN | | Status Keaktifan Akun (`true` / `false`) |

#### **3. `Pemilik`**
| Kolom | Tipe Data | Key | Keterangan |
| :--- | :--- | :--- | :--- |
| `Id_Pemilik` | INT | PK | Auto Increment |
| `Id_User` | INT | FK (1:1) | Relasi ke `User.Id_User` |
| `Nama` | VARCHAR(50) | | Nama Pemilik Resmi Terdaftar |
| `No_Telepon` | VARCHAR(255) | | Nomor HP / WhatsApp |
| `No_KTP` | CHAR(16) | UNIQUE | Nomor KTP Pemilik |
| `Alamat` | TEXT | | Alamat Domisili Pemilik |
| `Status_Pemilik` | ENUM | | `"Aktif"` / `"Nonaktif"` |

#### **4. `Kios`**
| Kolom | Tipe Data | Key | Keterangan |
| :--- | :--- | :--- | :--- |
| `Id_Kios` | INT | PK | Auto Increment |
| `No_Kios` | VARCHAR(10) | UNIQUE | Kode Kios (contoh: `B-1001`) |
| `Lantai` | INT | | Nomor Lantai Kios |
| `Ukuran` | VARCHAR(20) | | Ukuran Kios (contoh: `6M`) |
| `Status` | ENUM | | `"Terisi"` / `"Kosong"` |

#### **5. `Dokumen`**
| Kolom | Tipe Data | Key | Keterangan |
| :--- | :--- | :--- | :--- |
| `Id_Dokumen` | INT | PK | Auto Increment |
| `Id_Pemilik` | INT | FK | Relasi ke `Pemilik.Id_Pemilik` |
| `Id_Kios` | INT | FK, NULLABLE | FK Kios (untuk SP, PPJB, Sertifikat) |
| `Jenis_Dokumen` | ENUM | | `'SP'`, `'PPJB'`, `'Sertifikat'`, `'KTP'` |
| `Nomor_Dokumen` | VARCHAR(100) | NULLABLE | Nomor Resmi Berkas |
| `Tanggal` | DATE | NULLABLE | Tanggal Penerbitan Berkas |
| `Keterangan` | TEXT | NULLABLE | Catatan Bebas Dokumen |

#### **6. `Sewa`**
| Kolom | Tipe Data | Key | Keterangan |
| :--- | :--- | :--- | :--- |
| `Id_Sewa` | INT | PK | Auto Increment |
| `Id_Pemilik` | INT | FK | Relasi ke `Pemilik.Id_Pemilik` |
| `Id_Kios` | INT | FK | Relasi ke `Kios.Id_Kios` |
| `Jenis_Usaha` | VARCHAR(100) | | Jenis Bidang Usaha Tenant |
| `Tanggal_Mulai` | DATE | | Awal Siklus Sewa Bulanan |
| `Tanggal_Selesai` | DATE | | Akhir Siklus Sewa Bulanan |
| `Keterangan` | TEXT | NULLABLE | Catatan Tambahan Sewa |

#### **7. `Tagihan`**
| Kolom | Tipe Data | Key | Keterangan |
| :--- | :--- | :--- | :--- |
| `Id_Tagihan` | INT | PK | Auto Increment |
| `Id_Sewa` | INT | FK (1:1) | Relasi ke `Sewa.Id_Sewa` |
| `Periode` | CHAR(7) | INDEX | Format `YYYY-MM` (contoh: `2026-05`) |
| `Jatuh_Tempo` | DATE | | Tanggal Jatuh Tempo (Tgl 12 tiap bulan) |
| `Tarif_Sewa` | DECIMAL(12,2) | | Tarif Sewa Bulan Berjalan |
| `Hutang_Tunggakan` | DECIMAL(12,2) | | Akumulasi Tunggakan Siklus Lalu |
| `Total_Tagihan` | DECIMAL(12,2) | | `Tarif_Sewa` + `Hutang_Tunggakan` |
| `Status_Tagihan` | ENUM | INDEX | `'Lunas'`, `'Belum Bayar'`, `'Dicicil'`, `'Menunggu Verifikasi'` |

#### **8. `Pembayaran`**
| Kolom | Tipe Data | Key | Keterangan |
| :--- | :--- | :--- | :--- |
| `Id_Pembayaran` | INT | PK | Auto Increment |
| `Id_Tagihan` | INT | FK | Relasi ke `Tagihan.Id_Tagihan` |
| `Tanggal_Bayar` | DATE | | Tanggal Transaksi Pembayaran |
| `Total_Bayar` | DECIMAL(12,2) | | Nominal Pembayaran (Bebas / Cicilan) |
| `Metode_Bayar` | ENUM | | `'Transfer'`, `'Tunai'`, `'Midtrans'` |
| `Bukti_Pembayaran` | VARCHAR(255) | NULLABLE | Path Foto Resi Transfer Bank |
| `Verifikasi_Pembayaran` | ENUM | | `'Menunggu'`, `'Diterima'`, `'Ditolak'` |
| `catatan_admin` | TEXT | NULLABLE | Alasan Penolakan dari Admin |
| `teks_sanggahan` | TEXT | NULLABLE | Alasan Sanggahan dari Tenant |
| `bukti_sanggahan` | VARCHAR(255) | NULLABLE | Path Foto Resi Sanggahan Perbaikan |

#### **9. `Alokasi_Pembayaran`** *(Junction Table FIFO)*
| Kolom | Tipe Data | Key | Keterangan |
| :--- | :--- | :--- | :--- |
| `Id_Alokasi` | INT | PK | Auto Increment |
| `Id_Pembayaran` | INT | FK | Relasi ke `Pembayaran.Id_Pembayaran` |
| `Id_Tagihan` | INT | FK | Relasi ke `Tagihan.Id_Tagihan` |
| `Nominal_Teralokasi` | DECIMAL(12,2) | | Nominal Rupiah yang Dialokasikan Ke Tagihan Ini |

#### **10. `activity_logs`** *(Audit Trail System)*
| Kolom | Tipe Data | Key | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | Auto Increment |
| `id_user` | BIGINT | FK | ID Admin / User Pelaku Aksi |
| `username` | VARCHAR(100) | | Username Pelaku Aksi |
| `role` | VARCHAR(50) | | Sub-Role Admin |
| `modul` | VARCHAR(50) | | Modul Target (`Pembayaran`, `User`, `Sewa`, dll) |
| `aksi` | VARCHAR(50) | | Jenis Aksi (`Login`, `Verifikasi Terima`, `Edit Profil`, dll) |
| `deskripsi` | TEXT | | Deskripsi Rinci Aktivitas |
| `ip_address` | VARCHAR(45) | | IP Client Pelaku |
| `created_at` | TIMESTAMP | | Waktu Kejadian Aktivitas |

#### **11. `notifications`** *(Dynamic Event-Driven Notifications)*
| Kolom | Tipe Data | Key | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | Auto Increment |
| `target_type` | VARCHAR(20) | | Target Pengguna (`'tenant'` / `'admin'`) |
| `id_user` | BIGINT | NULLABLE | User ID Spesifik (null = All Admin) |
| `title` | VARCHAR(150) | | Judul Notifikasi |
| `message` | TEXT | | Pesan Rinci Notifikasi |
| `type` | VARCHAR(20) | | `'success'`, `'warning'`, `'danger'`, `'info'` |
| `is_read` | BOOLEAN | | Status Dibaca (`false` / `true`) |
| `link` | VARCHAR(255) | NULLABLE | Tautan Navigasi Internal |
| `created_at` | TIMESTAMP | | Waktu Pengiriman |

---

## **3. ARSITEKTUR RUTE & APLIKASI MONOREPO**

### **3.1 Apps Portal Tenant (`apps/tenant-app`)**
- `/` – Landing Page Publik & Direktori Kios
- `/auth` & `/auth/lupa-sandi` – Login Terpadu & Reset Password
- `/tenant/dashboard` – Dashboard Ringkasan Sapaan & Status Tagihan
- `/tenant/pembayaran` – Modul Pembayaran & Form Sanggahan Bukti Transfer
- `/tenant/histori` – Riwayat Transaksi Real-time
- `/tenant/tunggakan` – Akumulasi Tunggakan Berjalan
- `/tenant/akun` – Profil Tenant & Ubah Password

### **3.2 Apps Konsol Admin (`apps/admin-app`)**
- `/admin/dashboard` – Summary Statistik & Tabel Status Bulan Ini (Sortable)
- `/admin/verifikasi-bukti` – Antrean & Riwayat Verifikasi Transfer Bank (Auto-open modal supported)
- `/admin/setoran-tunai` – Loket Setoran Kasir dengan Auto-Fetch Tagihan & Warning Status
- `/admin/riwayat` – Log Riwayat Transaksi Lintas Metode (Sortable)
- `/admin/kios` – Pemetaan Utility Kios & Dropdown Sewa Baru Kios Kosong + Tombol Akhiri Sewa
- `/admin/detail-administrasi` – Legalitas Kios Generik & Reset Password Tenant
- `/admin/audit-log` – Log Aktivitas Staf Pengelola (Audit Trail System)
- `/admin/ekspor` – Ekspor Rekapitulasi Data Excel (.xlsx)
- `/admin/akun` – Profil Admin & Panel Superadmin Kelola Staf (RBAC Presets & Permission Matrix)

---

## **4. STANDAR ASET & HAK AKSES PERMISSION KEYS**

Berikut adalah daftar kunci izin (*Permission Keys*) resmi yang dievaluasi oleh backend `EnsureAdminRole` dan dipetakan ke UI `SidebarAdmin.jsx`:

| Key Permission | Label Fitur | Akses Rute / Menu |
| :--- | :--- | :--- |
| `verifikasi_pembayaran` | Verifikasi Bukti Transfer | `/admin/verifikasi-bukti` |
| `input_setoran` | Setoran Tunai Loket Kasir | `/admin/setoran-tunai` |
| `ekspor_laporan` | Ekspor Rekapitulasi Data | `/admin/ekspor` |
| `kelola_kios` | Kelola Kios & Pendaftaran Sewa | `/admin/kios`, `/admin/detail-administrasi` |
| `kelola_admin` | Kelola Akun Staf (Superadmin) | Panel Staf di `/admin/akun` |
| `lihat_audit_log` | Audit Trail Activity Log | `/admin/audit-log` |

---

## **5. PANDUAN PENGUJIAN & BUILD PRODUCTION**

Gunakan perintah CLI berikut untuk menjalankan dan memverifikasi build produksi:

```bash
# Menjalankan Server Backend Laravel
cd plaza_tenant_backend
C:\laragon\bin\php\php-8.3.33-Win32-vs16-x64\php.exe artisan serve

# Menjalankan Application Dev Server Frontend
cd plaza_tenant_frontend
npm run dev:tenant   # Portal Tenant (http://localhost:3000)
npm run dev:admin    # Konsol Admin (http://localhost:3001)

# Verifikasi Production Build
npm run build --workspace=apps/tenant-app
npm run build --workspace=apps/admin-app
```

Dokumen ini merupakan spesifikasi mutlak pengembang untuk arsitektur V6.0 Monorepo Release. 🚀
