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
}
