<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Mathématiques, Français, etc.
            $table->text('description')->nullable();
            $table->integer('coefficient')->default(1);
            $table->string('level'); // 6ème, 5ème, etc.
            $table->timestamps();
            $table->unique(['name', 'level']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subjects');
    }
};
