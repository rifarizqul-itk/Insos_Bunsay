<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory;

    protected $table = 'user';
    protected $primaryKey = 'Id_user';
    public $timestamps = false;
    protected $guarded = [];
    protected $hidden = ['Password'];

    // ============================================================
    // RELASI ELOQUENT
    // ============================================================

    public function role()
    {
        return $this->belongsTo(Role::class, 'Id_roles', 'Id_roles');
    }

    public function pemilik()
    {
        return $this->hasOne(Pemilik::class, 'Id_User', 'Id_user');
    }

    public function activityLogs()
    {
        return $this->hasMany(ActivityLog::class, 'id_user', 'Id_user');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class, 'id_user', 'Id_user');
    }
}

