<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('absences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->date('absence_date');
            $table->enum('period', ['MORNING', 'AFTERNOON', 'FULL_DAY'])->default('FULL_DAY');
            $table->text('reason')->nullable(); // Motif de l'absence
            $table->boolean('justified')->default(false); // Est-elle justifiée?
            $table->text('justification')->nullable(); // Preuve/Document
            $table->foreignId('recorded_by')->constrained('users')->onDelete('cascade'); // Prof qui a enregistré
            $table->timestamps();
            
            // Pour éviter les doublons
            $table->unique(['student_id', 'absence_date', 'period']);
            
            // Index pour les recherches rapides
            $table->index('absence_date');
            $table->index('student_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('absences');
    }
};
