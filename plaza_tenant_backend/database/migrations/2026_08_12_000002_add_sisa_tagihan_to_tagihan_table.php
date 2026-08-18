<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

/**
 * Menambah kolom Sisa_Tagihan ke tabel tagihan.
 *
 * Keputusan bisnis #1 (dikonfirmasi 2026-08-12):
 * - Sistem mendukung pembayaran parsial/cicilan (Partial Payment).
 * - Algoritma FIFO: nominal dibayar → dialokasikan ke tagihan tertua dulu.
 * - Sisa_Tagihan = sisa hutang yang belum terlunasi pada tagihan ini.
 * - Saat tagihan pertama kali dibuat: Sisa_Tagihan = Total_Tagihan.
 * - Saat pembayaran diterima: Sisa_Tagihan dikurangi sesuai nominal yang dialokasikan.
 * - Saat Sisa_Tagihan = 0: Status_Tagihan otomatis diubah ke 'Lunas'.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tagihan', function (Blueprint $table) {
            $table->decimal('Sisa_Tagihan', 12, 2)
                  ->nullable()
                  ->after('Total_Tagihan')
                  ->comment('Sisa hutang setelah pembayaran parsial. NULL = belum diinisialisasi (sama dengan Total_Tagihan)');
        });

        // Inisialisasi Sisa_Tagihan untuk semua tagihan yang belum Lunas
        // Tagihan lama yang Lunas dibiarkan NULL (tidak relevan)
        DB::statement("
            UPDATE tagihan
            SET Sisa_Tagihan = Total_Tagihan
            WHERE Status_Tagihan != 'Lunas'
              AND Sisa_Tagihan IS NULL
              AND Total_Tagihan IS NOT NULL
        ");
    }

    public function down(): void
    {
        Schema::table('tagihan', function (Blueprint $table) {
            $table->dropColumn('Sisa_Tagihan');
        });
    }
};
