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
            'No_Telepon' => 'nullable|string|max:20',
            'No_KTP'     => 'nullable|string|max:20',
            'Alamat'     => 'nullable|string',
            'Jenis_Usaha'=> 'nullable|string|max:255',
        ]);

        $validatedData['No_Telepon'] = $request->No_Telepon ?: ($request->Telepon ?: '081234567890');
        $validatedData['No_KTP']     = $request->No_KTP ?: ('6471' . rand(1000000000, 9999999999));
        $validatedData['Alamat']     = $request->Alamat ?: 'Plaza Kebun Sayur';
        $validatedData['Jenis_Usaha']= $request->Jenis_Usaha ?: 'Perdagangan Umum';

        try {
            // Otomatis buatkan akun User jika Id_User belum ada
            if (empty($validatedData['Id_User'])) {
                $cleanName = preg_replace('/[^a-zA-Z0-9]/', '', strtolower($request->Nama));
                $username = 'tenant_' . (strlen($cleanName) > 0 ? substr($cleanName, 0, 10) : 'user') . '_' . rand(100, 999);
                $plainPassword = 'bunsay' . rand(1000, 9999);
                $newUser = \App\Models\User::create([
                    'Id_roles' => 2,
                    'Username' => $username,
                    'Password' => \Illuminate\Support\Facades\Hash::make($plainPassword)
                ]);
                $validatedData['Id_User'] = $newUser->Id_user;
            }

            // 2. Simpan Data ke Database
            $pemilik = Pemilik::create($validatedData);
            $pemilik->load('user');

            // 3. Link ke Kios jika No_Kios disertakan
            if ($request->filled('No_Kios')) {
                $kiosTarget = \App\Models\Kios::where('No_Kios', $request->No_Kios)->first();
                if ($kiosTarget) {
                    $tarifCustom = (float) ($request->Tarif_Bulanan ?? $request->tarifBulanan ?? $request->Tarif_Sewa ?? 750000);
                    $newSewa = \App\Models\Sewa::create([
                        'Id_Kios'        => $kiosTarget->Id_Kios,
                        'Id_Pemilik'     => $pemilik->Id_Pemilik,
                        'Tanggal_Mulai'  => date('Y-m-d'),
                        'Tanggal_Selesai'=> date('Y-m-d', strtotime('+1 year')),
                        'Jenis_Usaha'    => $validatedData['Jenis_Usaha'],
                        'Tarif_Bulanan'  => $tarifCustom,
                        'Status'         => 'Aktif',
                    ]);
                    $kiosTarget->update(['Status' => 'Terisi']);

                    // Automatically generate first month's invoice (due on the 12th)
                    \App\Models\Tagihan::create([
                        'Id_Sewa'          => $newSewa->Id_Sewa,
                        'Periode'          => date('Y-m'),
                        'Jatuh_Tempo'      => date('Y-m-12'),
                        'Tarif_Sewa'       => $tarifCustom,
                        'Hutang_Tunggakan' => 0,
                        'Total_Tagihan'    => $tarifCustom,
                        'Sisa_Tagihan'     => $tarifCustom,
                        'Status_Tagihan'   => 'Belum Bayar',
                    ]);
                }
            }

            $responseData = $pemilik->toArray();
            $responseData['Username'] = $pemilik->user?->Username ?? $username ?? 'tenant';
            $responseData['tempPassword'] = $plainPassword ?? 'bunsay1234';

            return response()->json([
                'success' => true,
                'message' => 'Data pemilik berhasil ditambahkan',
                'data'    => $responseData
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

    public function toggleCicilan(Request $request, $id)
    {
        try {
            $pemilik = Pemilik::find($id);
            if (!$pemilik) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data pemilik tidak ditemukan'
                ], 404);
            }

            $newValue = !$pemilik->izinkan_cicilan;
            $pemilik->update(['izinkan_cicilan' => $newValue]);

            \App\Models\ActivityLog::record(
                $request,
                'Pemilik',
                'Toggle Izin Cicilan',
                "Admin " . ($newValue ? "MENGIZINKAN" : "MENCABUT") . " akses cicilan untuk tenant {$pemilik->Nama} (ID: {$pemilik->Id_Pemilik})."
            );

            return response()->json([
                'success'         => true,
                'message'         => 'Akses cicilan berhasil ' . ($newValue ? 'diberikan' : 'dicabut'),
                'izinkan_cicilan' => (bool) $newValue
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui status izin cicilan: ' . $e->getMessage()
            ], 500);
        }
    }
}