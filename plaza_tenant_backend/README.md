# 🏪 Plaza Tenant Backend — Bunsay Kebun Sayur Balikpapan

API Backend Laravel 11 untuk sistem manajemen sewa kios dan pembayaran.

---

## Prasyarat

Pastikan Laragon sudah berjalan dengan:
- PHP 8.3+
- MySQL aktif
- Composer tersedia di terminal Laragon

---

## ⚠️ Kenapa Perlu `composer install` Padahal Composer Sudah Ada?

Ini pertanyaan yang wajar. Laragon memang sudah include Composer (tool-nya), tapi **folder `vendor/` sengaja tidak di-upload ke Git** karena ukurannya terlalu besar.

Folder `vendor/` berisi seluruh framework Laravel, Sanctum, dan semua library PHP. Tanpa folder ini, `php artisan` tidak akan bisa jalan sama sekali.

```
Repo di GitHub:          Setelah clone ke komputermu:
├── composer.json  ──►  ├── composer.json   ✅ ada
├── composer.lock  ──►  ├── composer.lock   ✅ ada
└── vendor/ ✗      ──►  └── vendor/         ❌ KOSONG
                                              ↑ wajib jalankan composer install
```

**`composer install`** = perintah ke Composer untuk baca `composer.json` dan download semua dependency ke folder `vendor/` di komputermu sendiri.

---

## 👑 Langkah Owner (PATRA — Jalankan Sekali, Lalu Push)

> Ini hanya dijalankan **satu kali oleh pemilik repo** di komputernya.
> Setelah di-push, tim **tidak perlu** langkah ini — cukup `composer install`.

Buka terminal Laragon, lalu masuk ke folder backend:

```bash
# Ganti path sesuai lokasi folder project di komputermu
cd "C:\Users\NAMAMU\Documents\...\plaza_tenant_backend"

# Tambahkan Sanctum (mengupdate composer.json & composer.lock)
composer require laravel/sanctum

# Publish config Sanctum ke folder config/
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

Setelah selesai, **commit dan push**:

```bash
git add composer.json composer.lock config/sanctum.php
git commit -m "feat: install laravel sanctum"
git push
```

---

## 👥 Langkah Tim (Setelah Clone / Pull)

> Jalankan ini setiap kali **pertama clone** atau setelah pull perubahan besar dari owner.

Buka terminal Laragon, lalu masuk ke folder backend:

```bash
# Ganti path sesuai lokasi folder project di komputermu masing-masing
cd "C:\Users\NAMAMU\Documents\...\plaza_tenant_backend"

# 1. Download semua dependency PHP ke folder vendor/
#    (Termasuk Laravel, Sanctum, dll — wajib karena vendor/ tidak ada di Git)
composer install

# 2. Salin file konfigurasi environment
copy .env.example .env

# 3. Generate application key (wajib, tidak bisa dilewati)
php artisan key:generate

# 4. Edit file .env → sesuaikan nama database, username, password MySQL
#    (lihat bagian "Konfigurasi .env" di bawah)

# 5. Buat semua tabel di database
php artisan migrate
```

---

## Konfigurasi `.env` — Bagian Database

Buka file `.env` yang baru dibuat, lalu sesuaikan bagian ini:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=plaza_tenant
DB_USERNAME=root
DB_PASSWORD=           # kosongkan jika Laragon default (tanpa password)
```

> ⚠️ Pastikan database `plaza_tenant` sudah dibuat di phpMyAdmin / HeidiSQL **sebelum** menjalankan `php artisan migrate`.

---

## Menjalankan Server Development

```bash
# Jalankan Laravel di http://localhost:8000
php artisan serve
```

> Frontend (Vite) otomatis proxy semua request `/api/*` ke `localhost:8000`.
> Tidak perlu konfigurasi tambahan — langsung `npm run dev` di folder frontend.

---

## Struktur API Routes

Semua route ada di [`routes/api.php`](routes/api.php).

| Method | Endpoint | Controller | Auth |
|--------|----------|------------|------|
| POST | `/api/login` | AuthController@login | Public |
| POST | `/api/register` | AuthController@register | Public |
| POST | `/api/logout` | AuthController@logout | ✅ Sanctum |
| GET | `/api/dashboard/admin` | DashboardController@adminDashboard | ✅ Sanctum |
| GET | `/api/dashboard/tenant` | DashboardController@tenantDashboard | ✅ Sanctum |
| — | `/api/pemilik` | PemilikController (CRUD) | ✅ Sanctum |
| — | `/api/kios` | KiosController (CRUD) | ✅ Sanctum |
| — | `/api/sewa` | SewaController (CRUD) | ✅ Sanctum |
| — | `/api/dokumen` | DokumenController (CRUD) | ✅ Sanctum |
| — | `/api/tagihan` | TagihanController (index, store, show, update) | ✅ Sanctum |
| — | `/api/pembayaran` | PembayaranController (index, store, show, update) | ✅ Sanctum |
| PUT | `/api/pembayaran/{id}/konfirmasi` | PembayaranController@konfirmasi | ✅ Sanctum |

---

## Pembagian Tim

| Nama | Tanggung Jawab |
|------|----------------|
| **PATRA** | AuthController, DashboardController |
| **ARMAN** | PemilikController, KiosController, SewaController, DokumenController |
| **DAWWAS** | TagihanController, PembayaranController |
