<?php

namespace App\Services;

use App\Models\Pembayaran;
use App\Models\PembayaranDetail;
use App\Models\Tagihan;
use Illuminate\Support\Collection;

/**
 * Single owner for FIFO and Custom Itemized allocation of received payment amounts
 * across tagihan (Header-Detail Pattern).
 *
 * Callers MUST run inside a DB::transaction — open tagihan rows are locked with lockForUpdate().
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
     * Distribute $amount across the given open tagihan, oldest first (FIFO).
     * Optionally records entries in pembayaran_detail if $pembayaranId is given.
     */
    public function allocate(Collection $openTagihan, float $amount, ?int $pembayaranId = null): array
    {
        $remaining = $amount;
        $allocated = 0.0;
        $wasPartial = false;
        $details = [];

        foreach ($openTagihan as $tagihan) {
            if ($remaining <= 0) {
                break;
            }

            $sisa = max(0.0, (float) ($tagihan->Sisa_Tagihan ?? $tagihan->Total_Tagihan ?? 0));
            if ($sisa <= 0) {
                continue;
            }

            $portion = 0.0;
            if ($remaining >= $sisa) {
                $remaining -= $sisa;
                $allocated += $sisa;
                $portion = $sisa;
                $tagihan->update([
                    'Sisa_Tagihan'   => 0,
                    'Status_Tagihan' => 'Lunas',
                ]);
            } else {
                $portion = $remaining;
                $tagihan->update([
                    'Sisa_Tagihan'   => $sisa - $remaining,
                    'Status_Tagihan' => 'Dicicil',
                ]);
                $allocated += $remaining;
                $remaining = 0;
                $wasPartial = true;
            }

            if ($pembayaranId && $portion > 0) {
                $detail = PembayaranDetail::create([
                    'Id_Pembayaran'   => $pembayaranId,
                    'Id_Tagihan'      => $tagihan->Id_Tagihan,
                    'Nominal_Alokasi' => $portion,
                ]);
                $details[] = $detail;
            }
        }

        return [
            'allocated'   => $allocated,
            'unallocated' => $remaining,
            'wasPartial'  => $wasPartial,
            'details'     => $details,
        ];
    }

    /**
     * Alokasi kustom per tagihan (Opsi 2: Header-Detail).
     *
     * @param int $pembayaranId ID pembayaran induk
     * @param array $allocations Array of ['id_tagihan' => int, 'nominal' => float]
     * @param bool $applyStatus Jika true, langsung mutasi status tagihan (untuk pembayaran instant/kasir/midtrans)
     */
    public function allocateCustom(int $pembayaranId, array $allocations, bool $applyStatus = true): array
    {
        $totalAllocated = 0.0;
        $details = [];

        foreach ($allocations as $item) {
            $tagihanId = (int) ($item['id_tagihan'] ?? $item['Id_Tagihan'] ?? 0);
            $nominal = (float) ($item['nominal'] ?? $item['Nominal_Alokasi'] ?? 0);

            if ($tagihanId <= 0 || $nominal <= 0) {
                continue;
            }

            $tagihan = Tagihan::where('Id_Tagihan', $tagihanId)->lockForUpdate()->first();
            if (!$tagihan) {
                continue;
            }

            $sisa = max(0.0, (float) ($tagihan->Sisa_Tagihan ?? $tagihan->Total_Tagihan ?? 0));
            $nominalToApply = min($nominal, $sisa);

            if ($applyStatus) {
                $newSisa = max(0.0, $sisa - $nominalToApply);
                $tagihan->update([
                    'Sisa_Tagihan'   => $newSisa,
                    'Status_Tagihan' => $newSisa <= 0 ? 'Lunas' : 'Dicicil',
                ]);
            }

            $detail = PembayaranDetail::create([
                'Id_Pembayaran'   => $pembayaranId,
                'Id_Tagihan'      => $tagihanId,
                'Nominal_Alokasi' => $nominalToApply,
            ]);

            $details[] = $detail;
            $totalAllocated += $nominalToApply;
        }

        return [
            'allocated' => $totalAllocated,
            'details'   => $details,
        ];
    }

    /**
     * Terapkan alokasi kustom yang sebelumnya berstatus "Menunggu" saat admin mengonfirmasi "Diterima".
     */
    public function applyPendingCustomAllocation(Pembayaran $pembayaran): void
    {
        $details = PembayaranDetail::where('Id_Pembayaran', $pembayaran->Id_Pembayaran)->get();

        foreach ($details as $detail) {
            $tagihan = Tagihan::where('Id_Tagihan', $detail->Id_Tagihan)->lockForUpdate()->first();
            if (!$tagihan) {
                continue;
            }

            $sisa = max(0.0, (float) ($tagihan->Sisa_Tagihan ?? $tagihan->Total_Tagihan ?? 0));
            $nominal = (float) $detail->Nominal_Alokasi;
            $newSisa = max(0.0, $sisa - $nominal);

            $tagihan->update([
                'Sisa_Tagihan'   => $newSisa,
                'Status_Tagihan' => $newSisa <= 0 ? 'Lunas' : 'Dicicil',
            ]);
        }
    }
}

