<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tagihan extends Model
{
    use HasFactory;
    protected $table = 'tagihan';
    protected $primaryKey = 'Id_Tagihan';
    public $timestamps = false;
    protected $guarded = [];

    public function sewa()
    {
        return $this->belongsTo(Sewa::class, 'Id_Sewa', 'Id_Sewa');
    }

    public function pembayaran()
    {
        return $this->hasMany(Pembayaran::class, 'Id_Tagihan', 'Id_Tagihan');
    }

    public function pembayaranDetails()
    {
        return $this->hasMany(PembayaranDetail::class, 'Id_Tagihan', 'Id_Tagihan');
    }
}
