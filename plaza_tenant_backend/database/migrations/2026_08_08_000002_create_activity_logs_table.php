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
        if (!Schema::hasTable('activity_logs')) {
            Schema::create('activity_logs', function (Blueprint $table) {
                $table->id();
                $table->integer('id_user')->nullable();
                $table->string('username', 100);
                $table->string('role', 50)->default('admin');
                $table->string('modul', 50); // e.g. Pembayaran, Kios, Setoran, User, System
                $table->string('aksi', 50);  // e.g. Verifikasi Terima, Verifikasi Tolak, Setoran Tunai, Tambah Staf, Akhiri Sewa
                $table->text('deskripsi');
                $table->string('ip_address', 45)->nullable();
                $table->timestamp('created_at')->useCurrent();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
