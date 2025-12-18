<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransportLine extends Model
{
    use HasFactory;

    protected $table = 'transport_lines';

    protected $fillable = ['line_name', 'start_point', 'end_point', 'price', 'capacity', 'status'];

    protected $casts = [
        'price' => 'decimal:2',
    ];

    // Relations
    public function registrations()
    {
        return $this->hasMany(TransportRegistration::class, 'line_id');
    }
}
