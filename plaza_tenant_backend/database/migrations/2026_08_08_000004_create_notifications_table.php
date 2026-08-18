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
        if (!Schema::hasTable('notifications')) {
            Schema::create('notifications', function (Blueprint $table) {
                $table->id();
                $table->string('target_type', 20)->default('tenant'); // 'tenant' or 'admin'
                $table->integer('id_user')->nullable(); // null for broadcast to all admin
                $table->string('title', 150);
                $table->text('message');
                $table->string('type', 20)->default('info'); // 'success', 'warning', 'danger', 'info'
                $table->boolean('is_read')->default(false);
                $table->string('link', 255)->nullable();
                $table->timestamp('created_at')->useCurrent();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
