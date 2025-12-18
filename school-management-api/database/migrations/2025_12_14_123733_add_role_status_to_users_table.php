<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Vérifier si les colonnes n'existent pas avant de les ajouter
            if (!Schema::hasColumn('users', 'role')) {
                $table->enum('role', ['ADMIN', 'DIRECTOR', 'TEACHER', 'PARENT', 'STUDENT'])
                      ->default('STUDENT')
                      ->after('email');
            }
            
            if (!Schema::hasColumn('users', 'status')) {
                $table->enum('status', ['ACTIVE', 'INACTIVE', 'SUSPENDED'])
                      ->default('ACTIVE')
                      ->after('role');
            }
            
            if (!Schema::hasColumn('users', 'phone')) {
                $table->string('phone')->nullable()->after('status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Vérifier si les colonnes existent avant de les supprimer
            if (Schema::hasColumn('users', 'role')) {
                $table->dropColumn('role');
            }
            
            if (Schema::hasColumn('users', 'status')) {
                $table->dropColumn('status');
            }
            
            if (Schema::hasColumn('users', 'phone')) {
                $table->dropColumn('phone');
            }
        });
    }
};
