<?php

namespace App\Http\Controllers;

use App\Models\Pemilik;
use Illuminate\Http\Request;

class PemilikController extends Controller
{
    /**
     * Display a listing of the resource.
     * GET /api/pemilik
     */
    public function index()
    {
        try {
            // Mengambil semua pemilik beserta data akun user, dokumen, sewa, kios, dan tagihannya
            $pemilik = Pemilik::with(['user', 'dokumen', 'sewa.kios', 'sewa.tagihan'])->get();

            return response()->json([
                'success' => true,
                'message' => 'Daftar data pemilik berhasil diambil',
                'data'    => $pemilik
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data pemilik: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     * POST /api/pemilik
     */
    public function store(Request $request)
    {
        // 1. Validasi Input
        $validatedData = $request->validate([
            'Id_User'    => 'nullable',
            'Nama'       => 'required|string|max:255',
            'No_Telepon' => 'required|string|max:20',
            'No_KTP'     => 'required|string|max:20|unique:pemilik,No_KTP',
            'Alamat'     => 'required|string',
        ]);

        try {
            // Otomatis buatkan akun User jika Id_User belum ada
            if (empty($validatedData['Id_User'])) {
                $cleanName = preg_replace('/[^a-zA-Z0-9]/', '', strtolower($request->Nama));
                $username = 'tenant_' . (strlen($cleanName) > 0 ? substr($cleanName, 0, 10) : 'user') . '_' . rand(100, 999);
                $newUser = \App\Models\User::create([
                    'Id_roles' => 2,
                    'Username' => $username,
                    'Password' => \Illuminate\Support\Facades\Hash::make('123456')
                ]);
                $validatedData['Id_User'] = $newUser->Id_user;
            }

            // 2. Simpan Data ke Database
            $pemilik = Pemilik::create($validatedData);

            return response()->json([
                'success' => true,
                'message' => 'Data pemilik berhasil ditambahkan',
                'data'    => $pemilik
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menambahkan pemilik: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     * GET /api/pemilik/{id}
     */
    public function show($id)
    {
        try {
            $pemilik = Pemilik::with(['user', 'dokumen', 'sewa.kios'])->find($id);

            if (!$pemilik) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data pemilik tidak ditemukan'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Detail data pemilik ditemukan',
                'data'    => $pemilik
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
     * PUT/PATCH /api/pemilik/{id}
     */
    public function update(Request $request, $id)
    {
        $pemilik = Pemilik::find($id);

        if (!$pemilik) {
            return response()->json([
                'success' => false,
                'message' => 'Data pemilik tidak ditemukan'
            ], 404);
        }

        // Validasi input update (No_KTP diabaikan untuk ID pemilik ini sendiri)
        $validatedData = $request->validate([
            'Id_User'    => 'nullable|exists:users,id',
            'Nama'       => 'sometimes|required|string|max:255',
            'No_Telepon' => 'sometimes|required|string|max:20',
            'No_KTP'     => 'sometimes|required|string|max:20|unique:pemilik,No_KTP,' . $id . ',Id_Pemilik',
            'Alamat'     => 'sometimes|required|string',
        ]);

        try {
            $pemilik->update($validatedData);

            return response()->json([
                'success' => true,
                'message' => 'Data pemilik berhasil diperbarui',
                'data'    => $pemilik
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui data pemilik: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     * DELETE /api/pemilik/{id}
     */
    public function destroy($id)
    {
        try {
            $pemilik = Pemilik::find($id);

            if (!$pemilik) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data pemilik tidak ditemukan'
                ], 404);
            }

            $pemilik->delete();

            return response()->json([
                'success' => true,
                'message' => 'Data pemilik berhasil dihapus'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus pemilik (Mungkin data masih terikat dengan transaksi Sewa/Dokumen): ' . $e->getMessage()
            ], 500);
        }
    }
}