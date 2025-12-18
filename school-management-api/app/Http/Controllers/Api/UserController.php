<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
/*     public function __construct()
    {
        $this->middleware('auth:sanctum');
    } */

  public function index(Request $request)
{
    $query = User::query();

    // Filtrer par rôle si ?role=...
    if ($request->filled('role')) {
        $query->where('role', $request->role);
    }

    // Filtrer par statut si ?status=...
    if ($request->filled('status')) {
        $query->where('status', $request->status);
    }

    // Recherche texte sur nom ou email si ?search=...
    if ($request->filled('search')) {
        $search = $request->search;

        $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%");
        });
    }

    $users = $query->paginate($request->get('per_page', 15));

    return UserResource::collection($users);
}


    public function show(User $user)
    {
        return new UserResource($user);
    }

    public function updateStatus(Request $request, User $user)
    {
        $validated = $request->validate([
            'status' => 'required|in:ACTIVE,INACTIVE,SUSPENDED',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Statut mis à jour avec succès',
            'user' => new UserResource($user),
        ]);
    }
}
