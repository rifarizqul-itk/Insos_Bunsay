<?php

namespace App\Http\Controllers;

use App\Models\Kios;
use Illuminate\Http\Request;

class KiosController extends Controller
{
    public function index()
    {
        return response()->json(Kios::all());
    }

    public function store(Request $request)
    {
        $kios = Kios::create($request->all());
        return response()->json($kios, 201);
    }

    public function show(string $id)
    {
        return response()->json(Kios::findOrFail($id));
    }

    public function update(Request $request, string $id)
    {
        $kios = Kios::findOrFail($id);
        $kios->update($request->all());
        return response()->json($kios);
    }

    public function destroy(string $id)
    {
        Kios::findOrFail($id)->delete();
        return response()->json(['message' => 'Kios berhasil dihapus.']);
    }
}
