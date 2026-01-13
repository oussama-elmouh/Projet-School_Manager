<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Grade extends Model
{
    protected $fillable = [
        'student_id', 'subject_id', 'type', 'score', 'total_score',
        'period', 'teacher_id', 'remarks'
    ];

    protected $casts = [
        'score' => 'decimal:2',
        'total_score' => 'decimal:2',
    ];

    // Relations
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }

    // Accessors
    public function getTypeTranslationAttribute(): string
    {
        return match($this->type) {
            'EXAM' => '📝 Examen',
            'ASSIGNMENT' => '📚 Devoir',
            'CLASS_WORK' => '✏️ Travail en classe',
            'PROJECT' => '🎨 Projet',
            default => $this->type
        };
    }

    public function getPercentageAttribute(): float
    {
        if ($this->total_score == 0) return 0;
        return round(($this->score / $this->total_score) * 100, 2);
    }

    public function getGradeStatusAttribute(): string
    {
        $percentage = $this->percentage;
        if ($percentage >= 80) return '🟢 Excellent';
        if ($percentage >= 60) return '🟡 Bon';
        if ($percentage >= 40) return '🟠 Moyen';
        return '🔴 Faible';
    }

    public function getDisplayScoreAttribute(): string
    {
        return "{$this->score}/{$this->total_score}";
    }
}
