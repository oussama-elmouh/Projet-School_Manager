<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('class_id')->constrained('school_classes')->onDelete('cascade');
            $table->string('academic_year');
            $table->enum('status', ['ACTIVE', 'INACTIVE', 'GRADUATED'])->default('ACTIVE');
            $table->decimal('tuition_amount', 10, 2)->nullable();
            $table->decimal('amount_paid', 10, 2)->default(0);
            $table->timestamps();
            $table->unique(['student_id', 'class_id', 'academic_year']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('enrollments');
    }
};
