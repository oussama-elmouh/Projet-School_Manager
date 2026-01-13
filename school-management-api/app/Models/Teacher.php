<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Teacher extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'matricule', 'specialization', 'phone', 'email', 'bio', 'status'
    ];

    // Relations
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function classes()
    {
        return $this->belongsToMany(SchoolClass::class, 'teacher_school_class', 'teacher_id', 'class_id')
                    ->withPivot('subject')
                    ->withTimestamps();
    }

    // Accessors
    public function getFullNameAttribute()
    {
        return $this->user?->name ?? 'Unknown';
    }
    public function grades()
{
    return $this->hasMany(Grade::class);
}

}
