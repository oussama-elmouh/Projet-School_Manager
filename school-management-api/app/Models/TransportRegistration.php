<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransportRegistration extends Model
{
    use HasFactory;

    protected $table = 'transport_registrations';

    protected $fillable = ['student_id', 'line_id', 'status', 'pickup_point'];

    // Relations
    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function line()
    {
        return $this->belongsTo(TransportLine::class, 'line_id');
    }
}
