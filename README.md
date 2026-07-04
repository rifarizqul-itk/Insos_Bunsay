# Plaza Kebun Sayur — Sistem Pembayaran Sewa Kios

---

## 📂 Struktur Kode (Frontend)

Kode frontend dibangun dengan **React 18** + **Vite**. Folder `src/api/` berisi **mock API** yang digunakan untuk simulasi selama pengembangan. Semua fungsi di dalamnya (`admin.js`, `tenant.js`, `transactions.js`) adalah prototipe yang harus diganti dengan panggilan API nyata ke backend.

- **`src/api/admin.js`** – endpoint untuk manajemen tenant & kios  
- **`src/api/tenant.js`** – endpoint untuk dashboard, histori, tunggakan, pembayaran tenant  
- **`src/api/transactions.js`** – endpoint verifikasi, setoran tunai, ekspor laporan  

> 📌 *Dokumen ini akan fokus pada panduan untuk tim backend dan database.*

---

## 🗄️ Panduan untuk Tim Database

### Sumber Data

Data tenant, kios, dan tunggakan historis tersedia dalam file:

- **`CONTEXT/Data_Kios_BY_LEGAL_versi_MARKDOWN.md`** atau **`CONTEXT/Data Kios BY LEGAL ( update 26 April 2025 ).xlsx`** – berisi semua data kios per lantai, nama pemilik, nomor KTP, alamat, kontak, nomor SP/PPJB, tanggal BAST, ukuran, jenis usaha, sertifikat, dan histori pengalihan hak. Total tenant aktif sekitar **250 unit** (data per 26 April 2025).

### Skema Database yang Disarankan

Berdasarkan kebutuhan aplikasi, berikut skema minimal yang direkomendasikan:

#### 1. Tabel `tenants`
| Kolom           | Tipe        | Keterangan                           |
|-----------------|-------------|--------------------------------------|
| `id`            | INT / UUID  | Primary key                          |
| `nama`          | VARCHAR     | Nama pemilik kios                    |
| `email`         | VARCHAR     | Untuk login tenant                   |
| `password_hash` | VARCHAR     | Hash kata sandi (bcrypt)             |
| `no_ktp`        | VARCHAR     | Nomor KTP                            |
| `alamat`        | TEXT        | Alamat lengkap                       |
| `no_telepon`    | VARCHAR     | Nomor telepon                        |
| `jenis_usaha`   | VARCHAR     | Jenis usaha (Kerajinan, Fashion, dll)|

#### 2. Tabel `kios`
| Kolom           | Tipe        | Keterangan                           |
|-----------------|-------------|--------------------------------------|
| `id`            | INT / UUID  | Primary key                          |
| `nomor_kios`    | VARCHAR     | e.g. "B-1001"                        |
| `lantai`        | VARCHAR     | "Lt. 1", "Lt. 2", "Lt. 3"            |
| `status`        | ENUM        | `Terisi`, `Kosong`, `Perlu Validasi` |
| `tenant_id`     | INT / UUID  | Foreign key ke `tenants.id` (nullable)|
| `ukuran`        | VARCHAR     | e.g. "6M"                            |
| `no_sp`         | VARCHAR     | Nomor SP / tanggal                   |
| `no_ppjb`       | VARCHAR     | Nomor PPJB / tanggal                 |
| `tgl_bast`      | DATE        | Tanggal BAST                         |
| `no_sertifikat` | VARCHAR     | Nomor sertifikat / tanggal ambil     |
| `catatan`       | TEXT        | Keterangan tambahan                  |

#### 3. Tabel `transactions`
| Kolom           | Tipe        | Keterangan                           |
|-----------------|-------------|--------------------------------------|
| `id`            | INT / UUID  | Primary key                          |
| `tenant_id`     | INT / UUID  | Foreign key ke `tenants.id`          |
| `jenis_tagihan` | ENUM        | `Service Charge`, `Tunggakan AR`     |
| `nominal`       | DECIMAL     | Jumlah pembayaran                    |
| `metode`        | ENUM        | `Transfer Manual`, `Midtrans`, `Tunai`|
| `status`        | ENUM        | `Lunas`, `Pending`, `Tertolak`       |
| `waktu`         | TIMESTAMP   | Waktu transaksi                      |
| `bukti`         | VARCHAR     | Path/file name bukti (jika ada)      |
| `alasan_tolak`  | TEXT        | Alasan jika status `Tertolak`        |

> **⚠️ PENTING – Case-Sensitive ENUM:**  
> Frontend menggunakan string status secara **case-sensitive** untuk menentukan tampilan warna dan ikon.  
> Pastikan nilai yang dikembalikan API **persis sama** dengan nilai di atas, misalnya:  
> `"Lunas"` (bukan `"lunas"` atau `"LUNAS"`), `"Terisi"`, `"Pending"`, dst.

#### 4. Tabel `tunggakan_ar` (opsional, untuk historis)
| Kolom           | Tipe        | Keterangan                           |
|-----------------|-------------|--------------------------------------|
| `id`            | INT / UUID  | Primary key                          |
| `tenant_id`     | INT / UUID  | Foreign key ke `tenants.id`          |
| `total_awal`    | DECIMAL     | Total tunggakan awal                 |
| `terbayar`      | DECIMAL     | Total yang sudah dibayar             |
| `sisa`          | DECIMAL     | Sisa tunggakan                       |
| `riwayat_cicilan`| JSON       | Array objek cicilan                  |

> **Catatan**: Data di `Data_Kios_BY_LEGAL` mencakup informasi kepemilikan, sertifikat, dan pengalihan hak yang dapat dijadikan acuan untuk mengisi tabel `tenants` dan `kios`.

---

## 🔌 Panduan untuk Tim Backend

### Endpoint API yang Diperlukan

Frontend saat ini menggunakan fungsi-fungsi di `src/api/` yang harus diimplementasikan sebagai endpoint nyata. Berikut daftar endpoint minimal:

#### **Autentikasi**
- `POST /auth/login` → menerima `email`, `password`, mengembalikan `token` (JWT) dan `role` (`tenant` / `admin`).
- `POST /auth/logout` → (opsional, bisa handle di client)
- `POST /auth/forgot-password` → kirim email reset.

#### **Admin**
- `GET /admin/tenants` → daftar semua tenant (dengan filter status pembayaran).
- `GET /admin/kios` → daftar semua kios.
- `GET /admin/kios/:id` → detail administrasi kios.
- `PUT /admin/kios/:id` → update data kios.
- `POST /admin/tenants` → tambah tenant baru.
- `PUT /admin/tenants/:id/keuangan` → update status keuangan tenant.
- `POST /admin/transactions/verify` → verifikasi bukti transfer (ubah status).
- `POST /admin/transactions/cash` → catat setoran tunai.
- `GET /admin/transactions` → riwayat transaksi (admin).
- `GET /admin/export` → unduh laporan Excel (per bulan/tahun). **Wajib mengembalikan stream biner dengan header:**  
  `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

#### **Tenant**
- `GET /tenant/dashboard` → data dashboard (nama, kios, status service charge, tunggakan).
- `GET /tenant/history` → riwayat pembayaran tenant.
- `GET /tenant/tunggakan` → rincian tunggakan AR.
- `POST /tenant/payment` → buat transaksi baru. **Payload berupa `multipart/form-data`** dengan field:
  - `jenis_tagihan` (string)
  - `nominal` (number)
  - `metode` (string, salah satu: `transfer_manual` atau `midtrans_gateway`)
  - `bukti_transfer` (file gambar, **wajib** jika `metode` = `transfer_manual`)
- `PUT /tenant/profile` → update profil tenant.

### Autentikasi & Autoritasi

- Gunakan **JWT** dengan payload `{ userId, role }`.
- Role: `tenant` dan `admin`.
- Middleware untuk memvalidasi token dan role pada setiap endpoint yang dilindungi.

### Integrasi dengan Midtrans

Frontend mendukung pembayaran instan melalui **Midtrans Sandbox**. Untuk mengaktifkannya, backend perlu:

1. Menyediakan endpoint `/payment/create` yang memanggil API Snap Midtrans dan mengembalikan `token` ke frontend.
2. Menerima notifikasi webhook dari Midtrans untuk memperbarui status transaksi.

Environment variables yang dibutuhkan frontend:
- `VITE_API_BASE_URL` → base URL backend (misal `https://api.bunsay.com`)
- `VITE_MIDTRANS_CLIENT_KEY` → client key dari dashboard Midtrans

### 📋 Aturan Respons Error (Kepatuhan WCAG 2.2)

Frontend menerapkan standar aksesibilitas tinggi (WCAG 2.2, kriteria 3.3.1 & 3.3.3). Untuk itu, setiap respons error (HTTP 400, 422, 500, dll.) **harus** mengembalikan objek JSON dengan struktur yang konsisten dan pesan kesalahan dalam bahasa Indonesia yang jelas, spesifik, dan dapat dipahami pengguna.

**Format yang diharapkan:**
```json
{
  "message": "Deskripsi error dalam bahasa Indonesia formal",
  "field": "nama_field_terkait"  // opsional, untuk error validasi field tertentu
}
```

**Contoh yang benar:**
- `{ "message": "Nomor KTP harus berisi 16 digit angka" }`
- `{ "message": "Format alamat email tidak valid" }`
- `{ "message": "Kata sandi harus minimal 8 karakter" }`

**Contoh yang TIDAK boleh:**
- ❌ `{ "error": "ER_DUP_ENTRY: Duplicate entry '...' for key 'email'" }` (error mentah database)
- ❌ `"Internal Server Error"` (terlalu umum, tidak informatif)
- ❌ `{ "msg": "Invalid input" }` (tidak spesifik dan menggunakan bahasa Inggris)

---

## 🚀 Menjalankan Frontend (untuk Testing)

Meskipun backend belum siap, frontend dapat dijalankan dengan mock API untuk keperluan pengujian UI.

```bash
# Clone repositori
git clone <repo-url>
cd plaza-kebun-sayur-payment

# Install dependensi
npm install

# Buat file .env.local dan isi:
VITE_API_BASE_URL=http://localhost:3000/api   # ganti dengan URL backend
VITE_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxx

# Jalankan dev server
npm run dev
```

Akses `http://localhost:5173` untuk melihat aplikasi.

---

## 📎 Referensi Tambahan

- **Data Kios**: `CONTEXT/Data_Kios_BY_LEGAL` – sumber utama untuk migrasi data.
- **Notulensi Rapat**: `CONTEXT/Notul rapat 11 april 2026.md` – kesepakatan fitur dan alur bisnis.
- **Proposal**: `CONTEXT/PROPOSAL INOVASI SOSIAL.docx.md` – latar belakang dan metodologi proyek.
