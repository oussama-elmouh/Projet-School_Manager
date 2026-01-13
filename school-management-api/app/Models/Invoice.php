<?php
// app/Models/Invoice.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'invoice_number',
        'type',
        'billing_month',      // ✅ NEW
        'amount',
        'status',
        'due_date',
        'paid_date',
        'payment_method',
        'payment_reference',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'due_date' => 'date',
        'paid_date' => 'date',
    ];

    public function student()
    {
        return $this->belongsTo(\App\Models\Student::class);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'PENDING');
    }

    public function scopePaid($query)
    {
        return $query->where('status', 'PAID');
    }

    public function scopeOverdue($query)
    {
        return $query->where('status', 'OVERDUE')
            ->orWhere(function ($q) {
                $q->where('status', 'PENDING')
                  ->whereDate('due_date', '<', now());
            });
    }
}
