<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'status',
        'phone',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    // Relations
    public function student()
    {
        return $this->hasOne(Student::class);
    }

    public function parent()
    {
        return $this->hasOne(\App\Models\ParentModel::class);
    }

    public function teacherClasses()
    {
        return $this->hasMany(SchoolClass::class, 'principal_teacher_id');
    }

    public function absencesRecorded()
    {
        return $this->hasMany(Absence::class, 'recorded_by');
    }

    public function gradesRecorded()
    {
        return $this->hasMany(Grade::class, 'teacher_id');
    }

    // Scopes pour filtrer par rôle
    public function scopeAdmins($query)
    {
        return $query->where('role', 'ADMIN');
    }

    public function scopeTeachers($query)
    {
        return $query->where('role', 'TEACHER');
    }

    public function scopeParents($query)
    {
        return $query->where('role', 'PARENT');
    }

    public function scopeStudents($query)
    {
        return $query->where('role', 'STUDENT');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'ACTIVE');
    }

    // Helpers
    public function isAdmin()
    {
        return $this->role === 'ADMIN';
    }

    public function isTeacher()
    {
        return $this->role === 'TEACHER';
    }

    public function isParent()
    {
        return $this->role === 'PARENT';
    }

    public function isStudent()
    {
        return $this->role === 'STUDENT';
    }
}
