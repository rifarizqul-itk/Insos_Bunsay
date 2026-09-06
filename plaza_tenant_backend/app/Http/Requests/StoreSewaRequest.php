<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validasi pembuatan sewa (POST /api/v1/admin/sewa).
 * Mendukung input multi-kios: kios_list (nama), kios_ids, Id_Kios tunggal,
 * atau No_Kios.
 */
class StoreSewaRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Route sudah dilindungi middleware 'admin'.
        return true;
    }

    public function rules(): array
    {
        return [
            'Id_Pemilik'      => 'required|exists:pemilik,Id_Pemilik',
            'Id_Kios'         => 'nullable|exists:kios,Id_Kios',
            'kios_list'       => 'nullable',
            'kios_ids'        => 'nullable|array',
            'No_Kios'         => 'nullable|string',
            'Jenis_Usaha'     => 'required|string|max:255',
            'Tanggal_Mulai'   => 'nullable|date',
            'Tanggal_Selesai' => 'nullable|date',
            'Tarif_Bulanan'   => 'nullable|numeric|min:0',
            'tarif_kios_map'  => 'nullable',
            'Keterangan'      => 'nullable|string',
        ];
    }
}
