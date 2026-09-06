<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validasi pembuatan pemilik/tenant (POST /api/v1/admin/pemilik).
 * Normalisasi alias field frontend (Telepon→No_Telepon, nik→No_KTP,
 * alamat→Alamat) dilakukan di sini agar controller menerima bentuk kanonik.
 */
class StorePemilikRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'No_Telepon' => $this->No_Telepon ?: ($this->Telepon ?: null),
            'No_KTP'     => $this->No_KTP ?: ($this->nik ?: null),
            'Alamat'     => $this->Alamat ?: ($this->alamat ?: null),
        ]);
    }

    public function authorize(): bool
    {
        // Route sudah dilindungi middleware 'admin'.
        return true;
    }

    public function rules(): array
    {
        return [
            'Id_User'     => 'nullable',
            'Nama'        => 'required|string|max:255',
            'No_Telepon'  => 'required|string|max:20',
            'No_KTP'      => 'required|string|max:20',
            'Alamat'      => 'required|string',
            'Jenis_Usaha' => 'nullable|string|max:255',
        ];
    }
}
