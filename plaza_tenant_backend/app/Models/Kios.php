<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kios extends Model
{
    use HasFactory;

    protected $table = 'kios';
    protected $primaryKey = 'Id_Kios';
    public $timestamps = false;
    protected $guarded = [];

    // ============================================================
    // RELASI ELOQUENT
    // ============================================================

    /**
     * Relasi Kios ke Sewa (1 Kios memiliki data Sewa)
     */
    public function sewa()
    {
        return $this->hasOne(Sewa::class, 'Id_Kios', 'Id_Kios');
    }
}