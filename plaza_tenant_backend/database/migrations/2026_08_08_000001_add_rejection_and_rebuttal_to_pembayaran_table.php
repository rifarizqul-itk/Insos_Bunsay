<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pembayaran', function (Blueprint $table) {
            if (!Schema::hasColumn('pembayaran', 'catatan_admin')) {
                $table->text('catatan_admin')->nullable();
            }
            if (!Schema::hasColumn('pembayaran', 'teks_sanggahan')) {
                $table->text('teks_sanggahan')->nullable();
            }
            if (!Schema::hasColumn('pembayaran', 'bukti_sanggahan')) {
                $table->longText('bukti_sanggahan')->nullable();
            }
        });
    }

    public function down(): void
    {
        try {
            DB::statement("ALTER TABLE pembayaran DROP COLUMN catatan_admin, DROP COLUMN teks_sanggahan, DROP COLUMN bukti_sanggahan");
        } catch (\Throwable $e) {}
    }
};
