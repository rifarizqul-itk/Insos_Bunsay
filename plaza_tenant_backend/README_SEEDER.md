# 📋 Panduan Akun Login & Kredensial Database Seeder
## Sistem Informasi Retribusi Pasar Plaza Kebun Sayur Balikpapan

Dokumen ini berisi seluruh daftar kredensial login akun pengelola (*Admin*) dan daftar sampel akun penyewa riil (*886 Real Tenants*) hasil migrasi data resmi legalitas UPTD Pasar Plaza Kebun Sayur Dinas Perdagangan Kota Balikpapan.

---

## ⚡ Perintah Menjalankan Seeder

Untuk me-reset database dan men-seed data murni 100% tenant riil:

```bash
# Jalankan di direktori plaza_tenant_backend
ddev exec php artisan migrate:fresh --seed
```

---

## 🛡️ 1. Daftar Akun Pengelola (*Admin Portal*)

Seluruh akun admin menggunakan kata sandi standar: **`admin123`**

| No | Nama Akun | Username | Password | Role / Hak Akses | Deskripsi & Wewenang |
|:---:|:---|:---|:---|:---|:---|
| 1 | **Superadmin Utama** | `admin` / `superadmin` | `admin123` | `superadmin` *(Full Access)* | Memiliki seluruh wewenang (Verifikasi, Kasir, Kios, Ekspor, Audit Log, Kelola Admin). |
| 2 | **Petugas Loket Verifikasi** | `admin_verif` | `admin123` | `verifikator` | Mengonfirmasi bukti transfer bank & menerbitkan resi sah e-Retribusi. |
| 3 | **Kasir Loket Pasar** | `admin_kasir` | `admin123` | `kasir` | Menerima pembayaran tunai langsung di tempat dan mencetak kuitansi loket. |
| 4 | **Petugas Kios & Legalitas** | `admin_kios` | `admin123` | `petugas_kios` | Mengelola data unit kios, status ketersediaan, data legalitas & riwayat pemilik. |
| 5 | **Petugas Laporan & Audit** | `admin_laporan` | `admin123` | `auditor` | Mengunduh ekspor rekapitulasi data (Excel/CSV) dan memantau jejak audit (*Audit Trail*). |

---

## 🏢 2. Informasi Database Penyewa (*886 Real Tenants*)

* **Sumber Data**: *Data Kios BY LEGAL Dinas Perdagangan Kota Balikpapan*
* **Total Penyewa Terdaftar**: **886 Kontrak Sewa Riil**
* **Total Unit Kios Fisik**: **884 Unit Kios** (Lantai 1, Lantai 2, Lantai 3)
* **Kata Sandi Universal Tenant**: **`password123`**
* **Format Username**: Huruf kecil (*lowercase*) dari nama penyewa, spasi diganti garis bawah (*underscore*), dan karakter non-alfanumerik dihilangkan.

---

## 👤 3. Sampel Kredensial Tenant Siap Uji (*Sample Test Accounts*)

Berikut adalah beberapa sampel akun tenant riil dari berbagai blok, lantai, dan jenis usaha yang dapat langsung digunakan untuk pengujian portal tenant:

| No | Nama Penyewa | Username | Password | No. Kios | Lantai | Jenis Usaha |
|:---:|:---|:---|:---:|:---:|:---:|:---|
| 1 | **Hj. Yuliana** | `hjyuliana` | `password123` | `B-1001` | Lantai 1 | Kerajinan |
| 2 | **Hj. Yuliana. HS** | `hjyulianahs` | `password123` | `B-1001` | Lantai 1 | Perhiasan |
| 3 | **Wong Nova** | `wong_nova` | `password123` | `D-3023` | Lantai 3 | Tekstile |
| 4 | **Achmad Padllik, SE** | `achmad_padllikse` | `password123` | `D-3077` | Lantai 3 | Elektronik |
| 5 | **Fachrudy** | `fachrudy` | `password123` | `D-3078` | Lantai 3 | Elektronik |
| 6 | **Sabariah** | `sabariah` | `password123` | `D-3079` | Lantai 3 | Handphone |
| 7 | **Rina Aristina** | `rina_aristina` | `password123` | `D-3080` | Lantai 3 | Handphone |
| 8 | **Tri Marheni Anjang S** | `tri_marheni_anjang_s` | `password123` | `D-3082` | Lantai 3 | Tekstile |
| 9 | **Mardiani** | `mardiani` | `password123` | `D-3085` | Lantai 3 | Tekstile |
| 10 | **Eny Supriani** | `eny_supriani` | `password123` | `D-3088` | Lantai 3 | Tekstile |
| 11 | **Anwar Burhan** | `anwar_burhan` | `password123` | `D-3092` | Lantai 3 | Tekstile |
| 12 | **Nurdin** | `nurdin` | `password123` | `A-1001` | Lantai 1 | Emas & Perhiasan |
| 13 | **Naryati** | `naryati` | `password123` | `D-3047` | Lantai 3 | Tekstile |

> 💡 *Catatan: Untuk mencoba akun tenant lainnya dari 886 data, Anda cukup menggunakan nama tenant yang tertera pada tabel administrasi kios dengan format username `nama_tenant` dan password `password123`.*

---

## 📊 4. Struktur Data Tagihan & Pembayaran Seeder

Data seeder dikonfigurasi secara **real-time dinamis** mengikuti bulan berjalan saat seeder dieksekusi:

1. **Bulan 1 s.d. Bulan 5 (Maret – Juli 2026)**:
   * **Status Tagihan**: `Lunas`
   * **Histori Transaksi**: Tercatat 5 riwayat pembayaran lunas untuk masing-masing tenant lengkap dengan tanggal transaksi, metode pembayaran, dan bukti digital.
2. **Bulan ke-6 (Agustus 2026 / Bulan Berjalan)**:
   * **Status Tagihan**: `Belum Bayar`
   * **Nominal Tagihan**: `Rp 750.000`
   * **Tunggakan Aktif**: Muncul di dashboard tenant dan dashboard pengelola sebagai tagihan aktif yang siap dibayar melalui Midtrans (QRIS/VA), Transfer Bank Manual, maupun Setoran Tunai Loket Kasir.
