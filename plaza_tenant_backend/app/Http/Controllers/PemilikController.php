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
        // Merge field aliases before validation
        $request->merge([
            'No_Telepon' => $request->No_Telepon ?: ($request->Telepon ?: null),
            'No_KTP'     => $request->No_KTP ?: ($request->nik ?: null),
            'Alamat'     => $request->Alamat ?: ($request->alamat ?: null),
        ]);

        // 1. Validasi Input
        $validatedData = $request->validate([
            'Id_User'    => 'nullable',
            'Nama'       => 'required|string|max:255',
            'No_Telepon' => 'required|string|max:20',
            'No_KTP'     => 'required|string|max:20',
            'Alamat'     => 'required|string',
            'Jenis_Usaha'=> 'nullable|string|max:255',
        ]);

        $jenisUsaha = $request->Jenis_Usaha ?: 'Perdagangan Umum';
        unset($validatedData['Jenis_Usaha']);

        try {
            // Otomatis buatkan akun User jika Id_User belum ada
            if (empty($validatedData['Id_User'])) {
                $customUsername = trim($request->Username ?? $request->username ?? '');
                if (!empty($customUsername)) {
                    $finalUsername = preg_replace('/[^a-zA-Z0-9_-]/', '', strtolower($customUsername));
                    if (\App\Models\User::where('Username', $finalUsername)->exists()) {
                        $finalUsername = $finalUsername . rand(10, 99);
                    }
                } else {
                    $cleanName = preg_replace('/[^a-zA-Z0-9]/', '', strtolower($request->Nama));
                    $prefix = (strlen($cleanName) > 0 ? substr($cleanName, 0, 10) : 'user');
                    $finalUsername = 'tenant_' . $prefix . '_' . rand(100, 999);
                }

                $plainPassword = 'bunsay' . rand(1000, 9999);

                $newUser = \App\Models\User::create([
                    'Id_roles'    => 2,
                    'sub_role'    => 'tenant',
                    'status_aktif'=> 1,
                    'Username'    => $finalUsername,
                    'Password'    => \Illuminate\Support\Facades\Hash::make($plainPassword),
                    'nama_lengkap'=> $request->Nama,
                    'email'       => $request->Email ?? $request->email ?? null,
                ]);
                $validatedData['Id_User'] = $newUser->Id_user;
                $username = $finalUsername;
            }

            // 2. Simpan Data ke Database
            $pemilik = Pemilik::create($validatedData);
            $pemilik->load('user');

            // 3. Link ke Kios jika No_Kios atau kios_list disertakan
            $kiosListRaw = $request->kios_list ?? $request->No_Kios ?? [];
            $kiosList = is_array($kiosListRaw)
                ? $kiosListRaw
                : (is_string($kiosListRaw) ? array_filter(array_map('trim', explode(',', $kiosListRaw))) : []);

            $assignedKiosNames = [];
            foreach ($kiosList as $noKiosItem) {
                if (empty($noKiosItem)) continue;
                $kiosTarget = \App\Models\Kios::where('No_Kios', $noKiosItem)->first();
                if ($kiosTarget) {
                    $tarifCustom = (float) ($request->Tarif_Bulanan ?? $request->tarifBulanan ?? $request->Tarif_Sewa ?? 750000);
                    $newSewa = \App\Models\Sewa::create([
                        'Id_Kios'        => $kiosTarget->Id_Kios,
                        'Id_Pemilik'     => $pemilik->Id_Pemilik,
                        'Tanggal_Mulai'  => date('Y-m-d'),
                        'Tanggal_Selesai'=> $request->Tanggal_Selesai ?? null,
                        'Jenis_Usaha'    => $jenisUsaha,
                        'Tarif_Bulanan'  => $tarifCustom,
                        'Status'         => 'Aktif',
                    ]);
                    $kiosTarget->update(['Status' => 'Terisi']);
                    $assignedKiosNames[] = $kiosTarget->No_Kios;

                    // Automatically generate first month's invoice (due on the 25th)
                    \App\Models\Tagihan::create([
                        'Id_Sewa'          => $newSewa->Id_Sewa,
                        'Periode'          => date('Y-m'),
                        'Jatuh_Tempo'      => date('Y-m-25'),
                        'Tarif_Sewa'       => $tarifCustom,
                        'Hutang_Tunggakan' => 0,
                        'Total_Tagihan'    => $tarifCustom,
                        'Sisa_Tagihan'     => $tarifCustom,
                        'Status_Tagihan'   => 'Belum Bayar',
                    ]);
                }
            }

            if (!empty($assignedKiosNames) && !empty($pemilik->Id_User)) {
                $kiosStr = implode(', ', $assignedKiosNames);
                \App\Models\Notification::send(
                    'tenant',
                    $pemilik->Id_User,
                    'Selamat Datang di Portal Tenant Bunsay',
                    "Halo Bpk/Ibu {$pemilik->Nama}, akun tenant Anda untuk Kios {$kiosStr} telah aktif.",
                    'success',
                    '/tenant/dashboard'
                );
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
            'Id_User'    => 'nullable|exists:user,Id_user',
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
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengubah status cicilan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reset password akun tenant dari panel admin dan simpan langsung ke database.
     * POST /api/v1/admin/pemilik/{id}/reset-password
     */
    public function resetPassword(Request $request, $id)
    {
        try {
            $pemilik = Pemilik::with('user')->find($id);
            if (!$pemilik) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data pemilik tidak ditemukan.'
                ], 404);
            }

            // Generate password baru atau gunakan password custom
            $tempPassword = $request->password ?: ('bunsay' . rand(1000, 9999));
            $passwordHash = \Illuminate\Support\Facades\Hash::make($tempPassword);

            // Cek apakah pemilik sudah terhubung dengan akun User
            if ($pemilik->user) {
                $pemilik->user->update([
                    'Password'     => $passwordHash,
                    'status_aktif' => 1,
                ]);
                $username = $pemilik->user->Username;
            } else {
                // Buat akun User baru jika belum ada
                $cleanName = preg_replace('/[^a-zA-Z0-9]/', '', strtolower($pemilik->Nama));
                $prefix = (strlen($cleanName) > 0 ? substr($cleanName, 0, 10) : 'user');
                $finalUsername = 'tenant_' . $prefix . '_' . rand(100, 999);
                while (\App\Models\User::where('Username', $finalUsername)->exists()) {
                    $finalUsername = 'tenant_' . $prefix . '_' . rand(100, 999);
                }

                $newUser = \App\Models\User::create([
                    'Id_roles'    => 2,
                    'sub_role'    => 'tenant',
                    'status_aktif'=> 1,
                    'Username'    => $finalUsername,
                    'Password'    => $passwordHash,
                    'nama_lengkap'=> $pemilik->Nama,
                    'email'       => $pemilik->Email ?? null,
                ]);
                $pemilik->update(['Id_User' => $newUser->Id_user]);
                $username = $finalUsername;
            }

            \App\Models\ActivityLog::record(
                $request,
                'Pemilik',
                'Reset Password Tenant',
                "Admin mereset kata sandi tenant {$pemilik->Nama} (Username: {$username})."
            );

            return response()->json([
                'success'      => true,
                'message'      => 'Kata sandi tenant berhasil diperbarui di database.',
                'data'         => [
                    'username'     => $username,
                    'tempPassword' => $tempPassword,
                    'nama'         => $pemilik->Nama,
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mereset kata sandi: ' . $e->getMessage()
            ], 500);
        }
    }
}