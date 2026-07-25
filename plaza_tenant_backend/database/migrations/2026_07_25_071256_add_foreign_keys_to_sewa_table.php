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
        Schema::table('sewa', function (Blueprint $table) {
            $table->foreign(['Id_Pemilik'], 'sewa_ibfk_1')->references(['Id_Pemilik'])->on('pemilik')->onUpdate('cascade')->onDelete('no action');
            $table->foreign(['Id_Kios'], 'sewa_ibfk_2')->references(['Id_Kios'])->on('kios')->onUpdate('cascade')->onDelete('no action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sewa', function (Blueprint $table) {
            $table->dropForeign('sewa_ibfk_1');
            $table->dropForeign('sewa_ibfk_2');
        });
    }
};
