<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sewa extends Model
{
    use HasFactory;

    protected $table = 'sewa';
    protected $primaryKey = 'Id_Sewa';
    public $timestamps = false; // Set true jika tabel sewa pakai created_at & updated_at
    protected $guarded = [];

    // ============================================================
    // RELASI ELOQUENT
    // ============================================================

    // Sewa milik 1 Kios
    public function kios()
    {
        return $this->belongsTo(Kios::class, 'Id_Kios', 'Id_Kios');
    }

    // Sewa milik 1 Pemilik
    public function pemilik()
    {
        return $this->belongsTo(Pemilik::class, 'Id_Pemilik', 'Id_Pemilik');
    }

    // Sewa punya banyak Tagihan
    public function tagihan()
    {
        return $this->hasMany(Tagihan::class, 'Id_Sewa', 'Id_Sewa');
    }
}