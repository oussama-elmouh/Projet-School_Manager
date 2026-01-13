<?php
// database/migrations/2026_01_13_000001_add_billing_month_to_invoices_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            // Format: "YYYY-MM" (ex: 2026-01)
            $table->string('billing_month', 7)->nullable()->after('type');
            $table->index(['billing_month', 'student_id']);
            $table->index(['billing_month', 'type']);
        });
    }

    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropIndex(['billing_month', 'student_id']);
            $table->dropIndex(['billing_month', 'type']);
            $table->dropColumn('billing_month');
        });
    }
};
