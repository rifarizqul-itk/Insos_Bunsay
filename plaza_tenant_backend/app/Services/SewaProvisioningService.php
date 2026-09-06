<?php

namespace App\Services;

use App\Models\Kios;
use App\Models\Sewa;
use App\Models\Tagihan;
use Illuminate\Support\Facades\DB;

/**
 * Pemilik tunggal logika "provisioning sewa kios":
 *   buat Sewa (Aktif) → tandai Kios Terisi → buat Tagihan perdana.
 *
 * Dipakai oleh SewaController@store (admin pilih kios untuk tenant yang sudah
 * ada) dan PemilikController@store (buat tenant baru sekaligus kios-nya).
 * Sebelumnya logika ini diduplikasi ~40 baris di kedua controller.
 */
class SewaProvisioningService
{
    /**
     * Provision satu kios untuk satu pemilik.
     *
     * @param  array{
     *   Id_Pemilik: int,
     *   Tanggal_Mulai: string,
     *   Tanggal_Selesai?: ?string,
     *   Jenis_Usaha: string,
     *   Tarif_Bulanan: float,
     *   Keterangan?: ?string,
     *   Periode: string,
     *   Jatuh_Tempo: string,
     * } $params
     * @return array{sewa: Sewa, tagihan: Tagihan}
     */
    public function provisionKios(Kios $kios, array $params): array
    {
        return DB::transaction(function () use ($kios, $params) {
            $sewa = Sewa::create([
                'Id_Kios'         => $kios->Id_Kios,
                'Id_Pemilik'      => $params['Id_Pemilik'],
                'Tanggal_Mulai'   => $params['Tanggal_Mulai'],
                'Tanggal_Selesai' => $params['Tanggal_Selesai'] ?? null,
                'Jenis_Usaha'     => $params['Jenis_Usaha'],
                'Tarif_Bulanan'   => $params['Tarif_Bulanan'],
                'Status'          => 'Aktif',
                'Keterangan'      => $params['Keterangan'] ?? null,
            ]);

            $kios->update(['Status' => 'Terisi']);

            $tagihan = Tagihan::create([
                'Id_Sewa'          => $sewa->Id_Sewa,
                'Periode'          => $params['Periode'],
                'Jatuh_Tempo'      => $params['Jatuh_Tempo'],
                'Tarif_Sewa'       => $params['Tarif_Bulanan'],
                'Hutang_Tunggakan' => 0,
                'Total_Tagihan'    => $params['Tarif_Bulanan'],
                'Sisa_Tagihan'     => $params['Tarif_Bulanan'],
                'Status_Tagihan'   => 'Belum Bayar',
            ]);

            return ['sewa' => $sewa, 'tagihan' => $tagihan];
        });
    }

    /**
     * Normalisasi tarif per kios: custom dari tarif_kios_map[No_Kios]
     * bila ada, selain itu tarif bulanan default.
     *
     * @param  array<string, mixed>|null $tarifKiosMap  sudah di-decode dari JSON bila string
     */
    public function resolveTarif(?array $tarifKiosMap, string $noKios, float $defaultTarif): float
    {
        if (isset($tarifKiosMap[$noKios]) && $tarifKiosMap[$noKios] !== '') {
            return (float) $tarifKiosMap[$noKios];
        }

        return $defaultTarif;
    }

    /**
     * Decode field map yang bisa datang sebagai array atau string JSON.
     */
    public function decodeMap($value): array
    {
        if (is_array($value)) {
            return $value;
        }

        if (is_string($value)) {
            return json_decode($value, true) ?: [];
        }

        return [];
    }

    /**
     * Parse daftar nomor kios dari string "A-01, A-02" atau array.
     *
     * @return string[]
     */
    public function parseKiosList($value): array
    {
        if (is_array($value)) {
            return array_values(array_filter($value));
        }

        if (is_string($value)) {
            return array_values(array_filter(array_map('trim', explode(',', $value))));
        }

        return [];
    }
}
