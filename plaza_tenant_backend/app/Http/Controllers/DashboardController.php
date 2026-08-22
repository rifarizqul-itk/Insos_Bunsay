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
        
        // Tagihan belum lunas dari seluruh kios
        $unpaidTagihanAll = $allTagihan->whereIn('Status_Tagihan', ['Belum Bayar', 'Dicicil', 'Menunggu Verifikasi']);
        $totalKewajibanSemua = (float) $unpaidTagihanAll->sum(fn($t) => (float)($t->Sisa_Tagihan ?? $t->Total_Tagihan ?? 0));

        // Tagihan periode berjalan (paling baru)
        $tagihanBerjalan = $allTagihan->sortByDesc('Periode')->first()
            ?? $allTagihan->sortByDesc('Id_Tagihan')->first();

        // Hitung tarif sewa bulan ini (paling baru) vs total tunggakan bulan-bulan sebelumnya
        $tarifBulanIni = ($tagihanBerjalan && in_array($tagihanBerjalan->Status_Tagihan, ['Belum Bayar', 'Dicicil', 'Menunggu Verifikasi']))
            ? (float) ($tagihanBerjalan->Sisa_Tagihan ?? $tagihanBerjalan->Total_Tagihan ?? $tagihanBerjalan->Tarif_Sewa ?? 0)
            : 0.0;
        
        $totalTunggakanLalu = max(0.0, $totalKewajibanSemua - $tarifBulanIni);

        // Kumpulkan breakdown tagihan per masing-masing unit kios
        $kiosBreakdown = $pemilik->sewa->map(function ($sewaItem) {
            $unpaidKiosBills = $sewaItem->tagihan->whereIn('Status_Tagihan', ['Belum Bayar', 'Dicicil', 'Menunggu Verifikasi']);
            $totalUnpaidKios = (float) $unpaidKiosBills->sum(fn($t) => (float)($t->Sisa_Tagihan ?? $t->Total_Tagihan ?? 0));

            $latestTagihan = $sewaItem->tagihan->sortByDesc('Periode')->first()
                ?? $sewaItem->tagihan->sortByDesc('Id_Tagihan')->first();

            return [
                'idSewa'         => $sewaItem->Id_Sewa,
                'noKios'         => optional($sewaItem->kios)->No_Kios ?? '—',
                'lantai'         => optional($sewaItem->kios)->Lantai ? 'Lantai ' . $sewaItem->kios->Lantai : 'Lantai 1',
                'ukuran'         => optional($sewaItem->kios)->Ukuran ?? '4x4 m²',
                'jenisUsaha'     => $sewaItem->Jenis_Usaha ?? '—',
                'tarifBulanan'   => (float) ($sewaItem->Tarif_Bulanan ?? 750000),
                'totalKewajiban' => $totalUnpaidKios,
                'unpaidCount'    => $unpaidKiosBills->count(),
                'tanggalMulai'   => $sewaItem->Tanggal_Mulai,
                'tanggalSelesai' => $sewaItem->Tanggal_Selesai,
                'tagihan'        => $latestTagihan ? [
                    'idTagihan'       => $latestTagihan->Id_Tagihan,
                    'periode'         => $latestTagihan->Periode,
                    'tarifSewa'       => (float) $latestTagihan->Tarif_Sewa,
                    'hutangTunggakan' => (float) ($latestTagihan->Hutang_Tunggakan ?? 0),
                    'totalTagihan'    => (float) $latestTagihan->Total_Tagihan,
                    'sisaTagihan'     => (float) ($latestTagihan->Sisa_Tagihan ?? $latestTagihan->Total_Tagihan),
                    'statusTagihan'   => $unpaidKiosBills->count() > 0 ? ($latestTagihan->Status_Tagihan === 'Lunas' ? 'Menunggak' : $latestTagihan->Status_Tagihan) : 'Lunas',
                    'jatuhTempo'      => $latestTagihan->Jatuh_Tempo,
                ] : null,
            ];
        })->values();

        // Kumpulkan semua nomor kios yang dimiliki pemilik ini
        $kiosList = $pemilik->sewa->map(fn($s) => optional($s->kios)->No_Kios)->filter()->unique()->values();

        return response()->json([
            'idPemilik'              => $pemilik->Id_Pemilik,
            'nama'                   => $pemilik->Nama,
            'nik'                    => $pemilik->No_KTP ?: '—',
            'telepon'                => $pemilik->No_Telepon ?: '—',
            'email'                  => $user->email ?? $user->Username,
            'alamat'                 => $pemilik->Alamat ?: '—',
            'kios'                   => $kiosList->implode(', '),
            'kiosList'               => $kiosList,
            'kiosBreakdown'          => $kiosBreakdown,
            'totalTagihanSemuaKios'  => (float) $totalKewajibanSemua,
            'totalTunggakanLalu'     => (float) $totalTunggakanLalu,
            'tarifBulanIni'          => (float) $tarifBulanIni,
            'statusPemilik'          => $pemilik->Status_Pemilik,
            'izinkanCicilan'         => (bool) ($pemilik->izinkan_cicilan ?? false),
            'detailAdministrasi'     => [
                'lantai'     => is_numeric($sewaTerbaru?->kios?->Lantai) ? "Lantai " . $sewaTerbaru->kios->Lantai : ($sewaTerbaru?->kios?->Lantai ?? 'Lantai 1'),
                'ukuran'     => $sewaTerbaru?->kios?->Ukuran ?? '4x4 m²',
                'sertifikat' => $sewaTerbaru?->kios?->Sertifikat ?? '—',
                'sp'         => '—',
                'ppjb'       => '—',
                'catatan'    => $sewaTerbaru?->kios?->Catatan ?? 'Izin usaha aktif.'
            ],
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
                'hutangTunggakan' => (float) ($totalTunggakanLalu),
                'totalTagihan'    => (float) $tagihanBerjalan->Total_Tagihan,
                'statusTagihan'   => $unpaidTagihanAll->count() > 0 ? ($tagihanBerjalan->Status_Tagihan === 'Lunas' ? 'Menunggak' : $tagihanBerjalan->Status_Tagihan) : 'Lunas',
            ] : null,
        ]);
    }
}
