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
