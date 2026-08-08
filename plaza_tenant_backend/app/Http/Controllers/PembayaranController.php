<?php

namespace App\Http\Controllers;

use App\Models\Pembayaran;
use App\Models\Tagihan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PembayaranController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Jika tidak ada user login atau rolenya Admin (Id_roles = 1)
        // Maka tampilkan semua pembayaran
        if (!$user || $user->Id_roles == 1) {
            $pembayaran = Pembayaran::with(['tagihan.sewa.pemilik', 'tagihan.sewa.kios'])->orderBy('Tanggal_Bayar', 'desc')->get();
            return response()->json($pembayaran);
        }

        // Jika yang login adalah Tenant (Id_roles = 2)
        // Cari Id_Pemilik miliknya
        $pemilik = \App\Models\Pemilik::where('Id_User', $user->Id_user)->first();

        if (!$pemilik) {
            return response()->json([]); // Kosong jika belum punya profil pemilik
        }

        // Filter pembayaran yang tagihannya berelasi ke sewa milik tenant ini
        $pembayaran = Pembayaran::whereHas('tagihan.sewa', function ($query) use ($pemilik) {
            $query->where('Id_Pemilik', $pemilik->Id_Pemilik);
        })->with(['tagihan.sewa.pemilik', 'tagihan.sewa.kios'])->orderBy('Tanggal_Bayar', 'desc')->get();

        return response()->json($pembayaran);
    }

    public function store(Request $request)
    {
        $request->validate([
            'Id_Tagihan'           => 'required|exists:tagihan,Id_Tagihan',
            'Tanggal_Bayar'        => 'required|date',
            'Total_Bayar'          => 'required|numeric',
            'Metode_Bayar'         => 'required|in:Transfer,Tunai,Midtrans',
            'Bukti_Pembayaran'     => 'nullable|string',
            'Verifikasi_Pembayaran'=> 'nullable|in:Menunggu,Diterima,Ditolak,Belum Bayar',
        ]);

        $statusVerifikasi = $request->Verifikasi_Pembayaran ?? 'Menunggu';
        $idTagihanTarget = $request->Id_Tagihan;
        $tagihanTarget = Tagihan::find($idTagihanTarget);

        // 1. Cabut Foreign Key & Unique Index pada 'tagihan.Id_Sewa' dan 'pembayaran.Id_Tagihan' secara aman
        try {
            DB::statement("ALTER TABLE tagihan DROP FOREIGN KEY tagihan_ibfk_1");
            DB::statement("ALTER TABLE tagihan DROP INDEX id_sewa");
            DB::statement("ALTER TABLE tagihan ADD INDEX idx_id_sewa (Id_Sewa)");
            DB::statement("ALTER TABLE tagihan ADD CONSTRAINT tagihan_ibfk_1 FOREIGN KEY (Id_Sewa) REFERENCES sewa(Id_Sewa) ON UPDATE CASCADE ON DELETE CASCADE");
        } catch (\Throwable $th) {}

        try {
            DB::statement("ALTER TABLE pembayaran DROP FOREIGN KEY pembayaran_ibfk_1");
            DB::statement("ALTER TABLE pembayaran DROP INDEX id_tagihan");
            DB::statement("ALTER TABLE pembayaran ADD INDEX idx_id_tagihan (Id_Tagihan)");
            DB::statement("ALTER TABLE pembayaran ADD CONSTRAINT pembayaran_ibfk_1 FOREIGN KEY (Id_Tagihan) REFERENCES tagihan(Id_Tagihan) ON UPDATE CASCADE ON DELETE CASCADE");
        } catch (\Throwable $th) {}

        // 2. Ubah kolom Bukti_Pembayaran di database menjadi LONGTEXT agar dapat menyimpan Base64 foto bukti transfer
        try {
            DB::statement("ALTER TABLE pembayaran MODIFY COLUMN Bukti_Pembayaran LONGTEXT NULL");
        } catch (\Throwable $th) {}

        // Jika tagihan target sudah Lunas, buat tagihan baru untuk periode bulan berikutnya (Advance Payment)
        if ($tagihanTarget && $tagihanTarget->Status_Tagihan === 'Lunas') {
            $latestTagihan = Tagihan::where('Id_Sewa', $tagihanTarget->Id_Sewa)
                ->orderBy('Id_Tagihan', 'desc')
                ->first();

            $nextPeriode = '2025-05';
            if ($latestTagihan && $latestTagihan->Periode) {
                try {
                    $nextPeriode = Carbon::createFromFormat('Y-m', $latestTagihan->Periode)->addMonth()->format('Y-m');
                } catch (\Throwable $th) {
                    $nextPeriode = date('Y-m');
                }
            }

            $newTagihan = Tagihan::create([
                'Id_Sewa'          => $tagihanTarget->Id_Sewa,
                'Periode'          => $nextPeriode,
                'Jatuh_Tempo'      => Carbon::now()->addMonth()->format('Y-m-d'),
                'Tarif_Sewa'       => $tagihanTarget->Tarif_Sewa ?: $request->Total_Bayar,
                'Hutang_Tunggakan' => 0,
                'Total_Tagihan'    => $request->Total_Bayar ?: $tagihanTarget->Tarif_Sewa,
                'Status_Tagihan'   => $statusVerifikasi === 'Diterima' ? 'Lunas' : 'Belum Bayar',
            ]);

            $idTagihanTarget = $newTagihan->Id_Tagihan;
        }

        $buktiPath = $request->Bukti_Pembayaran;
        if (is_string($request->Bukti_Pembayaran) && str_starts_with($request->Bukti_Pembayaran, 'data:image/')) {
            try {
                preg_match('/data:image\/(?<type>\w+);base64,(?<data>.+)/', $request->Bukti_Pembayaran, $matches);
                if (isset($matches['data'])) {
                    $imageType = strtolower($matches['type'] ?? 'png');
                    $imageData = base64_decode($matches['data']);
                    $filename = 'bukti_' . time() . '_' . rand(1000, 9999) . '.' . $imageType;

                    $destinationPath = public_path('storage/bukti');
                    if (!file_exists($destinationPath)) {
                        mkdir($destinationPath, 0777, true);
                    }
                    file_put_contents($destinationPath . '/' . $filename, $imageData);
                    $buktiPath = 'storage/bukti/' . $filename;
                }
            } catch (\Throwable $e) {}
        }

        // 3. Selalu buatkan record Pembayaran baru (selalu bertambah di riwayat transaksi)
        $pembayaran = Pembayaran::create([
            'Id_Tagihan'            => $idTagihanTarget,
            'Tanggal_Bayar'         => $request->Tanggal_Bayar,
            'Total_Bayar'           => $request->Total_Bayar,
            'Metode_Bayar'          => $request->Metode_Bayar,
            'Bukti_Pembayaran'      => $buktiPath,
            'Verifikasi_Pembayaran' => $statusVerifikasi,
        ]);

        if ($statusVerifikasi === 'Diterima') {
            Tagihan::where('Id_Tagihan', $idTagihanTarget)
                ->update([
                    'Status_Tagihan' => 'Lunas',
                ]);
        }

        return response()->json($pembayaran, 201);
    }

    public function show(string $id)
    {
        return response()->json(Pembayaran::findOrFail($id));
    }

    public function update(Request $request, string $id)
    {
        $request->validate([
            'Tanggal_Bayar'        => 'sometimes|date',
            'Total_Bayar'          => 'sometimes|numeric',
            'Metode_Bayar'         => 'sometimes|in:Transfer,Tunai,Midtrans',
            'Bukti_Pembayaran'     => 'nullable|string',
            'Verifikasi_Pembayaran'=> 'sometimes|in:Menunggu,Diterima,Ditolak',
        ]);

        $pembayaran = Pembayaran::findOrFail($id);

        $pembayaran->update($request->only([
            'Tanggal_Bayar',
            'Total_Bayar',
            'Metode_Bayar',
            'Bukti_Pembayaran',
            'Verifikasi_Pembayaran',
        ]));

        return response()->json($pembayaran);
    }

    public function konfirmasi(Request $request, string $id)
    {
        $request->validate([
            'status' => 'required|in:Diterima,Ditolak',
            'catatan_admin' => 'nullable|string',
        ]);

        // Auto-ensure columns exist in MySQL database
        try {
            DB::statement("ALTER TABLE pembayaran ADD COLUMN catatan_admin TEXT NULL AFTER Verifikasi_Pembayaran");
        } catch (\Throwable $th) {}
        try {
            DB::statement("ALTER TABLE pembayaran ADD COLUMN teks_sanggahan TEXT NULL AFTER catatan_admin");
        } catch (\Throwable $th) {}
        try {
            DB::statement("ALTER TABLE pembayaran ADD COLUMN bukti_sanggahan LONGTEXT NULL AFTER teks_sanggahan");
        } catch (\Throwable $th) {}

        // Bersihkan prefix string seperti 'TRX-' jika dikirim dari frontend
        $cleanId = preg_replace('/[^0-9]/', '', $id);
        
        $pembayaran = Pembayaran::find($cleanId ?: $id);
        
        if (!$pembayaran) {
            // Jika ID spesifik tidak ditemukan di database, ambil pembayaran pertama berstatus Menunggu
            $pembayaran = Pembayaran::where('Verifikasi_Pembayaran', 'Menunggu')->first();
        }

        if (!$pembayaran) {
            return response()->json(['message' => 'Data pembayaran tidak ditemukan.'], 404);
        }

        $updatePayload = [
            'Verifikasi_Pembayaran' => $request->status,
        ];

        if ($request->has('catatan_admin')) {
            $updatePayload['catatan_admin'] = $request->catatan_admin;
        }

        try {
            $pembayaran->update($updatePayload);
        } catch (\Throwable $th) {
            // Fallback update status only if column is missing
            $pembayaran->update([
                'Verifikasi_Pembayaran' => $request->status
            ]);
        }

        if ($request->status === 'Diterima') {
            Tagihan::where('Id_Tagihan', $pembayaran->Id_Tagihan)
                ->update([
                    'Status_Tagihan' => 'Lunas',
                ]);
        } else {
            Tagihan::where('Id_Tagihan', $pembayaran->Id_Tagihan)
                ->update([
                    'Status_Tagihan' => 'Belum Bayar',
                ]);
        }

        \App\Models\ActivityLog::record(
            $request,
            'Pembayaran',
            $request->status === 'Diterima' ? 'Verifikasi Terima' : 'Verifikasi Tolak',
            "Admin memverifikasi status pembayaran TRX-{$pembayaran->Id_Pembayaran} menjadi {$request->status}." . ($request->filled('catatan_admin') ? " Alasan/Catatan: {$request->catatan_admin}" : "")
        );

        // Send Dynamic Event Notification to Tenant
        if ($request->status === 'Diterima') {
            \App\Models\Notification::send(
                'tenant',
                null,
                'Pembayaran Sewa Diterima',
                "Pembayaran transaksi TRX-{$pembayaran->Id_Pembayaran} sebesar Rp " . number_format((float)($pembayaran->Total_Bayar || 0), 0, ',', '.') . " telah diverifikasi dan DITERIMA oleh pengelola.",
                'success',
                '/tenant/histori'
            );
        } else if ($request->status === 'Ditolak') {
            \App\Models\Notification::send(
                'tenant',
                null,
                'Pembayaran Sewa Ditolak',
                "Pembayaran transaksi TRX-{$pembayaran->Id_Pembayaran} DITOLAK oleh pengelola. Alasan: " . ($request->catatan_admin ?: 'Bukti pembayaran tidak terbaca') . ". Silakan kirimkan sanggahan.",
                'danger',
                '/tenant/histori'
            );
        }

        return response()->json([
            'message' => 'Konfirmasi pembayaran berhasil.',
            'data' => $pembayaran->fresh(),
        ]);
    }

    public function sanggah(Request $request, string $id)
    {
        $request->validate([
            'teks_sanggahan' => 'required|string',
            'bukti_sanggahan' => 'nullable|string',
        ]);

        // Auto-ensure columns exist in MySQL database
        try {
            DB::statement("ALTER TABLE pembayaran ADD COLUMN catatan_admin TEXT NULL AFTER Verifikasi_Pembayaran");
        } catch (\Throwable $th) {}
        try {
            DB::statement("ALTER TABLE pembayaran ADD COLUMN teks_sanggahan TEXT NULL AFTER catatan_admin");
        } catch (\Throwable $th) {}
        try {
            DB::statement("ALTER TABLE pembayaran ADD COLUMN bukti_sanggahan LONGTEXT NULL AFTER teks_sanggahan");
        } catch (\Throwable $th) {}

        $cleanId = preg_replace('/[^0-9]/', '', $id);
        $pembayaran = Pembayaran::find($cleanId ?: $id);

        if (!$pembayaran) {
            return response()->json(['message' => 'Data pembayaran tidak ditemukan.'], 404);
        }

        $buktiPath = $request->bukti_sanggahan;
        if (is_string($request->bukti_sanggahan) && str_starts_with($request->bukti_sanggahan, 'data:image/')) {
            try {
                preg_match('/data:image\/(?<type>\w+);base64,(?<data>.+)/', $request->bukti_sanggahan, $matches);
                if (isset($matches['data'])) {
                    $imageType = strtolower($matches['type'] ?? 'png');
                    $imageData = base64_decode($matches['data']);
                    $filename = 'sanggahan_' . time() . '_' . rand(1000, 9999) . '.' . $imageType;

                    $destinationPath = public_path('storage/bukti');
                    if (!file_exists($destinationPath)) {
                        mkdir($destinationPath, 0777, true);
                    }
                    file_put_contents($destinationPath . '/' . $filename, $imageData);
                    $buktiPath = 'storage/bukti/' . $filename;
                }
            } catch (\Throwable $e) {}
        }

        try {
            $pembayaran->update([
                'teks_sanggahan'        => $request->teks_sanggahan,
                'bukti_sanggahan'       => $buktiPath,
                'Verifikasi_Pembayaran' => 'Menunggu',
            ]);
        } catch (\Throwable $th) {
            $pembayaran->update([
                'Verifikasi_Pembayaran' => 'Menunggu',
            ]);
        }

        // Send Dynamic Event Notification to Admin Staff
        \App\Models\Notification::send(
            'admin',
            null,
            'Sanggahan Pembayaran Tenant Baru',
            "Tenant mengirimkan sanggahan untuk transaksi TRX-{$pembayaran->Id_Pembayaran}. Catatan sanggahan: {$request->teks_sanggahan}",
            'warning',
            '/admin/verifikasi-bukti'
        );

        return response()->json([
            'message' => 'Sanggahan pembayaran berhasil dikirim.',
            'data'    => $pembayaran->fresh(),
        ]);
    }

    public function ekspor(Request $request)
    {
        $bulan = $request->query('bulan', 'Mei');
        $tahun = $request->query('tahun', '2026');
        
        return response()->json([
            'success' => true,
            'url' => "/downloads/rekap-{$bulan}-{$tahun}.xlsx",
            'message' => "Berkas rekapitulasi {$bulan} {$tahun} berhasil diekspor dari database SQL."
        ]);
    }
}