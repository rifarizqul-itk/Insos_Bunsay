<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class Sewa extends Model
{
    use HasFactory;

    protected $table = 'sewa';
    protected $primaryKey = 'Id_Sewa';
    public $timestamps = false;
    protected $guarded = [];

    /**
     * Cast kolom Status ke string agar konsisten.
     * Default: 'Aktif' (sesuai migrasi 2026_08_12_000001)
     */
    protected $casts = [
        'Tarif_Bulanan' => 'float',
    ];

    protected $attributes = [
        'Status'        => 'Aktif',
        'Tarif_Bulanan' => 750000.00,
    ];

    // ============================================================
    // LOCAL QUERY SCOPES
    // Keputusan bisnis #4 & #5 (dikonfirmasi 2026-08-12):
    // Sewa tidak pernah dihapus permanen. Gunakan scope ini
    // untuk memfilter sewa aktif vs yang sudah selesai.
    // ============================================================

    /**
     * Scope: hanya ambil sewa yang masih berjalan.
     * Contoh: Sewa::aktif()->with('kios')->get()
     *
     * @param Builder $query
     * @return Builder
     */
    public function scopeAktif(Builder $query): Builder
    {
        return $query->where('Status', 'Aktif');
    }

    /**
     * Scope: hanya ambil sewa yang sudah selesai (riwayat).
     * Contoh: Sewa::selesai()->where('Id_Pemilik', $id)->get()
     *
     * @param Builder $query
     * @return Builder
     */
    public function scopeSelesai(Builder $query): Builder
    {
        return $query->where('Status', 'Selesai');
    }

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

    // Sewa punya banyak Tagihan (tetap ada meski Status = 'Selesai')
    public function tagihan()
    {
        return $this->hasMany(Tagihan::class, 'Id_Sewa', 'Id_Sewa');
    }
}