<?php

namespace App\Http\Controllers;

use App\Models\Sewa;
use Illuminate\Http\Request;

class SewaController extends Controller
{
    public function index()
    {
        return response()->json(Sewa::all());
    }

    public function store(Request $request)
    {
        $sewa = Sewa::create($request->all());
        return response()->json($sewa, 201);
    }

    public function show(string $id)
    {
        return response()->json(Sewa::findOrFail($id));
    }

    public function update(Request $request, string $id)
    {
        $sewa = Sewa::findOrFail($id);
        $sewa->update($request->all());
        return response()->json($sewa);
    }

    public function destroy(string $id)
    {
        Sewa::findOrFail($id)->delete();
        return response()->json(['message' => 'Data sewa berhasil dihapus.']);
    }
}
