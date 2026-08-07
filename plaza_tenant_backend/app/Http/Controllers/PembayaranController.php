<?php

namespace App\Http\Controllers;

use App\Models\Pembayaran;
use App\Models\Tagihan;
use Illuminate\Http\Request;

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
            \Illuminate\Support\Facades\DB::statement("ALTER TABLE tagihan DROP FOREIGN KEY tagihan_ibfk_1");
            \Illuminate\Support\Facades\DB::statement("ALTER TABLE tagihan DROP INDEX id_sewa");
            \Illuminate\Support\Facades\DB::statement("ALTER TABLE tagihan ADD INDEX idx_id_sewa (Id_Sewa)");
            \Illuminate\Support\Facades\DB::statement("ALTER TABLE tagihan ADD CONSTRAINT tagihan_ibfk_1 FOREIGN KEY (Id_Sewa) REFERENCES sewa(Id_Sewa) ON UPDATE CASCADE ON DELETE CASCADE");
        } catch (\Throwable $th) {}

        try {
            \Illuminate\Support\Facades\DB::statement("ALTER TABLE pembayaran DROP FOREIGN KEY pembayaran_ibfk_1");
            \Illuminate\Support\Facades\DB::statement("ALTER TABLE pembayaran DROP INDEX id_tagihan");
            \Illuminate\Support\Facades\DB::statement("ALTER TABLE pembayaran ADD INDEX idx_id_tagihan (Id_Tagihan)");
            \Illuminate\Support\Facades\DB::statement("ALTER TABLE pembayaran ADD CONSTRAINT pembayaran_ibfk_1 FOREIGN KEY (Id_Tagihan) REFERENCES tagihan(Id_Tagihan) ON UPDATE CASCADE ON DELETE CASCADE");
        } catch (\Throwable $th) {}

        // 2. Ubah kolom Bukti_Pembayaran di database menjadi LONGTEXT agar dapat menyimpan Base64 foto bukti transfer tanpa error SQL 1406
        try {
            \Illuminate\Support\Facades\DB::statement("ALTER TABLE pembayaran MODIFY COLUMN Bukti_Pembayaran LONGTEXT NULL");
        } catch (\Throwable $th) {}

        // 2. Jika tagihan target sudah Lunas, buat tagihan baru untuk periode bulan berikutnya (Advance Payment)
        if ($tagihanTarget && $tagihanTarget->Status_Tagihan === 'Lunas') {
            $latestTagihan = Tagihan::where('Id_Sewa', $tagihanTarget->Id_Sewa)
                ->orderBy('Id_Tagihan', 'desc')
                ->first();

            $nextPeriode = '2025-05';
            if ($latestTagihan && $latestTagihan->Periode) {
                try {
                    $nextPeriode = \Carbon\Carbon::createFromFormat('Y-m', $latestTagihan->Periode)->addMonth()->format('Y-m');
                } catch (\Throwable $th) {
                    $nextPeriode = date('Y-m');
                }
            }

            $newTagihan = Tagihan::create([
                'Id_Sewa'          => $tagihanTarget->Id_Sewa,
                'Periode'          => $nextPeriode,
                'Jatuh_Tempo'      => \Carbon\Carbon::now()->addMonth()->format('Y-m-d'),
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
        ]);

        // bersihkan prefix string seperti 'TRX-' jika dikirim dari frontend
        $cleanId = preg_replace('/[^0-9]/', '', $id);
        
        $pembayaran = Pembayaran::find($cleanId ?: $id);
        
        if (!$pembayaran) {
            // Jika ID spesifik tidak ditemukan di database, ambil pembayaran pertama berstatus Menunggu
            $pembayaran = Pembayaran::where('Verifikasi_Pembayaran', 'Menunggu')->first();
        }

        if (!$pembayaran) {
            return response()->json(['message' => 'Data pembayaran tidak ditemukan.'], 404);
        }

        $pembayaran->update([
            'Verifikasi_Pembayaran' => $request->status,
        ]);

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

        return response()->json([
            'message' => 'Konfirmasi pembayaran berhasil.',
            'data' => $pembayaran,
        ]);
    }
}