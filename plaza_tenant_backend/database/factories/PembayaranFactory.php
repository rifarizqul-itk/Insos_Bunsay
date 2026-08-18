<?php

namespace Database\Factories;

use App\Models\Pembayaran;
use App\Models\Tagihan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Factory for Pembayaran model.
 */
class PembayaranFactory extends Factory
{
    protected $model = Pembayaran::class;

    public function definition(): array
    {
        return [
            'Id_Tagihan'           => Tagihan::factory(),
            'Tanggal_Bayar'        => now()->toDateString(),
            'Total_Bayar'          => 500000.00,
            'Metode_Bayar'         => fake()->randomElement(['Transfer', 'Tunai', 'Midtrans']),
            'Bukti_Pembayaran'     => 'storage/bukti/bukti_mock_' . rand(100, 999) . '.png',
            'Verifikasi_Pembayaran'=> 'Menunggu',
            'catatan_admin'        => null,
            'teks_sanggahan'       => null,
            'bukti_sanggahan'      => null,
        ];
    }

    public function diterima(): static
    {
        return $this->state(fn (array $attributes) => [
            'Verifikasi_Pembayaran' => 'Diterima',
        ]);
    }

    public function ditolak(string $alasan = 'Bukti transfer tidak jelas / nominal tidak sesuai.'): static
    {
        return $this->state(fn (array $attributes) => [
            'Verifikasi_Pembayaran' => 'Ditolak',
            'catatan_admin'        => $alasan,
        ]);
    }

    public function sanggahan(): static
    {
        return $this->state(fn (array $attributes) => [
            'Verifikasi_Pembayaran' => 'Menunggu',
            'catatan_admin'        => 'Bukti pembayaran blur',
            'teks_sanggahan'       => 'Mohon periksa kembali, saya sudah kirim foto ulang bukti transfer dari m-banking BNI.',
            'bukti_sanggahan'      => 'storage/bukti/sanggahan_mock_' . rand(100, 999) . '.png',
        ]);
    }
}
