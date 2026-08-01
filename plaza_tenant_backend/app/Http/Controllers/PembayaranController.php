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
        $pembayaran = Pembayaran::create($request->all());
        return response()->json($pembayaran, 201);
    }

    public function show(string $id)
    {
        return response()->json(Pembayaran::findOrFail($id));
    }

    public function konfirmasi(Request $request, string $id)
    {
        $request->validate([
            'status' => 'required|in:Diterima,Ditolak',
        ]);

        $pembayaran = Pembayaran::findOrFail($id);
        $pembayaran->update(['Verifikasi_Pembayaran' => $request->status]);

        // Update status tagihan jika diterima
        if ($request->status === 'Diterima') {
            Tagihan::where('Id_Tagihan', $pembayaran->Id_Tagihan)
                ->update(['Status_Tagihan' => 'Lunas']);
        } elseif ($request->status === 'Ditolak') {
            Tagihan::where('Id_Tagihan', $pembayaran->Id_Tagihan)
                ->update(['Status_Tagihan' => 'Belum Bayar']);
        }

        return response()->json(['message' => 'Konfirmasi pembayaran berhasil.', 'data' => $pembayaran]);
    }
}
