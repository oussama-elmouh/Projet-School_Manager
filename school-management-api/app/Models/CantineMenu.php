<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CantineMenu extends Model
{
    use HasFactory;

    protected $table = 'cantine_menus';

    protected $fillable = [
        'menu_date', 'type', 'description', 'price', 'quantity_available'
    ];

    protected $casts = [
        'menu_date' => 'date',
        'price' => 'decimal:2',
    ];

    // Relations
    public function registrations()
    {
        return $this->hasMany(CantineRegistration::class, 'menu_id');
    }
}
