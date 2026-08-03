<?php

namespace App\Http\Controllers;

use App\Models\Pembayaran;
use App\Models\Tagihan;
use Illuminate\Http\Request;

class PembayaranController extends Controller
{
    public function index()
    {
        return response()->json(Pembayaran::all());
    }

    public function store(Request $request)
    {
        $request->validate([
            'Id_Tagihan' => 'required|exists:tagihan,Id_Tagihan',
            'Tanggal_Bayar' => 'required|date',
            'Total_Bayar' => 'required|numeric',
            'Metode_Bayar' => 'required|in:Cash,Transfer',
            'Bukti_Pembayaran' => 'nullable|string',
            'Verifikasi_Pembayaran' => 'nullable|in:Menunggu,Diterima,Ditolak',
        ]);

        $pembayaran = Pembayaran::create($request->only([
            'Id_Tagihan',
            'Tanggal_Bayar',
            'Total_Bayar',
            'Metode_Bayar',
            'Bukti_Pembayaran',
            'Verifikasi_Pembayaran',
        ]));

        return response()->json($pembayaran, 201);
    }

    public function show(string $id)
    {
        return response()->json(Pembayaran::findOrFail($id));
    }

    public function update(Request $request, string $id)
    {
        $request->validate([
            'Tanggal_Bayar' => 'sometimes|date',
            'Total_Bayar' => 'sometimes|numeric',
            'Metode_Bayar' => 'sometimes|in:Cash,Transfer',
            'Bukti_Pembayaran' => 'nullable|string',
            'Verifikasi_Pembayaran' => 'sometimes|in:Menunggu,Diterima,Ditolak',
        ]);

        $pembayaran = Pembayaran::findOrFail($id);

        $pembayaran->update($request->only([
            'Tanggal_Bayar',
            'Total_Bayar',
            'Metode_Bayar',
            'Bukti_Pembayaran',
            'Verifikasi_Pembayaran',
        ]));

        return response()->json($pembayaran);
    }

    public function konfirmasi(Request $request, string $id)
    {
        $request->validate([
            'status' => 'required|in:Diterima,Ditolak',
        ]);

        $pembayaran = Pembayaran::findOrFail($id);

        $pembayaran->update([
            'Verifikasi_Pembayaran' => $request->status,
        ]);

        if ($request->status === 'Diterima') {
            Tagihan::where('Id_Tagihan', $pembayaran->Id_Tagihan)
                ->update([
                    'Status_Tagihan' => 'Lunas',
                ]);
        } else {
            Tagihan::where('Id_Tagihan', $pembayaran->Id_Tagihan)
                ->update([
                    'Status_Tagihan' => 'Belum Bayar',
                ]);
        }

        return response()->json([
            'message' => 'Konfirmasi pembayaran berhasil.',
            'data' => $pembayaran,
        ]);
    }
}