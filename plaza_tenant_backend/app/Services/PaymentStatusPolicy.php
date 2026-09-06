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
     * Status awal pembayaran baru berdasarkan metode pembayaran:
     *  - Transfer  → selalu Menunggu (bukti foto diverifikasi admin).
     *    Client TIDAK boleh mengklaim Diterima, sekalipun mengirim field itu.
     *  - Midtrans  → Diterima (gateway otomatis).
     *  - Tunai     → Diterima (diinput langsung oleh admin/kasir di loket).
     *  - Metode lain (fallback defensif) → Menunggu.
     */
    public function initialStatus(string $metode): string
    {
        return match ($metode) {
            'Midtrans', 'Tunai' => self::DITERIMA,
            default             => self::MENUNGGU,
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
    public function settlesImmediately(string $metode): bool
    {
        return $this->initialStatus($metode) === self::DITERIMA;
    }
}
