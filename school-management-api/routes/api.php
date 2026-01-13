<?php

use Illuminate\Support\Facades\Route;

// Controllers
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\AdminDashboardController;
use App\Http\Controllers\Api\TeacherController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\ParentController;
use App\Http\Controllers\Api\ClassController;
use App\Http\Controllers\Api\SubjectController;
use App\Http\Controllers\Api\EnrollmentController;
use App\Http\Controllers\Api\TimeTableController;
use App\Http\Controllers\Api\AbsenceController;
use App\Http\Controllers\Api\GradeController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\CantineController;
use App\Http\Controllers\Api\TransportController;
use App\Http\Controllers\Api\DisciplineController;
use App\Http\Controllers\Api\AdminAlertController;
use App\Http\Controllers\Api\TeacherDashboardController;


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    // ===============================
    // AUTH PUBLIC
    // ===============================
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
    });

    // ===============================
    // AUTHENTICATED ROUTES
    // ===============================
    Route::middleware('auth:sanctum')->group(function () {

        // Auth
        Route::prefix('auth')->group(function () {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::get('/me', [AuthController::class, 'me']);
            Route::post('/change-password', [AuthController::class, 'changePassword']);
        });

        // Users
        Route::prefix('users')->group(function () {
            Route::get('/', [UserController::class, 'index']);
            Route::get('/{user}', [UserController::class, 'show']);
            Route::patch('/{user}/status', [UserController::class, 'updateStatus']);
        });

        // ===============================
        // DASHBOARD ADMIN
        // ===============================
        Route::get('/admin/dashboard', [AdminDashboardController::class, 'stats']);
        Route::get('/admin/alerts', [AdminAlertController::class, 'index']);
        // ===============================
        // TEACHERS
        // ===============================
        Route::apiResource('teachers', TeacherController::class);
        Route::post('teachers/{teacher}/assign-class', [TeacherController::class, 'assignClass']);
        Route::delete('teachers/{teacher}/remove-class', [TeacherController::class, 'removeClass']);
        Route::get('/teacher/dashboard', [TeacherDashboardController::class, 'index']);
        // ===============================
        // STUDENTS
        // ===============================
        Route::apiResource('students', StudentController::class);
        Route::post('students/{student}/parents', [StudentController::class, 'attachParent']);
        Route::delete('students/{student}/parents', [StudentController::class, 'detachParent']);

        // ===============================
        // CLASSES
        // ===============================
 Route::get('classes/{schoolClass}/students', [ClassController::class, 'students']);

Route::apiResource('classes', ClassController::class)
    ->parameters(['classes' => 'schoolClass']);


        // ===============================
        // SUBJECTS
        // ===============================
        Route::apiResource('subjects', SubjectController::class);
     

        // ===============================
        // ABSENCES
        // ===============================
Route::apiResource('absences', AbsenceController::class);

Route::get('absences/student/{studentId}', [AbsenceController::class, 'getStudentAbsences']);
Route::get('absences/class/{classId}/date/{date}', [AbsenceController::class, 'getByClassAndDate']);
Route::get('absences/report/student/{studentId}', [AbsenceController::class, 'reportStudent']);
Route::apiResource('school-classes', \App\Http\Controllers\Api\SchoolClassController::class);
    Route::apiResource('time-tables', \App\Http\Controllers\Api\TimeTableController::class);
    

        // ===============================
        // emploi du temps
        // ===============================
 Route::apiResource('school-classes', \App\Http\Controllers\Api\SchoolClassController::class)
    ->only(['index', 'show']);

// ===============================
// EMPLOI DU TEMPS
// ===============================
Route::apiResource('time-tables', \App\Http\Controllers\Api\TimeTableController::class);

// Optionnel si tu veux garder ton endpoint spécifique byClass
Route::get('time-tables/by-class', [\App\Http\Controllers\Api\TimeTableController::class, 'byClass']);
// ===============================
// GRADES
// ===============================
Route::apiResource('grades', GradeController::class);
Route::get('grades/student/{studentId}', [GradeController::class, 'studentGrades']);
Route::get('grades/subject/{subjectId}', [GradeController::class, 'subjectGradebook']);
Route::post('grades/bulk', [GradeController::class, 'bulkStore']);
Route::get('grades/student/{studentId}/report', [GradeController::class, 'studentReport']);

        // ===============================
        // INVOICES
        // ===============================
Route::get('invoices/monthly-grid', [InvoiceController::class, 'monthlyGrid']);
Route::post('invoices/monthly-generate', [InvoiceController::class, 'monthlyGenerate']);

// tes routes existantes
Route::apiResource('invoices', InvoiceController::class);
Route::post('invoices/{invoice}/pay', [InvoiceController::class, 'pay']);
Route::get('invoices/student/report', [InvoiceController::class, 'studentReport']);

        // ===============================
        // MESSAGES
        // ===============================
        Route::apiResource('messages', MessageController::class);
        Route::get('messages/sent/list', [MessageController::class, 'sent']);
        Route::get('messages/unread/count', [MessageController::class, 'unreadCount']);
        Route::patch('messages/{message}/read', [MessageController::class, 'markAsRead']);

        // ===============================
        // AUTRES MODULES
        // ===============================
        Route::apiResource('parents', ParentController::class);
        Route::apiResource('enrollments', EnrollmentController::class);
        Route::apiResource('timetables', TimeTableController::class);
        Route::apiResource('discipline', DisciplineController::class);

        Route::prefix('cantine')->group(function () {
            Route::apiResource('menus', CantineController::class);
            Route::apiResource('registrations', CantineController::class);
        });

        Route::prefix('transport')->group(function () {
            Route::apiResource('lines', TransportController::class);
            Route::apiResource('registrations', TransportController::class);
        });

    });
});
