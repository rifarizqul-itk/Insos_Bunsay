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
        Schema::create('kios', function (Blueprint $table) {
            $table->integer('Id_Kios', true);
            $table->string('No_Kios', 10)->unique('no_kios');
            $table->integer('Lantai')->nullable();
            $table->string('Ukuran', 20)->nullable();
            $table->enum('Status', ['Terisi', 'Kosong'])->nullable()->default('Kosong');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kios');
    }
};
