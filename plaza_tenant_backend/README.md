# 🏪 Plaza Tenant Backend — Bunsay Kebun Sayur Balikpapan

Backend RESTful API berbasis **Laravel 11** & **PHP 8.3** yang menyediakan endpoint terpartisi untuk portal tenant (`bunsayhub.id`) dan konsol pengelola (`admin.bunsayhub.id`).

---

## ✅ Panduan Setup Backend

### Langkah 1 — Masuk Direktori & Install Dependencies

```bash
cd plaza_tenant_backend
composer install
```

---

### Langkah 2 — Konfigurasi Environment `.env`

```bash
cp .env.example .env
php artisan key:generate
```

Buka file `.env` dan pastikan konfigurasi koneksi database MySQL sudah sesuai:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=plaza_tenant
DB_USERNAME=root
DB_PASSWORD=
```

> 💡 *Buat database bernama `plaza_tenant` terlebih dahulu di MySQL/phpMyAdmin sebelum melanjutkan.*

---

### Langkah 3 — Jalankan Migrasi & Seeder Komprehensif

Sistem telah dilengkapi dengan 27 file migrasi dan orchestrator seeder yang otomatis menghasilkan **252+ Akun Tenant** beserta seluruh skenario data bisnis dan edge cases:

```bash
# Reset database total & isi data simulasi 252+ tenant
php artisan migrate:fresh --seed
```

> 📋 *Untuk rincian akun login pengujian (5 akun admin & skenario tenant unggulan), baca dokumen [README_SEEDER.md](README_SEEDER.md).*

---

### Langkah 4 — Jalankan Server Lokal

```bash
php artisan serve
```

Server backend aktif di: **`http://localhost:8000`**

---

### Langkah 5 — Menjalankan Frontend Monorepo (Terminal Terpisah)

Buka terminal baru di root folder frontend (`plaza_tenant_frontend`):

```bash
cd ..\plaza_tenant_frontend

# Install dependensi monorepo
npm install

# Menjalankan Portal Tenant (Port 5173):
npm run dev:tenant

# ATAU Menjalankan Konsol Admin (Port 3001):
npm run dev:admin
```

---

## 🚦 Struktur API Routes Resmi (v1 Dual-Domain)

Seluruh route beroperasi di bawah file [`routes/api.php`](routes/api.php) dengan partisi konteks yang tegas:

### 1. Autentikasi Tenant (`/api/v1/tenant/auth`)
| Method | Endpoint | Handler | Deskripsi & Auth |
|---|---|---|---|
| `POST` | `/api/v1/tenant/auth/login` | `AuthController@login` | Login tenant (username/password) — Public |
| `POST` | `/api/v1/tenant/auth/register` | `AuthController@register` | Registrasi akun tenant baru — Public |
| `POST` | `/api/v1/tenant/auth/refresh` | `AuthController@refresh` | Silent refresh token via HttpOnly Cookie |
| `POST` | `/api/v1/tenant/auth/logout` | `AuthController@logout` | Invalidation token & hapus cookie — Sanctum |
| `PUT` | `/api/v1/tenant/auth/profile` | `AuthController@updateProfile` | Update profil penyewa — Sanctum |
| `PUT` | `/api/v1/tenant/auth/change-password` | `AuthController@changePassword` | Ganti kata sandi — Sanctum |

### 2. Portal Bisnis Tenant (`/api/v1/tenant`)
| Method | Endpoint | Handler | Deskripsi |
|---|---|---|---|
| `GET` | `/api/v1/tenant/dashboard` | `DashboardController@tenantDashboard` | Data ringkasan kios, tagihan berjalan, & status sewa |
| `GET` | `/api/v1/tenant/pembayaran` | `PembayaranController@index` | Riwayat tagihan & riwayat transaksi tenant |
| `POST` | `/api/v1/tenant/pembayaran` | `PembayaranController@store` | Kirim setoran pembayaran cicilan (Transfer / Midtrans) |
| `POST` | `/api/v1/tenant/pembayaran/{id}/sanggah` | `PembayaranController@sanggah` | Ajukan sanggahan atas pembayaran yang ditolak |
| `GET` | `/api/v1/tenant/notifications` | `NotificationController@tenantNotifications` | Ambil notifikasi event tenant |
| `PUT` | `/api/v1/tenant/notifications/read-all` | `NotificationController@markAllAsRead` | Tandai semua notifikasi tenant sudah dibaca |

### 3. Autentikasi Pengelola / Admin (`/api/v1/admin/auth`)
| Method | Endpoint | Handler | Deskripsi & Auth |
|---|---|---|---|
| `POST` | `/api/v1/admin/auth/login` | `AuthController@login` | Login staf admin — Public |
| `POST` | `/api/v1/admin/auth/refresh` | `AuthController@refresh` | Silent refresh token pengelola via HttpOnly Cookie |
| `POST` | `/api/v1/admin/auth/logout` | `AuthController@logout` | Invalidation token admin — Sanctum |
| `PUT` | `/api/v1/admin/auth/profile` | `AuthController@updateProfile` | Update profil admin — Sanctum |
| `PUT` | `/api/v1/admin/auth/change-password` | `AuthController@changePassword` | Ganti kata sandi admin — Sanctum |

### 4. Konsol Bisnis & Master Data Admin (`/api/v1/admin` - Guard `auth:sanctum` + `admin`)
| Method | Endpoint | Handler | Deskripsi |
|---|---|---|---|
| `GET` | `/api/v1/admin/dashboard` | `DashboardController@adminDashboard` | Statistik kios, tagihan pending, & pembayaran hari ini |
| `GET` | `/api/v1/admin/ekspor` | `PembayaranController@ekspor` | Data rekapitulasi transaksi sewa untuk ekspor Excel |
| `GET` | `/api/v1/admin/kios/kosong` | `KiosController@getKosong` | Ambil daftar kios berstatus Kosong untuk pendaftaran |
| `POST` | `/api/v1/admin/sewa/{id}/akhiri` | `SewaController@akhiriSewa` | Akhiri masa sewa tenant (ubah kios jadi Kosong) |
| `GET\|POST` | `/api/v1/admin/pemilik` | `PemilikController` (CRUD) | Manajemen master data penyewa/pemilik kios |
| `PUT` | `/api/v1/admin/pemilik/{id}/toggle-cicilan`| `PemilikController@toggleCicilan` | Toggle izin pembayaran cicilan per tenant |
| `GET\|POST` | `/api/v1/admin/kios` | `KiosController` (CRUD) | Manajemen unit fisik kios (lantai, nomor, ukuran) |
| `GET\|POST` | `/api/v1/admin/sewa` | `SewaController` (CRUD) | Manajemen kontrak sewa kios |
| `GET\|POST` | `/api/v1/admin/dokumen` | `DokumenController` (CRUD) | Manajemen berkas legalitas (SP, PPJB, Sertifikat) |
| `GET\|POST` | `/api/v1/admin/tagihan` | `TagihanController` | Manajemen tagihan retribusi bulanan |
| `GET\|POST` | `/api/v1/admin/pembayaran` | `PembayaranController` | Antrian transaksi pembayaran & verifikasi kasir |
| `PUT` | `/api/v1/admin/pembayaran/{id}/konfirmasi` | `PembayaranController@konfirmasi` | Konfirmasi terima / tolak bukti transfer (FIFO trigger) |
| `GET` | `/api/v1/admin/logs` | `ActivityLogController@index` | Audit trail riwayat tindakan sensitif staf |
| `GET\|POST\|PUT` | `/api/v1/admin/staf` | `StafManagementController` | RBAC manajemen akun staf pengelola oleh Superadmin |
| `PUT` | `/api/v1/admin/staf/{id}/toggle-status` | `StafManagementController@toggleStatus` | Aktifkan/nonaktifkan akun staf |
| `GET` | `/api/v1/admin/notifications` | `NotificationController@adminNotifications` | Ambil notifikasi event admin |
| `PUT` | `/api/v1/admin/notifications/{id}/read` | `NotificationController@markAsRead` | Tandai notifikasi spesifik dibaca |
| `PUT` | `/api/v1/admin/notifications/read-all` | `NotificationController@markAllAsRead` | Tandai seluruh notifikasi admin dibaca |

---

## 👥 Pembagian Tanggung Jawab Tim Backend

| Anggota Tim | Tanggung Jawab Modul & Controller |
|---|---|
| **PATRA** | `AuthController`, `DashboardController`, `EnsureAdminRole` Middleware, Sanctum Dual-Domain |
| **ARMAN** | `PemilikController`, `KiosController`, `SewaController`, `DokumenController`, Toggle Cicilan |
| **DAWWAS** | `TagihanController`, `PembayaranController`, Alokasi FIFO, Sanggahan/Dispute, Staf Management & RBAC |
