<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PembayaranDetail extends Model
{
    use HasFactory;

    protected $table = 'pembayaran_detail';
    protected $primaryKey = 'Id_Pembayaran_Detail';
    public $timestamps = true;
    protected $guarded = [];

    protected $appends = ['Nominal', 'nominal'];

    public function getNominalAttribute(): float
    {
        return (float) ($this->attributes['Nominal_Alokasi'] ?? 0);
    }

    /**
     * Relasi ke transaksi induk pembayaran.
     */
    public function pembayaran()
    {
        return $this->belongsTo(Pembayaran::class, 'Id_Pembayaran', 'Id_Pembayaran');
    }

    /**
     * Relasi ke tagihan yang dialokasikan.
     */
    public function tagihan()
    {
        return $this->belongsTo(Tagihan::class, 'Id_Tagihan', 'Id_Tagihan');
    }
}
