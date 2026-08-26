<?php

namespace App\Http\Controllers;

use App\Models\Dokumen;
use Illuminate\Http\Request;

class DokumenController extends Controller
{
    /**
     * Display a listing of the resource.
     * GET /api/dokumen
     */
    public function index()
    {
        try {
            // Mengambil semua dokumen beserta data pemiliknya
            $dokumen = Dokumen::with('pemilik')->get();

            return response()->json([
                'success' => true,
                'message' => 'Daftar dokumen berhasil diambil',
                'data'    => $dokumen
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data dokumen: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     * POST /api/dokumen
     */
    public function store(Request $request)
    {
        // 1. Validasi Input
        $validatedData = $request->validate([
            'Id_Pemilik'    => 'required|exists:pemilik,Id_Pemilik',
            'Jenis_Dokumen' => 'required|string|max:100', // Contoh: SP, PPJB, Sertifikat, KTP
            'Nomor_Dokumen' => 'nullable|string|max:255',
            'Tanggal'       => 'nullable|date',
        ]);

        try {
            // 2. Simpan Dokumen Baru
            $dokumen = Dokumen::create($validatedData);

            return response()->json([
                'success' => true,
                'message' => 'Dokumen berhasil ditambahkan',
                'data'    => $dokumen->load('pemilik')
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menambahkan dokumen: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     * GET /api/dokumen/{id}
     */
    public function show($id)
    {
        try {
            $dokumen = Dokumen::with('pemilik')->find($id);

            if (!$dokumen) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dokumen tidak ditemukan'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Detail dokumen ditemukan',
                'data'    => $dokumen
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
     * PUT/PATCH /api/dokumen/{id}
     */
    public function update(Request $request, $id)
    {
        $dokumen = Dokumen::find($id);

        if (!$dokumen) {
            return response()->json([
                'success' => false,
                'message' => 'Dokumen tidak ditemukan'
            ], 404);
        }

        $validatedData = $request->validate([
            'Id_Pemilik'    => 'sometimes|required|exists:pemilik,Id_Pemilik',
            'Jenis_Dokumen' => 'sometimes|required|string|max:100',
            'Nomor_Dokumen' => 'nullable|string|max:255',
            'Tanggal'       => 'nullable|date',
        ]);

        try {
            $dokumen->update($validatedData);

            return response()->json([
                'success' => true,
                'message' => 'Dokumen berhasil diperbarui',
                'data'    => $dokumen->load('pemilik')
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui dokumen: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     * DELETE /api/dokumen/{id}
     */
    public function destroy($id)
    {
        try {
            $dokumen = Dokumen::find($id);

            if (!$dokumen) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dokumen tidak ditemukan'
                ], 404);
            }

            $dokumen->delete();

            return response()->json([
                'success' => true,
                'message' => 'Dokumen berhasil dihapus'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus dokumen: ' . $e->getMessage()
            ], 500);
        }
    }
}