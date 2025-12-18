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
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->date('absence_date');
            $table->enum('period', ['MORNING', 'AFTERNOON', 'FULL_DAY']);
            $table->text('reason')->nullable();
            $table->boolean('justified')->default(false);
            $table->text('justification')->nullable();
            $table->foreignId('recorded_by')->nullable()
                  ->constrained('users')->onDelete('set null');
            $table->timestamps();
            $table->index(['student_id', 'absence_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('absences');
    }
};
