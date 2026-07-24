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

### Skema Database Resmi (ERD v4 — FINAL)

Skema database resmi yang digunakan oleh frontend mengacu pada **[bunsay_erd.dbml.md](file:///d:/ITK/SEMESTER%205/INOVASI%20SOSIAL/plaza-kebun-sayur-payment/bunsay_erd.dbml.md)** dan **[GEMINI.md](file:///d:/ITK/SEMESTER%205/INOVASI%20SOSIAL/plaza-kebun-sayur-payment/GEMINI.md)** (Spesifikasi Handover V5.4).

#### Rangkuman 9 Tabel Utama (ERD v4):
1. **`Roles`**: Peran pengguna (`"Tenant"`, `"Admin"`).
2. **`User`**: Akun login terpusat berbasis **`Username`** (bukan email). Email disimpan untuk administrasi & reset lupa kata sandi.
3. **`Pemilik`**: Data profil pemilik kios beserta kolom `Status_Pemilik` (`"Aktif"`, `"Nonaktif"`).
4. **`Kios`**: Master data kios (`No_Kios`, `Lantai`, `Ukuran`, `Status`: `"Terisi"`, `"Kosong"`, `"Perlu Validasi"`).
5. **`Dokumen`**: Tabel generik dokumen legalitas (`SP`, `PPJB`, `Sertifikat`, `KTP`).
6. **`Sewa`**: Siklus sewa per bulan (reset setiap bulan, bukan kontrak jangka panjang bertahun-tahun).
7. **`Tagihan`**: Satu tagihan per siklus sewa (1:1), dengan `Tarif_Sewa` all-inclusive (termasuk service charge & kebersihan) dan `Hutang_Tunggakan` akumulatif. Status: `"Lunas"`, `"Belum Bayar"`, `"Dicicil"`, `"Menunggu Verifikasi"`.
8. **`Pembayaran`**: Mencatat pembayaran bebas (cicilan FIFO) lintas 3 metode: `"Transfer"`, `"Tunai"`, `"Midtrans"`.
9. **`Alokasi_Pembayaran`**: Tabel junction untuk mengalokasikan nominal pembayaran ke tagihan secara FIFO (First-In-First-Out).

> **⚠️ PENTING – Case-Sensitive ENUM:**  
> Frontend menggunakan string status secara **case-sensitive** untuk menentukan tampilan warna dan ikon.  
> Pastikan nilai yang dikembalikan API **persis sama** dengan spesifikasi ERD v4, misalnya:  
> `"Lunas"` (bukan `"lunas"` atau `"LUNAS"`), `"Dicicil"`, `"Menunggu Verifikasi"`, `"Terisi"`, dst.

---

## 🎨 Standar Desain & Aksesibilitas Frontend

Aplikasi frontend menerapkan pendekatan estetika **Modern Civic Precision** (DFII Score: 12.8 - *Excellent*) serta kepatuhan penuh **WCAG 2.2 AA** (Level A & AA) di seluruh 17 halaman aplikasi:

1. **Tipografi & Angka Tabular**: Font tunggal **Plus Jakarta Sans** dengan kelas `.font-tabular-nums` untuk perataan vertikal seluruh nilai finansial Rupiah dan nomor unit kios.
2. **Touch Targets Seluler**: Setiap tombol dan elemen interaktif memiliki ukuran sentuh minimum **44px x 44px** (`min-height: 44px`) dengan umpan balik visual `active:scale-[0.97]`.
3. **Bebas Emoji Mentah & Shared Icon Wrapper**: Seluruh ikon menggunakan `@iconify/react` yang dibungkus oleh komponen terpusat `Icon.jsx` dengan suntikan `aria-hidden="true"` otomatis (WCAG 1.1.1).
4. **Semantik Formulir & Tabel Teraksesibel**:
   - **`FormField.jsx`**: Otomatis mengikat `label` (`htmlFor`), input (`id`), error message (`aria-describedby`), dan indikator error (`aria-invalid="true"`).
   - **`Table.jsx`**: Mengintegrasikan elemen `<caption>` tersembunyi/terlihat, `aria-label`, header `scope="col"`, dan identifier baris `<th scope="row">`.
5. **Navigasi & Live Status**: Menjadwalkan Skip to Content Link (`<a href="#main-app">`), pembaharuan `document.title` dinamis berbasis rute, restorasi fokus modal, serta indikator `role="status"` / `aria-live="polite"` pada toast & tombol aksi.
6. **Audit & Logbook**: Rincian evaluasi dan kepatuhan UI/UX Pro Max dapat dilihat di **[AUDIT_UI_UX_PRO_MAX.md](file:///d:/ITK/SEMESTER%205/INOVASI%20SOSIAL/plaza-kebun-sayur-payment/AUDIT_UI_UX_PRO_MAX.md)** dan histori refactoring pada **[WALKTHROUGH.md](file:///d:/ITK/SEMESTER%205/INOVASI%20SOSIAL/plaza-kebun-sayur-payment/WALKTHROUGH.md)** (`ENTRY 08`).

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

- **Logbook Walkthrough**: `WALKTHROUGH.md` – riwayat rincian perubahan kode repositori.
- **Spesifikasi Handover**: `GEMINI.md` – dokumen spesifikasi handover pengembang.
- **Data Kios**: `CONTEXT/Data_Kios_BY_LEGAL` – sumber utama untuk migrasi data.
- **Notulensi Rapat**: `CONTEXT/Notul rapat 11 april 2026.md` – kesepakatan fitur dan alur bisnis.
- **Proposal**: `CONTEXT/PROPOSAL INOVASI SOSIAL.docx.md` – latar belakang dan metodologi proyek.
