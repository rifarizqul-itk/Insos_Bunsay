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
        Schema::create('pembayaran', function (Blueprint $table) {
            $table->integer('Id_Pembayaran', true);
            $table->integer('Id_Tagihan')->unique('id_tagihan');
            $table->date('Tanggal_Bayar')->nullable();
            $table->decimal('Total_Bayar', 12)->nullable();
            $table->enum('Metode_Bayar', ['Cash', 'Transfer'])->nullable();
            $table->string('Bukti_Pembayaran')->nullable();
            $table->enum('Verifikasi_Pembayaran', ['Menunggu', 'Diterima', 'Ditolak'])->nullable()->default('Menunggu');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pembayaran');
    }
};
