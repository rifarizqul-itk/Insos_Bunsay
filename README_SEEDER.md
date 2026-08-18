# 📋 Panduan Seeder & Mock Data — Plaza Kebun Sayur (Bunsay)

Dokumentasi ini menjelaskan struktur *Factory* dan *Seeder* Laravel yang telah dibuat untuk mensimulasikan **252+ Akun Tenant** dan **5 Akun Admin** beserta seluruh skenario bisnis dan *edge cases* Plaza Kebun Sayur.

---

## 🚀 Perintah Menjalankan Seeder

Jalankan perintah berikut pada direktori `plaza_tenant_backend`:

```bash
# Opsi 1: Jalankan Seeder saja (Tanpa menghapus data yang ada)
php artisan db:seed

# Opsi 2: Reset database total dan jalankan seeder dari nol (DIREKOMENDASIKAN)
php artisan migrate:fresh --seed
```

---

## 🔑 Kredensial Login Testing

Semua akun dalam data simulasi ini menggunakan kata sandi default: **`password123`**

### 1. Akun Admin / Pengelola Plaza (5 Akun)

| Username | Role / Sub-Role | Password | Keterangan & Hak Akses |
|---|---|---|---|
| `superadmin` | `superadmin` | `password123` | Superadmin Utama (Akses seluruh modul & sistem) |
| `admin` | `admin` | `password123` | Admin Pengelola Plaza (Verifikasi, Laporan, Kios) |
| `staff_loket` | `staff_loket` | `password123` | Staff Loket Kasir (Input setoran tunai & verifikasi) |
| `kasir_lisa` | `staff_loket` | `password123` | Kasir Loket (Lisa Anggraini) |
| `auditor_budi` | `auditor` | `password123` | Auditor Keuangan (Lihat audit log & ekspor laporan) |

---

### 2. Akun Tenant Unggulan per Skenario (11 Akun Utama)

Gunakan akun-akun ini untuk menguji alur UI/API spesifik di portal tenant (`bunsayhub.id` / `apps/tenant-app`):

| Username | Skenario | Password | Detail Kondisi Data |
|---|---|---|---|
| `tenant_aktif` | **SC-03 (Aktif Normal)** | `password123` | Sewa Aktif (Kios A1-01), riwayat 6 bulan `Lunas`, tagihan bulan ini siap bayar |
| `tenant_tunggak1` | **SC-04 (Menunggak 1 Bulan)** | `password123` | 1 tagihan lewat `Jatuh_Tempo` (`Belum Bayar`). Konsekuensi: Listrik dimatikan |
| `tenant_tunggak_multi` | **SC-05 / SC-51 (Menunggak 3 Bulan)** | `password123` | 3 tagihan menunggak (`Hutang_Tunggakan` = Rp 1.500.000, murni akumulasi sewa tanpa denda) |
| `tenant_lunas` | **SC-06 (Melunasi Tunggakan)** | `password123` | Riwayat pelunasan tunggakan lengkap dengan bukti pembayaran `Diterima` |
| `tenant_baru_0tagihan` | **SC-01 (0 Tagihan)** | `password123` | Tenant terdaftar tetapi belum memiliki kios/kontrak sewa (0 tagihan) |
| `tenant_stress_50` | **Edge Case (>50 Tagihan)** | `password123` | **Stress test**: Memiliki 60 tagihan bulanan (riwayat 5 tahun) untuk tes performa UI & pagination |
| `tenant_fifocicil` | **Edge Case (Cicilan / Pelunasan Tagihan Tertua)** | `password123` | 3 tagihan menunggak, dibayar Rp 750.000 → otomatis melunasi tagihan paling lama terlebih dahulu (tagihan 1 lunas), menyicil tagihan 2 (`Dicicil`), tagihan 3 (`Belum Bayar`) |
| `tenant_dispute` | **SC-17 / SC-24 (Dispute/Sanggahan)** | `password123` | Pembayaran sempat `Ditolak` admin → tenant mengirim `teks_sanggahan` & `bukti_sanggahan` → status `Menunggu` |
| `tenant_midtrans` | **SC-14 (Midtrans Auto-Confirm)** | `password123` | Pembayaran via Midtrans → otomatis `Verifikasi='Diterima'` tanpa antrian admin |
| `tenant_multikios` | **SC-08 (Multi-Kios)** | `password123` | 1 Pemilik menyewa 3 kios sekaligus (Kios A1-06, A1-07, A1-08) dengan tagihan terpisah |
| `tenant_selesai` | **SC-07 / SC-36 (Soft-Deleted / Keluar)** | `password123` | Sewa berstatus `'Selesai'`, Kios `'Kosong'`, seluruh riwayat tagihan & pembayaran lama tetap tersimpan |

---

### 3. Akun Tenant Kelompok / Bulk (241 Akun)

| Kelompok Username | Jumlah Akun | Skenario & Karakteristik Data |
|---|---|---|
| `tenant_aktif_1` s/d `tenant_aktif_120` | **120 Akun** | Tenant Aktif dengan riwayat bayar rutin 3–8 bulan |
| `tenant_tunggak1_1` s/d `tenant_tunggak1_40` | **40 Akun** | Tenant menunggak 1 bulan |
| `tenant_tunggak_multi_1` s/d `tenant_tunggak_multi_35` | **35 Akun** | Tenant menunggak 2–4 bulan |
| `tenant_keluar_1` s/d `tenant_keluar_25` | **25 Akun** | Tenant yang sudah keluar (Sewa Status = `'Selesai'`) |
| `tenant_baru_1` s/d `tenant_baru_15` | **15 Akun** | Tenant baru mendaftar (0 sewa, 0 tagihan) |
| `tenant_multikios_1` s/d `tenant_multikios_5` | **5 Akun** | Tenant multi-kios (masing-masing sewa 2 kios) |
| `tenant_stress_heavy` | **1 Akun** | Extra stress test account dengan 55 tagihan bulanan |

**Total Akun Tenant**: **252 Akun User Tenant** (Melebihi target 250 akun).

---

## 📂 Struktur File Factory & Seeder

Semua file dibuat mengikuti standar Eloquent Factory & Seeder Laravel:

```
plaza_tenant_backend/
├── database/
│   ├── factories/
│   │   ├── UserFactory.php        # State untuk Admin, Tenant, Superadmin, Staff Loket
│   │   ├── PemilikFactory.php     # Data nama, NIK (16 digit), No HP, Alamat
│   │   ├── KiosFactory.php        # Generasi No_Kios (Blok A-H, Lantai 1-2, Ukuran, Status)
│   │   ├── SewaFactory.php        # Tanggal_Mulai/Selesai, Jenis Usaha, Status ('Aktif'/'Selesai')
│   │   ├── TagihanFactory.php     # Periode, Jatuh_Tempo, Tarif, Tunggakan, Sisa_Tagihan, Status
│   │   ├── PembayaranFactory.php  # Metode (Transfer/Tunai/Midtrans), Verifikasi, Sanggahan
│   │   ├── DokumenFactory.php     # Dokumen legal (SP, PPJB, AJB, Sertifikat)
│   │   ├── ActivityLogFactory.php # Audit log aktivitas admin
│   │   └── NotificationFactory.php# Notifikasi sistem tenant/admin
│   │
│   └── seeders/
│       ├── RoleSeeder.php         # Master roles (1=Admin, 2=Tenant)
│       ├── AdminSeeder.php        # Akun superadmin, admin, staff_loket, kasir_lisa, auditor_budi
│       ├── KiosSeeder.php         # Generasi 285+ kios fisik pasar
│       ├── ScenarioSeeder.php     # Generasi 252+ tenant & seluruh skenario bisnis & edge cases
│       └── DatabaseSeeder.php     # Orchestrator utama yang dipanggil oleh `php artisan db:seed`
```

---

## 📊 Hasil Verifikasi Jumlah Data di Database

Setelah menjalankan `php artisan migrate:fresh --seed`, berikut jumlah record di database:

| Tabel Model | Jumlah Record | Status Verifikasi |
|---|---|---|
| `user` (Tenant) | **252** | ✅ Target ≥250 terpenuhi |
| `user` (Admin) | **5** | ✅ Superadmin, Admin, Staff Loket, Kasir, Auditor |
| `pemilik` | **252** | ✅ 1-to-1 dengan user tenant |
| `kios` | **285** | ✅ ~243 Terisi, ~42 Kosong (siap disewa) |
| `sewa` | **243** | ✅ Kombinasi Status `'Aktif'` & `'Selesai'` |
| `tagihan` | **1.207** | ✅ Termasuk 60 tagihan stress test tenant |
| `pembayaran` | **1.073** | ✅ Diterima, Ditolak, Cicilan Tagihan Tertua, Midtrans, Sanggahan |
| `dokumen` | **199** | ✅ Dokumen SP, PPJB, AJB, Sertifikat |
| `activity_logs` | **30** | ✅ Audit trail verifikasi & sistem |
| `notifications` | **40** | ✅ Notifikasi tenant & admin (Read/Unread) |

---

## 🔍 Pembuktian Aturan Bisnis & Schema Compliance

1. **Pelunasan Tagihan Tertua Secara Otomatis (Pembayaran Cicilan)**:
   - `tenant_fifocicil` memiliki 3 tagihan berurutan. Saat membayar Rp 750.000, pembayaran otomatis memotong tagihan paling lama terlebih dahulu (`Lunas`), sisa pembayaran menyicil tagihan kedua (`Dicicil`, sisa Rp 250.000), dan tagihan ketiga tetap (`Belum Bayar`).
2. **Tanpa Denda Telat Bayar**:
   - `Hutang_Tunggakan` pada `tenant_tunggak_multi` murni berjumlah `Rp 1.500.000` (3 bulan × Rp 500.000 tarif sewa) tanpa komponen denda. Konsekuensi telat bayar berupa pemutusan listrik kios.
3. **Midtrans Auto-Confirm**:
   - Pembayaran dengan `Metode_Bayar = 'Midtrans'` pada `tenant_midtrans` langsung berstatus `Verifikasi_Pembayaran = 'Diterima'` dan `Status_Tagihan = 'Lunas'` tanpa melalui antrian verifikasi manual admin.
4. **Soft-Delete Sewa**:
   - Tenant `tenant_selesai` dan kelompok `tenant_keluar_*` memiliki record `sewa` dengan `Status = 'Selesai'`. Kios terkait dikembalikan berstatus `'Kosong'`, namun seluruh riwayat `tagihan` dan `pembayaran` di masa lalu tetap tersimpan secara utuh di database.
