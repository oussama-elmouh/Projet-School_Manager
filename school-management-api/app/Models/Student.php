<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'matricule', 'first_name', 'last_name',
        'date_of_birth', 'gender', 'address', 'phone', 'medical_info', 'class_id'
    ];

    protected $casts = [
        'date_of_birth' => 'date',
    ];

    

    // Relations
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function currentClass()
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }

    public function parents()
    {
        return $this->belongsToMany(ParentModel::class, 'parent_student');
    }

    // Relation avec les absences
public function absences()
{
    return $this->hasMany(Absence::class);
}

// Accessors pour stats
public function getAbsencesCountAttribute()
{
    return $this->absences()->count();
}

public function getAbsencesThisMonthAttribute()
{
    return $this->absences()
        ->whereMonth('absence_date', now()->month)
        ->whereYear('absence_date', now()->year)
        ->count();
}

public function getJustifiedAbsencesAttribute()
{
    return $this->absences()->where('justified', true)->count();
}

public function getUnjustifiedAbsencesAttribute()
{
    return $this->absences()->where('justified', false)->count();
}

    public function grades()
{
    return $this->hasMany(Grade::class);
}

// Accesseur pour la moyenne générale
public function getAverageAttribute()
{
    $grades = $this->grades;
    if ($grades->isEmpty()) return 0;

    $totalPoints = $grades->sum('score');
    $totalPossible = $grades->sum('total_score');

    return $totalPossible > 0 ? round(($totalPoints / $totalPossible) * 100, 2) : 0;
}


    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    public function cantineRegistrations()
    {
        return $this->hasMany(CantineRegistration::class);
    }

    public function transportRegistrations()
    {
        return $this->hasMany(TransportRegistration::class);
    }

    public function disciplineRecords()
    {
        return $this->hasMany(DisciplineRecord::class);
    }

    public function messages()
    {
        return $this->hasMany(Message::class, 'recipient_id');
    }

    // Accessors
    public function getFullNameAttribute()
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function getAgeAttribute()
    {
        return $this->date_of_birth->diffInYears(now());
    }
    
}
