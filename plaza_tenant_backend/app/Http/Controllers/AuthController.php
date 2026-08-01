<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('Username', $request->username)->first();

        if (!$user || $user->Password !== $request->password) {
            return response()->json(['message' => 'Username atau password salah.'], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => $user,
        ]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'username' => 'required|string|unique:user,Username',
            'password' => 'required|string|min:6',
            'id_roles'  => 'required|integer',
        ]);

        $user = User::create([
            'Username' => $request->username,
            'Password' => $request->password,
            'Id_roles' => $request->id_roles,
        ]);

        return response()->json($user, 201);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logout berhasil.']);
    }
}
