<?php

namespace App\Http\Controllers;

use App\Models\Tagihan;
use Illuminate\Http\Request;

class TagihanController extends Controller
{
    public function index()
    {
        return response()->json(Tagihan::all());
    }

    public function store(Request $request)
    {
        $tagihan = Tagihan::create($request->all());
        return response()->json($tagihan, 201);
    }

    public function show(string $id)
    {
        return response()->json(Tagihan::findOrFail($id));
    }

    public function update(Request $request, string $id)
    {
        $tagihan = Tagihan::findOrFail($id);
        $tagihan->update($request->all());
        return response()->json($tagihan);
    }
}
