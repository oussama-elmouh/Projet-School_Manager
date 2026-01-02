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

    public function absences()
    {
        return $this->hasMany(Absence::class);
    }

    public function grades()
    {
        return $this->hasMany(Grade::class);
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
