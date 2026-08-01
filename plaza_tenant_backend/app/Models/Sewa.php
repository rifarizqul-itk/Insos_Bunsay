<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sewa extends Model
{
    protected $table = 'sewa';
    protected $primaryKey = 'Id_Sewa';
    public $timestamps = false;
    protected $guarded = [];
}
