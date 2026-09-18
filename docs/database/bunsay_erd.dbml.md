// ============================================================
// ERD VERSI 6.0 — Bunsay Hub (Plaza Kebun Sayur Balikpapan)
// Rilis Monorepo, RBAC, Audit Trail, & Notifikasi Dinamis
// 11 Tabel SQL Sesuai Laravel Migrations Backend (plaza_tenant_backend)
//
// Cara Penggunaan:
// Copy seluruh isi file ini dan paste di https://dbdiagram.io/d
// ============================================================

// ---------------- ENUM DEFINITIONS ----------------

Enum status_pemilik_enum {
  Aktif
  Nonaktif
}

Enum status_kios_enum {
  Terisi
  Kosong
}

Enum status_sewa_enum {
  Aktif
  Selesai
}

Enum status_aktif_user_enum {
  Aktif
  Nonaktif
}

Enum sub_role_enum {
  superadmin
  admin
  staff_loket
  auditor
}

Enum jenis_dokumen_enum {
  SP
  PPJB
  Sertifikat
  AJB
  KTP
}

Enum status_tagihan_enum {
  Lunas
  "Belum Bayar"
  Dicicil
  "Menunggu Verifikasi"
}

Enum metode_bayar_enum {
  Transfer
  Tunai
  Midtrans
}

Enum verifikasi_pembayaran_enum {
  Menunggu
  Diterima
  Ditolak
}

Enum notif_target_enum {
  tenant
  admin
  all
}

Enum notif_type_enum {
  info
  success
  warning
  danger
}

// ---------------- TABLES ----------------

Table Roles {
  Id_roles int [pk, increment]
  Nama_Role varchar(30) [not null]

  Note: 'Master data peran pengguna: 1 = Admin, 2 = Tenant.'
}

Table User {
  Id_user int [pk, increment]
  Id_roles int [ref: > Roles.Id_roles, not null]
  Username varchar(50) [not null, unique]
  Password varchar(255) [not null]
  nama_lengkap varchar(100) [null]
  email varchar(100) [null]
  sub_role sub_role_enum [null, note: 'Khusus staf admin: superadmin, admin, staff_loket, auditor']
  permissions text [null, note: 'JSON matrix perizinan hak akses modul']
  status_aktif status_aktif_user_enum [not null, default: 'Aktif']
  last_login_at datetime [null]

  Note: '''
  Akun login terpusat (Tenant & Admin) berbasis Username.
  Mendukung granular RBAC untuk staf pengelola & single tenant accounts.
  '''
}

Table Pemilik {
  Id_Pemilik int [pk, increment]
  Id_User int [ref: - User.Id_user, not null]
  Nama varchar(100) [not null]
  No_Telepon varchar(30) [not null]
  No_KTP char(16) [not null]
  Alamat text [not null]
  Status_Pemilik status_pemilik_enum [not null, default: 'Aktif']
  izinkan_cicilan boolean [not null, default: false, note: 'Toggle persetujuan cicilan oleh pengelola']

  Note: 'Data profil resmi penyewa kios perorangan / penanggung jawab.'
}

Table Kios {
  Id_Kios int [pk, increment]
  No_Kios varchar(10) [not null, unique]
  Lantai int [not null]
  Ukuran varchar(20) [null]
  Status status_kios_enum [not null, default: 'Kosong']
  Sertifikat varchar(100) [null]
  Catatan text [null]

  Note: 'Master data 285+ unit kios fisik di Plaza Kebun Sayur.'
}

Table Dokumen {
  Id_Dokumen int [pk, increment]
  Id_Pemilik int [ref: > Pemilik.Id_Pemilik, not null]
  Id_Kios int [ref: > Kios.Id_Kios, null]
  Jenis_Dokumen jenis_dokumen_enum [not null]
  Nomor_Dokumen varchar(100) [null]
  Tanggal date [null]
  Keterangan text [null]

  Note: 'Berkas legalitas sewa kios (SP, PPJB, AJB, Sertifikat, KTP).'
}

Table Sewa {
  Id_Sewa int [pk, increment]
  Id_Pemilik int [ref: > Pemilik.Id_Pemilik, not null]
  Id_Kios int [ref: > Kios.Id_Kios, not null]
  Jenis_Usaha varchar(100) [not null]
  Tanggal_Mulai date [not null]
  Tanggal_Selesai date [not null]
  Tarif_Bulanan decimal(12,2) [not null, default: 750000.00]
  Status status_sewa_enum [not null, default: 'Aktif', note: 'Soft-delete status: Aktif vs Selesai']
  Keterangan text [null]

  Note: '''
  Kontrak sewa kios. Saat masa sewa berakhir (Status = 'Selesai'),
  kios otomatis kembali menjadi 'Kosong', tetapi seluruh riwayat tagihan
  dan pembayaran tetap tersimpan utuh di database.
  '''
}

Table Tagihan {
  Id_Tagihan int [pk, increment]
  Id_Sewa int [ref: > Sewa.Id_Sewa, not null]
  Periode char(7) [not null, note: 'Format YYYY-MM']
  Jatuh_Tempo date [not null, note: 'Standard tanggal 12 tiap bulan']
  Tarif_Sewa decimal(12,2) [not null]
  Hutang_Tunggakan decimal(12,2) [not null, default: 0]
  Total_Tagihan decimal(12,2) [not null, note: 'Tarif_Sewa + Hutang_Tunggakan']
  Sisa_Tagihan decimal(12,2) [not null, default: 0, note: 'Sisa kewajiban setelah dicicil parsial']
  Status_Tagihan status_tagihan_enum [not null, default: 'Belum Bayar']

  indexes {
    Periode
    Status_Tagihan
  }

  Note: 'Tagihan sewa bulanan. Total_Tagihan = Tarif_Sewa + Akumulasi Tunggakan sebelumnya.'
}

Table Pembayaran {
  Id_Pembayaran int [pk, increment]
  Id_Tagihan int [ref: > Tagihan.Id_Tagihan, not null]
  Tanggal_Bayar date [not null]
  Total_Bayar decimal(12,2) [not null]
  Metode_Bayar metode_bayar_enum [not null]
  Bukti_Pembayaran varchar(255) [null]
  Verifikasi_Pembayaran verifikasi_pembayaran_enum [not null, default: 'Menunggu']
  catatan_admin text [null, note: 'Alasan penolakan dari admin']
  teks_sanggahan text [null, note: 'Keterangan sanggahan dari tenant']
  bukti_sanggahan varchar(255) [null, note: 'Bukti perbaikan transfer dari tenant']

  Note: '''
  Pencatatan transaksi pembayaran sewa via Transfer Bank, Tunai Loket, atau Midtrans.
  Mendukung alur penolakan, sanggahan/dispute, dan alokasi cicilan FIFO.
  '''
}

Table Alokasi_Pembayaran {
  Id_Alokasi int [pk, increment]
  Id_Pembayaran int [ref: > Pembayaran.Id_Pembayaran, not null]
  Id_Tagihan int [ref: > Tagihan.Id_Tagihan, not null]
  Nominal_Teralokasi decimal(12,2) [not null]

  Note: '''
  Junction table alokasi FIFO (First-In-First-Out):
  Memetakan setiap nominal rupiah pembayaran ke tagihan-tagihan tertua
  secara berurutan.
  '''
}

Table ActivityLog {
  id int [pk, increment]
  id_user int [ref: > User.Id_user, null]
  username varchar(50) [not null]
  role varchar(50) [not null]
  modul varchar(50) [not null]
  aksi varchar(50) [not null]
  deskripsi text [not null]
  ip_address varchar(45) [null]
  created_at datetime [not null]

  Note: 'Audit trail log untuk mencatat seluruh aksi sensitif pengelola plaza.'
}

Table Notification {
  id int [pk, increment]
  target_type notif_target_enum [not null, default: 'tenant']
  id_user int [ref: > User.Id_user, null]
  title varchar(150) [not null]
  message text [not null]
  type notif_type_enum [not null, default: 'info']
  is_read boolean [not null, default: false]
  link varchar(255) [null]
  created_at datetime [not null]

  Note: 'Notifikasi dinamis real-time untuk tenant dan staf pengelola admin.'
}
