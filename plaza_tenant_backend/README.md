# 🏪 Plaza Tenant Backend — Bunsay Kebun Sayur Balikpapan

API Backend Laravel 11 untuk sistem manajemen sewa kios dan pembayaran.

---

## ✅ Panduan Setup — Untuk Semua Anggota Tim

> Ikuti langkah ini **dari awal sampai selesai**.



### Langkah 1 — Clone Repo

```bash
git clone <https://github.com/rifarizqul-itk/Insos_Bunsay/tree/main> plaza_tenant_backend
cd plaza_tenant_backend
```

> Kalau sudah pernah clone, cukup pull:
> ```bash
> git pull
> ```
---

### Langkah 2 — Install Dependency PHP

```bash
composer install
```

> Ini mendownload Laravel, Sanctum, dan semua library PHP ke folder `vendor/`.
> Folder `vendor/` tidak ada di Git, jadi wajib dijalankan di tiap komputer.

---

### Langkah 3 — Buat File Konfigurasi

```bash
copy .env.example .env
php artisan key:generate
```

---

### Langkah 4 — Sesuaikan Database di `.env`

Buka file `.env`, cari bagian ini dan sesuaikan:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=plaza_tenant
DB_USERNAME=root
DB_PASSWORD=
```

> Kosongkan `DB_PASSWORD` kalau Laragon default (tanpa password).
> Buat database `plaza_tenant` dulu di phpMyAdmin sebelum lanjut.

---

### Langkah 5 — Buat Tabel Database

```bash
php artisan session:table
php artisan migrate
```

---

### Langkah 6 — Jalankan Server

```bash
php artisan serve
```

Backend berjalan di: **http://localhost:8000**

---

### Langkah 7 — Jalankan Frontend (di terminal terpisah)

Buka terminal baru, masuk ke folder frontend:

```bash
cd ..\plaza_tenant_frontend

npm install

npm run dev
```

Frontend berjalan di: **http://localhost:5173**

> Frontend otomatis terhubung ke backend di `localhost:8000` — tidak perlu konfigurasi tambahan.

---

## Ringkasan Perintah (Copy-Paste)

```bash
# BACKEND
composer install
copy .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve

# FRONTEND (terminal terpisah)
cd ..\plaza_tenant_frontend
npm install
npm run dev
```

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
