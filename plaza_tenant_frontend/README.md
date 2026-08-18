# 🎨 Plaza Kebun Sayur — Frontend Monorepo (Bunsay Hub)

Arsitektur Frontend **npm workspaces (Monorepo)** berbasis **React 18**, **Vite 8**, **Tailwind CSS v4**, dan standar aksesibilitas **WCAG 2.2 AA**.

---

## 📂 Struktur Arsitektur Monorepo

```
plaza_tenant_frontend/
├── apps/
│   ├── tenant-app/            # 📱 Portal Penyewa Kios (bunsayhub.id - Port 5173)
│   │   ├── src/
│   │   │   ├── modules/       # Billing (Dashboard, Tagihan, Bayar, Riwayat), Profile, Public Auth
│   │   │   ├── routes/        # TenantProtectedRoute
│   │   │   └── main.jsx
│   │   └── vite.config.js
│   │
│   └── admin-app/             # 💻 Konsol Pengelola Plaza (admin.bunsayhub.id - Port 3001)
│       ├── src/
│       │   ├── modules/       # Auth, Cashier (Setoran Tunai), Dashboard, Kiosks, Reports, Tenants, Verification
│       │   ├── routes/        # AdminProtectedRoute
│       │   └── main.jsx
│       └── vite.config.js
│
├── packages/
│   ├── shared-ui/             # 🧩 Shared Design System (WCAG 2.2 AA Compliant)
│   │   └── src/components/    # Button, Card, FormField, Table, Modal, Badge, Toast, FIFOPreview, etc.
│   │
│   └── shared-core/           # ⚡ Shared Business Logic & Utilities
│       └── src/               # HTTP Client, Auth Hydration, JWT & Cookie Handler, FIFO Allocator, Excel Export
│
├── database/
│   └── bunsay_erd.dbml.md     # 📊 Database Diagram (ERD v6 - 11 Tabel SQL)
├── CONTEXT/                   # 📁 Data survei kios legalitas, proposal inovasi sosial, & notulensi rapat
└── GEMINI.md                  # 📜 Dokumen Spesifikasi Handover Resmi (Single Source of Truth)
```

---

## 🚀 Menjalankan Aplikasi Frontend

Pastikan telah menginstal dependensi di root direktori frontend:

```bash
cd plaza_tenant_frontend

# Install semua workspace package (@bunsay/shared-ui, @bunsay/shared-core, tenant-app, admin-app)
npm install
```

### Script Development Server:

```bash
# Menjalankan Portal Tenant (Port 5173):
npm run dev:tenant

# Menjalankan Konsol Admin (Port 3001):
npm run dev:admin
```

### Script Production Build:

```bash
# Build seluruh workspace sekaligus:
npm run build

# Build per sub-aplikasi:
npm run build:tenant
npm run build:admin
```

---

## 🔐 Integrasi Autentikasi Dual-Domain (Sanctum)

Aplikasi frontend berkomunikasi dengan backend Laravel via `@bunsay/shared-core/src/api/createAuthHttpClient.ts`:

1. **In-Memory Bearer Token**: Access token disimpan di memori React Context (`AuthContext`) demi keamanan optimal dari serangan pencurian token melalui XSS.
2. **HttpOnly Refresh Cookie**: Saat halaman dimuat ulang (F5/Refresh), instance client melakukan *Silent Refresh* ke endpoint `/api/v1/{tenant|admin}/auth/refresh` menggunakan cookie yang diatur oleh server secara aman (`SameSite=Lax`, `HttpOnly`).
3. **Isolasi Domain**: Sesi login Admin dan Tenant terpisah secara fisik sehingga kredensial admin tidak akan tercampur di portal publik penyewa.

---

## 🎨 Standar Desain & Aksesibilitas (WCAG 2.2 AA)

Seluruh antarmuka mengacu pada filosofi estetika **Modern Civic Precision**:

1. **Tipografi Angka Tabular**: Font **Plus Jakarta Sans** dengan kelas utilitas `.font-tabular-nums` untuk meratakan format nominal mata uang Rupiah dan nomor kios.
2. **Touch Targets Ramah Seluler**: Seluruh tombol dan input interaktif memiliki tinggi sentuh minimum **44px** (`min-height: 44px`).
3. **Komponen Aksesibel**:
   - `FormField`: Otomatis mengikat relasi `label`, `input`, dan `aria-describedby` untuk pesan validasi.
   - `Table`: Menyediakan `caption`, `aria-label`, header `scope="col"`, dan baris identifier `<th scope="row">`.
   - `Icon`: Pembungkus terpusat untuk `@iconify/react` dengan suntikan `aria-hidden="true"`.
4. **Alokasi Pembayaran FIFO**: Komponen visual `FIFOPreview.jsx` dan `AlokasiBreakdown.jsx` menampilkan transparansi urutan pelunasan tagihan tertua ke termuda saat tenant menyicil.

---

## 📎 Sumber Referensi & Dokumentasi Lengkap

- 📜 **[GEMINI.md](GEMINI.md)** — **Single Source of Truth Utama** berisi arsitektur lengkap, 11 tabel SQL, dan aturan bisnis.
- 🌾 **[README_SEEDER.md](../plaza_tenant_backend/README_SEEDER.md)** — Panduan akun login testing (Admin & Tenant).
- 📊 **[bunsay_erd.dbml.md](database/bunsay_erd.dbml.md)** — Kode DBML skema database 11 tabel untuk diimpor ke *dbdiagram.io*.
