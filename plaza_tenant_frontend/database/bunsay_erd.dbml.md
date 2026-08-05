// ============================================================
// ERD VERSI 4 — Bunsay (Plaza Kebun Sayur Balikpapan)
// Revisi dari v3: Pembayaran cicilan (FIFO, nominal bebas)
// dikonfirmasi oleh tim database (Indri), menggantikan asumsi
// "harus lunas sekaligus" di v3 yang ternyata salah tafsir.
// Import di https://dbdiagram.io/d — paste kode ini di editor
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

Enum jenis_dokumen_enum {
  SP
  PPJB
  Sertifikat
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

// ---------------- TABLES ----------------

Table Roles {
  Id_Roles int [pk, increment]
  Nama_Role varchar(30)

  Note: 'Menyimpan daftar hak akses/peran pengguna (Tenant, Admin).'
}

Table User {
  Id_User int [pk, increment]
  Id_Roles int [ref: > Roles.Id_Roles, not null]
  Username varchar(50) [not null, unique]
  Email varchar(100) [not null, unique]
  Password varchar(255) [not null]

  Note: '''
  Akun login terpusat (Tenant & Admin) berbasis Username.
  Email disimpan di tabel User untuk formalitas administrasi &
  pengiriman tautan reset kata sandi (Lupa Sandi).
  Menggunakan model Single Official Admin Account (Shared Account)
  untuk staf pengelola kantor tanpa memerlukan tabel terpisah.
  '''
}

Table Pemilik {
  Id_Pemilik int [pk, increment]
  Id_User int [ref: - User.Id_User, not null]
  Nama varchar(50) [not null]
  No_Telepon varchar(255) [not null]
  No_KTP char(16) [not null, unique]
  Alamat text [not null]
  Status_Pemilik status_pemilik_enum [not null, default: 'Aktif']

  Note: '''
  Status_Pemilik membedakan tenant aktif vs riwayat lama.
  Tenant yang benar-benar berhenti (bukan menunggak) diubah
  jadi Nonaktif. Kalau sewa lagi di kemudian hari, dianggap
  Pemilik baru (row baru), bukan reaktivasi row lama.
  '''
}

Table Kios {
  Id_Kios int [pk, increment]
  No_Kios varchar(10) [not null, unique]
  Lantai int [not null]
  Ukuran varchar(20)
  Status status_kios_enum [not null, default: 'Kosong']

  Note: 'Master data seluruh unit kios di Plaza Kebun Sayur.'
}

Table Dokumen {
  Id_Dokumen int [pk, increment]
  Id_Pemilik int [ref: > Pemilik.Id_Pemilik, not null]
  Id_Kios int [ref: > Kios.Id_Kios, null]
  Jenis_Dokumen jenis_dokumen_enum [not null]
  Nomor_Dokumen varchar(100) [null]
  Tanggal date [null]
  Keterangan text [null]

  Note: '''
  Dokumen generik & opsional (kecuali KTP yang wajib di Pemilik).
  Id_Kios diisi untuk dokumen per-kios (SP, PPJB, Sertifikat);
  dikosongkan untuk dokumen per-pemilik (KTP).
  Satu baris per jenis dokumen yang dimiliki.
  '''
}

Table Sewa {
  Id_Sewa int [pk, increment]
  Id_Pemilik int [ref: > Pemilik.Id_Pemilik, not null]
  Id_Kios int [ref: > Kios.Id_Kios, not null]
  Jenis_Usaha varchar(100) [not null]
  Tanggal_Mulai date [not null]
  Tanggal_Selesai date [not null]
  Keterangan text [null]

  Note: '''
  SIKLUS SEWA BULANAN — bukan kontrak jangka panjang.
  Satu baris = satu bulan siklus sewa. Reset tiap bulan
  (baris baru dibuat, bukan update di tempat).
  Relasi ke siklus sebelumnya TIDAK eksplisit (tanpa FK) —
  cukup ditelusuri lewat Id_Pemilik + Id_Kios yang sama,
  karena tenant yang berhenti beneran akan dapat Id_Pemilik
  baru saat sewa lagi (lihat Pemilik.Status_Pemilik).
  '''
}

Table Tagihan {
  Id_Tagihan int [pk, increment]
  Id_Sewa int [ref: - Sewa.Id_Sewa, not null]
  Periode char(7) [not null, note: 'format YYYY-MM']
  Jatuh_Tempo date [not null]
  Tarif_Sewa decimal(12,2) [not null]
  Hutang_Tunggakan decimal(12,2) [not null, default: 0]
  Total_Tagihan decimal(12,2) [not null, note: 'Tarif_Sewa + Hutang_Tunggakan']
  Status_Tagihan status_tagihan_enum [not null, default: 'Belum Bayar']

  indexes {
    Periode
    Status_Tagihan
  }

  Note: '''
  Satu Tagihan per siklus Sewa (1:1, karena Sewa sudah per-bulan).
  Hutang_Tunggakan = akumulasi Total_Tagihan dari siklus Sewa
  sebelumnya yang masih belum Lunas (dicari via Id_Pemilik + Id_Kios).
  Total_Tagihan = Tarif_Sewa bulan ini + Hutang_Tunggakan.

  Total_Terbayar TIDAK disimpan sebagai kolom — dihitung on-the-fly
  lewat SUM(Alokasi_Pembayaran.Nominal_Teralokasi) WHERE Id_Tagihan
  = Tagihan ini, untuk menghindari risiko data tidak sinkron antara
  kolom tersimpan vs baris Alokasi_Pembayaran yang sebenarnya.
  Status_Tagihan diturunkan dari perbandingan hasil SUM itu vs
  Total_Tagihan:
    SUM = 0                         -> "Belum Bayar"
    0 < SUM < Total_Tagihan         -> "Dicicil"
    SUM >= Total_Tagihan            -> "Lunas"
  (Selama ada Pembayaran yang masih "Menunggu" verifikasi terkait
  Tagihan ini, status ditahan di "Menunggu Verifikasi".)

  Index ditambahkan di Periode & Status_Tagihan karena keduanya
  jadi kolom filter utama di fitur EksporData.jsx dan tabel admin.
  '''
}

Table Pembayaran {
  Id_Pembayaran int [pk, increment]
  Id_Pemilik int [ref: > Pemilik.Id_Pemilik, not null]
  Tanggal_Bayar date [not null]
  Total_Bayar decimal(12,2) [not null]
  Metode_Bayar metode_bayar_enum [not null]
  Bukti_Pembayaran varchar(255) [null]
  Verifikasi_Pembayaran verifikasi_pembayaran_enum [not null, default: 'Menunggu']

  Note: '''
  TIDAK LAGI 1:1 dengan Tagihan (revisi dari v3). Tenant boleh
  mencicil dengan NOMINAL BEBAS (dikonfirmasi tim database):
  tidak harus pas kelipatan satu bulan tagihan.

  Satu Pembayaran dialokasikan ke satu atau lebih Tagihan lewat
  Alokasi_Pembayaran, memakai aturan FIFO (First-In-First-Out):
  tagihan dengan Periode tertua yang belum Lunas dilunasi/dicicil
  duluan. Kelebihan nominal (jika ada) mengalir ke Tagihan
  berikutnya yang masih belum Lunas.

  Id_Pemilik (bukan Id_Tagihan) menjadi FK utama karena satu
  Pembayaran bisa menyentuh banyak Tagihan sekaligus.
  Bukti_Pembayaran nullable karena pembayaran Tunai/Midtrans
  tidak selalu perlu upload bukti.
  '''
}

Table Alokasi_Pembayaran {
  Id_Alokasi int [pk, increment]
  Id_Pembayaran int [ref: > Pembayaran.Id_Pembayaran, not null]
  Id_Tagihan int [ref: > Tagihan.Id_Tagihan, not null]
  Nominal_Teralokasi decimal(12,2) [not null]

  Note: '''
  Junction table BARU (menggantikan Tagihan_Terlunasi versi v3):
  mencatat berapa RUPIAH persis dari satu Pembayaran yang
  teralokasi ke satu Tagihan tertentu — bukan cuma penanda
  lunas/tidak, karena sekarang alokasinya bisa PARSIAL.

  WAJIB diproses backend dengan algoritma FIFO setiap kali
  Pembayaran diverifikasi (Verifikasi_Pembayaran = "Diterima"):
    1. Ambil semua Tagihan milik Pemilik itu dengan
       Status_Tagihan != "Lunas", urutkan Periode tertua dulu.
    2. Loop: alokasikan sisa nominal Pembayaran ke Tagihan
       tertua sampai habis atau semua Tagihan lunas.
    3. Tiap alokasi dicatat sebagai satu baris di sini.
    4. Setelah insert, hitung ulang SUM Alokasi_Pembayaran per
       Tagihan yang tersentuh untuk menentukan Status_Tagihan
       barunya (lihat Note di Tagihan).
  '''
}
