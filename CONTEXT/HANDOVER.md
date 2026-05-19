# DOKUMEN HANDOVER
## Website Digitalisasi Pembayaran Sewa Kios
### Plaza Kebun Sayur Balikpapan

| Informasi | Detail |
| :--- | :--- |
| **Ditujukan untuk** | LLM / Developer penerus implementasi front-end website |
| **Mitra** | Plaza Kebun Sayur Balikpapan |
| **Tim Pengembang** | Clara, Armansyah, Dawwas, Elsya, Indriani, Rifa, Patra, Tika, Dhia, Yael — Sistem Informasi & Aktuaria, ITK 2026 |
| **Dosen Pembimbing** | Hendy Indrawan Sunardi, S.Kom., M.Eng. |
| **Kontak Mitra** | 0811-5901-119 / info.plazabunsay@gmail.com |
| **Program** | Inovasi Sosial — Institut Teknologi Kalimantan, 2026 |

---

## 1. KONTEKS PROYEK

### 1.1 Latar Belakang dan Tujuan
Plaza Kebun Sayur Balikpapan adalah pusat perbelanjaan di Jalan Letjen Suprapto, Batu Ilir, Balikpapan Barat, Kalimantan Timur. Plaza ini menaungi 250 tenant aktif yang terdiri dari pedagang kerajinan, perhiasan, emas, fashion, aksesori, oleh-oleh, dan produk khas Kalimantan Timur. Jam operasional plaza ini berlangsung dari pukul 09.00 hingga 21.00 WITA setiap hari.

Sistem pembayaran saat ini masih manual. Tenant wajib datang ke kantor pengelola di lantai 3 untuk membayar sewa, sangat bergantung pada jam operasional kantor, dan rentan terhadap kehilangan bukti pembayaran. Tujuan proyek ini adalah memigrasikan proses tersebut ke website digital yang menghubungkan tenant dan pengelola secara praktis dan efisien.

### 1.2 Target Keberhasilan dari Proposal
* Minimal 80% tenant berhasil menggunakan sistem secara mandiri.
* Rata-rata waktu proses pembayaran turun dari 30 menit (manual) menjadi 5 menit per transaksi.
* Data pembayaran seluruh tenant tercatat terpusat dan dapat direkap otomatis.
* Transparansi status pembayaran secara real-time antara tenant dan pengelola.

### 1.3 Yang TIDAK Boleh Diubah
> ⚠ **PENTING:** Semua informasi berikut adalah fakta dari proposal dan data kios yang bersifat mutlak dan tidak boleh diubah.

* **Jumlah tenant aktif:** 250 tenant
* **Jam operasional:** 09.00–21.00 WITA
* **Alamat mitra:** Jl. Letjen Suprapto, Batu Ilir, Kec. Balikpapan Barat, Kota Balikpapan, Kaltim 76123
* **Nama aplikasi / brand:** Bunsay (singkatan Plaza Kebun Sayur)
* **Warna utama:** Merah marun / merah hangat — `#8B1A1A`

---

## 2. DATA KIOS DAN STRUKTUR DATABASE

### 2.1 Struktur File Excel Sumber
File Excel `Data_Kios_BY_LEGAL` (update 26 April 2025) adalah *source of truth* (sumber kebenaran tunggal) untuk data tenant. File ini terdiri dari beberapa sheet:
* **Lt1, Lt2, Lt3:** Data kios per lantai, masing-masing berisi daftar tenant dan field lengkap.
* **Sheet sertifikat:** Data status pengambilan sertifikat.
* **Sheet sewa kios:** Data terkait sewa.

### 2.2 Field Data Setiap Tenant (dari Excel)
> ⚠ **Catatan Penting:** Semua nilai tanggal di Excel menggunakan format *date serial* (angka integer). Konversi terlebih dahulu ke format tanggal yang terbaca manusia sebelum ditampilkan di UI.

| Nama Field | Contoh Nilai | Catatan |
| :--- | :--- | :--- |
| **Nama** | Hj. Yuliana | Nama pemilik kios |
| **No Kios** | B-1001 | Format: huruf blok - nomor (ex: B-1001, B-1002) |
| **Total AR s/d Sept 2024** | 13.219.998 | Nilai 0 = lunas, nilai > 0 = ada tunggakan |
| **Alamat** | Jl. Adil Makmur... | Alamat lengkap pemilik kios |
| **No KTP** | 175102.460772.0005 | Nomor KTP pemilik |
| **No Telepon** | 0812-5564-593 | Format bervariasi, lakukan normalisasi saat display |
| **No SP / Tgl SP** | 423 / 39574 | Nomor dan tanggal Surat Perjanjian (format Excel date serial) |
| **No PPJB / Tgl PPJB** | 423 / 39574 | Nomor dan tanggal Perjanjian Pengikatan Jual Beli |
| **Tgl BAST** | 40297 | Tanggal Berita Acara Serah Terima (format Excel date serial) |
| **Uk (Ukuran)** | 6M / 12M | Ukuran kios dalam meter persegi |
| **Jenis Usaha** | Kerajinan, Emas, Perhiasan | Kategori usaha yang dijalankan di kios |
| **No Sertifikat / Tgl Ambil** | 422 / 41011 | Nomor sertifikat dan tanggal pengambilan |
| **Pengalihan Ke** | Eva Tauresea | Nama penerima kios jika dialihkan. Jika kosong = tidak dialihkan |
| **Tgl Dialihkan** | 40331 | Tanggal pengalihan kios |
| **Keterangan** | Sertifikat diambil BPD Syariah | Catatan bebas, termasuk status sertifikat |

### 2.3 Aturan Data yang Harus Dijaga
* **Multi-kios:** Satu tenant bisa memiliki lebih dari satu nomor kios (contoh: Hj. Yuliana memegang B-1001 dan B-1002).
* **Histori Pengalihan:** Histori pengalihan kios harus tersimpan — jangan hapus data lama saat kios berpindah pemilik.
* **Field Total AR:** Merupakan data historis hingga September 2024. Data pembayaran baru harus dihitung dari sistem berjalan.
* **Keterangan Ambigu:** Baris dengan keterangan ambigu (sertifikat belum diambil, belum dibuatkan, dialihkan) tidak boleh langsung diklasifikasikan sebagai kios kosong.

---

## 3. FITUR YANG HARUS DIBANGUN

### 3.1 Pengunjung Umum — Tanpa Login
* **Beranda publik:** Informasi plaza, foto, dan ajakan masuk/daftar.
* **Informasi plaza:** Alamat, jam operasional (09.00-21.00 WITA), dan kontak pengelola.
* **Direktori tenant:** Daftar kios aktif dan tersedia, nama toko, jenis usaha, lokasi, serta jam buka.
* **Tabel ketersediaan kios (fitur baru dari mitra):** Menampilkan status ketersediaan (lihat detail di Section 4).
* **Tombol ajakan:** Masuk / Daftar sebagai Tenant.

### 3.2 Tenant / Pemilik Kios
* **Autentikasi:**
  * Halaman login: Email/username + password.
  * Halaman daftar akun baru: Nama lengkap, email, nomor kios, nomor telepon, dan kata sandi.
  * Lupa password: Minimal menyediakan placeholder untuk sistem nyata.
* **Dashboard Tenant:**
  * Sapaan personal: *"Halo, Hj. Yuliana — Kios B-1001"*.
  * Kartu sisa masa gedung (hari menuju jatuh tempo sewa).
  * Kartu sisa masa *service charge* (hari menuju jatuh tempo *service charge*).
  * Status pembayaran gedung: Lunas / Belum Lunas + total nominal.
  * Status pembayaran *service charge*: Lunas / Belum Lunas + total nominal.
  * Status tunggakan: Lunas / Ada Tunggakan + total nilai AR.
  * Ringkasan aktivitas terbaru (3-5 transaksi terakhir).
* **Fitur Pembayaran:**
  * Pilih metode: QRIS (tampilkan QR code) atau Transfer Bank (tampilkan nomor rekening).
  * Upload bukti transfer setelah melakukan pembayaran.
  * Status pasca-kirim: "Menunggu Verifikasi Admin".
  * Konfirmasi / notifikasi otomatis setelah admin memverifikasi.
* **Histori Pembayaran:**
  * Daftar seluruh transaksi: Tanggal, jam, nominal, jenis tagihan, metode, dan status.
  * Filter: Semua / Lunas / Belum Lunas / Tunggakan.
  * Bukti pembayaran dapat dilihat per transaksi (jika tersedia).
* **Tunggakan:**
  * Total nilai AR yang harus dibayar.
  * Rincian: Sewa bulan ini, listrik & air (jika ada), serta denda keterlambatan.
  * Riwayat cicilan tunggakan (cicilan ke-1, ke-2, dst.) beserta statusnya.
  * Sisa yang belum dibayarkan.
  * Tombol bayar tunggakan yang mengarah langsung ke halaman pembayaran.
* **Akun Tenant:**
  * Tampilan data profil: Nama, nomor kios, email, telepon, alamat, dan jenis usaha.
  * Edit profil (minimal UI, koneksi backend menyusul).
  * Tombol logout.

### 3.3 Admin Plaza
* **Dashboard Admin:**
  * Jumlah tenant aktif total, sudah lunas, belum bayar, dan ada tunggakan.
  * Jumlah pembayaran yang menunggu verifikasi.
  * Total pembayaran terkumpul bulan ini.
  * Notifikasi real-time semua pembayaran yang masuk.
* **Daftar Tenant:**
  * Tabel dengan kolom: Nama, nomor kios, jenis usaha, status gedung, status *service charge*, nilai tunggakan, dan aksi.
  * Filter status: Semua / Lunas / Belum Bayar / Menunggak.
  * Fitur pencarian (search): Nama tenant atau nomor kios.
  * Tombol "Detail" di setiap baris untuk membuka halaman detail tenant.
* **Detail Tenant (Admin View):**
  * Menampilkan semua field dari data kios lengkap (KTP, No. SP, PPJB, dll).
  * Status pembayaran aktif: Gedung dan *service charge* bulan berjalan.
  * Informasi tunggakan: Nilai AR dan rinciannya.
  * Riwayat pembayaran dari tenant tersebut.
  * Panel kanan: Daftar bukti pembayaran yang menunggu verifikasi khusus dari tenant ini.
  * Input pembayaran tunai manual: Pilihan jenis tagihan, nominal, dan tanggal bayar.
* **Verifikasi Pembayaran:**
  * Halaman khusus daftar seluruh pembayaran *pending* dari semua tenant.
  * Informasi item: Nama tenant, nomor kios, jenis tagihan, nominal, metode, dan waktu pengiriman bukti.
  * Preview bukti transfer / bukti QRIS.
  * Tombol Konfirmasi dan Tolak per item.
  * Pasca-konfirmasi: Status tenant diperbarui otomatis, item hilang dari daftar *pending*.
* **Export Data:**
  * Ekspor rekap pembayaran seluruh tenant ke format Excel (`.xlsx`).
  * Filter periode (bulan / tahun) sebelum mengunduh.
* **Tabel Ketersediaan Kios (Fitur Baru Mitra):** (Lihat spesifikasi di Section 4).

---

## 4. FITUR BARU: TABEL KETERSEDIAAN KIOS

### 4.1 Tujuan dan Posisi Fitur
Fitur ini merupakan permintaan langsung dari mitra Plaza Kebun Sayur untuk memberikan visibilitas kepada admin dan publik mengenai kios mana yang terisi tenant aktif dan kios mana yang masih kosong / tersedia untuk disewa.

> ⚠ **PERINGATAN MITRA:** Fitur ini **HARUS** ditampilkan dalam bentuk tabel. Jangan menggantinya dengan kartu, kanban, peta interaktif, atau representasi visual lainnya.

### 4.2 Kolom Minimum Tabel
| Lantai / Sheet | No. Kios | Status | Nama Tenant | Jenis Usaha |
| :--- | :--- | :--- | :--- | :--- |
| Lt. 1 | B-1001 | Terisi | Hj. Yuliana | Kerajinan |
| Lt. 1 | B-1004 | Kosong | — | — |
| Lt. 1 | B-1013 | Perlu Validasi | (ambigu) | — |

*Kolom tambahan yang dapat dimasukkan jika data tersedia:* Ukuran kios dan Catatan (misal: "Kios dialihkan", "Sertifikat belum diambil").

### 4.3 Aturan Status
* **Terisi:** Kolom Nama di Excel terisi dengan nama pemilik yang valid.
* **Kosong:** Nomor kios terdaftar di Excel tetapi kolom Nama kosong atau tidak ada data pemilik aktif.
* **Perlu Validasi Manual:** Data ambigu dan tidak bisa otomatis dikategorikan secara sistem. Biarkan admin yang menentukan status akhirnya.

### 4.4 Kondisi yang HARUS Dikecualikan dari Status "Kosong"
> ⚠ **PENTING:** Jangan tampilkan baris berikut sebagai unit kios kosong/terisi yang normal. Tandai sebagai "Perlu Validasi Manual" atau filter keluar dari sistem otomatis:

1. Baris bertuliskan "Pengalihan" (kios sedang dalam proses pengalihan kepemilikan).
2. Baris bertuliskan "Belum Ada Sertifikat" atau "Belum Dibuatkan Sertifikat".
3. Baris yang menyebut ada sertifikat tetapi belum diambil oleh pemilik.
4. Baris yang merupakan "Unit Sewa Kios" (bukan unit kepemilikan individual).

### 4.5 Aturan Tampilan Tabel
* Tabel harus bisa difilter per lantai (Lt1, Lt2, Lt3, dst).
* Tabel harus bisa difilter per status (Semua / Terisi / Kosong / Perlu Validasi).
* Tabel harus bisa dicari berdasarkan nomor kios atau nama tenant.
* **Privasi UI:** Tabel admin boleh menampilkan lebih banyak kolom daripada tabel publik. Tabel publik cukup menampilkan: *Nomor Kios, Status, Lantai, dan Jenis Usaha* (tanpa nama pemilik penuh untuk menjaga privasi).

---

## 5. ARSITEKTUR INFORMASI DAN NAVIGASI

### 5.1 Pembagian Tiga Zona
| Zona | Halaman | Navigasi |
| :--- | :--- | :--- |
| **Publik** | Beranda, Tentang Plaza, Direktori Tenant, Tabel Kios, Kontak | Top navbar dengan link. Tidak perlu login. |
| **Tenant** | Dashboard, Histori, Bayar Sekarang, Tunggakan, Akun | Sidebar kiri tetap. *Login required.* |
| **Admin** | Dashboard, Data Tenant, Detail Tenant, Verifikasi, Tabel Kios, Export | Sidebar kiri tetap. *Login admin required.* |

### 5.2 Komponen UI Reusable yang Harus Dibangun
1. **Header / top navbar:** Logo Bunsay + user info + bell notifikasi.
2. **Sidebar kiri always-visible:** Icon + label teks dengan ukuran font besar.
3. **Stat card:** Angka besar + label + warna aksen.
4. **Status badge:** Lunas (hijau), Belum Lunas (merah), Ada Tunggakan (oranye), Tersedia (hijau), Kosong (merah), Perlu Validasi (oranye).
5. **Tabel data:** Header merah, zebra stripe krem/putih, border abu-abu lembut.
6. **Filter bar:** Search input + tombol filter status.
7. **Detail drawer / panel kanan:** Untuk memuat informasi lengkap tenant.
8. **Modal verifikasi:** Konfirmasi / tolak yang dilengkapi preview bukti transfer.
9. **Upload area:** Area drag-and-drop/klik untuk bukti transfer dengan dashed border.
10. **Empty state:** Pesan ramah saat data kosong.
11. **Alert / toast notification:** Muncul di bawah layar selama 3 detik.
12. **Pagination:** Untuk penanganan tabel data yang panjang.

---

## 6. DESIGN SYSTEM DAN PANDUAN VISUAL

### 6.1 Identitas Warna
| Nama Token | Hex | Penggunaan |
| :--- | :--- | :--- |
| `--red` | `#8B1A1A` | Tombol utama, active state, heading tertentu, highlight pembayaran |
| `--red-dark` | `#6B1414` | Hover state tombol merah |
| `--red-50` | `#FDF2F2` | Background hover sidebar, background badge warning ringan |
| `--red-100` | `#FADADD` | Background badge Belum Lunas, border tipis elemen warning |
| `--cream` | `#FBF7F2` | Background halaman utama |
| `--warm-gray` | `#F5F0EB` | Background input field, zebra stripe tabel, background card sekunder |
| `--border` | `#E8E0D8` | Border card, border tabel, garis pemisah |
| `--text` | `#1A1410` | Teks utama (bukan hitam murni, tone hangat) |
| `--text-2` | `#5C4F46` | Teks sekunder, label, subtitle |
| `--text-3` | `#9E8E82` | Teks tersier, placeholder, tanggal |
| `--green` | `#1A6B3A` | Badge Lunas, badge Aktif, badge Tersedia |
| `--green-bg` | `#E8F5EE` | Background badge hijau |
| `--orange` | `#C05C00` | Badge Tunggakan, badge Perlu Validasi |
| `--orange-bg` | `#FEF3E6` | Background badge oranye |

### 6.2 Tipografi
* **Heading / Judul:** *Playfair Display* (semibold/bold) — memberikan kesan formal, hangat, dan tradisional.
* **Body / Label / Navigasi:** *Source Sans 3* (regular/semibold/bold) — bersih, modern, dan mudah dibaca.
* **Ukuran Font Minimum Body:** `15px` (untuk kenyamanan pengguna usia 40 tahun ke atas).
* **Label Navigasi Sidebar:** Minimal `15px` dengan penempatan ikon di sebelah kiri.
* **Line Height Body:** `1.6` guna menjaga kenyamanan baca.

### 6.3 Spacing dan Bentuk
* **Border Radius:** `10–18px` untuk card dan container. **JANGAN** gunakan *pill-shape* (`border-radius: 9999px`) pada elemen berukuran besar.
* **Shadow:** Tipis saja — `box-shadow: 0 2px 12px rgba(139,26,26,0.08)`. Dilarang menggunakan *multi-layer glow*.
* **Whitespace:** Gunakan padding yang lapang, hindari layout yang terlalu rapat.
* **Sidebar:** Lebar `240px`, *always visible*, berisi icon + label teks, dengan active state berupa garis merah di sisi kiri.
* **Topbar:** Tinggi `64px`, logo berada di kiri, info user + bell notifikasi di kanan.

### 6.4 Inspirasi Referensi Visual
Sistem administrasi ini menggabungkan kehangatan merah marun Plaza Kebun Sayur dengan ketenangan serta kejelasan visual dari Visiting Angels. Hasil akhirnya harus terasa familiar, terpercaya, dan mudah dipahami oleh pengelola maupun tenant yang berusia 40 tahun ke atas.
* **Figma Draft Mobile (Plaza Kebun Sayur):** Dominasi merah marun `#8B1A1A`, kartu dengan shadow ringan dan sudut membulat sedang, status badge berlatar ringan, header merah teks putih, serta konversi bottom nav mobile menjadi sidebar tetap pada desktop.
* **Visiting Angels (visitingangels.com):** Hero section bersih dengan heading besar, subtext empatis, CTA tidak agresif, navigasi atas stabil, hierarki informasi jelas, dan layout dengan lebar baca yang nyaman (tidak penuh 100% layar).

---

## 7. ATURAN ANTI-VIBE-CODED DESIGN

Dokumen ini secara eksplisit melarang karakteristik desain yang terlihat "di-generate oleh AI" atau bersifat "*vibe-coded*". Aturan ini disusun berdasarkan standar industri dan kebutuhan spesifik proyek.

### 7.1 Larangan Visual
| Yang Dilarang | Alasan / Pengganti yang Benar |
| :--- | :--- |
| **Emoji di elemen UI formal** | Emoji di label navigasi, judul halaman, atau heading dilarang. Emoji hanya boleh digunakan di toast/notifikasi. Gunakan ikon SVG/unicode yang tepat untuk elemen UI. |
| **Soft glow & drop shadow berlapis** | Dilarang di tombol atau kartu. Gunakan maksimal satu layer shadow tipis: `box-shadow: 0 2px 12px rgba(139,26,26,0.08)`. |
| **Border radius pill (999px) di semua tempat** | Gunakan radius `8–18px`. Bentuk *pill* hanya diperbolehkan untuk status badge kecil, bukan untuk kartu, tabel, atau tombol besar. |
| **Palet warna fintech futuristik** | Hindari perpaduan warna *purple + cyan + pink* (gelap) karena sangat khas AI generator. Proyek menggunakan merah marun hangat, krem, dan hijau natural. |
| **Hover effect berlebihan** | Jangan gunakan efek hover tanpa tujuan pada semua elemen. Hover hanya untuk elemen interaktif seperti tombol, baris tabel yang dapat diklik, dan item sidebar. |
| **CTA klise & kasual** | Dilarang menggunakan *"Let's Go!"*, *"Start Now!"*, *"Great Job!"*, atau *"Amazing!"*. Gunakan bahasa Indonesia formal: *"Bayar Sekarang"*, *"Konfirmasi"*, *"Simpan Data"*, *"Kirim Bukti"*. |
| **Lorem ipsum / Data fiktif** | Dilarang menggunakan placeholder generik. Gunakan data nyata dari Excel (nama tenant asli, nomor kios asli, nilai AR riil). |
| **Dark mode dingin** | Hindari background `gray-900` dengan teks putih dingin. Proyek ini mengutamakan *light mode first*. Jika dark mode ditambahkan, wajib menggunakan warna dasar hangat. |
| **Dekorasi tanpa fungsi** | Hindari garis diagonal, gradient berlebihan, atau pattern background kosong. Setiap elemen harus fungsional; whitespace jauh lebih baik. |
| **Tabel bergaya dashboard crypto** | Tabel harus terlihat seperti sistem administrasi profesional: serius, bersih, dan mudah dipindai (*scannable*). |
| **Animasi masuk yang berlebihan** | Hindari efek *slide, bounce,* atau *fade* di setiap tempat. Animasi halaman cukup menggunakan `fadeIn 0.2s ease` tanpa adanya efek spring/bounce. |

### 7.2 Cara Menguji Desain Sendiri
Sebelum menyelesaikan sebuah halaman UI, lakukan pengujian mandiri dengan menjawab pertanyaan berikut:
1. Apakah desain ini bisa digunakan oleh pengelola plaza berusia 50 tahun tanpa penjelasan tambahan?
2. Apakah ada elemen visual yang dipasang hanya karena "terlihat bagus" tanpa menambah nilai informasi?
3. Apakah semua teks sudah menggunakan bahasa Indonesia formal yang sopan dan mudah dipahami?
4. Apakah warna yang digunakan sepenuhnya berasal dari palet resmi (`#8B1A1A`, krem, hijau, oranye)?
5. Apakah font dan ukuran teks cukup besar serta nyaman dibaca tanpa perlu memperbesar (*zoom*) layar?
6. Apakah dimensi tombol dan elemen klik sudah cukup besar (tinggi minimal `44px`)?
7. Apakah desain keseluruhan terasa "familiar dan terpercaya", bukan "futuristik dan canggih"?

---

## 8. PRIORITAS IMPLEMENTASI

### 8.1 MVP (Minimum Viable Product) — Harus Ada
| # | Fitur | Catatan |
| :---: | :--- | :--- |
| 1 | **Autentikasi Tenant dan Admin** | Login, daftar, logout. Kredensial akun admin dibuat terpisah. |
| 2 | **Dashboard Tenant** | Sapaan personal, sisa masa sewa, status bayar, status tunggakan, aktivitas terbaru. |
| 3 | **Halaman Bayar Sekarang** | Integrasi tampilan QRIS dan transfer bank beserta upload bukti bayar. |
| 4 | **Histori Pembayaran Tenant** | Daftar riwayat transaksi disertai filter status. |
| 5 | **Halaman Tunggakan** | Total nilai AR, rincian komponen tagihan, riwayat cicilan, dan tombol bayar. |
| 6 | **Dashboard Admin** | Statistik tenant, kontrol filter, dan tabel daftar tenant utama. |
| 7 | **Detail Tenant (Admin View)** | Menampilkan seluruh field dari data kios, panel verifikasi, dan input tunai manual. |
| 8 | **Verifikasi Pembayaran** | Daftar antrean *pending*, preview bukti transfer, tombol konfirmasi/tolak. |
| 9 | **Tabel Ketersediaan Kios** | Pembagian status Terisi / Kosong / Perlu Validasi dengan filter per lantai. |
| 10 | **Halaman Publik** | Beranda utama, info plaza, direktori tenant, dan tabel kios versi publik. |

### 8.2 Nice to Have (Pengembangan Lanjutan)
* Export Excel dengan filter periode waktu tertentu.
* Notifikasi real-time (menggunakan WebSocket atau polling).
* Pengelolaan data pengalihan kios langsung di panel admin.
* Detail panel data yang menggunakan animasi *slide* atau *expand*.
* Riwayat AR historis per tenant yang disajikan lebih lengkap.
* Penyempurnaan tabel ketersediaan kios publik dengan pelengkap foto dan deskripsi.

### 8.3 Urutan Pengerjaan yang Disarankan
1. Bangun fondasi *design system* terlebih dahulu (token warna, tipografi, komponen dasar badge, tombol, kartu, input).
2. Halaman login dan pendaftaran tenant.
3. Dashboard tenant (halaman utama yang paling sering diakses oleh user).
4. Dashboard admin dan tabel daftar tenant keseluruhan.
5. Halaman detail tenant beserta modul verifikasi pembayaran.
6. Halaman pembayaran, histori transaksi, dan halaman tunggakan.
7. Tabel ketersediaan kios (admin & publik).
8. Selesaikan seluruh halaman publik.
9. Tahap *Polishing*: Optimalisasi responsivitas layout, aksesibilitas, penanganan *empty state*, dan *error state*.

---

## 9. CATATAN IMPLEMENTASI TEKNIS

### 9.1 Aturan Data
* Jangan pernah menginvent atau mengarang data yang tidak tercantum dalam file Excel atau proposal resmi.
* Jika field data belum tersedia, tandai dengan karakter strip "—" atau teks *"Data belum tersedia"*.
* Gunakan nama dan nomor kios riil sebagai sampel data (contoh: *"Hj. Yuliana — Kios B-1001"*).
* Lakukan konversi *date serial* Excel ke format tanggal normal (contoh: `40297` dikonversi menjadi `1 Januari 2010`).
* Normalisasi nomor telepon ke format yang konsisten (`0xxx-xxxx-xxxx`).

### 9.2 Aksesibilitas — Prioritas Tinggi
* Semua elemen interaktif wajib menyertakan label yang jelas (`aria-label` untuk ikon murni tanpa teks).
* Ukuran font minimal: `15px` untuk teks body, `13px` untuk label tersier.
* Tinggi area klik (*touch target*) minimal `44px` untuk tombol, baris tabel, maupun item menu sidebar.
* Rasio kontras warna wajib memenuhi standar **WCAG AA** (minimal 4.5:1 untuk teks normal).
* Jangan mengandalkan warna sebagai satu-satunya penanda status — wajib dikombinasikan dengan teks status atau ikon yang jelas.

### 9.3 Responsivitas
* **Desktop-First:** Desktop merupakan target utama fokus pengerjaan awal sistem ini.
* Layout mobile dirancang mengikuti Figma draft yang sudah ada: menggunakan navigasi bawah (*bottom navigation*) dan kartu dengan lebar penuh (*full-width card*).
* Breakpoint utama diset pada `900px` (sidebar kiri akan disembunyikan di bawah resolusi ini).
* Tabel admin pada layar sempit wajib menggunakan *scroll horizontal*, dilarang menyembunyikan kolom informasi yang penting.

### 9.4 Konvensi Penamaan dan Copy
* Seluruh antarmuka (UI) wajib menggunakan **Bahasa Indonesia formal**. Hindari pencampuran istilah Inggris-Indonesia secara tidak konsisten.
* Gunakan istilah **"Pengelola"** atau **"Admin Plaza"**, bukan *"Superuser"* atau *"Operator"*.
* Istilah baku penamaan komponen: **"Tenant"** untuk pemilik kios, **"Kios"** untuk unit properti, dan **"Gedung"** untuk tagihan sewa utama.
* Contoh pesan sukses: *"Pembayaran berhasil dikonfirmasi"* (bukan *"Awesome! Payment confirmed!"*).
* Contoh pesan error: *"Gagal menyimpan data. Coba lagi."* (bukan *"Oops, something went wrong!"*).

### 9.5 State Penting yang Harus Ditangani
* **Loading State:** Tampilkan skeleton screen atau spinner saat data sedang dimuat dari server.
* **Empty State:** Berikan ilustrasi atau pesan yang ramah saat daftar data kosong (contoh: *"Belum ada transaksi bulan ini"*).
* **Error State:** Tampilkan pesan yang jelas dan solutif saat koneksi internet gagal atau data tidak ditemukan.
* **Pending State:** Berikan indikator visual yang tegas ketika status pembayaran tenant sedang menunggu proses verifikasi admin.

---
*Dokumen handover ini disusun berdasarkan Proposal Inovasi Sosial, Data Kios Excel (update 26 April 2025), dan Notulensi Rapat 11 April 2026 oleh tim Sistem Informasi ITK 2026.*
