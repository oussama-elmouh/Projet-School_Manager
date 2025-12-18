<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cantine_registrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('menu_id')->constrained('cantine_menus')->onDelete('cascade');
            $table->enum('status', ['REGISTERED', 'ATTENDED', 'CANCELLED'])->default('REGISTERED');
            $table->timestamps();
            $table->unique(['student_id', 'menu_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cantine_registrations');
    }
};
