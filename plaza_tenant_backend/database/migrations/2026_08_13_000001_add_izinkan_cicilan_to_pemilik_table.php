<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pemilik', function (Blueprint $table) {
            if (!Schema::hasColumn('pemilik', 'izinkan_cicilan')) {
                $table->boolean('izinkan_cicilan')->default(false)->after('Alamat');
            }
        });
    }

    public function down(): void
    {
        Schema::table('pemilik', function (Blueprint $table) {
            if (Schema::hasColumn('pemilik', 'izinkan_cicilan')) {
                $table->dropColumn('izinkan_cicilan');
            }
        });
    }
};
