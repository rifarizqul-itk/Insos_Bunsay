<?php

namespace App\Services;

/**
 * Kebijakan status verifikasi pembayaran — satu pemilik aturan
 * "status apa boleh ditetapkan oleh siapa".
 *
 * Dipakai oleh PembayaranController (store, konfirmasi) dan Form Request
 * terkait, sehingga perubahan aturan verifikasi hanya menyentuh satu file.
 */
class PaymentStatusPolicy
{
    public const MENUNGGU = 'Menunggu';
    public const DITERIMA = 'Diterima';
    public const DITOLAK  = 'Ditolak';

    /**
     * Status awal pembayaran baru berdasarkan metode pembayaran dan peran pembuat:
     *  - Admin menginput Transfer (validasi WA) atau Tunai (di loket) → Diterima.
     *  - Tenant menginput Transfer atau Tunai (klaim web) → Menunggu (diverifikasi admin).
     *  - Midtrans (gateway otomatis) → Diterima.
     *  - Metode lain (fallback defensif) → Menunggu.
     */
    public function initialStatus(string $metode, bool $isAdmin = false): string
    {
        if ($isAdmin) {
            return match ($metode) {
                'Transfer', 'Tunai', 'Midtrans' => self::DITERIMA,
                default                         => self::MENUNGGU,
            };
        }

        return match ($metode) {
            'Midtrans' => self::DITERIMA,
            default    => self::MENUNGGU,
        };
    }

    /**
     * Nilai Verifikasi_Pembayaran yang boleh dikirim client pada endpoint
     * sanggah: sanggahan selalu mengembalikan transaksi ke antrean verifikasi.
     */
    public function statusAfterSanggah(): string
    {
        return self::MENUNGGU;
    }

    /**
     * Konfirmasi admin hanya boleh menetapkan dua status final ini.
     */
    public function allowedAdminConfirmationStatuses(): array
    {
        return [self::DITERIMA, self::DITOLAK];
    }

    /**
     * Apakah status awal ini memicu pelunasan/pengalokasian dana segera
     * (Midtrans/Tunai) atau menunggu verifikasi admin (Transfer)?
     */
    public function settlesImmediately(string $metode, bool $isAdmin = false): bool
    {
        return $this->initialStatus($metode, $isAdmin) === self::DITERIMA;
    }
}
