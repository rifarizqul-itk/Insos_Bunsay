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
        Schema::create('tagihan', function (Blueprint $table) {
            $table->integer('Id_Tagihan', true);
            $table->integer('Id_Sewa')->unique('id_sewa');
            $table->char('Periode', 7)->nullable();
            $table->date('Jatuh_Tempo')->nullable();
            $table->decimal('Tarif_Sewa', 12)->nullable();
            $table->decimal('Hutang_Tunggakan', 12)->nullable()->default(0);
            $table->decimal('Total_Tagihan', 12)->nullable();
            $table->enum('Status_Tagihan', ['Lunas', 'Belum Bayar', 'Menunggu Verifikasi'])->nullable()->default('Belum Bayar');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tagihan');
    }
};
