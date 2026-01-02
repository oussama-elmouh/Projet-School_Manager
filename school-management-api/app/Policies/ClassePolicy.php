<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Classe;

class ClassePolicy
{
    public function viewAny(User $user): bool
    {
        return true;  // Tout le monde peut voir la liste
    }

    public function view(User $user, Classe $classe): bool
    {
        return true;  // Tout le monde peut voir une classe
    }

    public function create(User $user): bool
    {
        return $user->role === 'ADMIN';  // Seul l'admin crée
    }

    public function update(User $user, Classe $classe): bool
    {
        return $user->role === 'ADMIN';  // Seul l'admin modifie
    }

    public function delete(User $user, Classe $classe): bool
    {
        return $user->role === 'ADMIN';  // Seul l'admin supprime
    }

    public function restore(User $user, Classe $classe): bool
    {
        return $user->role === 'ADMIN';
    }

    public function forceDelete(User $user, Classe $classe): bool
    {
        return $user->role === 'ADMIN';
    }
}
