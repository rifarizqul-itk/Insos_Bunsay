<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('dokumen', function (Blueprint $table) {
            $table->foreign(['Id_Pemilik'], 'dokumen_ibfk_1')->references(['Id_Pemilik'])->on('pemilik')->onUpdate('cascade')->onDelete('cascade');
            $table->foreign(['Id_Kios'], 'dokumen_ibfk_2')->references(['Id_Kios'])->on('kios')->onUpdate('cascade')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dokumen', function (Blueprint $table) {
            $table->dropForeign('dokumen_ibfk_1');
            $table->dropForeign('dokumen_ibfk_2');
        });
    }
};
