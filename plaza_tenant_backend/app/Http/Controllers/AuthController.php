<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('Username', $request->username)->first();

        // Gunakan Hash::check() agar aman (password di-hash saat register)
        if (!$user || !Hash::check($request->password, $user->Password)) {
            return response()->json(['message' => 'Username atau password salah.'], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => [
                'Id_user'  => $user->Id_user,
                'Username' => $user->Username,
                'Id_roles' => $user->Id_roles,
            ],
        ]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'username' => 'required|string|unique:user,Username',
            'password' => 'required|string|min:6',
            'id_roles' => 'required|integer',
        ]);

        $user = User::create([
            'Username' => $request->username,
            'Password' => Hash::make($request->password), // Hash password sebelum disimpan
            'Id_roles' => $request->id_roles,
        ]);

        return response()->json([
            'Id_user'  => $user->Id_user,
            'Username' => $user->Username,
            'Id_roles' => $user->Id_roles,
        ], 201);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logout berhasil.']);
    }
}
