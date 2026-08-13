<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pemilik extends Model
{
    use HasFactory;
    protected $table = 'pemilik';
    protected $primaryKey = 'Id_Pemilik';
    public $timestamps = false;
    protected $guarded = [];
    protected $casts = [
        'izinkan_cicilan' => 'boolean',
    ];

    // ============================================================
    // RELASI ELOQUENT (Sesuai ERD kalian)
    // ============================================================

    // Relasi ke User (Akun Login)
    public function user()
    {
        return $this->belongsTo(User::class, 'Id_User', 'Id_user');
    }

    // Relasi ke Dokumen (No SP, PPJB, Sertifikat)
    public function dokumen()
    {
        return $this->hasMany(Dokumen::class, 'Id_Pemilik', 'Id_Pemilik');
    }

    // Relasi ke Sewa (Menghubungkan Pemilik ke Kios)
    public function sewa()
    {
        return $this->hasMany(Sewa::class, 'Id_Pemilik', 'Id_Pemilik');
    }
}