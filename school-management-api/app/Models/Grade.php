<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Grade extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id', 'subject_id', 'type', 'score',
        'total_score', 'period', 'teacher_id', 'remarks'
    ];

    protected $casts = [
        'score' => 'decimal:2',
        'total_score' => 'decimal:2',
    ];

    // Relations
    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    // Accessors
    public function getPercentageAttribute()
    {
        return ($this->score / $this->total_score) * 100;
    }
}
