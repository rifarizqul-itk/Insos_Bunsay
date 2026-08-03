<?php

namespace App\Http\Controllers;

use App\Models\Pembayaran;
use App\Models\Tagihan;
use Illuminate\Http\Request;

class PembayaranController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Jika tidak ada user login atau rolenya Admin (Id_roles = 1)
        // Maka tampilkan semua pembayaran
        if (!$user || $user->Id_roles == 1) {
            $pembayaran = Pembayaran::with('tagihan.sewa.pemilik')->orderBy('Tanggal_Bayar', 'desc')->get();
            return response()->json($pembayaran);
        }

        // Jika yang login adalah Tenant (Id_roles = 2)
        // Cari Id_Pemilik miliknya
        $pemilik = \App\Models\Pemilik::where('Id_User', $user->Id_user)->first();

        if (!$pemilik) {
            return response()->json([]); // Kosong jika belum punya profil pemilik
        }

        // Filter pembayaran yang tagihannya berelasi ke sewa milik tenant ini
        $pembayaran = Pembayaran::whereHas('tagihan.sewa', function ($query) use ($pemilik) {
            $query->where('Id_Pemilik', $pemilik->Id_Pemilik);
        })->with('tagihan')->orderBy('Tanggal_Bayar', 'desc')->get();

        return response()->json($pembayaran);
    }

    public function store(Request $request)
    {
        $request->validate([
            'Id_Tagihan'           => 'required|exists:tagihan,Id_Tagihan',
            'Tanggal_Bayar'        => 'required|date',
            'Total_Bayar'          => 'required|numeric',
            'Metode_Bayar'         => 'required|in:Transfer,Tunai,Midtrans',
            'Bukti_Pembayaran'     => 'nullable|string',
            'Verifikasi_Pembayaran'=> 'nullable|in:Menunggu,Diterima,Ditolak',
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
            'Tanggal_Bayar'        => 'sometimes|date',
            'Total_Bayar'          => 'sometimes|numeric',
            'Metode_Bayar'         => 'sometimes|in:Transfer,Tunai,Midtrans',
            'Bukti_Pembayaran'     => 'nullable|string',
            'Verifikasi_Pembayaran'=> 'sometimes|in:Menunggu,Diterima,Ditolak',
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