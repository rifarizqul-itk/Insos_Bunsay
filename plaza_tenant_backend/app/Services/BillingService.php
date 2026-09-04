<?php

namespace App\Services;

use App\Models\Tagihan;
use Carbon\Carbon;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class BillingService
{
    private static bool $checkedInProcess = false;

    /**
     * Memastikan tagihan untuk bulan berjalan sudah diterbitkan.
     * 
     * PERFORMA:
     * - In-memory process cache (0ms dalam 1 siklus request).
     * - In-memory/DB Cache key dengan masa berlaku 1 bulan penuh.
     * - Dilengkapi Atomic Lock untuk mencegah race-condition saat pergantian bulan baru.
     */
    public static function ensureCurrentMonthBillsExist(): void
    {
        if (self::$checkedInProcess) {
            return;
        }

        $currentPeriod = Carbon::now()->format('Y-m');
        $cacheKey = "tagihan_checked_{$currentPeriod}";

        // Jalur instan jika bulan ini sudah diverifikasi
        if (Cache::get($cacheKey)) {
            self::$checkedInProcess = true;
            return;
        }

        try {
            // Lock selama 15 detik agar hanya 1 request yang memproses jika cron belum jalan
            Cache::lock("lock_generate_tagihan_{$currentPeriod}", 15)->get(function () use ($currentPeriod, $cacheKey) {
                // Double check setelah lock diperoleh
                if (Cache::get($cacheKey)) {
                    return;
                }

                $sudahAda = Tagihan::where('Periode', $currentPeriod)->exists();

                if (!$sudahAda) {
                    Artisan::call('tagihan:generate-bulanan', [
                        '--periode' => $currentPeriod,
                    ]);
                }

                // Simpan status sukses ke cache hingga akhir bulan + 1 hari
                $expiresAt = Carbon::now()->endOfMonth()->addDay();
                Cache::put($cacheKey, true, $expiresAt);
            });
        } catch (\Throwable $e) {
            // Safety net: kegagalan background check tidak boleh menggagalkan request utama user
            Log::warning("BillingService::ensureCurrentMonthBillsExist error: " . $e->getMessage());
        }
    }
}
