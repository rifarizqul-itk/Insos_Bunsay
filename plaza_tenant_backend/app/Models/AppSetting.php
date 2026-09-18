<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppSetting extends Model
{
    protected $table = 'pengaturan_aplikasi';

    protected $fillable = [
        'key',
        'value',
        'tipe',
        'keterangan',
    ];

    public static function get(string $key, mixed $default = null): mixed
    {
        $setting = self::where('key', $key)->first();
        if (!$setting) {
            return $default;
        }

        return match ($setting->tipe) {
            'boolean' => filter_var($setting->value, FILTER_VALIDATE_BOOLEAN),
            'number'  => is_numeric($setting->value) ? (float) $setting->value : $default,
            'json'    => json_decode($setting->value, true) ?? $default,
            default   => $setting->value ?? $default,
        };
    }

    public static function set(string $key, mixed $value, ?string $tipe = null, ?string $keterangan = null): self
    {
        $setting = self::firstOrNew(['key' => $key]);

        if ($tipe !== null) {
            $setting->tipe = $tipe;
        }

        if ($keterangan !== null) {
            $setting->keterangan = $keterangan;
        }

        if (is_bool($value)) {
            $setting->value = $value ? '1' : '0';
            $setting->tipe = $setting->tipe ?: 'boolean';
        } elseif (is_array($value) || is_object($value)) {
            $setting->value = json_encode($value);
            $setting->tipe = $setting->tipe ?: 'json';
        } else {
            $setting->value = (string) $value;
        }

        $setting->save();
        return $setting;
    }

    public static function isPenaltyActive(): bool
    {
        return (bool) self::get('denda_keterlambatan_aktif', false);
    }

    public static function getPenaltyConfig(): array
    {
        return [
            'is_active' => self::isPenaltyActive(),
            'type'      => self::get('denda_tipe', 'fixed'), // 'fixed' or 'percentage'
            'nominal'   => (float) self::get('denda_nominal', 50000),
        ];
    }

    public static function calculatePenalty(float $billAmount): float
    {
        if (!self::isPenaltyActive()) {
            return 0.0;
        }

        $type = self::get('denda_tipe', 'fixed');
        $val = (float) self::get('denda_nominal', 50000);

        if ($type === 'percentage') {
            return round(($billAmount * $val) / 100, 2);
        }

        return max(0.0, $val);
    }
}
