<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FormSubmission extends Model
{
    protected $fillable = [
        'type',
        'status',
        'name',
        'email',
        'subject',
        'payload',
        'ip',
        'user_agent',
        'read_at',
        'mailed_at',
        'mail_error',
    ];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'read_at' => 'datetime',
            'mailed_at' => 'datetime',
        ];
    }

    public function markRead(): void
    {
        if ($this->status === 'new') {
            $this->status = 'read';
            $this->read_at = now();
            $this->save();
        }
    }
}
