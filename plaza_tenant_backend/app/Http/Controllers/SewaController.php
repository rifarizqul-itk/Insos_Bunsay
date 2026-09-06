<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSewaRequest;
use App\Models\Kios;
use App\Models\Sewa;
use App\Services\SewaProvisioningService;
use Illuminate\Http\Request;

class SewaController extends Controller
{
    public function __construct(
        private SewaProvisioningService $provisioning = new SewaProvisioningService(),
    ) {
    }

    /**
     * Display a listing of the resource.
     * GET /api/sewa
     */
    public function index(Request $request)
    {
        // Keputusan bisnis #4 & #5 (dikonfirmasi 2026-08-12):
        // Secara default, hanya tampilkan sewa AKTIF.
        // Tambahkan ?include_selesai=true untuk menyertakan riwayat sewa yang sudah selesai.
        $query = Sewa::with(['kios', 'pemilik']);

        if ($request->query('include_selesai') !== 'true') {
            $query->aktif();
        }

        return response()->json([
            'success' => true,
            'message' => 'Daftar transaksi sewa berhasil diambil',
            'data'    => $query->get(),
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     * POST /api/sewa
     */
    public function store(StoreSewaRequest $request)
    {
        // 1. Tentukan target kios (single atau multi-kios).
        $kiosTargets = $this->resolveKiosTargets($request);

        if ($kiosTargets->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Silakan pilih minimal 1 unit kios kosong yang valid.',
            ], 422);
        }

        // 2. Guard: kios yang sudah memiliki sewa Aktif tidak boleh disewa lagi.
        $conflictKios = Sewa::whereIn('Id_Kios', $kiosTargets->pluck('Id_Kios'))
            ->where('Status', 'Aktif')
            ->with('kios')
            ->get();

        if ($conflictKios->isNotEmpty()) {
            $conflictNames = $conflictKios->pluck('kios.No_Kios')->join(', ');
            return response()->json([
                'success' => false,
                'message' => "Kios ({$conflictNames}) sudah memiliki sewa aktif. Akhiri sewa yang ada terlebih dahulu.",
            ], 422);
        }

        // 3. Parameter waktu & tarif.
        $tanggalMulaiInput = $request->Tanggal_Mulai ?? $request->tanggal_mulai ?? $request->tanggalMulai ?? now()->toDateString();
        $periodeSewa = date('Y-m', strtotime($tanggalMulaiInput));
        $defaultJatuhTempo = date('Y-m-12', strtotime($tanggalMulaiInput));
        $jatuhTempoInput = $request->Jatuh_Tempo ?? $request->jatuh_tempo ?? $request->jatuhTempo ?? $defaultJatuhTempo;

        $tarifKiosMap = $this->provisioning->decodeMap($request->tarif_kios_map ?? $request->tarifKiosMap);
        $usahaKiosMap = $this->provisioning->decodeMap($request->usaha_kios_map ?? $request->usahaKiosMap);

        // 4. Provision setiap kios (sewa + kios Terisi + tagihan perdana).
        $createdSewas = [];
        foreach ($kiosTargets as $kiosTarget) {
            $tarifCustom = $this->provisioning->resolveTarif(
                $tarifKiosMap,
                $kiosTarget->No_Kios,
                (float) ($request->Tarif_Bulanan ?? 0)
            );

            $result = $this->provisioning->provisionKios($kiosTarget, [
                'Id_Pemilik'      => $request->Id_Pemilik,
                'Tanggal_Mulai'   => $tanggalMulaiInput,
                'Tanggal_Selesai' => $request->Tanggal_Selesai ?? null,
                'Jenis_Usaha'     => $usahaKiosMap[$kiosTarget->No_Kios] ?? $request->Jenis_Usaha,
                'Tarif_Bulanan'   => $tarifCustom,
                'Keterangan'      => $request->Keterangan ?? null,
                'Periode'         => $periodeSewa,
                'Jatuh_Tempo'     => $jatuhTempoInput,
            ]);

            $createdSewas[] = $result['sewa'];
        }

        return response()->json([
            'success' => true,
            'message' => count($createdSewas) . ' unit sewa kios berhasil ditambahkan ke tenant',
            'data'    => $createdSewas,
        ], 201);
    }

    /**
     * Resolve kios targets dari salah satu input: kios_list (nama),
     * kios_ids, Id_Kios tunggal, atau No_Kios.
     */
    private function resolveKiosTargets(StoreSewaRequest $request)
    {
        if (!empty($request->kios_list)) {
            $rawList = $this->provisioning->parseKiosList($request->kios_list);

            return Kios::whereIn('No_Kios', $rawList)->get();
        }

        if (!empty($request->kios_ids) && is_array($request->kios_ids)) {
            return Kios::whereIn('Id_Kios', $request->kios_ids)->get();
        }

        if (!empty($request->Id_Kios)) {
            $single = Kios::find($request->Id_Kios);

            return collect($single ? [$single] : []);
        }

        if (!empty($request->No_Kios)) {
            $names = $this->provisioning->parseKiosList($request->No_Kios);

            return Kios::whereIn('No_Kios', $names)->get();
        }

        return collect([]);
    }

    /**
     * Display the specified resource.
     * GET /api/sewa/{id}
     */
    public function show($id)
    {
        $sewa = Sewa::with(['kios', 'pemilik', 'tagihan'])->find($id);

        if (!$sewa) {
            return response()->json([
                'success' => false,
                'message' => 'Data sewa tidak ditemukan',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail data sewa ditemukan',
            'data'    => $sewa,
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     * PUT/PATCH /api/sewa/{id}
     */
    public function update(Request $request, $id)
    {
        $sewa = Sewa::find($id);

        if (!$sewa) {
            return response()->json([
                'success' => false,
                'message' => 'Data sewa tidak ditemukan',
            ], 404);
        }

        $validatedData = $request->validate([
            'Id_Pemilik'      => 'sometimes|required|exists:pemilik,Id_Pemilik',
            'Id_Kios'         => 'sometimes|required|exists:kios,Id_Kios',
            'Jenis_Usaha'     => 'sometimes|required|string|max:255',
            'Tanggal_Mulai'   => 'sometimes|required|date',
            'Tanggal_Selesai' => 'sometimes|required|date',
            'Tarif_Bulanan'   => 'sometimes|nullable|numeric|min:0',
            'Keterangan'      => 'nullable|string',
        ]);

        $sewa->update($validatedData);

        return response()->json([
            'success' => true,
            'message' => 'Data sewa berhasil diperbarui',
            'data'    => $sewa->load(['kios', 'pemilik']),
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     * DELETE /api/sewa/{id}
     */
    public function destroy($id)
    {
        $sewa = Sewa::find($id);

        if (!$sewa) {
            return response()->json([
                'success' => false,
                'message' => 'Data sewa tidak ditemukan',
            ], 404);
        }

        // Keputusan bisnis #4 & #5 (dikonfirmasi 2026-08-12):
        // SOFT-DELETE — sewa TIDAK dihapus dari database.
        // Status kios dikembalikan ke 'Kosong', sewa diarsipkan sebagai 'Selesai'.
        // Seluruh riwayat tagihan & pembayaran tetap tersimpan permanen.
        $this->arsipkanSewa($sewa);

        return response()->json([
            'success' => true,
            'message' => 'Sewa berhasil diarsipkan (Status: Selesai). Kios kembali Kosong. Riwayat transaksi tetap tersimpan.',
        ], 200);
    }

    /**
     * Terminate lease action.
     * POST /api/v1/admin/sewa/{id}/akhiri
     */
    public function akhiriSewa($id)
    {
        $sewa = Sewa::where('Id_Sewa', $id)->first()
            ?? Sewa::where('Id_Kios', $id)->where('Status', 'Aktif')->first()
            ?? Sewa::whereHas('kios', fn($q) => $q->where('No_Kios', $id))->where('Status', 'Aktif')->first();

        if (!$sewa) {
            return response()->json([
                'success' => false,
                'message' => 'Data sewa tidak ditemukan',
            ], 404);
        }

        if ($sewa->Status === 'Selesai') {
            return response()->json([
                'success' => false,
                'message' => 'Sewa ini sudah berstatus Selesai sebelumnya.',
            ], 422);
        }

        // Keputusan bisnis #4 & #5 (dikonfirmasi 2026-08-12):
        // SOFT-DELETE — ubah Status sewa menjadi 'Selesai', TIDAK delete dari DB.
        $this->arsipkanSewa($sewa);

        return response()->json([
            'success' => true,
            'message' => 'Masa sewa berhasil diakhiri. Kios kembali Kosong. Riwayat transaksi tenant tetap tersimpan.',
            'data'    => [
                'sewa' => $sewa->fresh(),
                'kios' => Kios::find($sewa->Id_Kios),
            ],
        ], 200);
    }

    /**
     * Soft-delete bersama: sewa → Selesai (isi Tanggal_Selesai bila kosong),
     * kios → Kosong.
     */
    private function arsipkanSewa(Sewa $sewa): void
    {
        $sewa->update([
            'Status'          => 'Selesai',
            'Tanggal_Selesai' => $sewa->Tanggal_Selesai ?? now()->toDateString(),
        ]);

        Kios::where('Id_Kios', $sewa->Id_Kios)->update(['Status' => 'Kosong']);
    }
}
