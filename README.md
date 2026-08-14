# 🏪 Bunsay Hub — Plaza Kebun Sayur Balikpapan
### Sistem Digitalisasi Pembayaran Retribusi & Manajemen Sewa Kios Pasar Tradisional

> **Program Inovasi Sosial — Institut Teknologi Kalimantan (ITK) 2026**  
> **Mitra:** Pengelola Plaza Kebun Sayur Balikpapan Barat  
> **Dosen Pembimbing:** Hendy Indrawan Sunardi, S.Kom., M.Eng.  
> **Branch Pengembangan Aktif:** `refactor/monorepo-migration`

---

## 📌 Ringkasan Proyek

**Bunsay Hub** adalah platform digital *full-stack* yang mentransformasi tata kelola pembayaran sewa kios dan retribusi di Plaza Kebun Sayur Balikpapan (menampung 250+ tenant aktif) dari proses pencatatan fisik manual menjadi sistem digital yang transparan, akuntabel, dan terotomatisasi.

Sistem mengadopsi arsitektur **Frontend Monorepo (npm workspaces)** dengan dua aplikasi terpisah serta **Backend RESTful API (Laravel 11)** berbasis otentikasi *Sanctum Dual-Domain* (In-Memory Access Token + HttpOnly Refresh Cookie).

---

## 🏛️ Arsitektur Repositori

```
Insos_Bunsay/
├── README.md                      # 📖 Dokumentasi Master Proyek (File ini)
├── .github/workflows/deploy.yml   # ⚙️ CI/CD Deployment Pipeline (GitHub Actions)
│
├── plaza_tenant_frontend/         # 🎨 Frontend Monorepo (npm workspaces)
│   ├── apps/
│   │   ├── tenant-app/            # 📱 Portal Tenant (bunsayhub.id - Port 5173)
│   │   └── admin-app/             # 💻 Konsol Pengelola & Kasir (admin.bunsayhub.id - Port 3001)
│   ├── packages/
│   │   ├── shared-ui/             # 🧩 Shared Design System WCAG 2.2 AA (Tailwind CSS v4)
│   │   └── shared-core/           # ⚡ Shared Business Logic (FIFO Allocator, HTTP Client, Excel)
│   ├── database/
│   │   └── bunsay_erd.dbml.md     # 📊 Database Diagram Markup Language (ERD v6 - 11 Tabel)
│   ├── CONTEXT/                   # 📁 Data legalitas kios asli, notulensi rapat, & proposal
│   ├── GEMINI.md                  # 📜 Spesifikasi Handover & Single Source of Truth Utama
│   └── package.json               # 📦 Monorepo Workspaces Configuration
│
└── plaza_tenant_backend/          # ⚙️ Backend RESTful API (Laravel 11 + PHP 8.3)
    ├── app/
    │   ├── Http/Controllers/      # 🎯 11 Controller API (Auth, Kios, Tagihan, Staf, Logs, dll.)
    │   ├── Http/Middleware/       # 🛡️ EnsureAdminRole & Sanctum Security Middleware
    │   └── Models/                # 🗄️ 10 Eloquent Models dengan relasi lengkap
    ├── database/
    │   ├── migrations/            # 🔨 27 Migration Files (Schema v6)
    │   └── seeders/               # 🌾 ScenarioSeeder (252+ Tenant Accounts & Edge Cases)
    ├── routes/
    │   └── api.php                # 🚦 Scoped Dual-Domain Versioned API v1 Routes
    ├── README_SEEDER.md           # 📋 Panduan Akun Login Testing & Skenario Data
    └── README.md                  # 📘 Panduan Khusus Tim Backend
```

---

## 🚀 Panduan Memulai Cepat (Quickstart)

### Prasyarat Sistem:
- **PHP**: `>= 8.2` (Rekomendasi PHP 8.3+) dengan ekstensi `pdo_mysql`, `mbstring`, `openssl`
- **Composer**: `>= 2.6`
- **Node.js**: `>= 20.0` & **npm** `>= 10.0`
- **MySQL / MariaDB**: Server database lokal (Laragon / XAMPP)

---

### 1. Setup Backend API (`plaza_tenant_backend`)

Buka terminal di folder `plaza_tenant_backend`:

```bash
# 1. Masuk direktori backend
cd plaza_tenant_backend

# 2. Install dependensi PHP
composer install

# 3. Salin environment dan generate app key
cp .env.example .env
php artisan key:generate

# 4. Konfigurasi database di .env (pastikan database `plaza_tenant` telah dibuat)
# DB_DATABASE=plaza_tenant
# DB_USERNAME=root
# DB_PASSWORD=

# 5. Jalankan migrasi dan seeder otomatis (252+ Akun Tenant & 5 Akun Admin)
php artisan migrate:fresh --seed

# 6. Jalankan server backend
php artisan serve
```
> 🌐 Backend API aktif di: **`http://localhost:8000`**

---

### 2. Setup Frontend Monorepo (`plaza_tenant_frontend`)

Buka terminal baru di folder `plaza_tenant_frontend`:

```bash
# 1. Masuk direktori frontend
cd plaza_tenant_frontend

# 2. Install seluruh workspace dependensi sekaligus
npm install

# 3. Jalankan aplikasi pilihan:
# Menjalankan Portal Tenant (Port 5173):
npm run dev:tenant

# ATAU Menjalankan Konsol Admin (Port 3001):
npm run dev:admin
```

---

## 🔑 Kredensial Pengujian (Testing Accounts)

Semua akun pengujian menggunakan kata sandi seragam: **`password123`**

### 1. Akun Staf Pengelola / Admin
| Username | Role / Hak Akses | Deskripsi & Peruntukan |
| :--- | :--- | :--- |
| **`superadmin`** | `Superadmin` | Akses penuh seluruh modul, kelola akun staf & izin RBAC |
| **`admin`** | `Admin Kios` | Manajemen data kios, sewa, data pemilik, & laporan |
| **`staff_loket`** | `Staff Kasir` | Input setoran tunai loket & verifikasi transfer bank |
| **`kasir_lisa`** | `Staff Kasir` | Kasir loket operasional (Lisa Anggraini) |
| **`auditor_budi`** | `Auditor` | Hak akses baca untuk audit log & ekspor rekapitulasi Excel |

### 2. Akun Tenant Unggulan per Skenario Bisnis
| Username | Skenario Pengujian | Karakteristik Data |
| :--- | :--- | :--- |
| **`tenant_aktif`** | **SC-03 (Aktif Rutin)** | Kios A1-01, riwayat lunas 6 bulan, siap bayar bulan berjalan |
| **`tenant_tunggak1`** | **SC-04 (Menunggak 1 Bulan)** | 1 tagihan lewat jatuh tempo tanggal 12 |
| **`tenant_tunggak_multi`** | **SC-05 (Menunggak 3 Bulan)** | Akumulasi tunggakan 3 bulan tanpa denda |
| **`tenant_fifocicil`** | **Edge Case (Cicilan FIFO)** | Tagihan menunggak dicicil bertahap dengan nominal bebas |
| **`tenant_dispute`** | **SC-17 (Sanggahan/Dispute)** | Bukti ditolak admin -> Tenant mengajukan sanggahan & perbaikan |
| **`tenant_midtrans`** | **SC-14 (Midtrans Gateway)** | Pembayaran otomatis terverifikasi tanpa antrian admin |
| **`tenant_multikios`** | **SC-08 (Multi Kios)** | 1 pemilik mengelola 3 unit kios sekaligus |
| **`tenant_selesai`** | **SC-07 (Masa Sewa Berakhir)** | Status sewa `'Selesai'`, kios `'Kosong'`, riwayat transaksi utuh |

> 📖 Untuk daftar lengkap **252+ Akun Tenant Bulk**, lihat [README_SEEDER.md](file:///d:/ITK/SEMESTER%205/INOVASI%20SOSIAL/Insos_Bunsay/plaza_tenant_backend/README_SEEDER.md).

---

## 💡 Fitur Unggulan Sistem

1. **Dual-Domain Authentication Security**:
   - Isolasi sesi otentikasi antara domain tenant (`bunsayhub.id`) dan admin (`admin.bunsayhub.id`).
   - Token disimpan di memori dan diperbarui via *HttpOnly SameSite Cookie* untuk mencegah kerentanan XSS/CSRF.
2. **Algoritma Alokasi Pembayaran FIFO**:
   - Mendukung pembayaran cicilan dengan nominal bebas. Sistem secara otomatis melunasi tagihan dengan periode tertua terlebih dahulu.
3. **Role-Based Access Control (RBAC) & Audit Trail**:
   - Superadmin dapat mengatur hak akses staf individual (Kasir, Auditor, Admin Kios).
   - Setiap tindakan sensitif tercatat otomatis pada tabel `activity_logs` (*User, Modul, Aksi, Waktu, IP Address*).
4. **Sistem Notifikasi Event-Driven**:
   - Notifikasi dinamis saat pembayaran diverifikasi/ditolak, sanggahan diajukan, atau tagihan diterbitkan.
5. **Standar Desain Modern Civic Precision (WCAG 2.2 AA)**:
   - Tipografi angka tabular (`.font-tabular-nums`), touch target seluler 44px, dan semantik formulir/tabel teraksesibel.

---

## 📚 Tautan Dokumentasi Terkait

- 📜 **[GEMINI.md](file:///d:/ITK/SEMESTER%205/INOVASI%20SOSIAL/Insos_Bunsay/plaza_tenant_frontend/GEMINI.md)** — Dokumen Spesifikasi Handover Resmi V6.0 (Single Source of Truth)
- ⚙️ **[README Backend](file:///d:/ITK/SEMESTER%205/INOVASI%20SOSIAL/Insos_Bunsay/plaza_tenant_backend/README.md)** — Panduan pengembangan teknis & rute API backend
- 🌾 **[README Seeder](file:///d:/ITK/SEMESTER%205/INOVASI%20SOSIAL/Insos_Bunsay/plaza_tenant_backend/README_SEEDER.md)** — Panduan skenario pengujian 252+ tenant
- 📊 **[bunsay_erd.dbml.md](file:///d:/ITK/SEMESTER%205/INOVASI%20SOSIAL/Insos_Bunsay/plaza_tenant_frontend/database/bunsay_erd.dbml.md)** — Diagram Relasi Database (ERD v6 - 11 Tabel)
