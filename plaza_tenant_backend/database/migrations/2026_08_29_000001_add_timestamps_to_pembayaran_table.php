<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('pembayaran', function (Blueprint $table) {
            if (!Schema::hasColumn('pembayaran', 'created_at')) {
                $table->timestamp('created_at')->nullable()->after('Verifikasi_Pembayaran');
            }
            if (!Schema::hasColumn('pembayaran', 'updated_at')) {
                $table->timestamp('updated_at')->nullable()->after('created_at');
            }
        });

        // Populate existing created_at and updated_at based on Tanggal_Bayar
        DB::statement("UPDATE pembayaran SET created_at = CONCAT(Tanggal_Bayar, ' 09:30:00'), updated_at = CONCAT(Tanggal_Bayar, ' 09:30:00') WHERE created_at IS NULL AND Tanggal_Bayar IS NOT NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pembayaran', function (Blueprint $table) {
            if (Schema::hasColumn('pembayaran', 'created_at')) {
                $table->dropColumn('created_at');
            }
            if (Schema::hasColumn('pembayaran', 'updated_at')) {
                $table->dropColumn('updated_at');
            }
        });
    }
};
