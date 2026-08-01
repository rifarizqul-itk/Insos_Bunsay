<?php

namespace App\Http\Controllers;

use App\Models\Pemilik;
use Illuminate\Http\Request;

class PemilikController extends Controller
{
    public function index()
    {
        return response()->json(Pemilik::all());
    }

    public function store(Request $request)
    {
        $pemilik = Pemilik::create($request->all());
        return response()->json($pemilik, 201);
    }

    public function show(string $id)
    {
        return response()->json(Pemilik::findOrFail($id));
    }

    public function update(Request $request, string $id)
    {
        $pemilik = Pemilik::findOrFail($id);
        $pemilik->update($request->all());
        return response()->json($pemilik);
    }

    public function destroy(string $id)
    {
        Pemilik::findOrFail($id)->delete();
        return response()->json(['message' => 'Pemilik berhasil dihapus.']);
    }
}
