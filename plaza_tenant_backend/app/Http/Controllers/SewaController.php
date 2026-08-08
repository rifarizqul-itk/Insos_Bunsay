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
    public function index()
    {
        try {
            // Mengambil semua transaksi sewa beserta relasi Kios & Pemilik
            $sewa = Sewa::with(['kios', 'pemilik'])->get();

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
            'Keterangan'     => 'nullable|string',
        ]);

        try {
            // 2. Simpan Transaksi Sewa
            $sewa = Sewa::create($validatedData);

            // 3. Otomatis Update Status Kios menjadi 'Terisi'
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

            // Kembalikan status Kios menjadi 'Kosong' jika sewa dihapus/dibatalkan
            $idKios = $sewa->Id_Kios;
            $sewa->delete();

            $kios = Kios::find($idKios);
            if ($kios) {
                $kios->update(['Status' => 'Kosong']);
            }

            return response()->json([
                'success' => true,
                'message' => 'Transaksi sewa berhasil dihapus dan status kios kembali Kosong'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus data sewa: ' . $e->getMessage()
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
            $sewa = Sewa::find($id);

            if (!$sewa) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data sewa tidak ditemukan'
                ], 404);
            }

            $idKios = $sewa->Id_Kios;
            $sewa->delete();

            $kios = Kios::find($idKios);
            if ($kios) {
                $kios->update(['Status' => 'Kosong']);
            }

            return response()->json([
                'success' => true,
                'message' => 'Masa sewa berhasil diakhiri dan status kios kembali Kosong',
                'data'    => $kios
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengakhiri masa sewa: ' . $e->getMessage()
            ], 500);
        }
    }
}