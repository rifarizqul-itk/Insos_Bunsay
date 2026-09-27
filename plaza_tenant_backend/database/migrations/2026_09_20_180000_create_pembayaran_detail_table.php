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
        if (!Schema::hasTable('pembayaran_detail')) {
            Schema::create('pembayaran_detail', function (Blueprint $table) {
                $table->id('Id_Pembayaran_Detail');
                $table->integer('Id_Pembayaran');
                $table->integer('Id_Tagihan');
                $table->decimal('Nominal_Alokasi', 12, 2);
                $table->timestamps();

                // Foreign keys with cascade on delete
                $table->foreign('Id_Pembayaran')
                    ->references('Id_Pembayaran')->on('pembayaran')
                    ->onDelete('cascade');

                $table->foreign('Id_Tagihan')
                    ->references('Id_Tagihan')->on('tagihan')
                    ->onDelete('cascade');

                // Performance & query indexes
                $table->index(['Id_Pembayaran', 'Id_Tagihan'], 'idx_pembayaran_detail_relasi');
                $table->index('Id_Tagihan', 'idx_pembayaran_detail_tagihan');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pembayaran_detail');
    }
};
