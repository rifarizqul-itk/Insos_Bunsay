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
        Schema::create('pemilik', function (Blueprint $table) {
            $table->integer('Id_Pemilik', true);
            $table->integer('Id_User')->unique('id_user');
            $table->string('Nama', 50);
            $table->string('No_Telepon', 20)->nullable();
            $table->string('No_KTP', 20)->nullable();
            $table->text('Alamat')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pemilik');
    }
};
