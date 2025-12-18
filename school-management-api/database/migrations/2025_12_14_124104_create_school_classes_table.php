<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('school_classes', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // ex: "3A", "Seconde 1"
            $table->string('level'); // ex: "6ème", "5ème", "Seconde"
            $table->integer('capacity')->default(30);
            $table->foreignId('principal_teacher_id')->nullable()
                  ->constrained('users')->onDelete('set null');
            $table->string('academic_year'); // ex: "2024-2025"
            $table->timestamps();
            $table->unique(['name', 'academic_year']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('school_classes');
    }
};
