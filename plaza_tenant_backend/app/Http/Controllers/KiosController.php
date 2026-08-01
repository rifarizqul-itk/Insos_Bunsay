<?php

namespace App\Http\Controllers;

use App\Models\Kios;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class KiosController extends Controller
{
    /**
     * Display a listing of the resource.
     * GET /api/kios
     */
    public function index()
    {
        $kios = Kios::all();

        return response()->json([
            'success' => true,
            'message' => 'Daftar data kios berhasil diambil',
            'data'    => $kios
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     * POST /api/kios
     */
    public function store(Request $request)
    {
        // Validasi input data sesuai struktur kolom migration
        $validator = Validator::make($request->all(), [
            'No_Kios' => 'required|string|max:10|unique:kios,No_Kios',
            'Lantai'  => 'nullable|integer',
            'Ukuran'  => 'nullable|string|max:20',
            'Status'  => 'nullable|in:Terisi,Kosong',
        ]);

        // Jika validasi gagal
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors()
            ], 422);
        }

        // Simpan data ke database
        $kios = Kios::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Kios berhasil ditambahkan',
            'data'    => $kios
        ], 201);
    }

    /**
     * Display the specified resource.
     * GET /api/kios/{id}
     */
    public function show($id)
    {
        $kios = Kios::find($id);

        if (!$kios) {
            return response()->json([
                'success' => false,
                'message' => 'Data kios tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail data kios',
            'data'    => $kios
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     * PUT /api/kios/{id}
     */
    public function update(Request $request, $id)
    {
        $kios = Kios::find($id);

        if (!$kios) {
            return response()->json([
                'success' => false,
                'message' => 'Data kios tidak ditemukan'
            ], 404);
        }

        // Validasi input update (No_Kios unik kecuali untuk kios ini sendiri)
        $validator = Validator::make($request->all(), [
            'No_Kios' => 'required|string|max:10|unique:kios,No_Kios,' . $id . ',Id_Kios',
            'Lantai'  => 'nullable|integer',
            'Ukuran'  => 'nullable|string|max:20',
            'Status'  => 'nullable|in:Terisi,Kosong',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors()
            ], 422);
        }

        // Update data kios
        $kios->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Data kios berhasil diperbarui',
            'data'    => $kios
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     * DELETE /api/kios/{id}
     */
    public function destroy($id)
    {
        $kios = Kios::find($id);

        if (!$kios) {
            return response()->json([
                'success' => false,
                'message' => 'Data kios tidak ditemukan'
            ], 404);
        }

        $kios->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data kios berhasil dihapus'
        ], 200);
    }
}