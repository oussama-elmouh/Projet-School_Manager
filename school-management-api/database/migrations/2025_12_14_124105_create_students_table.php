<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        
   
Schema::create('students', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->string('matricule')->unique();
    $table->string('first_name');
    $table->string('last_name');
    $table->date('date_of_birth');
    $table->enum('gender', ['M', 'F', 'OTHER'])->nullable();
    $table->string('address')->nullable();
    $table->string('phone')->nullable();
    $table->text('medical_info')->nullable();
    $table->foreignId('class_id')->nullable()->constrained('school_classes')->onDelete('set null');
    $table->timestamps();
    $table->index('matricule');
});
 }
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
