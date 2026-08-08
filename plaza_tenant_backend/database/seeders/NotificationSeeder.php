<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Notification;

class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Notifikasi Sampel Tenant
        Notification::send(
            'tenant',
            null,
            'Pembayaran Sewa Diterima',
            'Pembayaran sewa periode Mei 2026 sebesar Rp 450.000 telah diverifikasi dan DITERIMA oleh kasir pengelola.',
            'success',
            '/tenant/histori'
        );

        Notification::send(
            'tenant',
            null,
            'Tagihan Sewa Baru Diterbitkan',
            'Tagihan sewa kios periode Juni 2026 telah diterbitkan. Harap lakukan pembayaran sebelum tanggal jatuh tempo.',
            'warning',
            '/tenant/pembayaran'
        );

        // 2. Notifikasi Sampel Admin
        Notification::send(
            'admin',
            null,
            'Bukti Transfer Baru Menunggu Verifikasi',
            'Ada 3 bukti transfer baru dari tenant (Hj. Yuliana & Bpk. Hendra) yang memerlukan verifikasi kasir.',
            'info',
            '/admin/verifikasi-bukti'
        );

        Notification::send(
            'admin',
            null,
            'Sanggahan Pembayaran Tenant',
            'Tenant Hj. Yuliana (Kios B-1001) mengirimkan sanggahan pembayaran beserta foto resi transfer baru.',
            'warning',
            '/admin/verifikasi-bukti'
        );
    }
}
