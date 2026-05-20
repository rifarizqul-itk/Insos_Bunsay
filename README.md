# Plaza Kebun Sayur Payment

Aplikasi ini adalah platform sistem pembayaran digital untuk sewa kios di Plaza Kebun Sayur Balikpapan. Proyek frontend ini dibangun menggunakan **React 18** dan dibundel dengan **Vite** sebagai alat pengembangan lokal yang cepat.

---

## 📂 Informasi Folder `CONTEXT`

Di dalam direktori utama (root) repositori ini terdapat folder khusus bernama `CONTEXT/`. Folder ini diperuntukkan sebagai **sumber konteks utama** bagi LLM (Large Language Model) seperti Gemini, Claude, atau ChatGPT saat membantu proses penulisan maupun pembuatan kode (*code generation*).

Folder ini menyimpan file-file dokumentasi penting seperti:
* `HANDOVER.md` [PANDUAN KHUSUS DEVELOPMENT FRONTEND] (Detail fitur dan aturan UI/UX)
* `Data_Kios_BY_LEGAL.md` (Spesifikasi dan aturan data basis data kios)
* Proposal dan Notulensi Rapat proyek

**Cara Penggunaan:** Sebelum Anda meminta AI menulis komponen atau memperbaiki *bug*, unggah atau berikan isi file dari folder `CONTEXT/` ini terlebih dahulu agar kode yang dihasilkan otomatis patuh terhadap aturan bisnis dan desain aplikasi.

---

## 📥 Panduan Clone Repositori via GitHub Desktop

Jika Anda ingin mengunduh proyek ini menggunakan antarmuka grafis **GitHub Desktop**, silakan ikuti langkah-langkah berikut:

1. **Buka Aplikasi:** Pastikan Anda telah mengunduh, menginstal, dan masuk (*sign-in*) ke aplikasi [GitHub Desktop](https://desktop.github.com/) menggunakan akun GitHub Anda.
2. **Mulai Kloning:** Klik menu **File** di pojok kiri atas aplikasi, lalu pilih opsi **Clone Repository...** (atau tekan tombol kombinasi `Ctrl + Shift + O`).
3. **Pilih URL:** Masuk ke tab **URL** pada jendela pop-up yang muncul.
4. **Masukkan Tautan:** Tempel (*paste*) URL repositori GitHub proyek ini pada kolom yang disediakan.
5. **Tentukan Folder Penyimpanan:** Di bagian *Local Path*, klik **Choose...** untuk menentukan lokasi folder di komputer Anda tempat berkas proyek akan disimpan.
6. **Eksekusi:** Klik tombol **Clone**. Tunggu hingga proses unduhan selesai, lalu buka folder tersebut di editor kode Anda (seperti VS Code).

---

## 💻 Panduan Menjalankan Web Secara Lokal (Local Development)

Pastikan Anda sudah menginstal [Node.js](https://nodejs.org/) (versi LTS yang direkomendasikan atau minimal versi 18) di perangkat komputer Anda sebelum memulai langkah di bawah ini.

### 1. Masuk ke Direktori Proyek
Buka terminal, Git Bash, atau Command Prompt, lalu masuk ke folder hasil klon proyek:
```bash
cd plaza-kebun-sayur-payment
```

### 2. Instalasi Dependensi / Pustaka

Jalankan perintah berikut untuk mengunduh dan memasang semua paket pustaka yang terdaftar di dalam file `package.json`:

```bash
npm install
```

*Tunggu beberapa saat hingga folder `node_modules` selesai dibuat.*

### 3. Menjalankan Server Pengembangan (Local Dev Server)

Untuk menyalakan server lokal aplikasi, gunakan perintah:

```bash
npm run dev
```

### 4. Mengakses Aplikasi

Setelah proses kompilasi awal selesai, Vite akan memberikan informasi alamat URL lokal di terminal Anda. Biasanya berupa:

```text
  ➜  Local:   http://localhost:5173/
```

Buka browser Anda dan akses tautan **http://localhost:5173/** untuk melihat tampilan web yang berjalan secara real-time.

---

## 🛠 Skrip Perintah yang Tersedia (Scripts)

Di dalam file `package.json`, telah dikonfigurasi beberapa perintah otomatis untuk mempermudah manajemen proyek:

* **`npm run dev`**
Menjalankan aplikasi dalam lingkungan pengembangan lokal menggunakan fitur *Hot Module Replacement* (HMR) bawaan Vite.
* **`npm run build`**
Mengompilasi dan mengoptimalkan semua kode sumber menjadi file statis siap pakai untuk lingkungan produksi di dalam folder `dist/`.
* **`npm run lint`**
Menjalankan ESLint untuk mengecek kualitas struktur penulisan kode pada berkas `.js` dan `.jsx` guna menghindari kesalahan sintaks.
* **`npm run preview`**
Membuka server lokal mandiri untuk meninjau hasil build produksi secara lokal sebelum diunggah ke hosting.

## 🔌 Panduan untuk Developer Backend

Repositori ini merupakan aplikasi **Frontend (SPA)** mandiri. Bagi developer backend yang bertugas menyediakan API atau melakukan integrasi endpoint, berikut adalah beberapa poin penting yang perlu diperhatikan:

### 1. Konfigurasi Environment Variables (API Base URL)
Untuk menghubungkan komponen frontend dengan server backend (lokal/staging), buatlah file `.env` atau `.env.local` di root direktori proyek ini, kemudian tentukan alamat URL API Anda:
```env
VITE_API_BASE_URL=http://localhost:PORT_BACKEND_ANDA/api
```

*Catatan: Vite mengharuskan variabel lingkungan diawali dengan prefiks `VITE_` agar dapat diakses di dalam kode frontend.*

### 2. Autentikasi & Authorization Header

* Proses autentikasi pengguna dijembatani melalui halaman `AuthPage.jsx`.
* Sistem menggunakan skema **Bearer Token (JWT)**. Setiap kali melakukan request ke endpoint yang dilindungi (*protected routes* seperti data tenant atau verifikasi admin), frontend akan menyisipkan token pada header request:
```text
Authorization: Bearer <token_jwt>
```

### 3. Sinkronisasi Aturan Bisnis & Skema Data

Sebelum merancang skema database atau endpoint API, developer backend sangat direkomendasikan untuk meninjau dokumen di folder `CONTEXT/` agar selaras dengan kebutuhan sistem:

* **`Data_Kios_BY_LEGAL.md`**: Gunakan sebagai acuan penanganan relasi data (seperti aturan *multi-kios* untuk satu tenant, format pencatatan tanggal, dan histori pengalihan kios).
* **`HANDOVER.md`**: Gunakan sebagai acuan alur logika bisnis utama (meliputi total kisaran ~250 tenant aktif, validasi status pembayaran, serta kalkulasi tunggakan/AR).