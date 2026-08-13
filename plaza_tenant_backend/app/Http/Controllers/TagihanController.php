<?php

namespace App\Http\Controllers;

use App\Models\Tagihan;
use Illuminate\Http\Request;

class TagihanController extends Controller
{
    public function index(Request $request)
    {
        $query = Tagihan::with(['sewa.pemilik']);
        if ($request->has('Id_Pemilik')) {
            $query->whereHas('sewa', function($q) use ($request) {
                $q->where('Id_Pemilik', $request->Id_Pemilik);
            });
        }
        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'Id_Sewa'          => 'required|exists:sewa,Id_Sewa',
            'Periode'          => 'required|string|max:7',
            'Jatuh_Tempo'      => 'required|date',
            'Tarif_Sewa'       => 'required|numeric|min:0',
            'Hutang_Tunggakan' => 'nullable|numeric|min:0',
            'Total_Tagihan'    => 'required|numeric|min:0',
            'Status_Tagihan'   => 'required|in:Lunas,Belum Bayar,Menunggu Verifikasi,Dicicil',
            'Sisa_Tagihan'     => 'nullable|numeric|min:0',
        ]);

        // Keputusan bisnis #6 (dikonfirmasi 2026-08-12):
        // Total_Tagihan = Tarif_Sewa + Hutang_Tunggakan (minimal >= Tarif_Sewa).
        $tarif       = (float) $request->Tarif_Sewa;
        $hutang      = (float) ($request->Hutang_Tunggakan ?? 0);
        $totalTagihan = (float) $request->Total_Tagihan;

        if ($totalTagihan < $tarif) {
            return response()->json([
                'success' => false,
                'message' => 'Total_Tagihan tidak boleh lebih kecil dari Tarif_Sewa. Total minimum: Rp ' . number_format($tarif, 0, ',', '.'),
            ], 422);
        }

        // Sisa_Tagihan default = Total_Tagihan (belum ada pembayaran)
        $sisaTagihan = $request->Sisa_Tagihan ?? $totalTagihan;
        // Jika tagihan langsung Lunas saat dibuat, sisa = 0
        if ($request->Status_Tagihan === 'Lunas') {
            $sisaTagihan = 0;
        }

        $tagihan = Tagihan::create([
            'Id_Sewa'          => $request->Id_Sewa,
            'Periode'          => $request->Periode,
            'Jatuh_Tempo'      => $request->Jatuh_Tempo,
            'Tarif_Sewa'       => $tarif,
            'Hutang_Tunggakan' => $hutang,
            'Total_Tagihan'    => $totalTagihan,
            'Sisa_Tagihan'     => $sisaTagihan,
            'Status_Tagihan'   => $request->Status_Tagihan,
        ]);

        return response()->json($tagihan, 201);
    }

    public function show(string $id)
    {
        return response()->json(Tagihan::findOrFail($id));
    }

    public function update(Request $request, string $id)
    {
        $request->validate([
            'Periode'          => 'sometimes|string|max:7',
            'Jatuh_Tempo'      => 'sometimes|date',
            'Tarif_Sewa'       => 'sometimes|numeric|min:0',
            'Hutang_Tunggakan' => 'sometimes|numeric|min:0',
            'Total_Tagihan'    => 'sometimes|numeric|min:0',
            'Sisa_Tagihan'     => 'sometimes|nullable|numeric|min:0',
            'Status_Tagihan'   => 'sometimes|in:Lunas,Belum Bayar,Menunggu Verifikasi,Dicicil',
        ]);

        $tagihan = Tagihan::findOrFail($id);

        // Validasi Total_Tagihan >= Tarif_Sewa jika keduanya diupdate
        if ($request->has('Total_Tagihan') && $request->has('Tarif_Sewa')) {
            if ((float) $request->Total_Tagihan < (float) $request->Tarif_Sewa) {
                return response()->json([
                    'success' => false,
                    'message' => 'Total_Tagihan tidak boleh lebih kecil dari Tarif_Sewa.',
                ], 422);
            }
        }

        // Jika Status diubah ke Lunas secara manual, otomatis set Sisa_Tagihan = 0
        $updateData = $request->only([
            'Periode',
            'Jatuh_Tempo',
            'Tarif_Sewa',
            'Hutang_Tunggakan',
            'Total_Tagihan',
            'Sisa_Tagihan',
            'Status_Tagihan',
        ]);

        if (isset($updateData['Status_Tagihan']) && $updateData['Status_Tagihan'] === 'Lunas') {
            $updateData['Sisa_Tagihan'] = 0;
        }

        $tagihan->update($updateData);

        return response()->json($tagihan);
    }
}