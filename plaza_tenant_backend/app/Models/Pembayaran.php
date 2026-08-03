<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pembayaran extends Model
{
    protected $table = 'pembayaran';
    protected $primaryKey = 'Id_Pembayaran';
    public $timestamps = false;
    protected $guarded = [];

    public function tagihan()
    {
        return $this->belongsTo(Tagihan::class, 'Id_Tagihan', 'Id_Tagihan');
    }
}