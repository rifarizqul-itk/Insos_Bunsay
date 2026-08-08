<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        try {
            DB::statement("ALTER TABLE pembayaran ADD COLUMN catatan_admin TEXT NULL AFTER Verifikasi_Pembayaran");
        } catch (\Throwable $e) {}

        try {
            DB::statement("ALTER TABLE pembayaran ADD COLUMN teks_sanggahan TEXT NULL AFTER catatan_admin");
        } catch (\Throwable $e) {}

        try {
            DB::statement("ALTER TABLE pembayaran ADD COLUMN bukti_sanggahan LONGTEXT NULL AFTER teks_sanggahan");
        } catch (\Throwable $e) {}
    }

    public function down(): void
    {
        try {
            DB::statement("ALTER TABLE pembayaran DROP COLUMN catatan_admin, DROP COLUMN teks_sanggahan, DROP COLUMN bukti_sanggahan");
        } catch (\Throwable $e) {}
    }
};
