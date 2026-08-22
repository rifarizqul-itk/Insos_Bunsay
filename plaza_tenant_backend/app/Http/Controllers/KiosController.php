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
        $kios = Kios::with(['sewa.pemilik'])->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar data kios berhasil diambil',
            'data'    => $kios
        ], 200);
    }

    /**
     * Display a listing of empty/available kiosks.
     * GET /api/v1/admin/kios/kosong
     */
    public function getKosong()
    {
        $kiosKosong = Kios::where('Status', 'Kosong')->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar data kios kosong berhasil diambil',
            'data'    => $kiosKosong
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     * POST /api/kios
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'No_Kios' => 'required|string|max:10|unique:kios,No_Kios',
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
        $kios = Kios::with(['sewa.pemilik.dokumen', 'sewa.pemilik.user', 'sewa.pemilik.sewa.kios'])->find($id)
            ?? Kios::with(['sewa.pemilik.dokumen', 'sewa.pemilik.user', 'sewa.pemilik.sewa.kios'])->where('No_Kios', $id)->first();

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
        $kios = Kios::with('sewa.pemilik')->find($id)
            ?? Kios::with('sewa.pemilik')->where('No_Kios', $id)->first();

        if (!$kios) {
            return response()->json([
                'success' => false,
                'message' => 'Data Kios tidak ditemukan'
            ], 404);
        }

        $kios->update([
            'No_Kios' => $request->input('nomorKios', $kios->No_Kios),
            'Lantai'  => $request->input('lantai', $kios->Lantai),
            'Catatan' => $request->input('catatan', $kios->Catatan),
            'Status'  => $request->input('statusKios', $kios->Status),
        ]);

        if ($request->has('tenant') && $kios->sewa && $kios->sewa->pemilik) {
            $kios->sewa->pemilik->update([
                'Nama' => $request->input('tenant')
            ]);
        }

        if ($request->has('tarifBulanan') && $kios->sewa) {
            $activeSewa = is_iterable($kios->sewa) ? $kios->sewa->first() : $kios->sewa;
            if ($activeSewa) {
                $activeSewa->update(['Tarif_Bulanan' => (float) $request->input('tarifBulanan')]);
            }
        }

        $kios->load(['sewa.pemilik.dokumen']);

        return response()->json([
            'success' => true,
            'message' => 'Data administrasi kios berhasil diperbarui di database',
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