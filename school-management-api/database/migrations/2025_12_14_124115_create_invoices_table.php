<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->string('invoice_number')->unique();
            $table->enum('type', ['TUITION', 'CANTINE', 'TRANSPORT', 'REGISTRATION', 'OTHER']);
            $table->decimal('amount', 10, 2);
            $table->enum('status', ['PENDING', 'PAID', 'OVERDUE', 'CANCELLED'])->default('PENDING');
            $table->date('due_date');
            $table->date('paid_date')->nullable();
            $table->string('payment_method')->nullable(); // CHEQUE, BANK_TRANSFER, CASH
            $table->string('payment_reference')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index(['student_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
