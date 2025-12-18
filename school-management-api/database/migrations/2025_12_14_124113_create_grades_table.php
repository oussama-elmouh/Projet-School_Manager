<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('grades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('subject_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['EXAM', 'ASSIGNMENT', 'CLASS_WORK', 'PROJECT']);
            $table->decimal('score', 5, 2);
            $table->decimal('total_score', 5, 2)->default(20);
            $table->enum('period', ['T1', 'T2', 'T3']); // Trimestres
            $table->foreignId('teacher_id')->constrained('users')->onDelete('cascade');
            $table->text('remarks')->nullable();
            $table->timestamps();
            $table->unique(['student_id', 'subject_id', 'type', 'period']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('grades');
    }
};
