<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

/**
 * Menambah kolom Status ke tabel sewa.
 *
 * Keputusan bisnis #4 & #5 (dikonfirmasi 2026-08-12):
 * - Sewa TIDAK pernah dihapus secara permanen (soft-delete).
 * - Saat masa sewa berakhir, Status berubah menjadi 'Selesai'.
 * - Seluruh riwayat tagihan & pembayaran tetap tersimpan permanen.
 *
 * Migrasi ini backward-compatible: data lama otomatis mendapat Status = 'Aktif'.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sewa', function (Blueprint $table) {
            $table->enum('Status', ['Aktif', 'Selesai'])
                  ->default('Aktif')
                  ->after('Keterangan')
                  ->comment('Aktif = sewa berjalan | Selesai = soft-delete, data tetap ada');
        });

        // Set semua record lama menjadi 'Aktif' (data protection)
        DB::statement("UPDATE sewa SET Status = 'Aktif' WHERE Status IS NULL");
    }

    public function down(): void
    {
        Schema::table('sewa', function (Blueprint $table) {
            $table->dropColumn('Status');
        });
    }
};
