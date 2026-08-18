<?php

namespace App\Http\Controllers;

use App\Models\Pembayaran;
use App\Models\Pemilik;
use App\Models\Tagihan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MidtransController extends Controller
{
    /**
     * Generate Midtrans Snap Token for Tenant Payment.
     * POST /api/v1/tenant/midtrans/token
     */
    public function createSnapToken(Request $request)
    {
        $request->validate([
            'Id_Tagihan' => 'required|exists:tagihan,Id_Tagihan',
            'nominal'    => 'required|numeric|min:1000',
        ]);

        $user = $request->user();
        $tagihan = Tagihan::with(['sewa.kios', 'sewa.pemilik'])->find($request->Id_Tagihan);

        if (!$tagihan) {
            return response()->json([
                'success' => false,
                'message' => 'Tagihan tidak ditemukan.',
            ], 404);
        }

        // Isolasi tenant: pastikan tagihan adalah milik user login
        $pemilik = null;
        if ($user) {
            $pemilik = Pemilik::where('Id_User', $user->Id_user)->first();
            if ($user->Id_roles != 1) {
                if (!$pemilik || $tagihan->sewa?->Id_Pemilik !== $pemilik->Id_Pemilik) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Anda tidak memiliki akses ke tagihan ini.',
                    ], 403);
                }
            }
        }

        $grossAmount = (int) round((float) $request->nominal);
        $orderId = 'BUNSAY-TAG-' . $tagihan->Id_Tagihan . '-' . time() . '-' . rand(100, 999);

        $serverKey = config('services.midtrans.server_key');
        $snapUrl   = config('services.midtrans.snap_url');

        $kiosNo  = $tagihan->sewa?->kios?->No_Kios ?? 'Kios';
        $periode = $tagihan->Periode ?? date('Y-m');

        $payload = [
            'transaction_details' => [
                'order_id'     => $orderId,
                'gross_amount' => $grossAmount,
            ],
            'customer_details' => [
                'first_name' => $pemilik?->Nama ?? ($user->nama_lengkap ?? 'Tenant Kebun Sayur'),
                'email'      => $user->email ?? 'tenant@bunsay.id',
                'phone'      => $pemilik?->No_Telepon ?? '081234567890',
            ],
            'item_details' => [
                [
                    'id'       => 'TAG-' . $tagihan->Id_Tagihan,
                    'price'    => $grossAmount,
                    'quantity' => 1,
                    'name'     => substr("Sewa Kios {$kiosNo} Periode {$periode}", 0, 50),
                ]
            ],
            'callbacks' => [
                'finish' => url('/tenant/histori'),
            ],
        ];

        try {
            $response = Http::withBasicAuth($serverKey, '')
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'Accept'       => 'application/json',
                ])
                ->post($snapUrl, $payload);

            if ($response->failed()) {
                $errorBody = $response->json();
                $errMsg = $errorBody['error_messages'][0] ?? $response->body();
                Log::error('Midtrans Snap Token Generation Failed: ' . $errMsg, ['payload' => $payload]);

                return response()->json([
                    'success' => false,
                    'message' => 'Gagal membuat transaksi Midtrans: ' . $errMsg,
                ], 500);
            }

            $resData = $response->json();

            return response()->json([
                'success'      => true,
                'token'        => $resData['token'] ?? null,
                'redirect_url' => $resData['redirect_url'] ?? null,
                'order_id'     => $orderId,
                'client_key'   => config('services.midtrans.client_key'),
            ]);

        } catch (\Throwable $th) {
            Log::error('Midtrans Snap Exception: ' . $th->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan koneksi ke Midtrans Gateway.',
            ], 500);
        }
    }

    /**
     * Midtrans HTTP Webhook Notification Handler.
     * POST /api/v1/midtrans/notification
     */
    public function handleNotification(Request $request)
    {
        $payload     = $request->all();
        $orderId     = $payload['order_id'] ?? '';
        $statusCode  = $payload['status_code'] ?? '';
        $grossAmount = $payload['gross_amount'] ?? '';
        $signature   = $payload['signature_key'] ?? '';
        $serverKey   = config('services.midtrans.server_key');

        // Verify SHA512 Signature
        $computedSignature = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);
        if ($computedSignature !== $signature) {
            Log::warning('Midtrans Webhook Invalid Signature', ['order_id' => $orderId]);
            return response()->json(['message' => 'Invalid signature'], 403);
        }

        $transactionStatus = $payload['transaction_status'] ?? '';
        $fraudStatus       = $payload['fraud_status'] ?? '';

        Log::info("Midtrans Webhook: {$orderId} - Status: {$transactionStatus}");

        // Handle Settlement
        if ($transactionStatus === 'settlement' || ($transactionStatus === 'capture' && $fraudStatus === 'accept')) {
            if (preg_match('/BUNSAY-TAG-(?<id>\d+)-/', $orderId, $matches)) {
                $idTagihan = (int) $matches['id'];
                $tagihan = Tagihan::find($idTagihan);

                if ($tagihan) {
                    $existingPayment = Pembayaran::where('Bukti_Pembayaran', $orderId)->first();
                    if (!$existingPayment) {
                        $pembayaranRequest = new Request([
                            'Id_Tagihan'           => $idTagihan,
                            'Tanggal_Bayar'        => now()->toDateString(),
                            'Total_Bayar'          => (float) $grossAmount,
                            'Metode_Bayar'         => 'Midtrans',
                            'Bukti_Pembayaran'     => $orderId,
                            'Verifikasi_Pembayaran'=> 'Diterima',
                        ]);

                        app(PembayaranController::class)->store($pembayaranRequest);
                    }
                }
            }
        }

        return response()->json(['success' => true]);
    }
}
