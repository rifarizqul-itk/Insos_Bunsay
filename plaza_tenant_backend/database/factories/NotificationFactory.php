<?php

namespace Database\Factories;

use App\Models\Notification;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Factory for Notification model.
 */
class NotificationFactory extends Factory
{
    protected $model = Notification::class;

    public function definition(): array
    {
        return [
            'target_type' => fake()->randomElement(['tenant', 'admin']),
            'id_user'     => null,
            'title'       => 'Pemberitahuan Tagihan Sewa',
            'message'     => 'Tagihan sewa bulan ini telah terbit. Silakan lakukan pembayaran sebelum tanggal jatuh tempo.',
            'type'        => fake()->randomElement(['info', 'success', 'warning', 'danger']),
            'is_read'     => fake()->boolean(),
            'link'        => '/tenant/histori',
            'created_at'  => fake()->dateTimeBetween('-1 month', 'now'),
        ];
    }
}
