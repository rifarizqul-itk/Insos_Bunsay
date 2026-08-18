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
            'Id_Kios'        => 'required|exists:kios,Id_Kios',
            'Jenis_Usaha'    => 'required|string|max:255',
            'Tanggal_Mulai'  => 'required|date',
            'Tanggal_Selesai'=> 'required|date|after_or_equal:Tanggal_Mulai',
            'Tarif_Bulanan'  => 'nullable|numeric|min:0',
            'Keterangan'     => 'nullable|string',
        ]);

        try {
            // 2. Guard: Cek apakah kios ini sudah punya sewa Aktif
            // Isu I3 dari schema audit (2026-08-12):
            // MySQL tidak support partial unique index, sehingga constraint ini
            // ditegakkan di application layer. Satu kios hanya boleh memiliki
            // SATU sewa berstatus 'Aktif' pada satu waktu.
            $sewaAktifExist = Sewa::where('Id_Kios', $request->Id_Kios)
                ->where('Status', 'Aktif')
                ->exists();

            if ($sewaAktifExist) {
                return response()->json([
                    'success' => false,
                    'message' => 'Kios ini sudah memiliki sewa aktif. Akhiri sewa yang ada terlebih dahulu sebelum membuat sewa baru.',
                ], 422);
            }

            // 3. Simpan Transaksi Sewa dengan Status default 'Aktif'
            $validatedData['Status'] = 'Aktif';
            $sewa = Sewa::create($validatedData);

            // 4. Otomatis Update Status Kios menjadi 'Terisi'
            $kios = Kios::find($request->Id_Kios);
            if ($kios) {
                $kios->update(['Status' => 'Terisi']);
            }

            return response()->json([
                'success' => true,
                'message' => 'Transaksi sewa kios berhasil dibuat',
                'data'    => $sewa->load(['kios', 'pemilik'])
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