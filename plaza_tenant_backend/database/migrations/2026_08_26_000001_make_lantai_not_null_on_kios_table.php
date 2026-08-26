<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Mengubah kolom Lantai pada tabel kios menjadi NOT NULL dengan default 1.
     */
    public function up(): void
    {
        if (DB::getDriverName() === 'mysql') {
            // 1. Data safety: pastikan tidak ada data yang NULL sebelum alter NOT NULL
            DB::statement("UPDATE kios SET Lantai = 1 WHERE Lantai IS NULL");

            // 2. Ubah kolom Lantai menjadi NOT NULL dengan default 1
            DB::statement("ALTER TABLE kios MODIFY COLUMN Lantai INT NOT NULL DEFAULT 1");
        } else {
            Schema::table('kios', function (Blueprint $table) {
                $table->integer('Lantai')->default(1)->nullable(false)->change();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE kios MODIFY COLUMN Lantai INT NULL DEFAULT NULL");
        } else {
            Schema::table('kios', function (Blueprint $table) {
                $table->integer('Lantai')->nullable()->default(null)->change();
            });
        }
    }
};
