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
        Schema::table('user', function (Blueprint $table) {
            if (!Schema::hasColumn('user', 'nama_lengkap')) {
                $table->string('nama_lengkap', 100)->nullable()->after('Username');
            }
            if (!Schema::hasColumn('user', 'email')) {
                $table->string('email', 100)->nullable()->after('nama_lengkap');
            }
            if (!Schema::hasColumn('user', 'sub_role')) {
                $table->string('sub_role', 50)->default('superadmin')->after('Id_roles');
            }
            if (!Schema::hasColumn('user', 'permissions')) {
                $table->text('permissions')->nullable()->after('sub_role');
            }
            if (!Schema::hasColumn('user', 'status_aktif')) {
                $table->tinyInteger('status_aktif')->default(1)->after('permissions');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user', function (Blueprint $table) {
            $table->dropColumn(['nama_lengkap', 'email', 'sub_role', 'permissions', 'status_aktif']);
        });
    }
};
