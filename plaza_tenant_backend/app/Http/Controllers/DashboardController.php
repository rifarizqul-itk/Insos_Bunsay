<?php

namespace App\Http\Controllers;

use App\Models\Kios;
use App\Models\Pemilik;
use App\Models\Sewa;
use App\Models\Tagihan;
use App\Models\Pembayaran;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function adminDashboard(Request $request)
    {
        return response()->json([
            'total_kios'        => Kios::count(),
            'kios_terisi'       => Kios::where('Status', 'Terisi')->count(),
            'kios_kosong'       => Kios::where('Status', 'Kosong')->count(),
            'tagihan_pending'   => Tagihan::where('Status_Tagihan', 'Belum Bayar')->count(),
            'tagihan_menunggu'  => Tagihan::where('Status_Tagihan', 'Menunggu Verifikasi')->count(),
            'pembayaran_today'  => Pembayaran::whereDate('Tanggal_Bayar', today())->count(),
        ]);
    }

    public function tenantDashboard(Request $request)
    {
        $user = $request->user();

        $pemilik = Pemilik::where('Id_User', $user->Id_user)->first();

        if (!$pemilik) {
            return response()->json(['message' => 'Data pemilik tidak ditemukan.'], 404);
        }

        $sewa = Sewa::where('Id_Pemilik', $pemilik->Id_Pemilik)->get();
        $sewaIds = $sewa->pluck('Id_Sewa');
        $tagihan = Tagihan::whereIn('Id_Sewa', $sewaIds)->get();

        return response()->json([
            'pemilik' => $pemilik,
            'sewa'    => $sewa,
            'tagihan' => $tagihan,
        ]);
    }
}
