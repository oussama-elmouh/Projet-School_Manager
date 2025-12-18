<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvoiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'invoice_number' => $this->invoice_number,
            'student' => new StudentResource($this->whenLoaded('student')),
            'type' => $this->type,
            'amount' => $this->amount,
            'status' => $this->status,
            'due_date' => $this->due_date->format('Y-m-d'),
            'paid_date' => $this->paid_date?->format('Y-m-d'),
            'payment_method' => $this->payment_method,
            'payment_reference' => $this->payment_reference,
            'notes' => $this->notes,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
