<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DisciplineRecord extends Model
{
    use HasFactory;

    protected $table = 'discipline_records';

    protected $fillable = [
        'student_id', 'type', 'title', 'description',
        'record_date', 'recorded_by'
    ];

    protected $casts = [
        'record_date' => 'date',
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
