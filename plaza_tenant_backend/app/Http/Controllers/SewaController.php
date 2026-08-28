<?php

namespace App\Http\Controllers;

use App\Models\Sewa;
use App\Models\Kios;
use Illuminate\Http\Request;

class SewaController extends Controller
{
    /**
     * Display a listing of the resource.
     * GET /api/sewa
     */
    public function index(Request $request)
    {
        try {
            // Keputusan bisnis #4 & #5 (dikonfirmasi 2026-08-12):
            // Secara default, hanya tampilkan sewa AKTIF.
            // Tambahkan ?include_selesai=true untuk menyertakan riwayat sewa yang sudah selesai.
            $query = Sewa::with(['kios', 'pemilik']);

            if ($request->query('include_selesai') === 'true') {
                // Tampilkan semua sewa (aktif + selesai) untuk keperluan riwayat
                // Tidak ada filter — ambil semua
            } else {
                $query->aktif();
            }

            $sewa = $query->get();

            return response()->json([
                'success' => true,
                'message' => 'Daftar transaksi sewa berhasil diambil',
                'data'    => $sewa
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data sewa: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     * POST /api/sewa
     */
    public function store(Request $request)
    {
        // 1. Validasi Input
        $validatedData = $request->validate([
            'Id_Pemilik'     => 'required|exists:pemilik,Id_Pemilik',
            'Id_Kios'        => 'nullable|exists:kios,Id_Kios',
            'kios_list'      => 'nullable',
            'kios_ids'       => 'nullable|array',
            'No_Kios'        => 'nullable|string',
            'Jenis_Usaha'    => 'required|string|max:255',
            'Tanggal_Mulai'  => 'nullable|date',
            'Tanggal_Selesai'=> 'nullable|date',
            'Tarif_Bulanan'  => 'nullable|numeric|min:0',
            'tarif_kios_map' => 'nullable',
            'Keterangan'     => 'nullable|string',
        ]);

        try {
            // 2. Tentukan target kios (single atau multi-kios)
            $kiosTargets = collect([]);
            if (!empty($request->kios_list)) {
                $rawList = is_array($request->kios_list) ? $request->kios_list : array_filter(array_map('trim', explode(',', $request->kios_list)));
                $kiosTargets = \App\Models\Kios::whereIn('No_Kios', $rawList)->get();
            } elseif (!empty($request->kios_ids) && is_array($request->kios_ids)) {
                $kiosTargets = \App\Models\Kios::whereIn('Id_Kios', $request->kios_ids)->get();
            } elseif (!empty($request->Id_Kios)) {
                $single = \App\Models\Kios::find($request->Id_Kios);
                if ($single) $kiosTargets = collect([$single]);
            } elseif (!empty($request->No_Kios)) {
                $names = array_filter(array_map('trim', explode(',', $request->No_Kios)));
                $kiosTargets = \App\Models\Kios::whereIn('No_Kios', $names)->get();
            }

            if ($kiosTargets->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Silakan pilih minimal 1 unit kios kosong yang valid.',
                ], 422);
            }

            // 3. Guard: Cek apakah ada kios yang sudah memiliki sewa Aktif
            $targetIds = $kiosTargets->pluck('Id_Kios');
            $conflictKios = Sewa::whereIn('Id_Kios', $targetIds)
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

            // 4. Parameter Waktu & Tarif
            $tanggalMulaiInput = $validatedData['Tanggal_Mulai'] ?? $request->tanggal_mulai ?? $request->tanggalMulai ?? date('Y-m-d');
            $periodeSewa = date('Y-m', strtotime($tanggalMulaiInput));
            $defaultJatuhTempo = date('Y-m-12', strtotime($tanggalMulaiInput));
            $jatuhTempoInput = $request->Jatuh_Tempo ?? $request->jatuh_tempo ?? $request->jatuhTempo ?? $defaultJatuhTempo;

            $tarifKiosMap = $request->tarif_kios_map ?? $request->tarifKiosMap ?? [];
            if (is_string($tarifKiosMap)) {
                $tarifKiosMap = json_decode($tarifKiosMap, true) ?: [];
            }

            $usahaKiosMap = $request->usaha_kios_map ?? $request->usahaKiosMap ?? [];
            if (is_string($usahaKiosMap)) {
                $usahaKiosMap = json_decode($usahaKiosMap, true) ?: [];
            }

            $createdSewas = [];

            foreach ($kiosTargets as $kiosTarget) {
                if (isset($tarifKiosMap[$kiosTarget->No_Kios]) && $tarifKiosMap[$kiosTarget->No_Kios] !== '') {
                    $tarifCustom = (float) $tarifKiosMap[$kiosTarget->No_Kios];
                } else {
                    $tarifCustom = (float) ($validatedData['Tarif_Bulanan'] ?? 0);
                }

                $jenisUsahaPerKios = !empty($usahaKiosMap[$kiosTarget->No_Kios]) ? $usahaKiosMap[$kiosTarget->No_Kios] : $validatedData['Jenis_Usaha'];

                $sewa = Sewa::create([
                    'Id_Kios'        => $kiosTarget->Id_Kios,
                    'Id_Pemilik'     => $validatedData['Id_Pemilik'],
                    'Tanggal_Mulai'  => $tanggalMulaiInput,
                    'Tanggal_Selesai'=> $validatedData['Tanggal_Selesai'] ?? null,
                    'Jenis_Usaha'    => $jenisUsahaPerKios,
                    'Tarif_Bulanan'  => $tarifCustom,
                    'Status'         => 'Aktif',
                    'Keterangan'     => $validatedData['Keterangan'] ?? null,
                ]);

                $kiosTarget->update(['Status' => 'Terisi']);

                // Buat tagihan perdana untuk kios ini
                \App\Models\Tagihan::create([
                    'Id_Sewa'          => $sewa->Id_Sewa,
                    'Periode'          => $periodeSewa,
                    'Jatuh_Tempo'      => $jatuhTempoInput,
                    'Tarif_Sewa'       => $tarifCustom,
                    'Hutang_Tunggakan' => 0.00,
                    'Total_Tagihan'    => $tarifCustom,
                    'Sisa_Tagihan'     => $tarifCustom,
                    'Status_Tagihan'   => 'Belum Bayar',
                ]);

                $createdSewas[] = $sewa;
            }

            return response()->json([
                'success' => true,
                'message' => count($createdSewas) . ' unit sewa kios berhasil ditambahkan ke tenant',
                'data'    => $createdSewas
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat transaksi sewa: ' . $e->getMessage()
            ], 500);
        }
    }


    /**
     * Display the specified resource.
     * GET /api/sewa/{id}
     */
    public function show($id)
    {
        try {
            $sewa = Sewa::with(['kios', 'pemilik', 'tagihan'])->find($id);

            if (!$sewa) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data sewa tidak ditemukan'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Detail data sewa ditemukan',
                'data'    => $sewa
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
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
                'message' => 'Data sewa tidak ditemukan'
            ], 404);
        }

        $validatedData = $request->validate([
            'Id_Pemilik'     => 'sometimes|required|exists:pemilik,Id_Pemilik',
            'Id_Kios'        => 'sometimes|required|exists:kios,Id_Kios',
            'Jenis_Usaha'    => 'sometimes|required|string|max:255',
            'Tanggal_Mulai'  => 'sometimes|required|date',
            'Tanggal_Selesai'=> 'sometimes|required|date',
            'Tarif_Bulanan'  => 'sometimes|nullable|numeric|min:0',
            'Keterangan'     => 'nullable|string',
        ]);

        try {
            $sewa->update($validatedData);

            return response()->json([
                'success' => true,
                'message' => 'Data sewa berhasil diperbarui',
                'data'    => $sewa->load(['kios', 'pemilik'])
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui data sewa: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     * DELETE /api/sewa/{id}
     */
    public function destroy($id)
    {
        try {
            $sewa = Sewa::find($id);

            if (!$sewa) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data sewa tidak ditemukan'
                ], 404);
            }

            // Keputusan bisnis #4 & #5 (dikonfirmasi 2026-08-12):
            // SOFT-DELETE — sewa TIDAK dihapus dari database.
            // Status kios dikembalikan ke 'Kosong', sewa diarsipkan sebagai 'Selesai'.
            // Seluruh riwayat tagihan & pembayaran tetap tersimpan permanen.
            $idKios = $sewa->Id_Kios;
            $sewa->update(['Status' => 'Selesai']);

            $kios = Kios::find($idKios);
            if ($kios) {
                $kios->update(['Status' => 'Kosong']);
            }

            return response()->json([
                'success' => true,
                'message' => 'Sewa berhasil diarsipkan (Status: Selesai). Kios kembali Kosong. Riwayat transaksi tetap tersimpan.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengarsipkan data sewa: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Terminate lease action.
     * POST /api/v1/admin/sewa/{id}/akhiri
     */
    public function akhiriSewa($id)
    {
        try {
            $sewa = Sewa::where('Id_Sewa', $id)->first()
                ?? Sewa::where('Id_Kios', $id)->where('Status', 'Aktif')->first()
                ?? Sewa::whereHas('kios', fn($q) => $q->where('No_Kios', $id))->where('Status', 'Aktif')->first();

            if (!$sewa) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data sewa tidak ditemukan'
                ], 404);
            }

            if ($sewa->Status === 'Selesai') {
                return response()->json([
                    'success' => false,
                    'message' => 'Sewa ini sudah berstatus Selesai sebelumnya.'
                ], 422);
            }

            // Keputusan bisnis #4 & #5 (dikonfirmasi 2026-08-12):
            // SOFT-DELETE — ubah Status sewa menjadi 'Selesai', TIDAK delete dari DB.
            // Tanggal_Selesai diisi hari ini jika belum diisi atau melewati hari ini.
            $idKios = $sewa->Id_Kios;
            $sewa->update([
                'Status'          => 'Selesai',
                'Tanggal_Selesai' => $sewa->Tanggal_Selesai ?? now()->toDateString(),
            ]);

            $kios = Kios::find($idKios);
            if ($kios) {
                $kios->update(['Status' => 'Kosong']);
            }

            return response()->json([
                'success' => true,
                'message' => 'Masa sewa berhasil diakhiri. Kios kembali Kosong. Riwayat transaksi tenant tetap tersimpan.',
                'data'    => [
                    'sewa' => $sewa->fresh(),
                    'kios' => $kios,
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengakhiri masa sewa: ' . $e->getMessage()
            ], 500);
        }
    }
}