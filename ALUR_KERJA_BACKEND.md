# Dokumentasi Alur Kerja Backend & Integrasi Frontend

Dokumen ini menjelaskan arsitektur backend Laravel, struktur folder **Controller** & **Model**, serta alur komunikasi data antara **Frontend (React)** dan **Backend (Laravel REST API)** pada proyek **Plaza Tenant Kebun Sayur Balikpapan**.

---

## 1. Ringkasan Arsitektur (MVC REST API)

Aplikasi ini menggunakan pola arsitektur **MVC (Model-View-Controller)** yang disesuaikan menjadi **RESTful API**:

- **Model (`app/Models`)**: Berkomunikasi langsung dengan database MySQL/PostgreSQL menggunakan Eloquent ORM.
- **Controller (`app/Http/Controllers`)**: Menangani logika bisnis, memproses validasi, memanggil Model, dan mengembalikan data JSON.
- **Route (`routes/api.php`)**: Memetakan URL HTTP dari frontend ke fungsi controller yang sesuai.
- **Frontend (`plaza_tenant_frontend`)**: Mengonsumsi REST API via HTTP Client (Axios/Fetch) dan merender antarmuka pengguna (UI).

---

## 2. Diagram Alur Data (Data Flow)

```
[ FRONTEND ] ────( 1. HTTP Request: GET /api/kios )────> [ ROUTE (routes/api.php) ]
                                                                   │
                                                                   ▼ (2. Meneruskan request)
[ FRONTEND ] <───( 6. HTTP Response: JSON Data )──────── [ CONTROLLER (KiosController) ]
                                                                   │
                                                                   ▼ (3. Query ke Eloquent)
                                                          [ MODEL (app/Models/Kios) ]
                                                                   │
                                                                   ▼ (4. Query SQL & Fetch)
                                                          [ DATABASE (Tabel Kios) ]
```

---

## 3. Penjelasan Rinci Alur dari Frontend ke Backend

### Langkah 1: Frontend Mengirim Request (HTTP Client)
Ketika pengguna membuka halaman atau melakukan aksi di frontend (misalnya melihat daftar Kios):
Frontend membuat permintaan HTTP (HTTP Request) ke URL backend dengan menyertakan Token Autentikasi (Sanctum):

```javascript
// Contoh di Frontend (React)
const response = await fetch('http://localhost:8000/api/kios', {
  headers: {
    'Authorization': 'Bearer ' + token,
    'Accept': 'application/json'
  }
});
const result = await response.json();
```

---

### Langkah 2: Routing di Backend (`routes/api.php`)
Permintaan dari frontend ditangkap oleh [routes/api.php](file:///c:/Users/ASUS%20TUF/Documents/KULIAH/INSOS/Insos_Bunsay/plaza_tenant_backend/routes/api.php). 
Route ini memverifikasi middleware (misal: `auth:sanctum`) lalu mengarahkan ke Controller yang bersangkutan:

```php
// routes/api.php
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('kios', KiosController::class);
    // GET /api/kios → KiosController@index
    // POST /api/kios → KiosController@store
    // GET /api/kios/{id} → KiosController@show
    // PUT /api/kios/{id} → KiosController@update
    // DELETE /api/kios/{id} → KiosController@destroy
});
```

---

### Langkah 3 & 4: Controller & Model (`app/Http/Controllers` & `app/Models`)

1. **Controller (`KiosController.php`)**:
   Fungsi `index()` pada [KiosController.php](file:///c:/Users/ASUS%20TUF/Documents/KULIAH/INSOS/Insos_Bunsay/plaza_tenant_backend/app/Http/Controllers/KiosController.php) dipanggil. Controller meminta data dari **Model Kios** lengkap dengan relasinya.

2. **Model (`Kios.php`)**:
   [Kios.php](file:///c:/Users/ASUS%20TUF/Documents/KULIAH/INSOS/Insos_Bunsay/plaza_tenant_backend/app/Models/Kios.php) bertindak sebagai jembatan ke tabel `kios` di database.

```php
// app/Http/Controllers/KiosController.php
namespace App\Http\Controllers;

use App\Models\Kios;
use Illuminate\Http\Request;

class KiosController extends Controller
{
    public function index()
    {
        // 🔑 Memanggil Model 'Kios' & mengambil relasi sewa -> pemilik
        $kios = Kios::with(['sewa.pemilik'])->get();

        // 🔑 Mengembalikan JSON Response ke Frontend
        return response()->json([
            'success' => true,
            'message' => 'Daftar data kios berhasil diambil',
            'data'    => $kios
        ], 200);
    }
}
```

---

### Langkah 5 & 6: Response JSON & Render di Frontend
Backend mengembalikan HTTP Response dengan status `200 OK` beserta payload JSON:

```json
{
  "success": true,
  "message": "Daftar data kios berhasil diambil",
  "data": [
    {
      "id": 1,
      "No_Kios": "B-1001",
      "Lantai": 1,
      "Ukuran": "6M",
      "Status": "Terisi"
    }
  ]
}
```

Frontend menerima data JSON tersebut, memperbarui state komponen (`setState`), dan menampilkan data pada tabel UI.

---

## 4. Daftar Controller & Model Utama Proyek

| Fitur / Modul | Controller ([app/Http/Controllers](file:///c:/Users/ASUS%20TUF/Documents/KULIAH/INSOS/Insos_Bunsay/plaza_tenant_backend/app/Http/Controllers)) | Model ([app/Models](file:///c:/Users/ASUS%20TUF/Documents/KULIAH/INSOS/Insos_Bunsay/plaza_tenant_backend/app/Models)) | Keterangan |
| :--- | :--- | :--- | :--- |
| **Autentikasi** | [AuthController.php](file:///c:/Users/ASUS%20TUF/Documents/KULIAH/INSOS/Insos_Bunsay/plaza_tenant_backend/app/Http/Controllers/AuthController.php) | [User.php](file:///c:/Users/ASUS%20TUF/Documents/KULIAH/INSOS/Insos_Bunsay/plaza_tenant_backend/app/Models/User.php) | Login, Logout, Register |
| **Tenant / Pemilik** | [PemilikController.php](file:///c:/Users/ASUS%20TUF/Documents/KULIAH/INSOS/Insos_Bunsay/plaza_tenant_backend/app/Http/Controllers/PemilikController.php) | [Pemilik.php](file:///c:/Users/ASUS%20TUF/Documents/KULIAH/INSOS/Insos_Bunsay/plaza_tenant_backend/app/Models/Pemilik.php) | Data profil pemilik kios |
| **Data Kios** | [KiosController.php](file:///c:/Users/ASUS%20TUF/Documents/KULIAH/INSOS/Insos_Bunsay/plaza_tenant_backend/app/Http/Controllers/KiosController.php) | [Kios.php](file:///c:/Users/ASUS%20TUF/Documents/KULIAH/INSOS/Insos_Bunsay/plaza_tenant_backend/app/Models/Kios.php) | Manajemen unit kios |
| **Siklus Sewa** | [SewaController.php](file:///c:/Users/ASUS%20TUF/Documents/KULIAH/INSOS/Insos_Bunsay/plaza_tenant_backend/app/Http/Controllers/SewaController.php) | [Sewa.php](file:///c:/Users/ASUS%20TUF/Documents/KULIAH/INSOS/Insos_Bunsay/plaza_tenant_backend/app/Models/Sewa.php) | Penyesuaian siklus sewa bulanan |
| **Tagihan** | [TagihanController.php](file:///c:/Users/ASUS%20TUF/Documents/KULIAH/INSOS/Insos_Bunsay/plaza_tenant_backend/app/Http/Controllers/TagihanController.php) | [Tagihan.php](file:///c:/Users/ASUS%20TUF/Documents/KULIAH/INSOS/Insos_Bunsay/plaza_tenant_backend/app/Models/Tagihan.php) | Tagihan bulanan + akumulasi tunggakan |
| **Pembayaran** | [PembayaranController.php](file:///c:/Users/ASUS%20TUF/Documents/KULIAH/INSOS/Insos_Bunsay/plaza_tenant_backend/app/Http/Controllers/PembayaranController.php) | [Pembayaran.php](file:///c:/Users/ASUS%20TUF/Documents/KULIAH/INSOS/Insos_Bunsay/plaza_tenant_backend/app/Models/Pembayaran.php) | Pembayaran transfer, tunai, & Midtrans |
| **Dokumen** | [DokumenController.php](file:///c:/Users/ASUS%20TUF/Documents/KULIAH/INSOS/Insos_Bunsay/plaza_tenant_backend/app/Http/Controllers/DokumenController.php) | [Dokumen.php](file:///c:/Users/ASUS%20TUF/Documents/KULIAH/INSOS/Insos_Bunsay/plaza_tenant_backend/app/Models/Dokumen.php) | Berkas legalitas (SP, PPJB, Sertifikat, KTP) |
| **Dashboard** | [DashboardController.php](file:///c:/Users/ASUS%20TUF/Documents/KULIAH/INSOS/Insos_Bunsay/plaza_tenant_backend/app/Http/Controllers/DashboardController.php) | - | Summary statistik admin & tenant |
