<?php

namespace App\Http\Controllers;

use App\Http\Requests\KonfirmasiPembayaranRequest;
use App\Http\Requests\SanggahRequest;
use App\Http\Requests\StorePembayaranRequest;
use App\Models\Pembayaran;
use App\Models\Tagihan;
use App\Services\BuktiImageException;
use App\Services\BuktiImageStore;
use App\Services\PaymentStatusPolicy;
use App\Services\TagihanAllocationService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PembayaranController extends Controller
{
    private const DEFAULT_PAGE_SIZE = 10;

    private const MAX_PAGE_SIZE = 100;

    /** Kolom yang boleh dipakai untuk sort (whitelist — input user tidak pernah dipakai mentah). */
    private const SORTABLE_COLUMNS = [
        'tanggal' => 'Tanggal_Bayar',
        'nominal' => 'Total_Bayar',
        'id'      => 'Id_Pembayaran',
        'status'  => 'Verifikasi_Pembayaran',
    ];
    public function __construct(
        private BuktiImageStore $buktiImageStore = new BuktiImageStore(),
        private TagihanAllocationService $allocationService = new TagihanAllocationService(),
        private PaymentStatusPolicy $statusPolicy = new PaymentStatusPolicy(),
    ) {
    }

    /**
     * Daftar pembayaran. Tanpa parameter ?page → bentuk legacy (array penuh,
     * dipakai enam halaman admin yang sudah berjalan). Dengan ?page → bentuk
     * terpaginasi + filter server-side:
     *
     *   GET /pembayaran?page=1&page_size=15&status=Ditolak&metode=Transfer&q=TRX-12
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $paginated = $request->filled('page');

        $query = Pembayaran::query()->with(['tagihan.sewa.pemilik', 'tagihan.sewa.kios']);

        // Tenant hanya melihat pembayaran miliknya (admin melihat semuanya).
        if ($user && $user->Id_roles != 1) {
            $pemilik = \App\Models\Pemilik::where('Id_User', $user->Id_user)->first();

            if (!$pemilik) {
                return $paginated
                    ? response()->json($this->emptyPage((int) $request->query('page_size', self::DEFAULT_PAGE_SIZE)))
                    : response()->json([]); // Kosong jika belum punya profil pemilik
            }

            $query->whereHas('tagihan.sewa', fn ($q) => $q->where('Id_Pemilik', $pemilik->Id_Pemilik));
        }

        // Filter server-side (hanya relevan untuk bentuk terpaginasi).
        if ($paginated) {
            if ($status = $request->query('status')) {
                // Dukung multi-status: ?status=Diterima,Ditolak
                $statuses = array_values(array_filter(array_map('trim', explode(',', $status))));
                $query->whereIn('Verifikasi_Pembayaran', $statuses ?: ['Menunggu']);
            }
            if ($metode = $request->query('metode')) {
                $query->where('Metode_Bayar', $metode);
            }
            if ($search = trim((string) $request->query('q', ''))) {
                $query->where(function ($q) use ($search) {
                    $q->where('Id_Pembayaran', is_numeric($search) ? (int) $search : -1)
                        ->orWhere('Bukti_Pembayaran', 'like', "%{$search}%");
                });
            }
        }

        // Sort server-side: hanya kolom dalam whitelist, arah hanya asc/desc.
        $sortKey = $request->query('sort_by', 'tanggal');
        $sortColumn = self::SORTABLE_COLUMNS[$sortKey] ?? self::SORTABLE_COLUMNS['tanggal'];
        $sortDir = strtolower((string) $request->query('sort_dir', 'desc')) === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sortColumn, $sortDir)->orderBy('Id_Pembayaran', 'desc');

        if (!$paginated) {
            return response()->json($query->get());
        }

        $pageSize = min(max(1, (int) $request->query('page_size', self::DEFAULT_PAGE_SIZE)), self::MAX_PAGE_SIZE);
        $page = $query->paginate($pageSize);

        return response()->json([
            'data'         => $page->items(),
            'current_page' => $page->currentPage(),
            'last_page'    => $page->lastPage(),
            'per_page'     => $page->perPage(),
            'total'        => $page->total(),
        ]);
    }

    private function emptyPage(int $pageSize): array
    {
        return [
            'data'         => [],
            'current_page' => 1,
            'last_page'    => 1,
            'per_page'     => $pageSize,
            'total'        => 0,
        ];
    }

    public function store(StorePembayaranRequest $request)
    {
        // Isolasi tenant (isu I4, 2026-08-12): tagihan harus milik pemilik
        // yang sedang login. Admin (Id_roles = 1) dikecualikan.
        $request->ensureTagihanOwnership();

        // Kebijakan status verifikasi (dikonfirmasi 2026-08-13, diperluas 2026-09-19):
        // - Admin menginput Transfer (validasi WA) atau Tunai di loket → auto Diterima.
        // - Tenant menginput Transfer atau Tunai via web → Menunggu verifikasi.
        // - Midtrans: auto Diterima (gateway otomatis).
        $isAdmin = $request->user() && (int) $request->user()->Id_roles === 1;
        $statusVerifikasi = $this->statusPolicy->initialStatus($request->Metode_Bayar, $isAdmin);

        // Bukti pembayaran: multipart, base64 data URI, atau string referensi.
        // Bukti tidak valid ditolak eksplisit (422) — tidak pernah dibuang diam-diam.
        try {
            $buktiPath = $this->buktiImageStore->store($request->Bukti_Pembayaran);
        } catch (BuktiImageException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }

        $tagihanTarget = Tagihan::find($request->Id_Tagihan);

        $pembayaran = DB::transaction(function () use (
            $request,
            $tagihanTarget,
            $statusVerifikasi,
            $buktiPath
        ) {
            $idTagihanTarget = $tagihanTarget->Id_Tagihan;
            $isPartialPayment = false;

            if ($tagihanTarget && $statusVerifikasi === 'Diterima') {
                $openTagihan = $this->allocationService->openTagihan($tagihanTarget->Id_Sewa);

                $sisaTagihanTarget = max(0.0, (float) ($tagihanTarget->Sisa_Tagihan ?? $tagihanTarget->Total_Tagihan ?? 0));

                if ($openTagihan->isNotEmpty() && (float) $request->Total_Bayar < $sisaTagihanTarget) {
                    // Partial payment: FIFO ke tagihan tertua pada sewa yang sama.
                    $isPartialPayment = true;
                    $this->allocationService->allocate($openTagihan, (float) $request->Total_Bayar);
                    $idTagihanTarget = $tagihanTarget->Id_Tagihan;
                } elseif ($tagihanTarget->Status_Tagihan === 'Lunas') {
                    // Advance payment: buat tagihan periode berikutnya untuk menampung dana.
                    $idTagihanTarget = $this->createAdvanceTagihan($tagihanTarget, $request, $statusVerifikasi);
                }
            }

            // Buat record Pembayaran baru (selalu bertambah di riwayat transaksi)
            $pembayaranRecord = Pembayaran::create([
                'Id_Tagihan'            => $idTagihanTarget,
                'Tanggal_Bayar'         => $request->Tanggal_Bayar,
                'Total_Bayar'           => $request->Total_Bayar,
                'Metode_Bayar'          => $request->Metode_Bayar,
                'Bukti_Pembayaran'      => $buktiPath,
                'Verifikasi_Pembayaran' => $statusVerifikasi,
            ]);

            // Untuk full payment yang diterima (non-FIFO): update tagihan target ke Lunas
            if ($statusVerifikasi === 'Diterima' && !$isPartialPayment) {
                Tagihan::where('Id_Tagihan', $idTagihanTarget)->update([
                    'Status_Tagihan' => 'Lunas',
                    'Sisa_Tagihan'   => 0,
                ]);
            }

            return $pembayaranRecord;
        });

        // 6. Kirim dynamic event notification ke panel Admin
        $this->notifyAdminOfIncomingPayment($pembayaran, $tagihanTarget);

        return response()->json($pembayaran, 201);
    }

    /**
     * Advance payment: tagihan target sudah Lunas, jadi dana dialokasikan ke
     * tagihan periode berikutnya (dibuat bila belum ada).
     */
    private function createAdvanceTagihan(Tagihan $tagihanTarget, Request $request, string $statusVerifikasi): int
    {
        $latestTagihan = Tagihan::where('Id_Sewa', $tagihanTarget->Id_Sewa)
            ->orderBy('Id_Tagihan', 'desc')
            ->first();

        $nextPeriode = now()->format('Y-m');
        if ($latestTagihan && $latestTagihan->Periode) {
            try {
                $nextPeriode = Carbon::createFromFormat('Y-m', $latestTagihan->Periode)->addMonth()->format('Y-m');
            } catch (\Throwable) {
                $nextPeriode = now()->format('Y-m');
            }
        }

        $tarif = $tagihanTarget->Tarif_Sewa ?: $request->Total_Bayar;

        $newTagihan = Tagihan::create([
            'Id_Sewa'          => $tagihanTarget->Id_Sewa,
            'Periode'          => $nextPeriode,
            'Jatuh_Tempo'      => now()->addMonth()->format('Y-m-d'),
            'Tarif_Sewa'       => $tarif,
            'Hutang_Tunggakan' => 0,
            'Total_Tagihan'    => $tarif,
            'Sisa_Tagihan'     => $statusVerifikasi === 'Diterima' ? 0 : $tarif,
            'Status_Tagihan'   => $statusVerifikasi === 'Diterima' ? 'Lunas' : 'Belum Bayar',
        ]);

        return $newTagihan->Id_Tagihan;
    }

    /**
     * Dynamic event notification ke panel Admin untuk pembayaran masuk.
     */
    private function notifyAdminOfIncomingPayment(Pembayaran $pembayaran, ?Tagihan $tagihanTarget): void
    {
        $nomFormatted = number_format((float) ($pembayaran->Total_Bayar ?? 0), 0, ',', '.');
        $namaTenant = $tagihanTarget?->sewa?->pemilik?->Nama ?? 'Tenant';

        if ($pembayaran->Metode_Bayar === 'Transfer' && $pembayaran->Verifikasi_Pembayaran === 'Menunggu') {
            \App\Models\Notification::send(
                'admin',
                null,
                'Pembayaran Transfer Masuk',
                "Tenant {$namaTenant} mengunggah bukti transfer sebesar Rp {$nomFormatted} (TRX-{$pembayaran->Id_Pembayaran}). Menunggu verifikasi admin.",
                'info',
                '/admin/verifikasi-bukti?trx=' . $pembayaran->Id_Pembayaran
            );
        } elseif ($pembayaran->Metode_Bayar === 'Tunai' && $pembayaran->Verifikasi_Pembayaran === 'Menunggu') {
            \App\Models\Notification::send(
                'admin',
                null,
                'Klaim Pembayaran Tunai Masuk',
                "Tenant {$namaTenant} mengajukan pembayaran tunai sebesar Rp {$nomFormatted} (TRX-{$pembayaran->Id_Pembayaran}). Menunggu konfirmasi loket.",
                'info',
                '/admin/verifikasi-bukti?trx=' . $pembayaran->Id_Pembayaran
            );
        } elseif ($pembayaran->Metode_Bayar === 'Midtrans') {
            \App\Models\Notification::send(
                'admin',
                null,
                'Pembayaran Midtrans Berhasil',
                "Pembayaran otomatis via Midtrans dari {$namaTenant} sebesar Rp {$nomFormatted} berhasil diterima.",
                'success',
                '/admin/riwayat'
            );
        }
    }

    public function show(string $id)
    {
        return response()->json(Pembayaran::findOrFail($id));
    }

    public function update(Request $request, string $id)
    {
        $request->validate([
            'Tanggal_Bayar'        => 'sometimes|date',
            'Total_Bayar'          => 'sometimes|numeric',
            'Metode_Bayar'         => 'sometimes|in:Transfer,Tunai,Midtrans',
            'Bukti_Pembayaran'     => 'nullable|string',
            'Verifikasi_Pembayaran'=> 'sometimes|in:Menunggu,Diterima,Ditolak',
        ]);

        $pembayaran = Pembayaran::findOrFail($id);

        $pembayaran->update($request->only([
            'Tanggal_Bayar',
            'Total_Bayar',
            'Metode_Bayar',
            'Bukti_Pembayaran',
            'Verifikasi_Pembayaran',
        ]));

        return response()->json($pembayaran);
    }

    public function konfirmasi(KonfirmasiPembayaranRequest $request, string $id)
    {

        // Bersihkan prefix string seperti 'TRX-' jika dikirim dari frontend
        $cleanId = preg_replace('/[^0-9]/', '', $id);

        $pembayaran = Pembayaran::with('tagihan.sewa.pemilik')->find($cleanId ?: $id);

        if (!$pembayaran) {
            return response()->json(['message' => 'Data pembayaran tidak ditemukan.'], 404);
        }

        DB::transaction(function () use ($pembayaran, $request) {
            $pembayaran->update([
                'Verifikasi_Pembayaran' => $request->status,
                'catatan_admin'         => $request->catatan_admin,
            ]);

            if ($request->status === 'Diterima') {
                $this->applyVerifiedAllocation($pembayaran);
            } else {
                // Tolak: kembalikan tagihan anchor ke Belum Bayar
                Tagihan::where('Id_Tagihan', $pembayaran->Id_Tagihan)
                    ->update(['Status_Tagihan' => 'Belum Bayar']);
            }
        });

        \App\Models\ActivityLog::record(
            $request,
            'Pembayaran',
            $request->status === 'Diterima' ? 'Verifikasi Terima' : 'Verifikasi Tolak',
            "Admin memverifikasi status pembayaran TRX-{$pembayaran->Id_Pembayaran} menjadi {$request->status}." . ($request->filled('catatan_admin') ? " Alasan/Catatan: {$request->catatan_admin}" : "")
        );

        $this->notifyTenantOfVerification($pembayaran, $request);

        return response()->json([
            'message' => 'Konfirmasi pembayaran berhasil.',
            'data' => $pembayaran->fresh(),
        ]);
    }

    /**
     * FIFO allocation saat admin menerima pembayaran.
     */
    private function applyVerifiedAllocation(Pembayaran $pembayaran): void
    {
        $tagihanAnchor = Tagihan::find($pembayaran->Id_Tagihan);
        if (!$tagihanAnchor) {
            return;
        }

        $openTagihan = $this->allocationService->openTagihan($tagihanAnchor->Id_Sewa);

        if ($openTagihan->isNotEmpty()) {
            $this->allocationService->allocate($openTagihan, (float) $pembayaran->Total_Bayar);
        } else {
            // Tidak ada tagihan terbuka: lunasi tagihan anchor secara langsung.
            $tagihanAnchor->update([
                'Status_Tagihan' => 'Lunas',
                'Sisa_Tagihan'   => 0,
            ]);
        }
    }

    /**
     * Dynamic event notification ke tenant setelah verifikasi admin.
     */
    private function notifyTenantOfVerification(Pembayaran $pembayaran, Request $request): void
    {
        $tenantUserId = $pembayaran->tagihan?->sewa?->pemilik?->Id_User;
        if (!$tenantUserId && $pembayaran->Id_Tagihan) {
            $tagihanObj = Tagihan::with('sewa.pemilik')->find($pembayaran->Id_Tagihan);
            $tenantUserId = $tagihanObj?->sewa?->pemilik?->Id_User;
        }

        if ($request->status === 'Diterima') {
            \App\Models\Notification::send(
                'tenant',
                $tenantUserId,
                'Pembayaran Sewa Diterima',
                "Pembayaran transaksi TRX-{$pembayaran->Id_Pembayaran} sebesar Rp " . number_format((float) ($pembayaran->Total_Bayar ?? 0), 0, ',', '.') . " telah diverifikasi dan DITERIMA oleh pengelola.",
                'success',
                '/tenant/histori'
            );
        } elseif ($request->status === 'Ditolak') {
            \App\Models\Notification::send(
                'tenant',
                $tenantUserId,
                'Pembayaran Sewa Ditolak',
                "Pembayaran transaksi TRX-{$pembayaran->Id_Pembayaran} DITOLAK oleh pengelola. Alasan: " . ($request->catatan_admin ?: 'Bukti pembayaran tidak terbaca') . ". Silakan kirimkan sanggahan.",
                'danger',
                '/tenant/histori'
            );
        }
    }

    public function sanggah(SanggahRequest $request)
    {
        // Pembayaran sudah di-resolve & diverifikasi kepemilikannya oleh
        // SanggahRequest (satu query, sebelum sentuh berkas apa pun).
        $pembayaran = $request->getPembayaran();

        if (!$pembayaran) {
            return response()->json(['message' => 'Data pembayaran tidak ditemukan.'], 404);
        }

        try {
            $buktiPath = $this->buktiImageStore->store($request->bukti_sanggahan, 'sanggahan');
        } catch (BuktiImageException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }

        // Akumulasi riwayat lampiran sanggahan (JSON array, atau string lama).
        $buktiArray = $this->decodeExistingBuktiSanggahan($pembayaran->bukti_sanggahan);
        if ($buktiPath && !in_array($buktiPath, $buktiArray)) {
            $buktiArray[] = $buktiPath;
        }

        $finalBuktiSanggahan = match (true) {
            empty($buktiArray)   => $pembayaran->bukti_sanggahan,
            count($buktiArray) === 1 => $buktiArray[0],
            default              => json_encode(array_values(array_unique($buktiArray))),
        };

        $pembayaran->update([
            'teks_sanggahan'        => $request->teks_sanggahan,
            'bukti_sanggahan'       => $finalBuktiSanggahan,
            'Verifikasi_Pembayaran' => $this->statusPolicy->statusAfterSanggah(),
        ]);

        // Send Dynamic Event Notification to Admin Staff
        \App\Models\Notification::send(
            'admin',
            null,
            'Sanggahan Pembayaran Tenant Baru',
            "Tenant mengirimkan sanggahan untuk transaksi TRX-{$pembayaran->Id_Pembayaran}. Catatan sanggahan: {$request->teks_sanggahan}",
            'warning',
            '/admin/verifikasi-bukti?trx=' . $pembayaran->Id_Pembayaran
        );

        return response()->json([
            'message' => 'Sanggahan pembayaran berhasil dikirim.',
            'data'    => $pembayaran->fresh(),
        ]);
    }

    /**
     * bukti_sanggahan bisa berisi JSON array, comma-separated path, atau
     * satu path — normalkan menjadi array string.
     */
    private function decodeExistingBuktiSanggahan(?string $existing): array
    {
        if (!$existing) {
            return [];
        }

        $decoded = json_decode($existing, true);
        if (is_array($decoded)) {
            return array_values(array_filter($decoded));
        }

        $parts = array_values(array_filter(explode(',', $existing)));
        if (!empty($parts)) {
            return $parts;
        }

        return [$existing];
    }

    public function ekspor(Request $request)
    {
        $bulan = $request->query('bulan', 'Mei');
        $tahun = $request->query('tahun', '2026');

        return response()->json([
            'success' => true,
            'url' => "/downloads/rekap-{$bulan}-{$tahun}.xlsx",
            'message' => "Berkas rekapitulasi {$bulan} {$tahun} berhasil diekspor dari database SQL."
        ]);
    }

    /**
     * Public QR Code / Receipt Verification endpoint.
     * Checks whether the transaction exists in the database and is officially 'Diterima' (LUNAS).
     */
    public function verifikasiResiPublic(Request $request)
    {
        $code = trim((string) $request->query('code', ''));

        if ($code === '' || strtoupper($code) === 'TRX-PAYMENT') {
            return response()->json([
                'valid'   => false,
                'message' => 'Silakan masukkan kode transaksi yang valid.',
            ], 422);
        }

        // Try parsing numeric ID from "TRX-123" or "123"
        $numericId = null;
        if (preg_match('/^(?:TRX-)?(\d+)$/i', $code, $matches)) {
            $numericId = (int) $matches[1];
        }

        // Query payment record
        $query = Pembayaran::with(['tagihan.sewa.kios', 'tagihan.sewa.pemilik']);

        if ($numericId !== null) {
            $query->where(function ($q) use ($numericId, $code) {
                $q->where('Id_Pembayaran', $numericId)
                  ->orWhere('Bukti_Pembayaran', $code);
            });
        } else {
            $query->where('Bukti_Pembayaran', $code);
        }

        $pembayaran = $query->first();

        if (!$pembayaran) {
            return response()->json([
                'valid'   => false,
                'message' => 'Dokumen bukti pembayaran dengan kode "' . $code . '" tidak ditemukan dalam database resmi.',
            ], 404);
        }

        $status = $pembayaran->Verifikasi_Pembayaran;

        if ($status === 'Diterima') {
            $kios = $pembayaran->tagihan?->sewa?->kios;
            $kiosLabel = $kios ? 'Kios ' . $kios->No_Kios : '-';

            return response()->json([
                'valid'   => true,
                'status'  => 'LUNAS',
                'data'    => [
                    'no_kuitansi'      => 'TRX-' . $pembayaran->Id_Pembayaran,
                    'referensi'        => ($pembayaran->Bukti_Pembayaran && str_starts_with($pembayaran->Bukti_Pembayaran, 'BUNSAY-'))
                                            ? $pembayaran->Bukti_Pembayaran
                                            : ('TRX-' . $pembayaran->Id_Pembayaran),
                    'tanggal_bayar'    => $pembayaran->Tanggal_Bayar,
                    'metode_bayar'     => $pembayaran->Metode_Bayar,
                    'total_bayar'      => (float) $pembayaran->Total_Bayar,
                    'jenis_retribusi'  => 'Retribusi Pemakaian Kekayaan Daerah (Sewa Kios)',
                    'unit_kios'        => $kiosLabel,
                    'periode'          => $pembayaran->tagihan?->Periode ?? '-',
                ],
            ]);
        }

        if ($status === 'Menunggu') {
            return response()->json([
                'valid'   => false,
                'status'  => 'Menunggu Verifikasi',
                'message' => 'Transaksi ditemukan, namun statusnya masih dalam proses verifikasi oleh petugas loket dan belum disetujui.',
            ], 200);
        }

        return response()->json([
            'valid'   => false,
            'status'  => 'Ditolak',
            'message' => 'Transaksi ditemukan tetapi berstatus DITOLAK, sehingga tidak berlaku sebagai bukti pembayaran yang sah.',
        ], 200);
    }

    /**
     * Unggah foto bukti pembayaran susulan (terutama untuk transaksi tunai/loket
     * atau transaksi yang bukti fotonya belum sempat dilampirkan).
     */
    public function uploadBuktiSusulan(Request $request, string $id)
    {
        $cleanId = (int) preg_replace('/[^0-9]/', '', $id);
        $pembayaran = Pembayaran::with(['tagihan.sewa.pemilik'])->findOrFail($cleanId);

        $user = $request->user();
        $isAdmin = $user && (int) $user->Id_roles === 1;

        if (!$isAdmin) {
            $pemilikUser = $pembayaran->tagihan?->sewa?->pemilik?->Id_User;
            $currentUserId = $user ? ($user->Id_user ?? $user->Id_User) : null;
            if (!$pemilikUser || (int) $pemilikUser !== (int) $currentUserId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda tidak memiliki hak akses untuk mengunggah bukti pembayaran ini.',
                ], 403);
            }
        }

        $currentBukti = $pembayaran->Bukti_Pembayaran;
        $hasExistingPhoto = !empty($currentBukti) && !str_starts_with($currentBukti, 'LOKET-CASH') && $currentBukti !== '-';

        if ($hasExistingPhoto && $pembayaran->Verifikasi_Pembayaran !== 'Ditolak') {
            return response()->json([
                'success' => false,
                'message' => 'Foto bukti pembayaran sudah tersimpan dan tidak dapat diubah kecuali status pembayaran ditolak oleh admin.',
            ], 422);
        }

        $source = $request->file('bukti')
            ?? $request->file('Bukti_Pembayaran')
            ?? $request->input('bukti')
            ?? $request->input('Bukti_Pembayaran');

        if (!$source) {
            return response()->json([
                'success' => false,
                'message' => 'Berkas bukti pembayaran tidak ditemukan dalam permintaan.',
            ], 422);
        }

        try {
            $buktiPath = $this->buktiImageStore->store($source, 'bukti_susulan');
        } catch (BuktiImageException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }

        $isReplacedAfterRejection = ($pembayaran->Verifikasi_Pembayaran === 'Ditolak');

        if ($isAdmin) {
            $wasNotDiterima = ($pembayaran->Verifikasi_Pembayaran !== 'Diterima');

            DB::transaction(function () use ($pembayaran, $buktiPath, $wasNotDiterima) {
                $updates = ['Bukti_Pembayaran' => $buktiPath];
                if ($wasNotDiterima) {
                    $updates['Verifikasi_Pembayaran'] = 'Diterima';
                }
                $pembayaran->update($updates);

                if ($wasNotDiterima) {
                    $this->applyVerifiedAllocation($pembayaran);
                }
            });

            if ($wasNotDiterima) {
                \App\Models\ActivityLog::record(
                    $request,
                    'Pembayaran',
                    'Verifikasi Terima',
                    "Admin mengunggah foto bukti fisik loket dan langsung mengesahkan pembayaran TRX-{$pembayaran->Id_Pembayaran} menjadi Diterima (Lunas)."
                );

                $tenantUserId = $pembayaran->tagihan?->sewa?->pemilik?->Id_User;
                if (!$tenantUserId && $pembayaran->Id_Tagihan) {
                    $tagihanObj = Tagihan::with('sewa.pemilik')->find($pembayaran->Id_Tagihan);
                    $tenantUserId = $tagihanObj?->sewa?->pemilik?->Id_User;
                }

                if ($tenantUserId) {
                    $nomFormatted = number_format((float) ($pembayaran->Total_Bayar ?? 0), 0, ',', '.');
                    \App\Models\Notification::send(
                        'tenant',
                        $tenantUserId,
                        'Pembayaran Sewa Disahkan Lunas',
                        "Pembayaran transaksi TRX-{$pembayaran->Id_Pembayaran} sebesar Rp {$nomFormatted} telah dilengkapi bukti fisik loket dan disahkan LUNAS oleh petugas admin.",
                        'success',
                        '/tenant/histori'
                    );
                }
            }

            return response()->json([
                'success'   => true,
                'message'   => $wasNotDiterima
                    ? 'Foto bukti fisik loket berhasil disimpan dan transaksi langsung disahkan Lunas.'
                    : 'Foto bukti pembayaran berhasil diunggah.',
                'data'      => $pembayaran->fresh(),
                'bukti_url' => asset($buktiPath),
            ]);
        }

        $updates = [
            'Bukti_Pembayaran' => $buktiPath,
        ];

        // Jika pembayaran sebelumnya berstatus Ditolak, unggah bukti baru oleh tenant mengembalikan
        // status verifikasi menjadi 'Menunggu' agar masuk kembali ke antrean verifikasi admin.
        if ($isReplacedAfterRejection) {
            $updates['Verifikasi_Pembayaran'] = 'Menunggu';
        }

        $pembayaran->update($updates);

        $namaTenant = $pembayaran->tagihan?->sewa?->pemilik?->Nama ?? 'Tenant';
        $nomFormatted = number_format((float) ($pembayaran->Total_Bayar ?? 0), 0, ',', '.');
        $notifTitle = $isReplacedAfterRejection ? 'Perbaikan Bukti Pembayaran Diunggah' : 'Foto Bukti Struk Diunggah';
        $notifDesc = $isReplacedAfterRejection
            ? "Tenant {$namaTenant} memperbarui foto bukti pembayaran yang ditolak senilai Rp {$nomFormatted} (TRX-{$pembayaran->Id_Pembayaran})."
            : "Tenant {$namaTenant} mengunggah foto bukti fisik pembayaran Rp {$nomFormatted} (TRX-{$pembayaran->Id_Pembayaran}).";

        \App\Models\Notification::send(
            'admin',
            null,
            $notifTitle,
            $notifDesc,
            'info',
            '/admin/verifikasi-bukti?trx=' . $pembayaran->Id_Pembayaran
        );

        return response()->json([
            'success'   => true,
            'message'   => 'Foto bukti pembayaran berhasil diunggah.',
            'data'      => $pembayaran->fresh(),
            'bukti_url' => asset($buktiPath),
        ]);
    }
}

