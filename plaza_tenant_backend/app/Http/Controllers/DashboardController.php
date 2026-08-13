<?php

namespace App\Http\Controllers;

use App\Models\Kios;
use App\Models\Pemilik;
use App\Models\Sewa;
use App\Models\Tagihan;
use App\Models\Pembayaran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function adminDashboard(Request $request)
    {
        $kiosStats = DB::table('kios')
            ->selectRaw('COUNT(*) as total, SUM(CASE WHEN Status = "Terisi" THEN 1 ELSE 0 END) as terisi, SUM(CASE WHEN Status = "Kosong" THEN 1 ELSE 0 END) as kosong')
            ->first();

        $tagihanStats = DB::table('tagihan')
            ->selectRaw('SUM(CASE WHEN Status_Tagihan = "Belum Bayar" THEN 1 ELSE 0 END) as pending, SUM(CASE WHEN Status_Tagihan = "Menunggu Verifikasi" THEN 1 ELSE 0 END) as menunggu')
            ->first();

        $pembayaranToday = DB::table('pembayaran')
            ->whereDate('Tanggal_Bayar', today())
            ->count();

        return response()->json([
            'total_kios'       => (int) ($kiosStats->total ?? 0),
            'kios_terisi'      => (int) ($kiosStats->terisi ?? 0),
            'kios_kosong'      => (int) ($kiosStats->kosong ?? 0),
            'tagihan_pending'  => (int) ($tagihanStats->pending ?? 0),
            'tagihan_menunggu' => (int) ($tagihanStats->menunggu ?? 0),
            'pembayaran_today' => (int) $pembayaranToday,
        ]);
    }

    public function tenantDashboard(Request $request)
    {
        $user = $request->user();

        $pemilik = Pemilik::where('Id_User', $user->Id_user)->with('sewa.tagihan', 'sewa.kios')->first();

        if (!$pemilik) {
            return response()->json(['message' => 'Data pemilik tidak ditemukan.'], 404);
        }

        // Ambil sewa aktif paling baru
        $sewaTerbaru = $pemilik->sewa->sortByDesc('Tanggal_Mulai')->first();
        $allTagihan = $pemilik->sewa->flatMap->tagihan;
        $tagihanBerjalan = $allTagihan->where('Status_Tagihan', '!=', 'Lunas')->sortByDesc('Id_Tagihan')->first()
            ?? $allTagihan->sortByDesc('Id_Tagihan')->first();

        // Kumpulkan semua nomor kios yang dimiliki pemilik ini
        $kiosList = $pemilik->sewa->map(fn($s) => optional($s->kios)->No_Kios)->filter()->unique()->values();

        return response()->json([
            'idPemilik'      => $pemilik->Id_Pemilik,
            'nama'           => $pemilik->Nama,
            'kios'           => $kiosList->implode(', '),
            'kiosList'       => $kiosList,
            'statusPemilik'  => $pemilik->Status_Pemilik,
            'izinkanCicilan' => (bool) ($pemilik->izinkan_cicilan ?? false),
            'siklusSewa' => $sewaTerbaru ? [
                'idSewa'         => $sewaTerbaru->Id_Sewa,
                'tanggalMulai'   => $sewaTerbaru->Tanggal_Mulai,
                'tanggalSelesai' => $sewaTerbaru->Tanggal_Selesai,
                'jatuhTempo'     => optional($tagihanBerjalan)->Jatuh_Tempo,
                'jenisUsaha'     => $sewaTerbaru->Jenis_Usaha,
                'tarifBulanan'   => (float) ($sewaTerbaru->Tarif_Bulanan ?? 750000),
            ] : null,
            'tagihanBerjalan' => $tagihanBerjalan ? [
                'idTagihan'       => $tagihanBerjalan->Id_Tagihan,
                'periode'         => $tagihanBerjalan->Periode,
                'tarifSewa'       => (float) ($tagihanBerjalan->Tarif_Sewa ?? $sewaTerbaru->Tarif_Bulanan ?? 750000),
                'hutangTunggakan' => (float) ($tagihanBerjalan->Hutang_Tunggakan ?? 0),
                'totalTagihan'    => (float) $tagihanBerjalan->Total_Tagihan,
                'statusTagihan'   => $tagihanBerjalan->Status_Tagihan,
            ] : null,
        ]);
    }
}
