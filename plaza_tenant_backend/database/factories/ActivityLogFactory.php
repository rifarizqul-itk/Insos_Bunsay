<?php

namespace Database\Factories;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Factory for ActivityLog model.
 */
class ActivityLogFactory extends Factory
{
    protected $model = ActivityLog::class;

    public function definition(): array
    {
        $modules = ['Pembayaran', 'Kios', 'Sewa', 'User', 'System'];
        $actions = ['Verifikasi Terima', 'Verifikasi Tolak', 'Tambah Kios', 'Akhiri Sewa', 'Update Tarif'];

        return [
            'id_user'    => 1,
            'username'   => 'admin',
            'role'       => 'admin',
            'modul'      => fake()->randomElement($modules),
            'aksi'       => fake()->randomElement($actions),
            'deskripsi'  => 'Admin melakukan tindakan simulasi pada sistem.',
            'ip_address' => '127.0.0.1',
            'created_at' => fake()->dateTimeBetween('-1 month', 'now'),
        ];
    }
}
