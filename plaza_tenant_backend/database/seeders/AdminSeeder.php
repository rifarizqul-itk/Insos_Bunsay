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
        $adminPasswordHash = Hash::make('admin123');

        $allPermissions = json_encode([
            'verifikasi_pembayaran',
            'input_setoran',
            'ekspor_laporan',
            'kelola_kios',
            'kelola_admin',
            'lihat_audit_log'
        ]);

        $verifPermissions = json_encode([
            'verifikasi_pembayaran',
        ]);

        $kasirPermissions = json_encode([
            'input_setoran',
            'verifikasi_pembayaran'
        ]);

        $kiosPermissions = json_encode([
            'kelola_kios',
            'verifikasi_pembayaran'
        ]);

        $auditorPermissions = json_encode([
            'ekspor_laporan',
            'lihat_audit_log'
        ]);

        $admins = [
            [
                'Username'     => 'superadmin',
                'Password'     => $adminPasswordHash,
                'nama_lengkap' => 'Superadmin Utama Plaza',
                'email'        => 'superadmin@bunsay.id',
                'sub_role'     => 'superadmin',
                'permissions'  => $allPermissions,
                'status_aktif' => 1,
            ],
            [
                'Username'     => 'admin',
                'Password'     => $adminPasswordHash,
                'nama_lengkap' => 'Admin Pengelola Plaza',
                'email'        => 'admin@bunsay.id',
                'sub_role'     => 'superadmin',
                'permissions'  => $allPermissions,
                'status_aktif' => 1,
            ],
            [
                'Username'     => 'admin_verif',
                'Password'     => $adminPasswordHash,
                'nama_lengkap' => 'Petugas Loket Verifikasi',
                'email'        => 'verif@bunsay.id',
                'sub_role'     => 'verifikator',
                'permissions'  => $verifPermissions,
                'status_aktif' => 1,
            ],
            [
                'Username'     => 'admin_kasir',
                'Password'     => $adminPasswordHash,
                'nama_lengkap' => 'Kasir Loket Pasar',
                'email'        => 'kasir@bunsay.id',
                'sub_role'     => 'kasir',
                'permissions'  => $kasirPermissions,
                'status_aktif' => 1,
            ],
            [
                'Username'     => 'admin_kios',
                'Password'     => $adminPasswordHash,
                'nama_lengkap' => 'Petugas Kios & Legalitas',
                'email'        => 'kios@bunsay.id',
                'sub_role'     => 'petugas_kios',
                'permissions'  => $kiosPermissions,
                'status_aktif' => 1,
            ],
            [
                'Username'     => 'admin_laporan',
                'Password'     => $adminPasswordHash,
                'nama_lengkap' => 'Petugas Laporan & Audit',
                'email'        => 'laporan@bunsay.id',
                'sub_role'     => 'auditor',
                'permissions'  => $auditorPermissions,
                'status_aktif' => 1,
            ],
            [
                'Username'     => 'staff_loket',
                'Password'     => $adminPasswordHash,
                'nama_lengkap' => 'Staff Loket Kasir',
                'email'        => 'staff.loket@bunsay.id',
                'sub_role'     => 'kasir',
                'permissions'  => $kasirPermissions,
                'status_aktif' => 1,
            ],
            [
                'Username'     => 'kasir_lisa',
                'Password'     => $adminPasswordHash,
                'nama_lengkap' => 'Lisa Anggraini (Kasir)',
                'email'        => 'lisa.kasir@bunsay.id',
                'sub_role'     => 'kasir',
                'permissions'  => $kasirPermissions,
                'status_aktif' => 1,
            ],
            [
                'Username'     => 'auditor_budi',
                'Password'     => $adminPasswordHash,
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
