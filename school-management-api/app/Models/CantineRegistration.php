<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CantineRegistration extends Model
{
    use HasFactory;

    protected $table = 'cantine_registrations';

    protected $fillable = ['student_id', 'menu_id', 'status'];

    // Relations
    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function menu()
    {
        return $this->belongsTo(CantineMenu::class, 'menu_id');
    }
}
