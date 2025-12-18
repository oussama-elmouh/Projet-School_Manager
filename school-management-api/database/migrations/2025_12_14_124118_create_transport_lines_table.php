<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transport_lines', function (Blueprint $table) {
            $table->id();
            $table->string('line_name'); // ex: "Ligne 1", "Route Marrakech"
            $table->string('start_point');
            $table->string('end_point');
            $table->decimal('price', 6, 2);
            $table->integer('capacity')->default(40);
            $table->enum('status', ['ACTIVE', 'INACTIVE'])->default('ACTIVE');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transport_lines');
    }
};
