<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validasi pembuatan tagihan (POST /api/v1/admin/tagihan).
 */
class StoreTagihanRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Route sudah dilindungi middleware 'admin'.
        return true;
    }

    public function rules(): array
    {
        return [
            'Id_Sewa'          => 'required|exists:sewa,Id_Sewa',
            'Periode'          => 'required|string|max:7',
            'Jatuh_Tempo'      => 'required|date',
            'Tarif_Sewa'       => 'required|numeric|min:0',
            'Hutang_Tunggakan' => 'nullable|numeric|min:0',
            'Total_Tagihan'    => 'required|numeric|min:0',
            'Status_Tagihan'   => 'required|in:Lunas,Belum Bayar,Menunggu Verifikasi,Dicicil',
            'Sisa_Tagihan'     => 'nullable|numeric|min:0',
        ];
    }
}
