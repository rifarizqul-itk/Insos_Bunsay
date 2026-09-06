<?php

namespace App\Http\Requests;

use App\Models\Pembayaran;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Validasi + otorisasi pengajuan sanggahan (POST /pembayaran/{id}/sanggah).
 * Mengambil alih IDOR check sanggah dari controller, dan memastikan penolakan
 * bukti tidak valid terjadi SEBELUM controller menulis apa pun.
 */
class SanggahRequest extends FormRequest
{
    private ?Pembayaran $resolvedPembayaran = null;

    private bool $resolved = false;

    public function authorize(): bool
    {
        // Admin boleh menyanggah atas nama tenant (data-repair).
        if ($this->user() && (int) $this->user()->Id_roles === 1) {
            return true;
        }

        $pembayaran = $this->getPembayaran();

        // Pembayaran tidak ditemukan: lolos otorisasi, controller yang
        // memutuskan 404 (pesan "Data pembayaran tidak ditemukan.").
        if (!$pembayaran) {
            return true;
        }

        $pemilik = \App\Models\Pemilik::where('Id_User', $this->user()->Id_user)->first();

        return $pemilik
            && $pembayaran->tagihan?->sewa?->Id_Pemilik === $pemilik->Id_Pemilik;
    }

    protected function failedAuthorization(): void
    {
        abort(response()->json([
            'success' => false,
            'message' => 'Anda tidak memiliki hak akses untuk menyanggah transaksi ini.',
        ], 403));
    }

    public function rules(): array
    {
        return [
            'teks_sanggahan'  => 'required|string',
            // Bentuk divalidasi oleh BuktiImageStore (ekstensi & ukuran) agar
            // pesan 422 konsisten untuk upload multipart maupun data URI.
            'bukti_sanggahan' => 'nullable',
        ];
    }

    /**
     * Pembayaran target (sudah dimuat beserta tagihan.sewa.pemilik),
     * atau null bila tidak ada — satu query, dipakai bersama authorize()
     * dan controller.
     */
    public function getPembayaran(): ?Pembayaran
    {
        if ($this->resolved) {
            return $this->resolvedPembayaran;
        }

        $this->resolved = true;

        // Bersihkan prefix string seperti 'TRX-' jika dikirim dari frontend.
        $rawId = (string) $this->route('id');
        $cleanId = preg_replace('/[^0-9]/', '', $rawId);

        return $this->resolvedPembayaran = Pembayaran::with('tagihan.sewa.pemilik')
            ->find($cleanId ?: $rawId);
    }
}
