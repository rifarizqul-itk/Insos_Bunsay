# 🏪 Bunsay Hub — Plaza Kebun Sayur Balikpapan
### Sistem Digitalisasi Pembayaran Retribusi & Manajemen Sewa Kios Pasar Tradisional

[![Laravel](https://img.shields.io/badge/Laravel-11.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![PHP](https://img.shields.io/badge/PHP-8.3-777BB4?style=for-the-badge&logo=php&logoColor=white)](https://www.php.net)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com)
[![WCAG](https://img.shields.io/badge/Accessibility-WCAG_2.2_AA-22C55E?style=for-the-badge)](https://www.w3.org/WAI/standards-guidelines/wcag/)
[![Security Audit](https://img.shields.io/badge/Security_Audit-0_CVEs_Passed-10B981?style=for-the-badge)](https://github.com/)

> 🎓 **Program Inovasi Sosial — Institut Teknologi Kalimantan (ITK) 2026**  
> 🏢 **Mitra Program:** Pengelola UPTD Pasar Plaza Kebun Sayur — Dinas Perdagangan Kota Balikpapan  
> 👨‍🏫 **Dosen Pembimbing:** Hendy Indrawan Sunardi, S.Kom., M.Eng.  
> 🌿 **Branch Utama:** `main`

---

## 📌 Tentang Proyek

**Bunsay Hub** adalah platform tata kelola retribusi dan penyewaan kios pasar tradisional modern di **Plaza Kebun Sayur Balikpapan**. Sistem mengelola **886 kontrak sewa penyewa riil (884 unit kios fisik)** melintasi Lantai 1, Lantai 2, dan Lantai 3, mentransformasi pencatatan manual menjadi platform terpusat yang transparan, akuntabel, dan aman.

Sistem dibangun menggunakan arsitektur **Frontend Monorepo (npm workspaces)** dengan dua aplikasi terisolasi (*Tenant App* & *Admin App*) dan **Backend RESTful API (Laravel 11)** dengan keamanan *Sanctum Dual-Domain* (In-Memory Access Token + HttpOnly Refresh Cookie).

---

## 🏛️ Arsitektur Sistem & Direktori

```
Insos_Bunsay/
├── README.md                      # 📖 Master Documentation (File ini)
├── README_SEEDER.md               # 📋 Panduan Kredensial Login (Admin & 886 Tenant Riil)
├── .github/workflows/deploy.yml   # ⚙️ CI/CD Deployment Workflow (GitHub Actions)
│
├── plaza_tenant_frontend/         # 🎨 Frontend Monorepo (React 18 + Vite 8 + Tailwind v4)
│   ├── apps/
│   │   ├── tenant-app/            # 📱 Portal Penyewa Kios (bunsayhub.id - Port 5173)
│   │   └── admin-app/             # 💻 Konsol Pengelola, Kasir & Auditor (admin.bunsayhub.id - Port 5174)
│   ├── packages/
│   │   ├── shared-ui/             # 🧩 Shared Civic Design System (WCAG 2.2 AA compliant)
│   │   └── shared-core/           # ⚡ Shared Business Logic (FIFO Allocator, HTTP Client, ExcelJS)
│   ├── database/
│   │   └── bunsay_erd.dbml.md     # 📊 Database Diagram Markup Language (ERD v6 - 11 Tabel)
│   ├── GEMINI.md                  # 📜 Spesifikasi Teknis & Single Source of Truth Utama
│   └── package.json               # 📦 Monorepo Workspaces Configuration
│
└── plaza_tenant_backend/          # ⚙️ Backend RESTful API (Laravel 11 + PHP 8.3 + MySQL 8.0)
    ├── app/
    │   ├── Http/Controllers/      # 🎯 12 API Controllers (Auth, Tagihan, Pembayaran, Kios, Staf, dll.)
    │   ├── Http/Middleware/       # 🛡️ EnsureAdminRole & Sanctum Authentication
    │   └── Models/                # 🗄️ 10 Eloquent Models dengan relasi lengkap
    ├── database/
    │   ├── migrations/            # 🔨 29 Migration Files
    │   └── seeders/               # 🌾 RealTenantSeeder (886 Real Tenants) & AdminSeeder
    ├── routes/
    │   └── api.php                # 🚦 Versioned v1 Dual-Domain Scoped Routes
    ├── tests/Feature/             # 🧪 Automated Feature Test Suites (Auth, Payments, RBAC)
    └── phpunit.xml                # ⚡ Isolated In-Memory Testing Configuration
```

---

## 🚀 Panduan Memulai Cepat (Quickstart)

### Prasyarat:
* **PHP**: `>= 8.2` (PHP 8.3 direkomendasikan) dengan ekstensi `pdo_mysql`, `mbstring`, `openssl`, `sqlite3`
* **Composer**: `>= 2.6`
* **Node.js**: `>= 20.0` & **npm** `>= 10.0`
* **Database**: MySQL 8.0 / MariaDB (via DDEV Docker atau Laragon / XAMPP)

---

### Opsi A: Menggunakan DDEV Docker (Rekomendasi)

```bash
# 1. Masuk ke direktori backend dan jalankan container
cd plaza_tenant_backend
ddev start

# 2. Jalankan migrasi dan seeder data riil
ddev artisan migrate:fresh --seed

# 3. Jalankan automated test suite
ddev artisan test

# 4. Di terminal baru, jalankan frontend monorepo
cd ../plaza_tenant_frontend
npm install

# Jalankan Portal Tenant (Port 5173):
npm run dev:tenant

# ATAU Jalankan Konsol Admin (Port 5174):
npm run dev:admin
```

---

### Opsi B: Menggunakan Local Server (Laragon / XAMPP)

#### 1. Setup Backend:
```bash
cd plaza_tenant_backend
composer install
cp .env.example .env
php artisan key:generate

# Konfigurasikan DB_DATABASE=plaza_tenant di file .env Anda
php artisan migrate:fresh --seed
php artisan serve
```
> 🌐 Backend API aktif di: **`http://localhost:8000`** (Health Check: `http://localhost:8000/api/health`)

#### 2. Setup Frontend Monorepo:
```bash
cd plaza_tenant_frontend
npm install

# Portal Tenant:
npm run dev:tenant

# Konsol Admin Pengelola:
npm run dev:admin
```

---

## 🔑 Kredensial Login Pengujian (*Test Credentials*)

> 📖 **Daftar lengkap 886 akun tenant riil:** Lihat [README_SEEDER.md](README_SEEDER.md).

### 1. Akun Pengelola (*Admin Portal* — `http://localhost:5174`)
Seluruh akun pengelola menggunakan kata sandi: **`admin123`**

| No | Nama Akun | Username | Password | Role & Wewenang |
|:---:|:---|:---|:---:|:---|
| 1 | **Superadmin Utama** | `admin` / `superadmin` | `admin123` | **Superadmin** *(Akses Penuh: Verifikasi, Kasir, Kios, Ekspor, Audit Log, RBAC)* |
| 2 | **Petugas Loket Verifikasi** | `admin_verif` | `admin123` | **Verifikator** *(Konfirmasi Bukti Transfer Bank & Terbitkan Resi)* |
| 3 | **Kasir Loket Pasar** | `admin_kasir` / `kasir_lisa` | `admin123` | **Kasir Loket** *(Pencatatan Setoran Tunai Langsung & Kuitansi)* |
| 4 | **Petugas Kios & Legalitas** | `admin_kios` | `admin123` | **Petugas Kios** *(Manajemen Okupansi Kios, Sewa Baru, & Legalitas)* |
| 5 | **Petugas Laporan & Audit** | `admin_laporan` / `auditor_budi` | `admin123` | **Auditor** *(Ekspor Rekap Laporan Excel & Audit Trail)* |

### 2. Sampel Akun Penyewa (*Tenant Portal* — `http://localhost:5173`)
Seluruh akun penyewa menggunakan kata sandi: **`password123`**

| No | Nama Penyewa | Username | Password | No. Kios | Lantai | Jenis Usaha |
|:---:|:---|:---|:---:|:---:|:---:|:---|
| 1 | **Hj. Yuliana** | `hjyuliana` | `password123` | `B-1001` | Lantai 1 | Kerajinan |
| 2 | **Wong Nova** | `wong_nova` | `password123` | `D-3023` | Lantai 3 | Tekstile |
| 3 | **Achmad Padllik, SE** | `achmad_padllikse` | `password123` | `D-3077` | Lantai 3 | Elektronik |
| 4 | **Sabariah** | `sabariah` | `password123` | `D-3079` | Lantai 3 | Handphone |
| 5 | **Nurdin** | `nurdin` | `password123` | `A-1001` | Lantai 1 | Emas & Perhiasan |

---

## 🛡️ Fitur Unggulan & Arsitektur Keamanan

1. **Dual-Domain Authentication (Sanctum Secure Architecture)**:
   - **In-Memory Access Token**: Token JWT disimpan di memori context React (terlindung dari pencurian localStorage/XSS).
   - **HttpOnly Refresh Cookie**: Mekanisme *Silent Refresh* saat browser di-refresh tanpa mengekspos credential ke JavaScript.
   - **Domain Scoping**: Domain penyewa (`bunsayhub.id`) dan domain pengelola (`admin.bunsayhub.id`) terisolasi secara ketat.

2. **Algoritma Alokasi Pembayaran FIFO (*First-In, First-Out*)**:
   - Pembayaran parsial atau cicilan didistribusikan secara otomatis untuk melunasi tagihan tertua yang belum lunas.
   - Status tagihan bertransisi dinamis: `Belum Bayar` → `Dicicil` → `Lunas`.
   - Dilindungi database transactions (`DB::transaction`) dan *pessimistic row locking* (`lockForUpdate()`).

3. **Role-Based Access Control (RBAC) & Audit Trail**:
   - Pengaturan hak akses granular per staf (Kasir, Verifikator, Petugas Kios, Auditor).
   - Pelacakan aktivitas menyeluruh pada tabel `activity_logs` (*User, Modul, Aksi, Waktu, IP Address*).

4. **Multi-Channel Payment Gateway & Dispute Mechanism**:
   - **Midtrans Payment Gateway**: Integrasi Snap Token (QRIS, GoPay, ShopeePay, Virtual Account Bank).
   - **Transfer Bank Manual**: Verifikasi bukti unggah dengan resolusi sanggahan (*dispute/rebuttal flow*) dan proteksi IDOR.
   - **Setoran Tunai Loket**: Input langsung di loket pasar oleh petugas kasir.

5. **Standar Desain Modern Civic Precision (WCAG 2.2 AA)**:
   - Tipografi angka tabular (`.font-tabular-nums`) untuk keterbacaan data keuangan.
   - Touch targets ramah seluler minimal **44px** dan kontras warna terverifikasi.
   - Ekspor data laporan Excel diformat otomatis menggunakan `exceljs`.

---

## 🧪 Pengujian Otomatis & Verifikasi Build

```bash
# 1. Menjalankan Backend Automated Tests (In-Memory SQLite):
cd plaza_tenant_backend
ddev artisan test  # 11 tests, 21 assertions passed

# 2. Memeriksa Audit Dependensi (0 Vulnerabilities):
ddev composer audit
cd ../plaza_tenant_frontend && npm audit

# 3. Validasi Build Produksi Frontend:
npm run build
```

---

## 📚 Tautan Dokumentasi Terkait

* 📜 **[GEMINI.md](plaza_tenant_frontend/GEMINI.md)** — Spesifikasi Teknis Handover & Single Source of Truth Utama
* 📋 **[README_SEEDER.md](README_SEEDER.md)** — Panduan Kredensial Database Seeder & 886 Tenant Riil
* ⚙️ **[README Backend](plaza_tenant_backend/README.md)** — Panduan Khusus Pengembang Backend & Rute API
* 🎨 **[README Frontend](plaza_tenant_frontend/README.md)** — Panduan Khusus Pengembang Frontend & Arsitektur Komponen
* 📊 **[bunsay_erd.dbml.md](plaza_tenant_frontend/database/bunsay_erd.dbml.md)** — Diagram Skema Database ERD (11 Tabel)

---

## 👥 Tim Pengembang (Institut Teknologi Kalimantan)

* **Program:** Inovasi Sosial 2026
* **Institusi:** Institut Teknologi Kalimantan (ITK) Balikpapan
* **Mitra:** UPTD Pasar Plaza Kebun Sayur Balikpapan Barat
