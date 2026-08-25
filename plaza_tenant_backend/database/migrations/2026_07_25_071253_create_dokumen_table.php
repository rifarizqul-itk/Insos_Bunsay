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
        Schema::create('dokumen', function (Blueprint $table) {
            $table->integer('Id_Dokumen', true);
            $table->integer('Id_Pemilik')->index('dokumen_id_pemilik_idx');
            $table->integer('Id_Kios')->index('dokumen_id_kios_idx');
            $table->enum('Jenis_Dokumen', ['Sertifikat', 'SP', 'PPJB', 'AJB']);
            $table->string('Nomor_Dokumen', 100)->nullable();
            $table->date('Tanggal')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dokumen');
    }
};
