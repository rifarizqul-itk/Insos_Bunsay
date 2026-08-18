<?php

namespace Database\Factories;

use App\Models\Tagihan;
use App\Models\Sewa;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Factory for Tagihan model.
 */
class TagihanFactory extends Factory
{
    protected $model = Tagihan::class;

    public function definition(): array
    {
        $tarif = fake()->randomElement([500000.00, 750000.00, 1000000.00, 1250000.00, 1500000.00]);
        $periode = date('Y-m');
        $dueDate = date('Y-m-25');

        return [
            'Id_Sewa'          => Sewa::factory(),
            'Periode'          => $periode,
            'Jatuh_Tempo'      => $dueDate,
            'Tarif_Sewa'       => $tarif,
            'Hutang_Tunggakan' => 0.00,
            'Total_Tagihan'    => $tarif,
            'Sisa_Tagihan'     => $tarif,
            'Status_Tagihan'   => 'Belum Bayar',
        ];
    }

    public function lunas(): static
    {
        return $this->state(fn (array $attributes) => [
            'Sisa_Tagihan'   => 0.00,
            'Status_Tagihan' => 'Lunas',
        ]);
    }

    public function dicicil(float $sisa): static
    {
        return $this->state(fn (array $attributes) => [
            'Sisa_Tagihan'   => $sisa,
            'Status_Tagihan' => 'Dicicil',
        ]);
    }

    public function menungguVerifikasi(): static
    {
        return $this->state(fn (array $attributes) => [
            'Status_Tagihan' => 'Menunggu Verifikasi',
        ]);
    }
}
