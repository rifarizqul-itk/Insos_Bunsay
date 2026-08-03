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
            'total_kios'       => Kios::count(),
            'kios_terisi'      => Kios::where('Status', 'Terisi')->count(),
            'kios_kosong'      => Kios::where('Status', 'Kosong')->count(),
            'tagihan_pending'  => Tagihan::where('Status_Tagihan', 'Belum Bayar')->count(),
            'tagihan_menunggu' => Tagihan::where('Status_Tagihan', 'Menunggu Verifikasi')->count(),
            'pembayaran_today' => Pembayaran::whereDate('Tanggal_Bayar', today())->count(),
        ]);
    }

    public function tenantDashboard(Request $request)
    {
        $user = $request->user();

        $pemilik = Pemilik::where('Id_User', $user->Id_user)->with('sewa.tagihan', 'sewa.kios')->first();

        if (!$pemilik) {
            return response()->json(['message' => 'Data pemilik tidak ditemukan.'], 404);
        }

        // Ambil sewa aktif paling baru (bulan berjalan)
        $sewaTerbaru = $pemilik->sewa->sortByDesc('Tanggal_Mulai')->first();
        $tagihanBerjalan = $sewaTerbaru?->tagihan?->sortByDesc('Periode')->first();

        // Kumpulkan semua nomor kios yang dimiliki pemilik ini
        $kiosList = $pemilik->sewa->map(fn($s) => optional($s->kios)->No_Kios)->filter()->unique()->values();

        return response()->json([
            'idPemilik'  => $pemilik->Id_Pemilik,
            'nama'       => $pemilik->Nama,
            'kios'       => $kiosList->implode(', '),
            'kiosList'   => $kiosList,
            'statusPemilik' => $pemilik->Status_Pemilik,
            'siklusSewa' => $sewaTerbaru ? [
                'idSewa'         => $sewaTerbaru->Id_Sewa,
                'tanggalMulai'   => $sewaTerbaru->Tanggal_Mulai,
                'tanggalSelesai' => $sewaTerbaru->Tanggal_Selesai,
                'jatuhTempo'     => optional($tagihanBerjalan)->Jatuh_Tempo,
                'jenisUsaha'     => $sewaTerbaru->Jenis_Usaha,
            ] : null,
            'tagihanBerjalan' => $tagihanBerjalan ? [
                'idTagihan'       => $tagihanBerjalan->Id_Tagihan,
                'periode'         => $tagihanBerjalan->Periode,
                'tarifSewa'       => (float) $tagihanBerjalan->Tarif_Sewa,
                'hutangTunggakan' => (float) ($tagihanBerjalan->Hutang_Tunggakan ?? 0),
                'totalTagihan'    => (float) $tagihanBerjalan->Total_Tagihan,
                'statusTagihan'   => $tagihanBerjalan->Status_Tagihan,
            ] : null,
        ]);
    }
}
