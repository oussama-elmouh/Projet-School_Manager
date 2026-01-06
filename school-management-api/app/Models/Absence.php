<?php

namespace App\Models;
 

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Absence extends Model
{
    protected $fillable = [
        'student_id', 'absence_date', 'period', 'reason',
        'justified', 'justification', 'recorded_by'
    ];

    protected $casts = [
        'absence_date' => 'date',
        'justified' => 'boolean',
    ];

    // Relations
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function recordedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    // Accessors
    public function getStatusLabelAttribute(): string
    {
        return $this->justified ? '✅ Justifiée' : '❌ Non justifiée';
    }

    public function getPeriodLabelAttribute(): string
    {
        return match($this->period) {
            'MORNING' => '🌅 Matin',
            'AFTERNOON' => '🌤️ Après-midi',
            'FULL_DAY' => '📅 Journée complète',
            default => $this->period
        };
    }
}
