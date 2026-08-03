<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Dokumen extends Model
{
    use HasFactory;

    protected $table = 'dokumen';
    protected $primaryKey = 'Id_Dokumen';
    public $timestamps = false;
    protected $guarded = [];

    // ============================================================
    // RELASI ELOQUENT
    // ============================================================

    // Dokumen milik 1 Pemilik
    public function pemilik()
    {
        return $this->belongsTo(Pemilik::class, 'Id_Pemilik', 'Id_Pemilik');
    }
}