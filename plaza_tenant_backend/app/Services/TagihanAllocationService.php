<?php

namespace App\Services;

use App\Models\Tagihan;
use Illuminate\Support\Collection;

/**
 * Single owner for FIFO allocation of a received payment amount across a
 * sewa's unpaid tagihan (oldest Id_Tagihan first).
 *
 * Used by PembayaranController@store (auto-accepted methods) and
 * @konfirmasi (after admin verification). Callers MUST run inside a
 * DB::transaction — open tagihan rows are locked with lockForUpdate().
 */
class TagihanAllocationService
{
    /** Statuses considered "still open" for allocation. */
    public const OPEN_STATUSES = ['Belum Bayar', 'Dicicil', 'Menunggu Verifikasi'];

    /**
     * Fetch the sewa's open tagihan, oldest first, with row locks held.
     */
    public function openTagihan(int $sewaId): Collection
    {
        return Tagihan::where('Id_Sewa', $sewaId)
            ->whereIn('Status_Tagihan', self::OPEN_STATUSES)
            ->orderBy('Id_Tagihan')
            ->lockForUpdate()
            ->get();
    }

    /**
     * Distribute $amount across the given open tagihan, oldest first.
     * Mutates the passed models (and persists them).
     *
     * Returns:
     *  - allocated:   amount consumed by the allocation
     *  - unallocated: remainder the open tagihan could not absorb
     *  - wasPartial:  true when the last touched tagihan was only partially covered
     */
    public function allocate(Collection $openTagihan, float $amount): array
    {
        $remaining = $amount;
        $allocated = 0.0;
        $wasPartial = false;

        foreach ($openTagihan as $tagihan) {
            if ($remaining <= 0) {
                break;
            }

            $sisa = max(0.0, (float) ($tagihan->Sisa_Tagihan ?? $tagihan->Total_Tagihan ?? 0));
            if ($sisa <= 0) {
                continue;
            }

            if ($remaining >= $sisa) {
                $remaining -= $sisa;
                $allocated += $sisa;
                $tagihan->update([
                    'Sisa_Tagihan'   => 0,
                    'Status_Tagihan' => 'Lunas',
                ]);
            } else {
                $tagihan->update([
                    'Sisa_Tagihan'   => $sisa - $remaining,
                    'Status_Tagihan' => 'Dicicil',
                ]);
                $allocated += $remaining;
                $remaining = 0;
                $wasPartial = true;
            }
        }

        return [
            'allocated'   => $allocated,
            'unallocated' => $remaining,
            'wasPartial'  => $wasPartial,
        ];
    }
}
