<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cantine_menus', function (Blueprint $table) {
            $table->id();
            $table->date('menu_date');
            $table->enum('type', ['LUNCH', 'BREAKFAST', 'SNACK']);
            $table->longText('description');
            $table->decimal('price', 6, 2);
            $table->integer('quantity_available')->default(100);
            $table->timestamps();
            $table->unique(['menu_date', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cantine_menus');
    }
};
