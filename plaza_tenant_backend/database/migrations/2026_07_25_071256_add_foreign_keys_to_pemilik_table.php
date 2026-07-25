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
        Schema::table('pemilik', function (Blueprint $table) {
            $table->foreign(['Id_User'], 'pemilik_ibfk_1')->references(['Id_user'])->on('user')->onUpdate('cascade')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pemilik', function (Blueprint $table) {
            $table->dropForeign('pemilik_ibfk_1');
        });
    }
};
