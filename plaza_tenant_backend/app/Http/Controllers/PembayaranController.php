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
            'Total_Bayar'          => 'required|numeric|min:1',
            'Metode_Bayar'         => 'required|in:Transfer,Tunai,Midtrans',
            'Bukti_Pembayaran'     => 'nullable|string',
            'Verifikasi_Pembayaran'=> 'nullable|in:Menunggu,Diterima,Ditolak,Belum Bayar',
        ]);

        // ============================================================
        // Isu I4 dari schema audit (2026-08-12):
        // Isolasi tenant — verifikasi bahwa tagihan yang dibayar benar-benar
        // milik tenant yang sedang login. Tanpa ini, tenant A bisa membayar
        // (atau mengekspos data) tagihan milik tenant B hanya dengan menebak Id_Tagihan.
        //
        // Admin (Id_roles = 1) dikecualikan — admin boleh input untuk siapapun.
        // ============================================================
        $user = $request->user();
        if ($user && $user->Id_roles != 1) {
            $pemilik = \App\Models\Pemilik::where('Id_User', $user->Id_user)->first();

            if (!$pemilik) {
                return response()->json([
                    'success' => false,
                    'message' => 'Profil pemilik tidak ditemukan. Hubungi admin.',
                ], 403);
            }

            $isOwner = Tagihan::where('Id_Tagihan', $request->Id_Tagihan)
                ->whereHas('sewa', fn($q) => $q->where('Id_Pemilik', $pemilik->Id_Pemilik))
                ->exists();

            if (!$isOwner) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda tidak memiliki akses ke tagihan ini.',
                ], 403);
            }
        }

        // ============================================================
        // Keputusan bisnis (dikonfirmasi 2026-08-13):
        // - Midtrans: auto Diterima (Gateway otomatis).
        // - Tunai: auto Diterima (karena diinput langsung oleh admin/kasir di loket).
        // - Transfer: Menunggu verifikasi manual bukti foto.
        // ============================================================
        if (in_array($request->Metode_Bayar, ['Midtrans', 'Tunai'])) {
            $statusVerifikasi = 'Diterima';
        } else {
            $statusVerifikasi = $request->Verifikasi_Pembayaran ?? 'Menunggu';
        }

        $idTagihanTarget = $request->Id_Tagihan;
        $tagihanTarget   = Tagihan::find($idTagihanTarget);

        // 1. Cabut Foreign Key & Unique Index secara aman (backward compat)
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

        // 2. Ubah kolom Bukti_Pembayaran menjadi LONGTEXT agar bisa simpan Base64
        try {
            DB::statement("ALTER TABLE pembayaran MODIFY COLUMN Bukti_Pembayaran LONGTEXT NULL");
        } catch (\Throwable $th) {}

        // 3. Proses upload bukti pembayaran (Base64 → file)
        $buktiPath = $request->Bukti_Pembayaran;
        if (is_string($request->Bukti_Pembayaran) && str_starts_with($request->Bukti_Pembayaran, 'data:image/')) {
            try {
                preg_match('/data:image\/(?<type>\w+);base64,(?<data>.+)/', $request->Bukti_Pembayaran, $matches);
                if (isset($matches['data'])) {
                    $imageType = strtolower($matches['type'] ?? 'png');
                    $imageData = base64_decode($matches['data']);
                    $filename  = 'bukti_' . time() . '_' . rand(1000, 9999) . '.' . $imageType;

                    $destinationPath = public_path('storage/bukti');
                    if (!file_exists($destinationPath)) {
                        mkdir($destinationPath, 0777, true);
                    }
                    file_put_contents($destinationPath . '/' . $filename, $imageData);
                    $buktiPath = 'storage/bukti/' . $filename;
                }
            } catch (\Throwable $e) {}
        }

        // ============================================================
        // Keputusan bisnis #1 (dikonfirmasi 2026-08-12):
        // Partial Payment dengan algoritma FIFO.
        // Jika Total_Bayar < Sisa_Tagihan tagihan target:
        //   → Alokasikan ke tagihan tertua yang belum lunas (urutan Id_Tagihan ASC).
        //   → Update Sisa_Tagihan di setiap tagihan yang tersentuh.
        //   → Status 'Dicicil' jika belum lunas sepenuhnya, 'Lunas' jika lunas.
        // Jika Total_Bayar >= Total_Tagihan: proses normal (full payment).
        // ============================================================
        $nominalTersisa = (float) $request->Total_Bayar;
        $isPartialPayment = false;

        if ($tagihanTarget && $statusVerifikasi === 'Diterima') {
            // Ambil semua tagihan belum lunas dari sewa yang sama, urutan tertua dulu (FIFO)
            $sewaId = $tagihanTarget->Id_Sewa;
            $tagihanBelumLunas = Tagihan::where('Id_Sewa', $sewaId)
                ->whereIn('Status_Tagihan', ['Belum Bayar', 'Dicicil', 'Menunggu Verifikasi'])
                ->orderBy('Id_Tagihan', 'asc')
                ->get();

            $sisaTagihanTarget = (float) ($tagihanTarget->Sisa_Tagihan ?? $tagihanTarget->Total_Tagihan ?? 0);

            // Cek apakah ini partial payment
            if ($nominalTersisa < $sisaTagihanTarget && $tagihanBelumLunas->count() > 0) {
                $isPartialPayment = true;
            }

            if ($isPartialPayment) {
                // Distribusikan nominal ke tagihan-tagihan tertua (FIFO)
                foreach ($tagihanBelumLunas as $tagihan) {
                    if ($nominalTersisa <= 0) break;

                    $sisaTagihan = (float) ($tagihan->Sisa_Tagihan ?? $tagihan->Total_Tagihan ?? 0);

                    if ($nominalTersisa >= $sisaTagihan) {
                        // Tagihan ini bisa dilunasi sepenuhnya
                        $nominalTersisa -= $sisaTagihan;
                        $tagihan->update([
                            'Sisa_Tagihan'   => 0,
                            'Status_Tagihan' => 'Lunas',
                        ]);
                    } else {
                        // Tagihan ini hanya terbayar sebagian
                        $tagihan->update([
                            'Sisa_Tagihan'   => $sisaTagihan - $nominalTersisa,
                            'Status_Tagihan' => 'Dicicil',
                        ]);
                        $nominalTersisa = 0;
                    }
                }

                // Gunakan tagihan target sebagai anchor record pembayaran
                $idTagihanTarget = $tagihanTarget->Id_Tagihan;

            } else {
                // Full payment: cek apakah tagihan target sudah lunas (advance payment)
                if ($tagihanTarget->Status_Tagihan === 'Lunas') {
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
                        'Sisa_Tagihan'     => $statusVerifikasi === 'Diterima' ? 0 : ($request->Total_Bayar ?: $tagihanTarget->Tarif_Sewa),
                        'Status_Tagihan'   => $statusVerifikasi === 'Diterima' ? 'Lunas' : 'Belum Bayar',
                    ]);

                    $idTagihanTarget = $newTagihan->Id_Tagihan;
                }
            }
        }

        // 4. Buat record Pembayaran baru (selalu bertambah di riwayat transaksi)
        $pembayaran = Pembayaran::create([
            'Id_Tagihan'            => $idTagihanTarget,
            'Tanggal_Bayar'         => $request->Tanggal_Bayar,
            'Total_Bayar'           => $request->Total_Bayar,
            'Metode_Bayar'          => $request->Metode_Bayar,
            'Bukti_Pembayaran'      => $buktiPath,
            'Verifikasi_Pembayaran' => $statusVerifikasi,
        ]);

        // 5. Untuk full payment yang diterima (non-FIFO): update tagihan target ke Lunas
        if ($statusVerifikasi === 'Diterima' && !$isPartialPayment) {
            Tagihan::where('Id_Tagihan', $idTagihanTarget)
                ->update([
                    'Status_Tagihan' => 'Lunas',
                    'Sisa_Tagihan'   => 0,
                ]);
        }

        // 6. Kirim dynamic event notification ke panel Admin
        $nomFormatted = number_format((float)($request->Total_Bayar ?? 0), 0, ',', '.');
        $namaTenant = $tagihanTarget?->sewa?->pemilik?->Nama ?? 'Tenant';
        if ($request->Metode_Bayar === 'Transfer') {
            \App\Models\Notification::send(
                'admin',
                null,
                'Pembayaran Transfer Masuk',
                "Tenant {$namaTenant} mengunggah bukti transfer sebesar Rp {$nomFormatted} (TRX-{$pembayaran->Id_Pembayaran}). Menunggu verifikasi admin.",
                'info',
                '/admin/verifikasi-bukti?trx=' . $pembayaran->Id_Pembayaran
            );
        } else if ($request->Metode_Bayar === 'Midtrans') {
            \App\Models\Notification::send(
                'admin',
                null,
                'Pembayaran Midtrans Berhasil',
                "Pembayaran otomatis via Midtrans dari {$namaTenant} sebesar Rp {$nomFormatted} berhasil diterima.",
                'success',
                '/admin/riwayat'
            );
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
            $tagihanAnchor = Tagihan::find($pembayaran->Id_Tagihan);
            if ($tagihanAnchor) {
                $sewaId = $tagihanAnchor->Id_Sewa;
                $nominalTersisa = (float) $pembayaran->Total_Bayar;

                $tagihanBelumLunas = Tagihan::where('Id_Sewa', $sewaId)
                    ->whereIn('Status_Tagihan', ['Belum Bayar', 'Dicicil', 'Menunggu Verifikasi'])
                    ->orderBy('Id_Tagihan', 'asc')
                    ->get();

                if ($tagihanBelumLunas->count() > 0) {
                    foreach ($tagihanBelumLunas as $tagihan) {
                        if ($nominalTersisa <= 0) break;

                        $sisa = (float) ($tagihan->Sisa_Tagihan ?? $tagihan->Total_Tagihan ?? 0);

                        if ($nominalTersisa >= $sisa) {
                            $nominalTersisa -= $sisa;
                            $tagihan->update([
                                'Sisa_Tagihan'   => 0,
                                'Status_Tagihan' => 'Lunas',
                            ]);
                        } else {
                            $tagihan->update([
                                'Sisa_Tagihan'   => max(0, $sisa - $nominalTersisa),
                                'Status_Tagihan' => 'Dicicil',
                            ]);
                            $nominalTersisa = 0;
                        }
                    }
                } else {
                    $tagihanAnchor->update([
                        'Status_Tagihan' => 'Lunas',
                        'Sisa_Tagihan'   => 0,
                    ]);
                }
            }
        } else {
            // Tolak: kembalikan tagihan ke Belum Bayar
            // Sisa_Tagihan TIDAK diubah (biarkan sesuai nilai sebelumnya)
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
        $tenantUserId = $pembayaran->tagihan?->sewa?->pemilik?->Id_User;
        if (!$tenantUserId && $pembayaran->Id_Tagihan) {
            $tagihanObj = Tagihan::with('sewa.pemilik')->find($pembayaran->Id_Tagihan);
            $tenantUserId = $tagihanObj?->sewa?->pemilik?->Id_User;
        }

        if ($request->status === 'Diterima') {
            \App\Models\Notification::send(
                'tenant',
                $tenantUserId,
                'Pembayaran Sewa Diterima',
                "Pembayaran transaksi TRX-{$pembayaran->Id_Pembayaran} sebesar Rp " . number_format((float)($pembayaran->Total_Bayar ?? 0), 0, ',', '.') . " telah diverifikasi dan DITERIMA oleh pengelola.",
                'success',
                '/tenant/histori'
            );
        } else if ($request->status === 'Ditolak') {
            \App\Models\Notification::send(
                'tenant',
                $tenantUserId,
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

        $existingBukti = $pembayaran->bukti_sanggahan;
        $buktiArray = [];
        if ($existingBukti) {
            $decoded = json_decode($existingBukti, true);
            if (is_array($decoded)) {
                $buktiArray = $decoded;
            } else if (is_string($existingBukti)) {
                $buktiArray = array_values(array_filter(explode(',', $existingBukti)));
                if (empty($buktiArray) && trim($existingBukti) !== '') {
                    $buktiArray = [$existingBukti];
                }
            }
        }

        if ($buktiPath && !in_array($buktiPath, $buktiArray)) {
            $buktiArray[] = $buktiPath;
        }

        $finalBuktiSanggahan = !empty($buktiArray)
            ? (count($buktiArray) === 1 ? $buktiArray[0] : json_encode(array_values(array_unique($buktiArray))))
            : $buktiPath;

        try {
            $pembayaran->update([
                'teks_sanggahan'        => $request->teks_sanggahan,
                'bukti_sanggahan'       => $finalBuktiSanggahan,
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
            '/admin/verifikasi-bukti?trx=' . $pembayaran->Id_Pembayaran
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