<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SchoolClass extends Model
{
    use HasFactory;

    protected $table = 'school_classes';

    protected $fillable = ['name', 'level', 'capacity', 'principal_teacher_id', 'academic_year'];

    // Relations
    public function principalTeacher()
    {
        return $this->belongsTo(User::class, 'principal_teacher_id');
    }

    public function students()
    {
        return $this->hasMany(Student::class, 'class_id');
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class, 'class_id');
    }

    public function timeTables()
    {
        return $this->hasMany(TimeTable::class, 'class_id');
    }
}
