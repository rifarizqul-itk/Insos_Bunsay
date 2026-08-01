<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    protected $table = 'roles';
    protected $primaryKey = 'Id_roles';
    public $timestamps = false;
    protected $guarded = [];
}
