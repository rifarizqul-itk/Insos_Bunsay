<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Generate tagihan sewa otomatis setiap tanggal 1, pukul 07.00 WIB
// Jalankan manual: php artisan tagihan:generate-bulanan
// Preview tanpa simpan: php artisan tagihan:generate-bulanan --dry-run
// Paksa bulan tertentu: php artisan tagihan:generate-bulanan --periode=2026-09
Schedule::command('tagihan:generate-bulanan')
    ->monthlyOn(1, '07:00')
    ->timezone('Asia/Makassar')
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/tagihan-bulanan.log'));
