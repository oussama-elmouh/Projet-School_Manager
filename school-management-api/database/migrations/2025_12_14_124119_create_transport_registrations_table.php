<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transport_registrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('line_id')->constrained('transport_lines')->onDelete('cascade');
            $table->enum('status', ['ACTIVE', 'INACTIVE'])->default('ACTIVE');
            $table->string('pickup_point')->nullable();
            $table->timestamps();
            $table->unique(['student_id', 'line_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transport_registrations');
    }
};
