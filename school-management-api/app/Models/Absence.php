<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Absence extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id', 'absence_date', 'period', 'reason',
        'justified', 'justification', 'recorded_by'
    ];

    protected $casts = [
        'absence_date' => 'date',
        'justified' => 'boolean',
    ];

    // Relations
    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function recordedBy()
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}
