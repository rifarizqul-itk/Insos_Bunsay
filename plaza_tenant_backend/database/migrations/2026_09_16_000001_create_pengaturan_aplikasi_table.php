<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pengaturan_aplikasi', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('tipe')->default('string'); // string, boolean, number, json
            $table->string('keterangan')->nullable();
            $table->timestamps();
        });

        // Seed default penalty settings
        DB::table('pengaturan_aplikasi')->insert([
            [
                'key' => 'denda_keterlambatan_aktif',
                'value' => '0',
                'tipe' => 'boolean',
                'keterangan' => 'Status aktif sistem denda keterlambatan pembayaran',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'denda_tipe',
                'value' => 'fixed', // 'fixed' | 'percentage'
                'tipe' => 'string',
                'keterangan' => 'Tipe perhitungan denda: fixed (nominal tetap) atau percentage (persentase dari tagihan)',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'denda_nominal',
                'value' => '50000',
                'tipe' => 'number',
                'keterangan' => 'Nominal tetap denda (Rp) atau persentase (%)',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('pengaturan_aplikasi');
    }
};
