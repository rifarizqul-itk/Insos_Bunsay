<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pembayaran extends Model
{
    use HasFactory;
    protected $table = 'pembayaran';
    protected $primaryKey = 'Id_Pembayaran';
    public $timestamps = true;
    protected $guarded = [];

    public function tagihan()
    {
        return $this->belongsTo(Tagihan::class, 'Id_Tagihan', 'Id_Tagihan');
    }

    /**
     * Rincian alokasi per tagihan (Pola Header-Detail).
     */
    public function details()
    {
        return $this->hasMany(PembayaranDetail::class, 'Id_Pembayaran', 'Id_Pembayaran');
    }

    public function getBuktiPembayaranAttribute($value)
    {
        if (!$value || !is_string($value)) {
            return $value;
        }

        $normalized = str_replace('\\', '/', $value);
        if (preg_match('#storage/(.+)$#', $normalized, $m)) {
            return 'storage/' . $m[1];
        }

        return $value;
    }

    public function getBuktiSanggahanAttribute($value)
    {
        if (!$value || !is_string($value)) {
            return $value;
        }

        $normalized = str_replace('\\', '/', $value);
        if (preg_match('#storage/(.+)$#', $normalized, $m)) {
            return 'storage/' . $m[1];
        }

        return $value;
    }
}