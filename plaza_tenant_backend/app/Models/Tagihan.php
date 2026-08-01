<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tagihan extends Model
{
    protected $table = 'tagihan';
    protected $primaryKey = 'Id_Tagihan';
    public $timestamps = false;
    protected $guarded = [];
}
