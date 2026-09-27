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
            'Id_Tagihan'       => 'nullable|exists:tagihan,Id_Tagihan',
            'Tanggal_Bayar'    => 'required|date',
            'Total_Bayar'      => 'required|numeric|min:1',
            'Metode_Bayar'     => 'required|in:Transfer,Tunai,Midtrans',
            'Bukti_Pembayaran' => 'nullable',
            'alokasi'          => 'nullable|array|min:1',
            'alokasi.*.id_tagihan' => 'required_with:alokasi|integer|exists:tagihan,Id_Tagihan',
            'alokasi.*.nominal'    => 'required_with:alokasi|numeric|min:1',
        ];
    }

    /**
     * Validasi keseimbangan total alokasi dengan total bayar.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $alokasi = $this->input('alokasi');
            if (is_array($alokasi) && count($alokasi) > 0) {
                $sumAlokasi = 0.0;
                foreach ($alokasi as $item) {
                    $sumAlokasi += (float) ($item['nominal'] ?? 0);
                }

                $totalBayar = (float) $this->input('Total_Bayar', 0);
                if (abs($sumAlokasi - $totalBayar) > 0.01) {
                    $validator->errors()->add(
                        'alokasi',
                        "Jumlah total alokasi per tagihan (Rp " . number_format($sumAlokasi, 0, ',', '.') . ") harus sama dengan Total Bayar (Rp " . number_format($totalBayar, 0, ',', '.') . ")."
                    );
                }
            } elseif (!$this->filled('Id_Tagihan')) {
                $validator->errors()->add('Id_Tagihan', 'Id_Tagihan atau daftar alokasi wajib diisi.');
            }
        });
    }

    /**
     * Tagihan yang dibayar harus milik pemilik yang sedang login
     * (admin dikecualikan). Menangani IDOR pada Id_Tagihan dan rincian alokasi.
     */
    public function ensureTagihanOwnership(): void
    {
        $user = $this->user();
        if (!$user || (int) $user->Id_roles === 1) {
            return;
        }

        $pemilik = Pemilik::where('Id_User', $user->Id_user)->first();
        if (!$pemilik) {
            abort(response()->json([
                'success' => false,
                'message' => 'Profil pemilik tidak ditemukan.',
            ], 403));
        }

        $tagihanIds = [];
        if ($this->filled('Id_Tagihan')) {
            $tagihanIds[] = (int) $this->input('Id_Tagihan');
        }

        $alokasi = $this->input('alokasi');
        if (is_array($alokasi)) {
            foreach ($alokasi as $item) {
                if (!empty($item['id_tagihan'])) {
                    $tagihanIds[] = (int) $item['id_tagihan'];
                }
            }
        }

        $tagihanIds = array_unique($tagihanIds);

        foreach ($tagihanIds as $tId) {
            $isOwner = Tagihan::where('Id_Tagihan', $tId)
                ->whereHas('sewa', fn ($q) => $q->where('Id_Pemilik', $pemilik->Id_Pemilik))
                ->exists();

            if (!$isOwner) {
                abort(response()->json([
                    'success' => false,
                    'message' => 'Anda tidak memiliki akses ke tagihan ini (ID: ' . $tId . ').',
                ], 403));
            }
        }
    }
}

