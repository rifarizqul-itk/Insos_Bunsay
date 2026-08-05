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
            'Id_Sewa' => 'required|exists:sewa,Id_Sewa',
            'Periode' => 'required|string|max:7',
            'Jatuh_Tempo' => 'required|date',
            'Tarif_Sewa' => 'required|numeric',
            'Hutang_Tunggakan' => 'nullable|numeric',
            'Total_Tagihan' => 'required|numeric',
            'Status_Tagihan' => 'required|in:Lunas,Belum Bayar,Menunggu Verifikasi,Dicicil',
        ]);

        $tagihan = Tagihan::create($request->only([
            'Id_Sewa',
            'Periode',
            'Jatuh_Tempo',
            'Tarif_Sewa',
            'Hutang_Tunggakan',
            'Total_Tagihan',
            'Status_Tagihan',
        ]));

        return response()->json($tagihan, 201);
    }

    public function show(string $id)
    {
        return response()->json(Tagihan::findOrFail($id));
    }

    public function update(Request $request, string $id)
    {
        $request->validate([
            'Periode' => 'sometimes|string|max:7',
            'Jatuh_Tempo' => 'sometimes|date',
            'Tarif_Sewa' => 'sometimes|numeric',
            'Hutang_Tunggakan' => 'sometimes|numeric',
            'Total_Tagihan' => 'sometimes|numeric',
            'Status_Tagihan' => 'sometimes|in:Lunas,Belum Bayar,Menunggu Verifikasi,Dicicil',
        ]);

        $tagihan = Tagihan::findOrFail($id);

        $tagihan->update($request->only([
            'Periode',
            'Jatuh_Tempo',
            'Tarif_Sewa',
            'Hutang_Tunggakan',
            'Total_Tagihan',
            'Status_Tagihan',
        ]));

        return response()->json($tagihan);
    }
}