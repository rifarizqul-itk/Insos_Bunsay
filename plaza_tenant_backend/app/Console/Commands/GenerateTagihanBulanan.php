<?php

namespace App\Console\Commands;

use App\Models\Sewa;
use App\Models\Tagihan;
use Carbon\Carbon;
use Illuminate\Console\Command;

class GenerateTagihanBulanan extends Command
{
    /**
     * Jalankan manual: php artisan tagihan:generate-bulanan
     * Berjalan otomatis tiap tanggal 1 pukul 07.00 WIB (lihat routes/console.php)
     */
    protected $signature = 'tagihan:generate-bulanan
                            {--periode= : Paksa periode tertentu, format YYYY-MM (opsional, default bulan berjalan)}
                            {--dry-run  : Preview tanpa menyimpan ke database}';

    protected $description = 'Generate tagihan sewa bulanan otomatis untuk semua sewa aktif yang belum punya tagihan di periode berjalan.';

    public function handle(): int
    {
        $isDryRun  = $this->option('dry-run');
        $periodeOpt = $this->option('periode');

        // Tentukan periode yang akan di-generate
        $periode = $periodeOpt
            ? Carbon::createFromFormat('Y-m', $periodeOpt)->startOfMonth()
            : Carbon::now()->startOfMonth();

        $periodeStr  = $periode->format('Y-m');
        $jatuhTempo  = $periode->copy()->day(12)->format('Y-m-d'); // Jatuh tempo tanggal 12

        $this->info("=== Generate Tagihan Bulanan ===");
        $this->info("Periode  : {$periodeStr}");
        $this->info("Jth Tempo: {$jatuhTempo}");
        $isDryRun && $this->warn("Mode     : DRY RUN (tidak ada data disimpan)");
        $this->newLine();

        // Ambil semua sewa aktif beserta relasi yang dibutuhkan
        $sewaAktif = Sewa::aktif()->with(['pemilik', 'tagihan'])->get();

        $this->info("Total sewa aktif: {$sewaAktif->count()}");
        $this->newLine();

        $generated = 0;
        $skipped   = 0;

        foreach ($sewaAktif as $sewa) {
            // Cek apakah tagihan untuk periode ini sudah ada
            $sudahAda = $sewa->tagihan
                ->where('Periode', $periodeStr)
                ->isNotEmpty();

            if ($sudahAda) {
                $this->line("  [SKIP] Sewa #{$sewa->Id_Sewa} — tagihan {$periodeStr} sudah ada.");
                $skipped++;
                continue;
            }

            // Ambil tarif dari field Tarif_Bulanan di tabel sewa,
            // atau fallback ke tagihan terakhir jika ada, lalu ke default 750.000
            $tagahanTerakhir = $sewa->tagihan->sortByDesc('Periode')->first();
            $tarif = $sewa->Tarif_Bulanan
                ?? $tagahanTerakhir?->Tarif_Sewa
                ?? 750000.00;

            $namaPemilik = $sewa->pemilik?->Nama ?? "Sewa #{$sewa->Id_Sewa}";

            if ($isDryRun) {
                $this->line("  [DRY]  Sewa #{$sewa->Id_Sewa} ({$namaPemilik}) — akan dibuat Rp " . number_format($tarif, 0, ',', '.'));
            } else {
                Tagihan::create([
                    'Id_Sewa'          => $sewa->Id_Sewa,
                    'Periode'          => $periodeStr,
                    'Jatuh_Tempo'      => $jatuhTempo,
                    'Tarif_Sewa'       => $tarif,
                    'Hutang_Tunggakan' => 0.00,
                    'Total_Tagihan'    => $tarif,
                    'Sisa_Tagihan'     => $tarif,
                    'Status_Tagihan'   => 'Belum Bayar',
                ]);

                if ($sewa->pemilik && $sewa->pemilik->Id_User) {
                    \App\Models\Notification::send(
                        'tenant',
                        $sewa->pemilik->Id_User,
                        'Tagihan Sewa Bulan Baru',
                        "Tagihan sewa periode {$periodeStr} sebesar Rp " . number_format($tarif, 0, ',', '.') . " telah diterbitkan. Batas jatuh tempo: {$jatuhTempo}.",
                        'info',
                        '/tenant/pembayaran'
                    );
                }

                $this->line("  [OK]   Sewa #{$sewa->Id_Sewa} ({$namaPemilik}) — Tagihan Rp " . number_format($tarif, 0, ',', '.') . " dibuat.");
            }

            $generated++;
        }

        $this->newLine();
        $this->info("Selesai! Dibuat: {$generated} tagihan | Dilewati: {$skipped} (sudah ada).");

        return Command::SUCCESS;
    }
}
