<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class ActivityLog extends Model
{
    protected $table = 'activity_logs';
    public $timestamps = false;
    protected $guarded = [];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    /**
     * Static helper to cleanly record audit log entries across controllers.
     */
    public static function record(?Request $request, string $modul, string $aksi, string $deskripsi): self
    {
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
    }
}
