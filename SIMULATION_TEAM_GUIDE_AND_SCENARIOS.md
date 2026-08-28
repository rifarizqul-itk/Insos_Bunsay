# Panduan Simulasi Interaktif & Matriks Skenario Kombinatorial Tim (10 Orang)
## Sistem Manajemen Tenant Plaza Kebun Sayur (Insos Bunsay)

Dokumen ini adalah panduan resmi skenario pengujian interaktif menyeluruh (*End-to-End Combinatorial Simulation*) untuk **Tim 10 Orang** yang mencakup **100% variasi *state* sistem**.

---

## 1. Pemodelan Kombinatorial PICT (*Pairwise Independent Combinatorial Testing*)

Skenario disusun menggunakan metodologi **PICT / Combinatorial Testing** dengan partisi ekuivalensi dan *pairwise constraints* berikut:

```pict
# ==============================================================================
# PICT MODEL: INSOS BUNSAY TENANT & BILLING MANAGEMENT SYSTEM
# ==============================================================================

# 1. Parameter Tim & Hak Akses
TeamRole:               Superadmin, Admin_Kasir, Admin_PetugasKios, Tenant_Standard, Tenant_MultiKios, Tenant_Prospek
AccountStatus:          Aktif, NonAktif

# 2. Status Fisik & Alokasi Kios
KioskFloor:             Lantai_1, Lantai_2, CrossFloor_Multi
KioskStatus:            Terisi, Kosong
KioskAllocation:        Single_Unit, Multi_Unit_SameNIK, Zero_Unit

# 3. Siklus Kontrak Sewa (Sewa)
LeaseStatus:            Aktif, Selesai_SoftDeleted, None_BelumSewa
MonthlyTariff:          Tarif_500k, Tarif_750k, Tarif_800k, Tarif_1000k, Tarif_1200k
LegalDocSet:            Complete_4Docs, Partial_SP_PPJB, SP_Only, Empty_NoDocs

# 4. Status Tagihan & Tunggakan
BillingState:           Lunas_OnTime, Overdue_1Mo, Overdue_3Mo_Kritis, Dicicil_Partial_FIFO, Stress_50Invoices, Zero_Invoices
CicilanPermission:      Allowed_True, Disallowed_False

# 5. Metode Pembayaran & Verifikasi
PaymentMethod:          Midtrans_Gateway, Transfer_Bank, Tunai_Kasir, Belum_Bayar
VerificationStatus:     Diterima, Menunggu, Ditolak, NotApplicable
DisputeState:           None, Sanggahan_Active, Sanggahan_Approved

# ==============================================================================
# CONSTRAINTS (Aturan Bisnis Sistem)
# ==============================================================================
IF [TeamRole] IN {"Superadmin", "Admin_Kasir", "Admin_PetugasKios"} 
  THEN [KioskAllocation] = "Zero_Unit" AND [LeaseStatus] = "None_BelumSewa" AND [BillingState] = "Zero_Invoices";

IF [KioskAllocation] = "Zero_Unit" 
  THEN [LeaseStatus] = "None_BelumSewa" AND [BillingState] = "Zero_Invoices" AND [LegalDocSet] = "Empty_NoDocs";

IF [LeaseStatus] = "Selesai_SoftDeleted" 
  THEN [KioskStatus] = "Kosong" AND [BillingState] IN {"Lunas_OnTime", "Stress_50Invoices"};

IF [PaymentMethod] = "Midtrans_Gateway" 
  THEN [VerificationStatus] = "Diterima";

IF [PaymentMethod] = "Tunai_Kasir" 
  THEN [VerificationStatus] = "Diterima";

IF [PaymentMethod] = "Belum_Bayar" 
  THEN [VerificationStatus] = "NotApplicable" AND [DisputeState] = "None";

IF [DisputeState] = "Sanggahan_Active" 
  THEN [PaymentMethod] = "Transfer_Bank" AND [VerificationStatus] = "Menunggu";

IF [BillingState] = "Dicicil_Partial_FIFO" 
  THEN [CicilanPermission] = "Allowed_True" AND [PaymentMethod] IN {"Transfer_Bank", "Tunai_Kasir"};

IF [CicilanPermission] = "Disallowed_False" 
  THEN [BillingState] <> "Dicicil_Partial_FIFO";
```

---

## 2. Matriks Pembagian Peran Tim 10 Orang

Setiap anggota tim memegang akun utama (serta akun *edge case*) dengan kredensial seragam agar memudahkan pengujian.

| No | Nama Anggota Tim | Peran / Persona | Username Akun | Password | Kios & Lokasi | Skenario Fokus |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **01** | **Patra** | 👑 Superadmin Utama | `sim_superadmin` | `admin123` | *Global Console* | Manajemen Staf RBAC, Global Analytics, Akhiri Sewa, Kontrol Penuh |
| **02** | **Arman** | 💵 Admin Kasir & Loket | `sim_admin_kasir` | `admin123` | *Loket Pasar* | Input Setoran Tunai, Verifikasi Bukti Transfer, Review Sanggahan, Ekspor |
| **03** | **Rifa** | 📋 Petugas Kios & Pembayaran | `sim_admin_petugas` | `admin123` | *Tata Usaha* | Master Kios, Pendaftaran Tenant Baru (+NIK Wajib), Tambah Kios Tenant Terdaftar, Verifikasi, Ekspor |
| **04** | **Dawwas** | 🏪 Tenant A (Ideal On-Time) | `sim_tenant_ideal` | `bunsay123` | `A1-01` (Lt 1) | Pembayaran Lancar (Midtrans & Transfer), Dokumen Lengkap (4 berkas), Verifikasi Resi |
| ↳ | *Akun Edge Dawwas* | 🆕 Simulasi Pendaftaran Tenant | `sim_tenant_baru` | `bunsay123` | `D2-01` (Lt 2) | Uji alur pendaftaran via Form Admin Kios (Input Nama, NIK 16 digit, Telp, Tarif Bulanan) |
| **05** | **Tika** | ⚠️ Tenant B (Tunggakan 1 Bln) | `sim_tenant_tunggak1` | `bunsay123` | `B1-05` (Lt 1) | Peringatan Jatuh Tempo & Listrik, Upload Bukti Transfer ke Antrean, Lupa Password OTP |
| **06** | **Dhia** | 🚨 Tenant C (Tunggakan 3 Bln) | `sim_tenant_kritis` | `bunsay123` | `C1-12` (Lt 1) | Akumulasi Hutang Rp 2.25M, Status Segel / SP-3, Bayar Tunai di Kasir Arman |
| **07** | **Indriani** | ⚖️ Tenant D (Cicilan FIFO) | `sim_tenant_cicil` | `bunsay123` | `D1-08` (Lt 1) | Izin Cicil Aktif (`true`), Alokasi Parsial FIFO Rp 750k, Status `Dicicil`, Uji Proteksi IDOR |
| ↳ | *Akun Edge Indriani*| 🚫 Tenant Tanpa Izin Cicil | `sim_tenant_nocicil` | `bunsay123` | *(Standar)* | Izin Cicil Nonaktif (`false`), pengujian validasi proteksi penolakan cicilan |
| **08** | **Elsya** | 🔄 Tenant E (Dispute/Sanggah) | `sim_tenant_dispute` | `bunsay123` | `E2-03` (Lt 2) | Bukti Ditolak Admin, Pengajuan Sanggahan + Bukti Baru, Uji Rate Limiting 3x Gagal Login |
| **09** | **Yael** | 🏢 Tenant F (Multi-Kios) | `sim_tenant_multikios` | `bunsay123` | `F1-15`, `F2-08`, `G2-11` | 1 NIK / 1 Akun mengelola 3 Kios lintas lantai (Lt 1 & Lt 2), Reset Password oleh Admin |
| **10** | **Clara** | 📦 Tenant G (Sewa Selesai) | `sim_tenant_selesai` | `bunsay123` | `H1-20` (*Kosong*) | Soft-delete Kontrak (`Selesai`), Kios kembali Kosong, Riwayat Kuitansi Abadi |
| ↳ | *Akun Edge Clara* | 📊 Stress Test 50 Tagihan | `sim_tenant_stress50` | `bunsay123` | `G1-01` (Lt 1) | 50 Bulan Riwayat Tagihan & Pembayaran, Uji Pagination & Infinite Scroll |

---

## 3. Matriks Skenario & Cakupan *State* Sistem (100% Coverage)

| ID Skenario | Dimensi Pengujian | State & Kondisi Data | Target UI / API | Aktor Utama | Aktor Verifikator |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SC-01** | *RBAC & Staff Lifecycle* | Superadmin membuat staf kasir baru, edit permission, dan toggle aktif/nonaktif | `/admin/staf` | Patra (P01) | Arman (P02) |
| **SC-02** | *Negative Auth Guard* | Login menggunakan akun non-aktif `sim_admin_nonaktif` (Harus ditolak `401/403`) | `/api/v1/admin/auth/login` | Patra (P01) | - |
| **SC-03** | *Form Pendaftaran Tenant Baru* | Admin mendaftarkan tenant baru via Form Kios (Wajib: NIK 16 digit, Nama, No. HP, Kios, Tarif Bulanan) | `/admin/kios` | Rifa (P03) | Dawwas (P04) |
| **SC-04** | *On-time Midtrans Gateway* | Pembayaran auto-settlement Midtrans Webhook, status langsung `Lunas` & `Diterima` | `/tenant/pembayaran` | Dawwas (P04) | Patra / Arman / Rifa |
| **SC-05** | *Complete Legal Docs* | Kios memiliki 4 dokumen lengkap (`SP`, `PPJB`, `AJB`, `Sertifikat`) | `/admin/detail-administrasi` | Dawwas (P04) | Rifa (P03) |
| **SC-06** | *1-Month Overdue Alert* | Tagihan melewati tgl 12, banner peringatan pemutusan listrik menyala | `/tenant/dashboard` | Tika (P05) | Arman / Rifa |
| **SC-07** | *Transfer Proof Verification* | Tenant upload bukti transfer, status `Menunggu Verifikasi`, Kasir/Petugas verifikasi `Diterima` | `/admin/verifikasi-bukti` | Tika (P05) | Arman (P02) |
| **SC-08** | *Critical Arrears (3 Bulan)* | Hutang terakumulasi Rp 2.250.000, Total Tagihan Rp 3.000.000, Status Segel SP-3 | `/tenant/tunggakan` | Dhia (P06) | Arman (P02) |
| **SC-09** | *Cashier Over-the-Counter* | Kasir input setoran tunai manual di loket pasar, otomatis terbit resi & status `Lunas` | `/admin/setoran-tunai` | Arman (P02) | Dhia (P06) |
| **SC-10** | *Installment Access Toggle* | Admin toggle `izinkan_cicilan` dari `false` ke `true` di panel detail pemilik | `/admin/riwayat-pemilik` | Rifa (P03) | Indriani (P07) |
| **SC-11** | *FIFO Partial Payment* | Pembayaran parsial Rp 750k melunasi tagihan tertua Rp 500k & menyicil tagihan berjalan (Sisa Rp 250k) | `/tenant/pembayaran` | Indriani (P07) | Arman / Rifa |
| **SC-12** | *Transfer Rejection Flow* | Kasir menolak bukti transfer tidak valid dengan alasan tercatat di `catatan_admin` | `/admin/verifikasi-bukti` | Arman (P02) | Elsya (P08) |
| **SC-13** | *Dispute / Sanggahan Cycle* | Tenant mengirim tangkapan layar m-banking baru + teks sanggahan, Kasir menyetujui | `/tenant/histori` | Elsya (P08) | Arman (P02) |
| **SC-14** | *Multi-Kios Cross-Floor* | 1 Tenant mengelola 3 unit kios (`F1-15`, `F2-08`, `G2-11`), berganti tab unit kios | `/tenant/dashboard` | Yael (P09) | Rifa (P03) |
| **SC-15** | *Admin Password Reset* | Petugas TU mereset kata sandi tenant langsung dari admin dan menyerahkan kredensial baru | `/admin/riwayat-pemilik` | Rifa (P03) | Yael (P09) |
| **SC-16** | *Lease Soft-Deletion* | Superadmin mengakhiri sewa (`akhiriSewa`), sewa menjadi `Selesai`, Kios kembali `Kosong` | `/admin/kios` | Patra (P01) | Clara (P10) |
| **SC-17** | *Stress Test & Pagination* | Tenant dengan 50 bulan histori transaksi, pengujian filter periode & ekspor Excel | `/tenant/histori` | Clara (P10) | Rifa (P03) |
| **SC-18** | *Audit Trail & Pusher Event* | Notifikasi real-time masuk ke lonceng dan seluruh aksi tercatat di tabel `activity_logs` | `/admin/audit-log` | Seluruh Tim | Patra & Rifa |
| **SC-19** | *Tambah Kios ke Tenant Terdaftar* | Admin menambah unit kios baru ke tenant existing (`Dawwas`) via Drawer Mode Terdaftar | `/admin/kios` | Rifa (P03) | Dawwas (P04) |
| **SC-20** | *Verifikasi Publik Resi / QR Code* | Cek keaslian nomor resi transaksi kuitansi pembayaran secara publik tanpa login | `/verifikasi` | Dawwas (P04) | Arman (P02) |
| **SC-21** | *Reset Password & Generator WA* | Admin mereset password tenant di detail kios, sistem otomatis generate template pesan WhatsApp | `/admin/kios/:id` | Rifa (P03) | Yael (P09) |
| **SC-22** | *Lupa Kata Sandi Mandiri* | Tenant memulihkan akun via nomor WhatsApp/email dan verifikasi OTP reset sandi | `/auth/lupa-sandi` | Tika (P05) | Patra (P01) |
| **SC-23** | *Rate Limiting 3x Gagal Login* | Salah memasukkan kata sandi 3 kali berturut-turut memicu penguncian akun 60 detik (*cooldown timer*) | `/auth` | Elsya (P08) | - |
| **SC-24** | *Auto-Confirm Webhook Midtrans* | Webhook payment gateway `settlement` mengonfirmasi lunas seketika tanpa approval admin manual | `/api/v1/midtrans/notification` | Dawwas (P04) | Patra (P01) |
| **SC-25** | *Isolasi Data Tenant (IDOR Guard)* | Percobaan tenant A membayar/mengakses tagihan milik tenant B ditolak dengan kode `403 Forbidden` | API Endpoint | Indriani (P07) | Patra (P01) |

---

## 4. Alur Simulasi Interaktif Per Fase (Step-by-Step Guide)

```
[ FASE 1: AUTH & SETUP ] ──> [ FASE 2: DAFTAR TENANT & TAMBAH KIOS ] ──> [ FASE 3: PENANGANAN TUNGGAKAN ]
                                                                                       │
[ FASE 6: AUDIT & ARSIP ] <── [ FASE 5: REBUTTAL & SANGGAHAN ] <─────── [ FASE 4: CICILAN FIFO ]
         │
         ▼
[ FASE 7: KEAMANAN, GATEWAY & VERIFIKASI RESI PUBLIK ]
```

---

### 🔹 Fase 1: Setup Staf, Autentikasi & Verifikasi Hak Akses
1. **Patra (Person 01 - Superadmin)**:
   - Login ke `http://localhost:3001/login` dengan `sim_superadmin` / `admin123`.
   - Buka menu **Manajemen Staf** (`/admin/staf`).
   - Cek daftar staf: pastikan Arman (`sim_admin_kasir`) dan Rifa (`sim_admin_petugas`) keduanya aktif dan memiliki akses pembayaran (`verifikasi_pembayaran` & `input_setoran`).
   - Coba uji coba nonaktifkan akun `sim_admin_nonaktif` untuk pengujian auth guard (SC-02).
2. **Arman (Person 02 - Admin Kasir)** & **Rifa (Person 03 - Petugas Kios & Pembayaran)**:
   - Login dengan akun masing-masing (`admin123`).
   - Keduanya dapat mengakses fitur utama pembayaran: **Setoran Tunai** (`/admin/setoran-tunai`) dan **Verifikasi Bukti Transfer** (`/admin/verifikasi-bukti`).

---

### 🔹 Fase 2: Pendaftaran Tenant Baru & Tambah Kios ke Tenant Terdaftar (Mode Terdaftar)

#### Bagian A: Pendaftaran Tenant Baru dari Nol
1. **Rifa (Person 03 - Petugas Kios)**:
   - Buka menu **Ketersediaan Kios** (`/admin/kios`) di panel admin.
   - Klik tombol **+ Tambah Penyewa / Kios**.
   - Pastikan tab aktif adalah **"Penyewa Baru"**, lalu isi data lengkap:
     * **Nama Penyewa**: `Dawwas`
     * **NIK (KTP Tenant)**: `6471022001950002` *(16 Digit - Wajib diisi!)*
     * **Nomor Telepon/WA**: `082199887766`
     * **Alamat Domisili**: `Jl. MT Haryono No. 89, Balikpapan`
     * **Pilih Unit Kios**: `D2-01` (Lantai 2)
     * **Jenis Usaha**: `Toko Busana & Aksesoris Pria`
     * **Tarif Bulanan**: `750000`
   - Klik **Daftarkan Tenant Baru**.
   - Sistem secara otomatis membuat akun `User`, entri `Pemilik` (berisi NIK), mengikat kontrak `Sewa`, mengubah status Kios `D2-01` menjadi `Terisi`, dan menerbitkan tagihan awal bulan berjalan.
   - Rifa menyerahkan kredensial login (`sim_tenant_baru` / `bunsay123`) ke Dawwas.

#### Bagian B: Tambah Unit Kios Tambahan ke Tenant yang Sudah Ada (*Multi-Kios Expansion*)
2. **Rifa (Person 03 - Petugas Kios)**:
   - Masih di menu **Ketersediaan Kios** (`/admin/kios`), klik lagi **+ Tambah Penyewa / Kios**.
   - Kali ini, pilih tab **"Tambah Kios ke Tenant Terdaftar"** (Mode Terdaftar).
   - Cari tenant existing: ketik `Dawwas` atau NIK `6471011508800001` (Person 04).
   - Pilih tenant Dawwas dari daftar.
   - Pilih unit kios kosong tambahan yang ingin disewa, misalnya **`B1-02`** (Lantai 1).
   - Masukkan **Jenis Usaha**: `Cabang Toko Pakaian Barokah 2` dan **Tarif Bulanan**: `750000`.
   - Klik **Tambahkan Kios ke Tenant**.
   - Backend memanggil `POST /api/v1/admin/sewa` menghubungkan `Id_Pemilik` Dawwas dengan Kios `B1-02`, status kios `B1-02` otomatis berubah menjadi `Terisi`, dan tagihan baru terbit.

#### Bagian C: Verifikasi di Sisi Tenant
3. **Dawwas (Person 04 - Tenant Ideal & Multi-Kios)**:
   - Login ke portal tenant `http://localhost:3000/auth` dengan `sim_tenant_ideal` / `bunsay123`.
   - Perhatikan bahwa sekarang muncul tombol **Kiosk Switcher / Pilihan Unit Kios** di Dashboard:
     * Kios 1: `A1-01` (Kios lama, status Lunas)
     * Kios 2: `B1-02` (Kios baru yang baru saja ditambahkan oleh Rifa, status Belum Bayar)
   - Dawwas dapat berganti-ganti unit kios, mengecek tagihan masing-masing kios, dan membayar tanpa perlu membuat akun login baru!
   - Coba juga login dengan akun `sim_tenant_baru` untuk memverifikasi Kios `D2-01`.

---

### 🔹 Fase 3: Peringatan Tunggakan & Pembayaran Loket Kasir
1. **Tika (Person 05 - Tenant Tunggak 1 Bulan - `sim_tenant_tunggak1` / `bunsay123`)**:
   - Login ke portal tenant. Perhatikan banner kuning **Peringatan Jatuh Tempo Kios B1-05**.
   - Buka menu **Bayar Sekarang** (`/tenant/pembayaran`), pilih metode **Transfer Bank**.
   - Upload file/gambar bukti transfer baru -> Kirim. Status tagihan berubah menjadi **Menunggu Verifikasi**.
2. **Arman (Person 02 - Admin Kasir)**:
   - Buka panel **Verifikasi Bukti** (`/admin/verifikasi-bukti`).
   - Temukan transaksi masuk dari Tika.
   - Klik **Terima Pembayaran**.
   - Periksa notifikasi tenant Tika: status otomatis berubah menjadi **Lunas**.
3. **Dhia (Person 06 - Tenant Kritis 3 Bulan - `sim_tenant_kritis` / `bunsay123`)**:
   - Login ke portal tenant. Perhatikan banner merah **Peringatan Penyegelan Kios (SP-3)**.
   - Total tagihan terakumulasi Rp 2.250.000 (3 bulan).
   - Datang ke loket kasir (simulasi fisik).
4. **Arman (Person 02 - Admin Kasir)**:
   - Buka menu **Setoran Tunai** (`/admin/setoran-tunai`).
   - Pilih Kios `C1-12` (Dhia).
   - Masukkan nominal setoran tunai Rp 2.250.000 -> Simpan & Cetak Kuitansi Kasir.
   - Tagihan Dhia seketika lunas dan status segel dicabut.

---

### 🔹 Fase 4: Pembayaran Parsial Cicilan Berjenjang (Algoritma FIFO)
1. **Indriani (Person 07 - Tenant Cicilan - `sim_tenant_cicil` / `bunsay123`)**:
   - Login ke portal tenant.
   - Memiliki total hutang 2 bulan berjalan (Bulan kemarin sisa Rp 250k + Bulan ini Rp 500k = Total Rp 750k).
   - Masukkan pembayaran cicilan sebesar **Rp 500.000**.
   - Upload bukti transfer.
2. **Arman (Person 02 - Admin Kasir)** / **Rifa (Person 03)**:
   - Buka `/admin/verifikasi-bukti` dan setujui transaksi Indriani.
   - Sistem menjalankan **Algoritma FIFO**:
     - Rp 250.000 otomatis melunasi sisa tagihan bulan kemarin (Status: `Lunas`).
     - Rp 250.000 sisanya dialokasikan ke tagihan bulan berjalan (Status: `Dicicil`, Sisa Tagihan: Rp 250.000).
3. **Indriani (Akun Edge - `sim_tenant_nocicil`)**:
   - Login dan coba bayar nominal kurang dari total tagihan -> Validasi menolak karena `izinkan_cicilan = false`.

---

### 🔹 Fase 5: Siklus Penolakan & Sanggahan (Dispute / Rebuttal)
1. **Elsya (Person 08 - Tenant Dispute - `sim_tenant_dispute` / `bunsay123`)**:
   - Login ke portal tenant.
   - Tagihan bulan berjalan berstatus **Menunggu Verifikasi** dengan riwayat penolakan sebelumnya: *"Bukti transfer buram/terpotong"*.
   - Buka menu **Histori**, klik tombol **Ajukan Sanggahan**.
   - Masukkan teks sanggahan: *"Saya kirimkan bukti mutasi mobile banking yang jelas."* dan unggah gambar baru.
2. **Arman (Person 02 - Admin Kasir)**:
   - Panel `/admin/verifikasi-bukti` menerima notifikasi badge peringatan sanggahan masuk dari Elsya.
   - Kasir memeriksa bukti sanggahan baru, melihat catatan alasan sanggahan, lalu klik **Diterima**.
   - Status transaksi Elsya resmi berubah menjadi **Lunas**.

---

### 🔹 Fase 6: Multi-Kios, Soft-Deletion, Ekspor Laporan & Audit Trail
1. **Yael (Person 09 - Tenant Multi-Kios - `sim_tenant_multikios` / `bunsay123`)**:
   - Login ke portal tenant.
   - Perhatikan tombol *Switcher Kios*: Yael memiliki **3 unit kios** (`F1-15` di Lt 1, `F2-08` di Lt 2, `G2-11` di Lt 2).
   - Ganti unit kios aktif: seluruh kartu tagihan, riwayat transaksi, dan profil toko berubah secara dinamis sesuai kios yang dipilih.
2. **Rifa (Person 03 - Petugas Kios)**:
   - Buka `/admin/riwayat-pemilik`, cari Yael.
   - Klik **Reset Password**: masukkan password baru atau buat acak -> Kredensial baru tersimpan langsung di database.
3. **Clara (Person 10 - Tenant Sewa Selesai - `sim_tenant_selesai` / `bunsay123`)**:
   - Login ke portal tenant: Status sewa **Selesai (Arsip)**.
   - Kios `H1-20` berstatus **Kosong** di panel admin, namun seluruh kuitansi riwayat masa lalu Clara tetap dapat diakses abadi.
4. **Clara (Akun Edge - `sim_tenant_stress50`)**:
   - Login dan buka menu **Histori**.
   - Uji performa *pagination* / *infinite scroll* untuk **50 baris transaksi tagihan**.
5. **Rifa (Person 03 - Petugas Kios & Auditor)** & **Patra (Person 01)**:
   - Buka `/admin/ekspor`.
   - Pilih periode bulan & tahun berjalan -> Klik **Unduh Rekapitulasi Excel (.xlsx)**.
   - Buka `/admin/audit-log` untuk memverifikasi seluruh rekam jejak aksi tim 10 orang dari Fase 1 hingga Fase 6.

---

### 🔹 Fase 7: Skenario Keamanan, Integrasi Gateway & Fitur Publik

1. **Dawwas (Person 04 - Verifikasi Resi / QR Code Publik — SC-20)**:
   - Buka halaman publik `http://localhost:3000/verifikasi`.
   - Masukkan ID Transaksi (misalnya: `TRX-1` atau nomor kuitansi resmi).
   - Sistem menampilkan detail validitas pembayaran asli dari database SQL (Nama Penyewa: Dawwas, Unit Kios: A1-01, Tanggal, Nominal, Status Diterima) sebagai fitur transparansi publik.
2. **Rifa (Person 03 - Reset Sandi & Generator Pesan WA — SC-21)**:
   - Buka `/admin/kios/A1-01` -> Klik **Reset Password Tenant**.
   - Modal menampilkan kata sandi baru dan **Template Pesan WhatsApp Resmi** yang siap disalin langsung untuk dikirim ke nomor WA Dawwas atau Yael.
3. **Tika (Person 05 - Lupa Kata Sandi Mandiri via OTP — SC-22)**:
   - Buka portal tenant `http://localhost:3000/auth/lupa-sandi`.
   - Masukkan nomor HP/WA atau email terdaftar.
   - Verifikasi alur permintaan OTP dan form pembaruan kata sandi baru.
4. **Elsya (Person 08 - Uji Proteksi Keamanan 3x Gagal Login — SC-23)**:
   - Buka `http://localhost:3000/auth`.
   - Coba masukkan kata sandi yang salah secara sengaja sebanyak 3 kali berturut-turut.
   - Sistem mengaktifkan **Rate-Limiter Lockout**: form terkunci selama 60 detik (*countdown timer*) untuk melindungi akun dari serangan *brute-force*.
5. **Dawwas (Person 04 - Simulasi Webhook Midtrans Settlement — SC-24)**:
   - Simulasi pengiriman payload callback webhook Midtrans (`settlement`) ke `/api/v1/midtrans/notification`.
   - Tagihan terkait otomatis berubah menjadi **Lunas** dan status pembayaran **Diterima** tanpa intervensi manual.
6. **Indriani (Person 07 - Uji Proteksi IDOR / Isolasi Tenant — SC-25)**:
   - Tenant Indriani mencoba mengakses atau membayar tagihan milik Tika (Person 05) melalui pemanggilan API langsung.
   - Backend memblokir dengan response **`403 Forbidden`** (*"Anda tidak memiliki hak akses ke tagihan ini"*).

---

## 5. Panduan Menjalankan Mock Seeder di Komputer Lokal

Untuk mereset database dan mengaktifkan seluruh data simulasi 10 orang di atas:

### Opsi A: Jalankan Menggunakan DDEV
```bash
# Masuk ke direktori backend
cd plaza_tenant_backend

# Eksekusi seeder simulasi 10 orang
ddev exec php artisan db:seed --class=SimulationScenarioSeeder
```

### Opsi B: Jalankan Menggunakan PHP Artisan Langsung
```bash
cd plaza_tenant_backend
php artisan db:seed --class=SimulationScenarioSeeder
```

### Opsi C: Reset Bersih Seluruh Database + Seed Simulasi
```bash
cd plaza_tenant_backend
php artisan migrate:fresh --seed
```

---

## 6. Ringkasan Kredensial Cepat (Cheat Sheet Tim 10 Orang)

```
================================================================================
KREDENSIAL ADMIN (URL: http://localhost:3001/login)
===============================================================================
Person 01 (Patra)            : sim_superadmin       / admin123  (Superadmin Utama)
Person 02 (Arman)            : sim_admin_kasir      / admin123  (Admin Kasir & Loket)
Person 03 (Rifa)             : sim_admin_petugas    / admin123  (Petugas Kios & Pembayaran)
Admin Non-Aktif (Negative)   : sim_admin_nonaktif   / admin123  (Negative Test)

================================================================================
KREDENSIAL TENANT (URL: http://localhost:3000/auth)
================================================================================
Person 04 (Dawwas)           : sim_tenant_ideal     / bunsay123 (Ideal On-Time, Kios A1-01)
Person 04 Edge (Dawwas)      : sim_tenant_baru      / bunsay123 (Calon Baru, Kios D2-01)
Person 05 (Tika)             : sim_tenant_tunggak1  / bunsay123 (Tunggak 1 Bln, Kios B1-05)
Person 06 (Dhia)             : sim_tenant_kritis    / bunsay123 (Tunggak 3 Bln, Kios C1-12)
Person 07 (Indriani)         : sim_tenant_cicil     / bunsay123 (Cicilan FIFO, Kios D1-08)
Person 07 Edge (Indriani)    : sim_tenant_nocicil   / bunsay123 (Tanpa Izin Cicil)
Person 08 (Elsya)            : sim_tenant_dispute   / bunsay123 (Dispute/Sanggah, Kios E2-03)
Person 09 (Yael)             : sim_tenant_multikios / bunsay123 (Multi-Kios 3 Unit)
Person 10 (Clara)            : sim_tenant_selesai   / bunsay123 (Sewa Selesai, Kios H1-20)
Person 10 Edge (Clara)       : sim_tenant_stress50  / bunsay123 (Stress 50 Rows, Kios G1-01)
================================================================================
```
