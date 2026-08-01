<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kios extends Model
{
    protected $table = 'kios';
    protected $primaryKey = 'Id_Kios';
    public $timestamps = false;
    protected $guarded = [];
}
