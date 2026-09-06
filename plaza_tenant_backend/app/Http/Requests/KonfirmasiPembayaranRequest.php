<?php

namespace App\Http\Requests;

use App\Services\PaymentStatusPolicy;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Validasi konfirmasi verifikasi pembayaran oleh admin
 * (PUT /admin/pembayaran/{id}/konfirmasi).
 */
class KonfirmasiPembayaranRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Route sudah dilindungi middleware 'admin'.
        return true;
    }

    public function rules(): array
    {
        $policy = app(PaymentStatusPolicy::class);

        return [
            'status'        => ['required', Rule::in($policy->allowedAdminConfirmationStatuses())],
            'catatan_admin' => 'nullable|string',
        ];
    }
}
