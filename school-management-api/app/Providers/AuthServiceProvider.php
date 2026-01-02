<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use App\Models\Classe;
use App\Policies\ClassePolicy;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Classe::class => ClassePolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();
    }
}
