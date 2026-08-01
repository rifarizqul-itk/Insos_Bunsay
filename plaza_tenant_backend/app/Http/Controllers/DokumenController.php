<?php

namespace App\Http\Controllers;

use App\Models\Dokumen;
use Illuminate\Http\Request;

class DokumenController extends Controller
{
    public function index()
    {
        return response()->json(Dokumen::all());
    }

    public function store(Request $request)
    {
        $dokumen = Dokumen::create($request->all());
        return response()->json($dokumen, 201);
    }

    public function show(string $id)
    {
        return response()->json(Dokumen::findOrFail($id));
    }

    public function update(Request $request, string $id)
    {
        $dokumen = Dokumen::findOrFail($id);
        $dokumen->update($request->all());
        return response()->json($dokumen);
    }

    public function destroy(string $id)
    {
        Dokumen::findOrFail($id)->delete();
        return response()->json(['message' => 'Dokumen berhasil dihapus.']);
    }
}
