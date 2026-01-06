<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddDefaultAcademicYearToSchoolClasses extends Migration
{
    public function up()
    {
        Schema::table('school_classes', function (Blueprint $table) {
            $table->string('academic_year')->default('2025-2026')->change(); // Ajoute la valeur par défaut
        });
    }

    public function down()
    {
        Schema::table('school_classes', function (Blueprint $table) {
            $table->string('academic_year')->default(null)->change(); // Retire la valeur par défaut
        });
    }
}
