<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sewa', function (Blueprint $table) {
            if (!Schema::hasColumn('sewa', 'Tarif_Bulanan')) {
                $table->decimal('Tarif_Bulanan', 12, 2)->default(750000.00)->after('Jenis_Usaha');
            }
        });
    }

    public function down(): void
    {
        Schema::table('sewa', function (Blueprint $table) {
            if (Schema::hasColumn('sewa', 'Tarif_Bulanan')) {
                $table->dropColumn('Tarif_Bulanan');
            }
        });
    }
};
