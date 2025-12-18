<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Enrollment extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id', 'class_id', 'academic_year', 'status',
        'tuition_amount', 'amount_paid'
    ];

    protected $casts = [
        'tuition_amount' => 'decimal:2',
        'amount_paid' => 'decimal:2',
    ];

    // Relations
    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function class()
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    // Accessors
    public function getRemainingAmountAttribute()
    {
        return $this->tuition_amount - $this->amount_paid;
    }

    public function isPaid()
    {
        return $this->remaining_amount <= 0;
    }
}
