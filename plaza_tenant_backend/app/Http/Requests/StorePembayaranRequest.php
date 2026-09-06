<?php

namespace App\Http\Requests;

use App\Models\Pemilik;
use App\Models\Tagihan;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Validasi + otorisasi pembuatan pembayaran (tenant & admin/kasir).
 * Mengambil alih blok Isolasi Tenant (I4) dari controller.
 */
class StorePembayaranRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Tenant tanpa profil pemilik ditolak dengan 403 eksplisit via failedAuthorization.
        if ($this->user() && (int) $this->user()->Id_roles !== 1) {
            return Pemilik::where('Id_User', $this->user()->Id_user)->exists();
        }

        return true;
    }

    protected function failedAuthorization(): void
    {
        abort(response()->json([
            'success' => false,
            'message' => 'Profil pemilik tidak ditemukan. Hubungi admin.',
        ], 403));
    }

    public function rules(): array
    {
        return [
            'Id_Tagihan'    => 'required|exists:tagihan,Id_Tagihan',
            'Tanggal_Bayar' => 'required|date',
            'Total_Bayar'   => 'required|numeric|min:1',
            'Metode_Bayar'  => 'required|in:Transfer,Tunai,Midtrans',
            'Bukti_Pembayaran' => 'nullable',
            // Client tidak lagi diizinkan mengklaim status verifikasi;
            // kebijakan status ditentukan server (PaymentStatusPolicy).
        ];
    }

    /**
     * Tagihan yang dibayar harus milik pemilik yang sedang login
     * (admin dikecualikan). Menangani IDOR pada Id_Tagihan.
     */
    public function ensureTagihanOwnership(): void
    {
        $user = $this->user();
        if (!$user || (int) $user->Id_roles === 1) {
            return;
        }

        $pemilik = Pemilik::where('Id_User', $user->Id_user)->first();

        $isOwner = $pemilik && Tagihan::where('Id_Tagihan', $this->input('Id_Tagihan'))
            ->whereHas('sewa', fn ($q) => $q->where('Id_Pemilik', $pemilik->Id_Pemilik))
            ->exists();

        if (!$isOwner) {
            abort(response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke tagihan ini.',
            ], 403));
        }
    }
}
