<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class ActivityLog extends Model
{
    use HasFactory;
    protected $table = 'activity_logs';
    public $timestamps = false;
    protected $guarded = [];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    /**
     * Static helper to cleanly record audit log entries across controllers.
     */
    public static function record(?Request $request, string $modul, string $aksi, string $deskripsi): ?self
    {
        try {
            if (!Schema::hasTable('activity_logs')) {
                Schema::create('activity_logs', function (Blueprint $table) {
                    $table->id('id_log');
                    $table->unsignedBigInteger('id_user')->nullable();
                    $table->string('username', 100)->nullable();
                    $table->string('role', 50)->nullable();
                    $table->string('modul', 100);
                    $table->string('aksi', 100);
                    $table->text('deskripsi')->nullable();
                    $table->string('ip_address', 45)->nullable();
                    $table->timestamp('created_at')->useCurrent();
                });
            }

            $user = $request ? $request->user() : null;
            $username = $user ? $user->Username : 'system';
            $role = $user ? ($user->sub_role ?? 'admin') : 'system';
            $ip = $request ? $request->ip() : null;

            return self::create([
                'id_user'    => $user ? $user->Id_user : null,
                'username'   => $username,
                'role'       => $role,
                'modul'      => $modul,
                'aksi'       => $aksi,
                'deskripsi'  => $deskripsi,
                'ip_address' => $ip,
                'created_at' => now(),
            ]);
        } catch (\Throwable $e) {
            return null; // Fail-safe: don't break authentication if audit logging fails
        }
    }
}
