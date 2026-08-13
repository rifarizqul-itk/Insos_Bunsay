<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Notification;

class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        $pemilikList = \App\Models\Pemilik::with(['user', 'sewa.kios'])->take(5)->get();

        foreach ($pemilikList as $p) {
            $userId = $p->user?->Id_user;
            $nama = $p->Nama ?? 'Tenant';
            $kiosNo = $p->sewa->first()?->kios?->No_Kios ?? 'Kios';

            Notification::send(
                'tenant',
                $userId,
                'Tagihan Sewa Bulan Berjalan',
                "Yth. Bpk/Ibu {$nama}, tagihan sewa rutin bulanan untuk Kios {$kiosNo} telah diterbitkan. Harap lakukan pembayaran sebelum tanggal 12.",
                'info',
                '/tenant/pembayaran'
            );

            Notification::send(
                'tenant',
                $userId,
                'Status Sistem Pembayaran',
                "Pengingat: Seluruh pembayaran sewa kios Plaza Kebun Sayur jatuh tempo setiap tanggal 12 bulan berjalan.",
                'success',
                '/tenant/dashboard'
            );
        }

        // Notifikasi Admin
        $firstPemilik = $pemilikList->first()?->Nama ?? 'Penyewa Kios';
        $firstKios = $pemilikList->first()?->sewa->first()?->kios?->No_Kios ?? 'A-101';

        Notification::send(
            'admin',
            null,
            'Bukti Transfer Baru Menunggu Verifikasi',
            "Terdapat setoran transfer dari tenant {$firstPemilik} ({$firstKios}) yang memerlukan verifikasi kasir admin.",
            'warning',
            '/admin/verifikasi-bukti'
        );

        Notification::send(
            'admin',
            null,
            'Laporan Keuangan & Retribusi Updated',
            'Laporan rekapitulasi data pembayaran retribusi bulanan seluruh tenant telah berhasil diperbarui secara otomatis.',
            'success',
            '/admin/ekspor'
        );
    }
}
