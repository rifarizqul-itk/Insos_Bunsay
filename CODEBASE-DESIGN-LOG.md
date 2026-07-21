# CODEBASE DESIGN & DEEPENING LOG

**Project**: Plaza Kebun Sayur Payment (`plaza-kebun-sayur-payment`)  
**Dokumen Referensi**: `@codebase-design` (`SKILL.md`, `DEEPENING.md`, `DESIGN-IT-TWICE.md`)  
**Terakhir Diperbarui**: Juli 2026

---

## 1. Deepening Assessment (Analisis Awal)

### 1.1 Hasil Deletion Test `src/api/`

Prinsip **Deletion Test** (`SKILL.md`):
> *"Bayangkan menghapus modul tersebut. Jika kompleksitas hilang, modul tersebut hanyalah pass-through (shallow). Jika kompleksitas muncul kembali di N pemanggil (pages/components), maka modul tersebut layak dan earned its keep (deep)."*

* **`src/api/tenant.js`**:
  * **Fungsi**: `getTenantDashboard`, `getTenantHistory`, `getTunggakan`, `createPayment`.
  * **Hasil Deletion Test**: **LOLOS (Deep Candidate)**.
  * **Rasional**: Mengisolasi logika status pembayaran instant vs manual (`metode === 'midtrans_gateway' ? 'Lunas' : 'Pending'`), kalkulasi tunggakan AR historis s/d Sept 2024, dan format respons dashboard. Jika dihapus, kompleksitas menyebar di 4 halaman tenant (`DashboardTenant`, `TunggakanAR`, `BayarSekarang`, `HistoriPembayaran`).
* **`src/api/admin.js`**:
  * **Fungsi**: `getAdminTenants`, `getAdminKios`, `getAdminKiosDetail`, `createTenant`, `updateKios`.
  * **Hasil Deletion Test**: **LOLOS (Deep Candidate)**.
  * **Rasional**: Mengisolasi direktori kios/tenant (Lt 1–3) dan filter status legalitas. Jika dihapus, logika pencarian/filtering menyebar di 3 halaman admin (`DashboardAdmin`, `KetersediaanKios`, `DetailAdministrasiKios`).
* **`src/api/transactions.js`**:
  * **Fungsi**: `verifyTransaction`, `recordCashPayment`, `exportReport`.
  * **Hasil Deletion Test**: **LOLOS DENGAN CATATAN (Needs Deepening)**.
  * **Rasional**: Saat ini merupakan *shallow mock wrapper*, tetapi merupakan batas domain krusial (verifikasi, setoran tunai loket, ekspor laporan). Jika dihapus, integrasi API bocor langsung ke komponen UI.
* **`src/api/client.js`**:
  * **Fungsi**: `apiClient` (throwing errors) & `mockDelay`.
  * **Hasil Deletion Test**: **GAGAL (Saat ini Shallow Pass-Through / Indirection)**.
  * **Rasional**: `apiClient` tidak dipanggil oleh file manapun (dead indirection). Namun, berpotensi diperdalam menjadi HTTP Transport Adapter.

---

### 1.2 Evaluasi Context API (`AuthContext` & `TransactionContext`)

* **`AuthContext.jsx`**:
  * **Interface**: `isLoggedIn`, `role`, `user`, `login`, `logout`.
  * **Evaluasi**: **DEEP MODULE**. Mengisolasi rehidrasi sesi, fallback `localStorage` vs `sessionStorage`, dan proteksi rute.
  * **Seam Strategy**: Dihubungkan ke `authApi` Port di bawahnya tanpa mengubah interface React context.
* **`TransactionContext.jsx`**:
  * **Interface**: `antrean`, `riwayat`, `tambahAntrean`, `prosesVerifikasi`, `tambahRiwayat`.
  * **Evaluasi**: **DUALISM SEAM / SHALLOW STATE WRAPPER**. Mengelola state antrean/riwayat secara in-memory terpisah dari `src/api/transactions.js`. Komponen `SetoranTunai` memanggil API, sementara `VerifikasiBuktiTransfer` memanggil Context.
  * **Seam Strategy**: Didalami dan digabungkan bersama `src/api/transactions.js` menjadi 1 Transaction Domain Seam terpadu.

---

### 1.3 Klasifikasi Kategori Dependency & Pola Port/Adapter

* **Kategori Saat Ini**: **Category 4: True External (Mock)** (Backend belum dikembangkan, semua data bersifat mock).
* **Target Transisi**: **Category 3: Remote but owned (Ports & Adapters)** (Backend siap kelak).
* **Arsitektur Port & Adapter**:
  * **Port (Interface)**: Kontrak domain murni (`ITransactionService`, `ITenantService`, dll).
  * **Mock Adapter**: In-memory delay + JSON mock data saat ini.
  * **HTTP Adapter**: Axios/Fetch REST API client saat backend terhubung.
  * **Two Adapters Rule**: Dengan 2 adapter ini, switching backend cukup dengan mengubah `VITE_USE_MOCK=false` pada environment variable.

---

### 1.4 Tabel Prioritas Modul Deepening

| Rank | Nama Modul / Seam | Deskripsi & Cakupan Deepening | Alasan Prioritas (Leverage) |
| :--- | :--- | :--- | :--- |
| **1** | **`Transaction Domain Module`** <br>`(TransactionContext` + `src/api/transactions.js`) | Menggabungkan state antrean verifikasi, transaksi tunai loket, dan histori transaksi ke dalam satu seam Port/Adapter. | **Paling Kritis.** Menghilangkan dualisme state transaksi & verifikasi. |
| **2** | **`Tenant Domain Module`** <br>`(src/api/tenant.js`) | Membungkus logika kalkulasi service charge, status tunggakan AR historis, dan pembuatan transaksi pembayaran. | **High Leverage.** Digunakan oleh 4 halaman utama tenant. Menyembunyikan aturan bisnis status transaksi. |
| **3** | **`Admin & Kios Domain Module`** <br>`(src/api/admin.js`) | Membungkus direktori unit kios (Lt. 1–3), filter status kios, dan detail legalitas kios. | **High Locality.** Mencegah pencarian dan pengolahan data kios tersebar di halaman admin. |
| **4** | **`Auth Domain Module`** <br>`(AuthContext.jsx` + `src/api/auth.js`) | Menambahkan Port API `auth.js` di bawah `AuthContext` untuk memisahkan logika request login/token. | **Medium Leverage.** `AuthContext` sudah deep, namun butuh seam API resmi. |
| **5** | **`HTTP Transport Client Adapter`** <br>`(src/api/client.js`) | Merombak `client.js` dari shallow thrower menjadi HTTP client solid (interceptor JWT, penanganan timeout, WCAG error handling). | **Infrastructure.** Fondasi teknis yang akan menyokong seluruh HTTP Adapter saat backend mulai diintegrasikan. |

---

## 2. Design It Twice — Transaction Domain Module

### Step 1: Problem Space & Boundary Constraints

#### Boundary Constraints (Caller Requirements)
Modul **Transaction Domain** yang baru harus mampu melayani 6 caller utama tanpa menimbulkan *breaking changes* besar:
1. `SetoranTunai.jsx`: Pencatatan setoran tunai fisik loket oleh admin + foto bukti.
2. `VerifikasiBuktiTransfer.jsx`: Antrean verifikasi bukti transfer oleh admin (Terima `Lunas` / Tolak `Tertolak` + alasan).
3. `RiwayatTransaksiAdmin.jsx`: Tabel log seluruh transaksi lintas metode (Tunai, Transfer, QRIS, Midtrans) + filter status.
4. `BayarSekarang.jsx`: Pembayaran oleh tenant (Transfer Bank / QRIS Manual -> masuk antrean pending; Midtrans -> instant Lunas).
5. `HistoriPembayaran.jsx`: Log transaksi individual tenant.
6. `EksporData.jsx`: Generasi dan ekspor laporan Excel `.xlsx` berdasarkan periode bulan & tahun.

#### Klasifikasi Dependency
* **Saat ini**: Kategori 4 (*True External / Mock*). Data disimpan di React state (`TransactionContext`) dan fungsi delay (`transactions.js`).
* **Target Backend**: Kategori 3 (*Remote but owned*). Interface modul harus berupa **Port** yang menerima **Adapter** (Mock vs HTTP REST).

#### Code Sketch Ilustratif Constraint (Grounding Sketch)
```javascript
// Ilustrasi ekspektasi seam publik Transaction Domain Module
// Harus menyembunyikan pemisahan antara State Management React dan HTTP API
const transactionModule = {
  // Queries
  getQueue: (filter) => Promise<Transaction[]>,
  getHistory: (filter) => Promise<Transaction[]>,
  
  // Commands (State Transitions)
  submitPayment: (payload) => Promise<TransactionResult>, // Dipakai BayarSekarang & SetoranTunai
  verifyPayment: (id, decision) => Promise<VerificationResult>, // Dipakai VerifikasiBuktiTransfer
  exportReport: (period) => Promise<ExportResult> // Dipakai EksporData
};
```

---

### Step 2: Sub-Agent Radical Design Explorations

---

#### Design Option 1 (Agent 1: Minimize Interface — Maximum Leverage)
* **Tujuan Design**: Meminimalkan interface hingga **maksimal 2–3 entry point**. Memaksimalkan *leverage per entry point*.

##### 1. Interface Definition
```typescript
type TransactionQuery = {
  scope: 'queue' | 'history' | 'tenant' | 'export';
  tenantId?: string;
  status?: 'Lunas' | 'Menunggu Verifikasi' | 'Tertolak';
  period?: { month: number; year: number };
};

type TransactionCommand = 
  | { type: 'SUBMIT_PAYMENT'; channel: 'CASH' | 'MANUAL_TRANSFER' | 'MIDTRANS' | 'QRIS'; payload: PaymentPayload }
  | { type: 'VERIFY_TRANSFER'; transactionId: string; approved: boolean; reason?: string }
  | { type: 'GENERATE_REPORT'; month: number; year: number };

// Interface publik hanya 2 method:
export interface TransactionService {
  query(params: TransactionQuery): Promise<TransactionQueryResult>;
  execute(command: TransactionCommand): Promise<TransactionCommandResult>;
}
```

##### 2. Usage Example
```javascript
// Di VerifikasiBuktiTransfer.jsx
const handleApprove = async (id) => {
  await transactionService.execute({
    type: 'VERIFY_TRANSFER',
    transactionId: id,
    approved: true
  });
};

// Di SetoranTunai.jsx
const handleCashSubmit = async (data) => {
  await transactionService.execute({
    type: 'SUBMIT_PAYMENT',
    channel: 'CASH',
    payload: data
  });
};
```

##### 3. Implementation Details (Behind the Seam)
* Menyembunyikan seluruh percabangan routing command (`SUBMIT_PAYMENT`, `VERIFY_TRANSFER`, `GENERATE_REPORT`).
* Menyembunyikan sinkronisasi antara React State (antrean verifikasi) dan HTTP requests/mock database.
* Otomatis memvalidasi aturan payload berdasarkan `type` sebelum dikirim ke adapter.

##### 4. Dependency Strategy & Adapters
* Memiliki **Command/Query Bus Port**.
* `MockTransactionAdapter` mengeksekusi switch-case terhadap array in-memory.
* `HttpTransactionAdapter` memetakan `type` command ke endpoint HTTP yang sesuai (`POST /api/v1/cash`, `PATCH /api/v1/verify`).

##### 5. Trade-offs
* **Leverage**: Extremely High (Hanya 2 method `query` & `execute` untuk melayani 6 pemanggil).
* **Kelemahan**: Caller kehilangan ketegasan autocompletion type (membutuhkan discriminated union pada parameter), dan kode caller tampak lebih verbose karena membungkus objek command.

---

#### Design Option 2 (Agent 2: Maximize Flexibility — Extensible Domain Engine)
* **Tujuan Design**: Mendukung banyak use case, saluran pembayaran baru, strategi filter kompleks, dan ekstensi ekspor tanpa merusak seam.

##### 1. Interface Definition
```typescript
export interface TransactionDomainEngine {
  // Sub-services / Repositories exposed via Seam
  payments: {
    recordCash(payload: CashPayload): Promise<Transaction>;
    submitTransfer(payload: TransferPayload): Promise<Transaction>;
    initiateGateway(payload: GatewayPayload): Promise<GatewaySession>;
  };
  verification: {
    getPendingQueue(filter?: QueueFilter): Promise<Transaction[]>;
    approve(id: string, note?: string): Promise<Transaction>;
    reject(id: string, reason: string): Promise<Transaction>;
  };
  ledger: {
    getHistory(filter?: HistoryFilter): Promise<PaginatedResult<Transaction>>;
    getTenantLedger(tenantId: string): Promise<TenantStatement>;
  };
  reports: {
    exportExcel(period: PeriodFilter): Promise<BlobDownload>;
  };
}
```

##### 2. Usage Example
```javascript
// Di VerifikasiBuktiTransfer.jsx
const { verification } = useTransactionEngine();
await verification.approve(item.id, 'Sesuai rekening BNI');

// Di SetoranTunai.jsx
const { payments } = useTransactionEngine();
await payments.recordCash({ tenantId, amount, receiptImage });
```

##### 3. Implementation Details (Behind the Seam)
* Menyembunyikan logika pembagian 4 domain internal: `PaymentProcessor`, `VerificationWorkflow`, `LedgerRepository`, dan `ReportGenerator`.
* Mengelola event bus internal yang memicu pemicuan otomatis (misal saat `verification.approve` dipanggil, event `TRANSACTION_VERIFIED` ditembakkan untuk memperbarui `ledger`).

##### 4. Dependency Strategy & Adapters
* Menerapkan multi-port granular (`IPaymentAdapter`, `IVerificationAdapter`, `ILedgerAdapter`).
* Memungkinkan pengujian unit terpisah untuk tiap modul spesifik.

##### 5. Trade-offs
* **Leverage**: Medium (Interface permukaan cukup luas dengan 4 sub-namespace dan ~9 method).
* **Kelebihan**: Fleksibilitas maksimal untuk penambahan fitur baru (misal audit log, denda keterlambatan).
* **Kelemahan**: Interface sedikit lebih *shallow* karena setiap fitur baru membutuhkan method baru di namespace.

---

#### Design Option 3 (Agent 3: Optimize for Most Common Caller — Verifikasi First)
* **Tujuan Design**: Mengoptimalkan kasus penggunaan yang paling sering terjadi (Alur Verifikasi Bukti Transfer & Antrean Admin) agar panggilan menjadi *trivial* dan bebas boilerplate.

##### 1. Interface Definition
```typescript
export interface TransactionWorkflow {
  // State utama langsung di-expose
  pendingQueue: Transaction[];
  completedHistory: Transaction[];

  // Method aksi khusus kasus paling umum
  verify(id: string, isApproved: boolean, reason?: string): Promise<void>;
  
  // Secondary utility methods (dibuat ringkas)
  addCash(tenantId: string, amount: number, proofFile: File): Promise<void>;
  exportMonthly(month: number, year: number): Promise<void>;
}
```

##### 2. Usage Example
```javascript
// Di VerifikasiBuktiTransfer.jsx - Sangat Trivial & Langsung!
const { pendingQueue, verify } = useTransactionWorkflow();

// Setujui atau Tolak cukup 1 baris
const handleApprove = (id) => verify(id, true);
const handleReject = (id, reason) => verify(id, false, reason);
```

##### 3. Implementation Details (Behind the Seam)
* Menyembunyikan sinkronisasi instan antara `pendingQueue` dan `completedHistory`. Saat `verify(id, true)` dipanggil, transaksi otomatis berpindah dari antrean ke riwayat secara atomic.
* Menyembunyikan panggilan API HTTP di balik aksi `verify`.

##### 4. Dependency Strategy & Adapters
* Menggunakan Single Unified Adapter (`TransactionWorkflowAdapter`).
* Sederhana untuk di-mock dalam pengujian UI komponen React.

##### 5. Trade-offs
* **Leverage**: High pada alur admin verifikasi.
* **Kelebihan**: Penggunaan oleh komponen React `VerifikasiBuktiTransfer.jsx` sangat bersih tanpa boilerplate.
* **Kelemahan**: Terlalu fokus pada verifikasi, sehingga penambahan transaksi tunai atau ekspor terasa seperti *tumpangan* (*tacked-on methods*).

---

### Step 3: Comparison & Final Recommendation

#### Perbandingan Ketiga Desain

| Dimensi Evaluasi | Design 1 (Minimize Interface) | Design 2 (Maximize Flexibility) | Design 3 (Optimized for Verification) |
| :--- | :--- | :--- | :--- |
| **Depth (Leverage per unit interface)** | **Sangat Tinggi** (Hanya 2 method `query` & `execute` menyembunyikan seluruh logika bisnis). | **Sedang** (4 namespace dengan 9 method terpisah). | **Tinggi pada Verifikasi**, tetapi dangkal pada fitur pendukung. |
| **Locality (Pusat Perubahan)** | **Tinggi** (Perubahan aturan transaksi cukup menambah command handler tanpa merusak interface). | **Tinggi** (Terisolasi per domain namespace). | **Sedang** (Perubahan di luar verifikasi berisiko membengkakkan interface utama). |
| **Seam Placement & Refactor Effort** | Perlu refactor sedang pada callers (harus membungkus objek command). | Refactor sangat minim (mirip struktur API saat ini). | Refactor paling mudah khusus untuk `VerifikasiBuktiTransfer`. |
| **Kepatuhan Port & Adapter** | Sangat baik (Command/Query pattern mudah ditukar adapter HTTP). | Sangat baik (Granular ports). | Cukup baik (Unified adapter). |

---

#### Rekomendasi Final: Hybrid Architecture (Option 1 + Option 3)

Berdasarkan pertimbangan **Depth**, **Locality**, dan **Kemudahan Adopsi oleh Caller**, kami merekomendasikan **DESAIN HYBRID (Option 1 + Option 3)** dengan kriteria sebagai berikut:

1. **Gunakan Single-Seam React Context + Custom Hook (`useTransactionDomain`)** yang mengekspos:
   - **Reactive State (Query Surface)**: `queue` (antrean), `history` (riwayat), `isLoading`, `error`.
   - **Semantic Action Methods (Command Surface)**:
     - `verifyTransaction(id, { status: 'Lunas' | 'Tertolak', reason? })`: Mengoptimalkan kasus admin verifikasi (Option 3).
     - `recordCashPayment(payload)`: Melayani `SetoranTunai.jsx`.
     - `submitTenantPayment(payload)`: Melayani `BayarSekarang.jsx`.
     - `exportReport(period)`: Melayani `EksporData.jsx`.

2. **Di Belakang Seam (Implementation Layer)**:
   - Menggunakan **Command Bus / Port Pattern** dari Option 1 di tingkat API Service (`src/api/transactions.js`).
   - Menyediakan `MockTransactionAdapter` (aktif sekarang) dan `HttpTransactionAdapter` (saat backend tiba).

3. **Manfaat Utama Hybrid**:
   - **Bagi Component Caller**: Tetap mendapatkan kemudahan pemanggilan method bermakna (`verifyTransaction`, `recordCashPayment`) tanpa boilerplate Command Object yang rumit.
   - **Bagi Maintainer Backend**: Seluruh pemanggilan HTTP dan penanganan state terisolasi sempurna di dalam Port & Adapter. Saat backend asli aktif, penggantian adapter terjadi 100% di dalam seam `src/api/` tanpa mengubah 1 baris pun di komponen React.

---

## 3. Hybrid Architecture — Implementation Contract

### 3.1 Interaksi Antar Layer (Hubungan Context & API Port)

Di dalam arsitektur hybrid ini, **`useTransactionDomain` (React Context)** bertindak sebagai **Semantic Facade / State Manager** untuk UI, sedangkan **`src/api/transactions.js`** bertindak sebagai **Unified API Port** yang didelegasikan ke Adapter (Mock vs HTTP).

- `useTransactionDomain` menyediakan semantic methods ringkas (misal: `verifyTransaction(id, status, reason)`).
- Di balik layar, semantic method tersebut **menerjemahkan** argumen menjadi objek Command terstruktur dan memanggil `transactionPort.execute(command)` serta `transactionPort.query(params)` pada Port API (`src/api/transactions.js`).

**Alur Eksekusi**:
`Component UI` $\xrightarrow{\text{semantic call}}$ `useTransactionDomain` $\xrightarrow{\text{command payload}}$ `transactionPort.execute()` $\xrightarrow{\text{delegasi}}$ `MockAdapter / HttpAdapter`

---

### 3.2 Signature Kontrak Persis (Exact Function Signatures)

#### 1. Contract `useTransactionDomain()` (React Context Hook - Seam UI)

```typescript
// Detail Error Standar (Kepatuhan WCAG 3.3.1 & 3.3.3)
export type TransactionError = {
  message: string;  // Pesan error formal Bahasa Indonesia (tampilan Toast/Alert summary)
  field?: string;   // Element ID / field name spesifik (misal 'nominal', 'bukti') untuk highlight visual pada form
};

// Return type of useTransactionDomain()
interface TransactionDomainHook {
  // --- Reactive State (Query Surface) ---
  antrean: Transaction[];             // Queue transaksi status 'Menunggu Verifikasi'
  riwayat: Transaction[];             // Log seluruh transaksi selesai ('Lunas' | 'Tertolak')
  isLoading: boolean;                 // Async loading state
  error: TransactionError | null;     // Object error { message, field? } diteruskan ke UI untuk Toast & highlight input per WCAG

  // --- Semantic Action Methods (Command Surface) ---
  /** Dipanggil oleh VerifikasiBuktiTransfer.jsx & DashboardAdmin.jsx */
  verifyTransaction: (
    id: string, 
    status: 'Lunas' | 'Tertolak', 
    alasan?: string
  ) => Promise<void>;

  /** Dipanggil oleh SetoranTunai.jsx */
  recordCashPayment: (payload: {
    tenantId: string | number;
    jenisTagihan: string;
    nominal: number;
    bukti: string; // Filename / Data URI
  }) => Promise<void>;

  /** Dipanggil oleh BayarSekarang.jsx */
  submitTenantPayment: (payload: {
    jenisTagihan: string;
    nominal: number;
    metode: 'transfer_manual' | 'midtrans_gateway' | 'qris_manual';
    berkas?: File | string;
  }) => Promise<void>;

  /** Dipanggil oleh EksporData.jsx */
  exportReport: (period: {
    bulan: number;
    tahun: number;
  }) => Promise<{ url: string }>;
}
```

#### 2. Contract `src/api/transactions.js` (Unified Port & Adapter - Seam Infrastructure)

`src/api/transactions.js` mengekspor interface Port generik (`query` dan `execute`) dari Option 1, sehingga penambahan jenis transaksi atau endpoint backend baru di masa depan **tidak merusak signature Port ini**:

```typescript
// Parameter Query
// Catatan Scope & Status: Status 'Menunggu Verifikasi' sengaja TIDAK dimasukkan ke dalam union status pada scope 'HISTORY'
// karena seluruh item transaksi yang menunggu verifikasi diakses secara eksplisit dan khusus melalui scope: 'QUEUE'.
export type TransactionQuery = 
  | { scope: 'QUEUE'; tenantId?: string }
  | { scope: 'HISTORY'; tenantId?: string; status?: 'Lunas' | 'Tertolak' }
  | { scope: 'ALL' };

// Parameter Command
export type TransactionCommand = 
  | { type: 'SUBMIT_PAYMENT'; payload: { tenantId?: string; jenisTagihan: string; nominal: number; metode: string; bukti?: string } }
  | { type: 'VERIFY_TRANSACTION'; payload: { id: string; status: 'Lunas' | 'Tertolak'; alasan?: string } }
  | { type: 'RECORD_CASH'; payload: { tenantId: string | number; jenisTagihan: string; nominal: number; bukti: string } }
  | { type: 'EXPORT_REPORT'; payload: { bulan: number; tahun: number } };

// Output Result dari API Adapter (Sesuai Spesifikasi Error GEMINI.md & WCAG 3.3.1/3.3.3)
export type CommandResult = {
  success: boolean;
  id?: string;
  url?: string;
  message?: string; // Pesan penjelasan dari backend
  field?: string;   // Nama field input bermasalah jika terjadi kesalahan validasi (contoh: 'no_ktp', 'nominal')
};

// Interface Port Utama (Ekspor tunggal dari src/api/transactions.js)
export interface TransactionPort {
  query(params: TransactionQuery): Promise<Transaction[]>;
  execute(command: TransactionCommand): Promise<CommandResult>;
}

// Concrete Adapters yang mengimplementasikan TransactionPort:
// 1. MockTransactionAdapter (In-memory & mock delay saat ini)
// 2. HttpTransactionAdapter (Axios / Fetch saat backend ready)
```

---

## 4. Design It Twice — Tenant Domain Module

### Step 1: Problem Space & Boundary Constraints

#### Boundary Constraints (Caller Requirements)
Modul **Tenant Domain** (`src/api/tenant.js`) harus melayani 5 halaman pemanggil utama di zona tenant tanpa merusak alur UI saat ini:
1. `DashboardTenant.jsx`: Membaca ringkasan personal tenant (nama pemilik, nomor kios, status service charge bulan berjalan & dueDate, serta rincian tunggakan AR historis).
2. `BayarSekarang.jsx`: Membaca data nominal bawaan untuk prefilling form pembayaran (misal tagihan service charge atau tunggakan AR). *Catatan*: Proses submit transaksi pembayaran telah ditangani oleh Transaction Domain Module.
3. `HistoriPembayaran.jsx`: Membaca log transaksi pembayaran spesifik milik tenant.
4. `TunggakanAR.jsx`: Membaca rincian piutang historis s/d September 2024 (totalAwal, totalTerbayar, sisa, dan riwayat cicilan).
5. `AkunTenant.jsx`: Membaca dan memperbarui profil pemilik kios (nama, kios, email, nomor telepon, alamat, jenis usaha).

#### Klasifikasi Dependency
* **Saat ini**: Kategori 4 (*True External / Mock*). Data di-mock secara lokal di `src/api/tenant.js` dengan fungsi `mockDelay`.
* **Target Backend**: Kategori 3 (*Remote but owned*). Dipanggil via HTTP REST endpoints (`GET /api/v1/tenant/dashboard`, `GET /api/v1/tenant/tunggakan`, `PUT /api/v1/tenant/profile`).

#### Evaluasi Penggabungan Context vs Standalone Seam
* Berbeda dengan **Transaction Domain** yang memiliki dualisme state (antara array in-memory `TransactionContext` dan API `transactions.js`), **Tenant Domain** bersifat *read-heavy query module*.
* `tenant.js` lolos Deletion Test secara mandiri tanpa memerlukan React Context terpisah. Komponen UI dapat langsung memanggil **`tenantPort`** melalui custom hooks (`useTenantDashboard`, `useTunggakanAR`, `useTenantProfile`) atau `useApi`.

#### Code Sketch Ilustratif Constraint (Grounding Sketch)
```javascript
// Ilustrasi ekspektasi seam publik Tenant Domain Module
const tenantModule = {
  // Queries
  getDashboard: () => Promise<TenantDashboardDTO>,
  getTunggakan: () => Promise<TunggakanDTO>,
  getProfile: () => Promise<TenantProfileDTO>,
  
  // Commands
  updateProfile: (payload) => Promise<CommandResult>
};
```

---

### Step 2: Sub-Agent Radical Design Explorations

---

#### Design Option 1 (Agent 1: Minimize Interface — Maximum Leverage)
* **Tujuan Design**: Meminimalkan antarmuka hingga **hanya 2 entry point** (`getTenantResource` dan `updateTenantResource`).

##### 1. Interface Definition
```typescript
type TenantResourceScope = 'DASHBOARD' | 'TUNGGAKAN' | 'PROFILE';

export interface TenantService {
  getTenantResource(scope: TenantResourceScope): Promise<TenantResourceResult>;
  updateTenantResource(scope: TenantResourceScope, payload: Record<string, any>): Promise<CommandResult>;
}
```

##### 2. Usage Example
```javascript
// Di DashboardTenant.jsx
const { data } = useApi(() => tenantService.getTenantResource('DASHBOARD'));

// Di AkunTenant.jsx
const handleSave = async (formData) => {
  await tenantService.updateTenantResource('PROFILE', formData);
};
```

##### 3. Implementation Details (Behind the Seam)
* Menyembunyikan percabangan endpoint HTTP berdasarkan enum `scope`.
* Menyembunyikan mock delay dan struktur JSON di dalam 1 dispatcher terpusat.

##### 4. Dependency Strategy & Adapters
* `MockTenantAdapter` mengeksekusi switch-case terhadap objek `mockDashboard`, `mockTunggakan`, dan `mockProfile`.
* `HttpTenantAdapter` memetakan `scope` ke URL REST (`/api/v1/tenant/dashboard`, `/api/v1/tenant/tunggakan`, `/api/v1/tenant/profile`).

##### 5. Trade-offs
* **Leverage**: Sangat Tinggi (Hanya 2 method melayani seluruh kebutuhan tenant).
* **Kelemahan**: Kehilangan ketegasan type autocompletion pada parameter dan return value (membutuhkan type casting/assertion di caller).

---

#### Design Option 2 (Agent 2: Maximize Flexibility — Resource Repositories)
* **Tujuan Design**: Mendukung skenario komplek (multi-kios per tenant, histori pengalihan kepemilikan, pembaruan password, dan rincian cicilan terperinci).

##### 1. Interface Definition
```typescript
export interface TenantDomainEngine {
  dashboard: {
    getOverview(): Promise<TenantDashboardSummary>;
  };
  ar: {
    getStatement(): Promise<ARStatement>;
    getCicilanHistory(): Promise<CicilanRecord[]>;
  };
  profile: {
    getProfile(): Promise<TenantProfile>;
    updateProfile(payload: Partial<TenantProfile>): Promise<CommandResult>;
    changePassword(payload: PasswordChangePayload): Promise<CommandResult>;
  };
  units: {
    getKiosUnits(): Promise<KiosUnitDetail[]>;
  };
}
```

##### 2. Usage Example
```javascript
// Di TunggakanAR.jsx
const { ar } = useTenantEngine();
const statement = await ar.getStatement();

// Di AkunTenant.jsx
const { profile } = useTenantEngine();
await profile.updateProfile(formData);
```

##### 3. Implementation Details (Behind the Seam)
* Membagi logic ke dalam 4 domain repository internal: `DashboardRepository`, `ARRepository`, `ProfileRepository`, dan `KiosRepository`.
* Mendukung parsing tanggal serial Excel (misal `BAST: 40297`) menjadi format ISO/Human-readable secara otomatis di backend repository.

##### 4. Dependency Strategy & Adapters
* Memiliki granular ports per domain sub-repository.
* Fleksibel jika kelak modul Kios atau AR ingin dipisahkan ke microservice terpisah.

##### 5. Trade-offs
* **Leverage**: Sedang (Antarmuka cukup luas dengan 4 sub-namespace dan ~7 method).
* **Kelebihan**: Fleksibilitas maksimal jika struktur tenant berkembang menjadi multi-kios atau memiliki fitur pengalihan legalitas.
* **Kelemahan**: Lebih verbose untuk halaman sederhana yang hanya butuh 1 data call.

---

#### Design Option 3 (Agent 3: Optimize for Most Common Caller — Dashboard-First Facade)
* **Tujuan Design**: Mengoptimalkan kasus penggunaan terbanyak (`DashboardTenant.jsx`) agar 1 pemanggilan query mengembalikan seluruh snapshot data penting tenant (Sapaan, Kios, Service Charge, Tunggakan AR).

##### 1. Interface Definition
```typescript
export interface TenantFacade {
  // Query terpadu untuk Dashboard & Halaman Utama
  getTenantDashboard(): Promise<{
    nama: string;
    kios: string;
    serviceCharge: { status: string; nominal: number; dueDate: string };
    tunggakan: { status: string; nominal: number; label: string };
  }>;

  // Query spesifik untuk Tunggakan AR
  getTunggakanDetail(): Promise<{
    totalAwal: number;
    totalTerbayar: number;
    sisa: number;
    riwayatCicilan: Array<{ ke: number; tanggal: string; nominal: number; status: string }>;
  }>;

  // Query & Command untuk Profil
  getProfile(): Promise<TenantProfile>;
  updateProfile(payload: Partial<TenantProfile>): Promise<CommandResult>;
}
```

##### 2. Usage Example
```javascript
// Di DashboardTenant.jsx - 1 Call mendapatkan seluruh info snapshot
const { data } = useApi(tenantApi.getTenantDashboard, [], true);

// Di TunggakanAR.jsx
const { data } = useApi(tenantApi.getTunggakanDetail, [], true);
```

##### 3. Implementation Details (Behind the Seam)
* Di balik `getTenantDashboard()`, adapter melakukan penggabungan data (aggregation) dari profile, status service charge bulan ini, dan saldo sisa tunggakan AR.
* Menyembunyikan kalkulasi sisa tunggakan (`totalAwal - totalTerbayar = sisa`).

##### 4. Dependency Strategy & Adapters
* Unified `TenantPort` dengan 4 semantic method.
* `MockTenantAdapter` langsung mengembalikan DTO snapshot yang sudah teragregasi.

##### 5. Trade-offs
* **Leverage**: Tinggi pada alur utama tenant.
* **Kelebihan**: Sangat intuitif untuk pengembang UI karena method persis mencerminkan kebutuhan halaman (`Dashboard`, `Tunggakan`, `Profile`).
* **Kelemahan**: Jika ada halaman baru di luar 3 kategori ini, perlu menambahkan method baru di Port.

---

### Step 3: Comparison & Final Recommendation

#### Perbandingan Ketiga Desain

| Dimensi Evaluasi | Design 1 (Minimize Interface) | Design 2 (Maximize Flexibility) | Design 3 (Dashboard-First Facade) |
| :--- | :--- | :--- | :--- |
| **Depth (Leverage per unit interface)** | **Sangat Tinggi** (2 method generik). | **Sedang** (4 namespace, 7 method). | **Tinggi** (4 semantic methods yang terfokus pada DTO halaman). |
| **Locality (Pusat Perubahan)** | **Tinggi** (Terpusat di adapter). | **Sangat Tinggi** (Domain terisolasi). | **Sangat Tinggi** (Perubahan DTO terisolasi di Port/Adapter). |
| **Kemudahan Pemanggilan UI** | Sedang (Perlu type casting). | Sedang (Membutuhkan navigating namespace). | **Sangat Tinggi** (1-to-1 matching dengan halaman UI). |
| **Kepatuhan Port & Adapter** | Sangat baik. | Sangat baik (Granular). | Sangat baik (Unified TenantPort). |

---

#### Rekomendasi Final: Semantic Port Architecture (Option 3 with Custom Hooks Seam)

Berdasarkan analisis, kami merekomendasikan **Option 3 (Dashboard-First Facade)** dengan arsitektur **Semantic TenantPort**:

1. **Port Seam (`src/api/tenant.js`)**:
   Mengekspor `tenantPort` sebagai Unified Port dengan 4 method semantic:
   - `getDashboard()`: Snapshot teragregasi untuk `DashboardTenant.jsx`.
   - `getTunggakan()`: Detail piutang & riwayat cicilan untuk `TunggakanAR.jsx`.
   - `getProfile()`: Data diri pemilik kios untuk `AkunTenant.jsx`.
   - `updateProfile(payload)`: Pengkinian data diri dari `AkunTenant.jsx`.

2. **Custom Hooks Layer / Direct `useApi` Seam**:
   Menyediakan custom hooks ringkas di atas `useApi` dan `tenantPort`:
   - `useTenantDashboard()`
   - `useTunggakanAR()`
   - `useTenantProfile()`

3. **Tanpa React Context Tambahan**:
   Karena data tenant bersifat *read-heavy* dan tidak memerlukan sinkronisasi state interaktif antar-halaman yang kompleks dalam 1 waktu, **tidak diperlukan `TenantContext`**. Hal ini menjaga arsitektur tetap ramping (*lightweight*) tanpa overhead Context re-render.

4. **Kepatuhan Backend (Adapter)**:
   - `MockTenantAdapter`: Menyediakan data mock saat `VITE_USE_MOCK=true`.
   - `HttpTenantAdapter`: Memanggil REST endpoints asli (`/api/v1/tenant/*`) saat backend siap.

---

### 4.4 Kontrak Detail & Klarifikasi

#### 1. Reuse `CommandResult` & Pemetaan Error Validasi (`AkunTenant.jsx`)

Untuk fungsi `updateProfile(payload)`, kita **mereuse secara persis** struktur `CommandResult` standar dari Transaction Domain Module demi konsistensi antar modul dan kepatuhan WCAG 3.3.1 & 3.3.3:

```typescript
export type CommandResult = {
  success: boolean;
  message?: string; // Pesan error / sukses formal Bahasa Indonesia (Toast / Alert)
  field?: string;   // Nama field input yang gagal validasi (misal 'telepon', 'email', 'alamat')
  data?: any;       // Payload DTO profil terbaru setelah diperbarui
};
```

##### Contoh Error Case & Pemetaan ke Input Form (`AkunTenant.jsx`):
* **Skenario**: Pengguna memasukkan format nomor telepon yang tidak valid (misal `"0812-abc"` atau kurang dari 10 digit).
* **Respons Adapter**:
  ```json
  {
    "success": false,
    "message": "Nomor telepon harus berisi 10 hingga 13 digit angka valid.",
    "field": "telepon"
  }
  ```
* **Pemetaan di UI (`AkunTenant.jsx`)**:
  * Pesan `message` ditampilkan ke pengguna melalui notification toast (`addToast(result.message, 'error')`).
  * Nilai `field === 'telepon'` dipetakan langsung ke elemen form `<input id="profile-telepon" name="telepon" />` untuk memberikan outline border merah (`border-color: var(--red)`) dan indikator kesalahan visual langsung pada bidang input tersebut per panduan aksesibilitas WCAG 3.3.1 & 3.3.3.

---

#### 2. Sinkronisasi Data Profil dengan `AuthContext.jsx`

* **Kondisi Overlap**:  
  `AuthContext.jsx` menyimpan state `user` aktif (`{ name, kios, email, ... }`) yang digunakan oleh `App.jsx`, header navigasi, dan sapaan personal. Di sisi lain, `tenantPort.getProfile()` mengembalikan DTO profil terperinci milik tenant.
* **Keputusan Sinkronisasi**:  
  Kedua data ini **tidak boleh dibiarkan terpisah/divergen**. Setelah operasi `updateProfile(payload)` berhasil pada `AkunTenant.jsx`:
  1. `tenantPort.updateProfile()` mengembalikan data profil terbaru.
  2. `AkunTenant.jsx` memanggil helper `updateUser(updatedProfile)` pada `AuthContext`.
  3. `AuthContext` memperbarui state `user` dan menyimpan ulang data sesi ke `localStorage` / `sessionStorage`.
* **Dampak Aksesibilitas**: Nama pemilik dan email di seluruh header navigasi dan sapaan dashboard ter-update secara serentak dan konsisten tanpa memerlukan reload halaman web.

---

## 5. Admin & Kios Domain Module

### 5.1 Boundary Constraints & Caller Requirements
Modul **Admin & Kios Domain** (`src/api/admin.js`) melayani 4 halaman utama zona pengelola/admin:
1. `DashboardAdmin.jsx`: Membaca ringkasan statistik tenant, status pembayaran bulan ini per tenant, serta trigger verifikasi cepat.
2. `KetersediaanKios.jsx`: Membaca tabel utilitas kios (Lt 1–3, nomor kios, status, tenant, usaha, catatan) serta membuat pendaftaran tenant baru (`createTenant`).
3. `DetailAdministrasiKios.jsx`: Membaca & memperbarui rincian administrasi legalitas unit kios (No. SP, No. PPJB, Tgl BAST, No. Sertifikat, histori pengalihan) via `getKiosDetail` dan `updateKios`.
4. `DetailKeuanganTenant.jsx` / `DetailTenantAdmin.jsx`: Drill-down view detail keuangan dan profil tenant spesifik.

### 5.2 Dependency Category
* **Saat ini**: Kategori 4 (*True External / Mock*). Data di-mock secara lokal di `src/api/admin.js` menggunakan array `mockTenants` & `mockKios` dengan `mockDelay`.
* **Target Backend**: Kategori 3 (*Remote but owned*). Dipanggil via REST API endpoints (`GET /api/v1/admin/tenants`, `GET /api/v1/admin/kios`, `POST /api/v1/admin/tenants`, `PUT /api/v1/admin/kios/:id`).

### 5.3 Interface & Seam Design (Semantic AdminPort Option 3 Style)
Mengikuti arsitektur Semantic Port yang sukses diterapkan pada Tenant Domain, **`adminPort`** diekspor sebagai Unified Port dengan 5 semantic methods:
* `getTenants()`: Query seluruh daftar tenant beserta status pembayaran & tunggakan.
* `getKiosList()`: Query seluruh utilitas unit kios (Lt 1–3).
* `getKiosDetail(kiosId)`: Query detail legalitas & administrasi kios spesifik.
* `createTenant(payload)`: Command mendaftarkan tenant baru ke kios.
* `updateKios(kiosId, data)`: Command pembaruan data legalitas & administrasi kios.

### 5.4 Standardized `CommandResult` & Validation Mapping (WCAG 3.3.1 / 3.3.3)
Struktur `CommandResult` dari Transaction & Tenant Domain di-reuse 100%:
```typescript
export type CommandResult = {
  success: boolean;
  message?: string; // Pesan penjelasan formal Bahasa Indonesia
  field?: string;   // Element ID / field input yang gagal validasi (misal 'nama', 'kios', 'email')
  data?: any;       // DTO objek baru/terupdate setelah operasi
};
```

##### Contoh Error Case pada `createTenant`:
* **Skenario**: Admin menginput nama tenant kosong atau nomor kios yang sudah terisi.
* **Respons Adapter**:
  ```json
  {
    "success": false,
    "message": "Nomor Kios B-1001 sudah terisi oleh Hj. Yuliana.",
    "field": "kios"
  }
  ```
* **Mapping di UI (`KetersediaanKios.jsx`)**: `addToast(result.message, 'error')` dipicu dan input `<select name="kios">` mendapatkan border merah per WCAG 3.3.1/3.3.3.

### 5.5 Custom Hooks Seam (Tanpa Context Baru)
Dibuat berkas `src/hooks/useAdmin.js` yang menyediakan custom hooks ringkas di atas `adminPort` dan `useApi`:
* `useAdminTenants()`
* `useAdminKios()`
* `useAdminKiosDetail(kiosId)`
* `useTenantRegistration()`
* `useKiosUpdate()`

### 5.6 Invariant Kontrak Resmi: Auto Cross-Update Status Kios
Sebagai bagian dari **kontrak resmi sistem**, perintah `createTenant(payload)` pada `adminPort` wajib menjalankan *relational invariant cross-update* pada status kios:
1. Ketika tenant baru berhasil didaftarkan ke nomor kios tertentu (misal `"C-3002"`), status kios tersebut pada domain/database **wajib secara otomatis berubah dari `Kosong` / `Perlu Validasi` menjadi `Terisi`**, dan nama tenant baru otomatis ditetapkan sebagai pemilik unit tersebut.
2. Jika kios yang dipilih sudah berstatus `Terisi`, perintah `createTenant` **wajib ditolak** dengan mengembalikan `CommandResult` error (`{ success: false, message: "Kios [nomor] sudah terisi oleh [nama]", field: "kios" }`).
*Catatan untuk Tim Backend*: Backend wajib mengimplementasikan transaksi database atomik (misal DB transaction / SQL trigger) untuk menjamin inkrementasi tabel `tenants` dan update kolom `status_kios` pada tabel `kios` berjalan secara *atomic*.

---

## 6. Auth Domain Module (Rank #4)

### 6.1 Problem Space & Callers
Modul **Auth Domain** (`src/api/auth.js`) melayani seluruh alur autentikasi dan manajemen sesi aplikasi:
* `AuthPage.jsx` (`/auth`): Login tenant & admin.
* `ForgotPassword.jsx` (`/auth/lupa-sandi`): Pemulihan kata sandi.
* `AuthContext.jsx`: Penyedia state autentikasi global (`isLoggedIn`, `role`, `user`).

### 6.2 Interface & Seam Design (`AuthPort`)
`authPort` mengekspos 3 semantic method:
* `login({ email, password, role })`: Memvalidasi kredensial dan mengembalikan `CommandResult` berisi payload `user` & `token`.
* `logout()`: Menghapus token & menutup sesi.
* `getSession()`: Membaca data sesi aktif dari storage.

### 6.3 Adapter Strategy & Integration (`AuthContext.jsx`)
* **`MockAuthAdapter`**: Menyediakan data mock user aktif dan kredensial uji coba.
* **Integrasi `AuthContext.jsx`**: `AuthContext` memanggil `authPort` di dalam method `login`, `logout`, dan pemuatan sesi awal tanpa mengubah kontrak interface `useAuth()` yang dipanggil oleh seluruh komponen UI.

---

## 7. HTTP Transport Client Adapter (Rank #5)

### 7.1 Objective & Architecture
Berkas `src/api/client.js` dirombak dari *shallow thrower* menjadi foundation HTTP Transport Client yang siap pakai untuk menghubungkan frontend ke REST API backend asli saat server aktif.

### 7.2 Core Capabilities
1. **Unified Request Methods**: `httpClient.get`, `httpClient.post`, `httpClient.put`, `httpClient.delete`.
2. **Request Interceptor**: Otomatis menyematkan `Authorization: Bearer <token>` dari `localStorage`/`sessionStorage` dan `Content-Type: application/json`.
3. **Response & Error Normalizer (WCAG 3.3.1 / 3.3.3)**: Mengubah seluruh error HTTP (400, 401, 422, 500) menjadi format JSON terstandar:
   ```json
   {
     "message": "Pesan kesalahan formal dalam Bahasa Indonesia",
     "field": "nama_field_bermasalah"
   }
   ```
4. **Timeout & Abort Handling**: Mendukung pembatalan request otomatis jika melebihi batas waktu timeout default (10.000 ms).
5. **Backward-Compatible `mockDelay`**: Tetap mengekspos `mockDelay(data, ms)` untuk mendukung kelancaran seluruh adapter mock saat ini.






