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
}
