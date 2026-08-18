<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Seeder for Admin accounts across different sub_roles.
 */
class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $passwordHash = Hash::make('password123');

        $allPermissions = json_encode([
            'verifikasi_pembayaran',
            'input_setoran',
            'ekspor_laporan',
            'kelola_kios',
            'kelola_admin',
            'lihat_audit_log'
        ]);

        $kasirPermissions = json_encode([
            'input_setoran',
            'verifikasi_pembayaran'
        ]);

        $auditorPermissions = json_encode([
            'ekspor_laporan',
            'lihat_audit_log'
        ]);

        $admins = [
            [
                'Username'     => 'superadmin',
                'Password'     => $passwordHash,
                'nama_lengkap' => 'Superadmin Utama Plaza',
                'email'        => 'superadmin@bunsay.id',
                'sub_role'     => 'superadmin',
                'permissions'  => $allPermissions,
                'status_aktif' => 1,
            ],
            [
                'Username'     => 'admin',
                'Password'     => $passwordHash,
                'nama_lengkap' => 'Admin Pengelola Plaza',
                'email'        => 'admin@bunsay.id',
                'sub_role'     => 'admin',
                'permissions'  => $allPermissions,
                'status_aktif' => 1,
            ],
            [
                'Username'     => 'staff_loket',
                'Password'     => $passwordHash,
                'nama_lengkap' => 'Staff Loket Kasir',
                'email'        => 'staff.loket@bunsay.id',
                'sub_role'     => 'staff_loket',
                'permissions'  => $kasirPermissions,
                'status_aktif' => 1,
            ],
            [
                'Username'     => 'kasir_lisa',
                'Password'     => $passwordHash,
                'nama_lengkap' => 'Lisa Anggraini (Kasir)',
                'email'        => 'lisa.kasir@bunsay.id',
                'sub_role'     => 'staff_loket',
                'permissions'  => $kasirPermissions,
                'status_aktif' => 1,
            ],
            [
                'Username'     => 'auditor_budi',
                'Password'     => $passwordHash,
                'nama_lengkap' => 'Budi Santoso (Auditor Keuangan)',
                'email'        => 'budi.auditor@bunsay.id',
                'sub_role'     => 'auditor',
                'permissions'  => $auditorPermissions,
                'status_aktif' => 1,
            ],
        ];

        foreach ($admins as $adminData) {
            User::updateOrInsert(
                ['Username' => $adminData['Username']],
                array_merge($adminData, ['Id_roles' => 1])
            );
        }
    }
}
