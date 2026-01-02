<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Controllers
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\TeacherController;
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
use App\Http\Controllers\Api\UserController;

// ============================================
// ROUTES PUBLIQUES (sans authentification)
// ============================================
Route::prefix('v1')->group(function () {
    // Authentification
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
    });
});

// ============================================
// ROUTES PROTÉGÉES (authentification requise)
// ============================================
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    
    // ============================================
    // AUTHENTIFICATION
    // ============================================
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/change-password', [AuthController::class, 'changePassword']);
    });

    // ============================================
    // GESTION DES UTILISATEURS
    // ============================================
    Route::prefix('users')->group(function () {
        Route::get('/', [UserController::class, 'index']);
        Route::get('/{user}', [UserController::class, 'show']);
        Route::patch('/{user}/status', [UserController::class, 'updateStatus']);
    });

  // ============================================
// GESTION DES PROFESSEURS
// ============================================
    Route::prefix('teachers')->group(function () {
        Route::get('/', [TeacherController::class, 'index']);
        Route::post('/', [TeacherController::class, 'store']);
        Route::get('/{teacher}', [TeacherController::class, 'show']);
        Route::patch('/{teacher}', [TeacherController::class, 'update']);
        Route::delete('/{teacher}', [TeacherController::class, 'destroy']);
        
        // Relations prof ↔ classes
        Route::post('/{teacher}/assign-class', [TeacherController::class, 'assignClass']);
        Route::delete('/{teacher}/remove-class', [TeacherController::class, 'removeClass']);
    }); 


    // ============================================
    // GESTION DES PARENTS
    // ============================================
    Route::prefix('parents')->group(function () {
        Route::get('/', [ParentController::class, 'index']);
        Route::post('/', [ParentController::class, 'store']);
        Route::get('/{parentModel}', [ParentController::class, 'show']);
        Route::patch('/{parentModel}', [ParentController::class, 'update']);
        Route::delete('/{parentModel}', [ParentController::class, 'destroy']);
    });

    // ============================================
    // GESTION DES CLASSES
    // ============================================
    Route::prefix('classes')->group(function () {
        Route::get('/', [ClassController::class, 'index']);
        Route::post('/', [ClassController::class, 'store']);
        Route::get('/{schoolClass}', [ClassController::class, 'show']);
        Route::patch('/{schoolClass}', [ClassController::class, 'update']);
        Route::delete('/{schoolClass}', [ClassController::class, 'destroy']);
        
        // Élèves d'une classe
        Route::get('/{schoolClass}/students', [ClassController::class, 'students']);
    });
// ============================================
    // GESTION DES ÉLÈVES
    // ============================================
    Route::prefix('students')->group(function () {
        Route::get('/', [StudentController::class, 'index']);
        Route::post('/', [StudentController::class, 'store']);
        Route::get('/{student}', [StudentController::class, 'show']);
        Route::patch('/{student}', [StudentController::class, 'update']);
        Route::delete('/{student}', [StudentController::class, 'destroy']);
        
        // Relations parent-élève
        Route::post('/{student}/parents', [StudentController::class, 'attachParent']);
        Route::delete('/{student}/parents', [StudentController::class, 'detachParent']);
    });

    // ============================================
    // GESTION DES Professeur
    // ============================================

    Route::prefix('auth:sanctum')->group(function () {
    Route::apiResource('teachers', TeacherController::class);
    Route::post('teachers/{teacher}/assign-class', [TeacherController::class, 'assignClass']);
    Route::delete('teachers/{teacher}/remove-class', [TeacherController::class, 'removeClass']);
});
    // ============================================
    // GESTION DES MATIÈRES
    // ============================================
    Route::prefix('subjects')->group(function () {
        Route::get('/', [SubjectController::class, 'index']);
        Route::post('/', [SubjectController::class, 'store']);
        Route::get('/{subject}', [SubjectController::class, 'show']);
        Route::patch('/{subject}', [SubjectController::class, 'update']);
        Route::delete('/{subject}', [SubjectController::class, 'destroy']);
    });

    // ============================================
    // GESTION DES INSCRIPTIONS
    // ============================================
    Route::prefix('enrollments')->group(function () {
        Route::get('/', [EnrollmentController::class, 'index']);
        Route::post('/', [EnrollmentController::class, 'store']);
        Route::get('/{enrollment}', [EnrollmentController::class, 'show']);
        Route::delete('/{enrollment}', [EnrollmentController::class, 'destroy']);
        
        // Paiement des frais
        Route::post('/{enrollment}/pay-tuition', [EnrollmentController::class, 'payTuition']);
    });

    // ============================================
    // GESTION DE L'EMPLOI DU TEMPS
    // ============================================
    Route::prefix('timetables')->group(function () {
        Route::get('/', [TimeTableController::class, 'index']);
        Route::post('/', [TimeTableController::class, 'store']);
        Route::get('/{timeTable}', [TimeTableController::class, 'show']);
        Route::patch('/{timeTable}', [TimeTableController::class, 'update']);
        Route::delete('/{timeTable}', [TimeTableController::class, 'destroy']);
        
        // Emploi du temps par classe et jour
        Route::get('/by-class/schedule', [TimeTableController::class, 'byClass']);
    });

    // ============================================
    // GESTION DES ABSENCES
    // ============================================
    Route::prefix('absences')->group(function () {
        Route::get('/', [AbsenceController::class, 'index']);
        Route::post('/', [AbsenceController::class, 'store']);
        Route::get('/{absence}', [AbsenceController::class, 'show']);
        Route::delete('/{absence}', [AbsenceController::class, 'destroy']);
        
        // Justification d'absence
        Route::patch('/{absence}/justify', [AbsenceController::class, 'justify']);
        
        // Rapport d'absences d'un élève
        Route::get('/student/report', [AbsenceController::class, 'studentReport']);
    });

    // ============================================
    // GESTION DES NOTES
    // ============================================
    Route::prefix('grades')->group(function () {
        Route::get('/', [GradeController::class, 'index']);
        Route::post('/', [GradeController::class, 'store']);
        Route::get('/{grade}', [GradeController::class, 'show']);
        Route::patch('/{grade}', [GradeController::class, 'update']);
        Route::delete('/{grade}', [GradeController::class, 'destroy']);
        
        // Moyenne d'un élève
        Route::get('/student/average', [GradeController::class, 'studentAverage']);
        
        // Bulletin d'un élève
        Route::get('/student/bulletin', [GradeController::class, 'bulletin']);
    });

    // ============================================
    // MESSAGERIE
    // ============================================
    Route::prefix('messages')->group(function () {
        Route::get('/', [MessageController::class, 'index']);
        Route::post('/', [MessageController::class, 'store']);
        Route::get('/{message}', [MessageController::class, 'show']);
        Route::delete('/{message}', [MessageController::class, 'destroy']);
        
        // Messages envoyés
        Route::get('/sent/list', [MessageController::class, 'sent']);
        
        // Marquer comme lu
        Route::patch('/{message}/read', [MessageController::class, 'markAsRead']);
        
        // Compter les messages non lus
        Route::get('/unread/count', [MessageController::class, 'unreadCount']);
    });

    // ============================================
    // GESTION DES FACTURES
    // ============================================
    Route::prefix('invoices')->group(function () {
        Route::get('/', [InvoiceController::class, 'index']);
        Route::post('/', [InvoiceController::class, 'store']);
        Route::get('/{invoice}', [InvoiceController::class, 'show']);
        Route::delete('/{invoice}', [InvoiceController::class, 'destroy']);
        
        // Paiement d'une facture
        Route::post('/{invoice}/pay', [InvoiceController::class, 'pay']);
        
        // Rapport financier d'un élève
        Route::get('/student/report', [InvoiceController::class, 'studentReport']);
    });

    // ============================================
    // GESTION DE LA CANTINE
    // ============================================
    Route::prefix('cantine')->group(function () {
        // Menus
        Route::prefix('menus')->group(function () {
            Route::get('/', [CantineController::class, 'indexMenus']);
            Route::post('/', [CantineController::class, 'storeMenu']);
            Route::get('/{menu}', [CantineController::class, 'showMenu']);
            Route::patch('/{menu}', [CantineController::class, 'updateMenu']);
            Route::delete('/{menu}', [CantineController::class, 'destroyMenu']);
        });
        
        // Inscriptions cantine
        Route::prefix('registrations')->group(function () {
            Route::get('/', [CantineController::class, 'indexRegistrations']);
            Route::post('/', [CantineController::class, 'storeRegistration']);
            Route::delete('/{registration}/cancel', [CantineController::class, 'cancelRegistration']);
        });
    });

    // ============================================
    // GESTION DU TRANSPORT
    // ============================================
    Route::prefix('transport')->group(function () {
        // Lignes de transport
        Route::prefix('lines')->group(function () {
            Route::get('/', [TransportController::class, 'indexLines']);
            Route::post('/', [TransportController::class, 'storeLine']);
            Route::get('/{line}', [TransportController::class, 'showLine']);
            Route::patch('/{line}', [TransportController::class, 'updateLine']);
            Route::delete('/{line}', [TransportController::class, 'destroyLine']);
        });
        
        // Inscriptions transport
        Route::prefix('registrations')->group(function () {
            Route::get('/', [TransportController::class, 'indexRegistrations']);
            Route::post('/', [TransportController::class, 'storeRegistration']);
            Route::delete('/{registration}/cancel', [TransportController::class, 'cancelRegistration']);
        });
    });

    // ============================================
    // GESTION DE LA VIE SCOLAIRE
    // ============================================
    Route::prefix('discipline')->group(function () {
        Route::get('/', [DisciplineController::class, 'index']);
        Route::post('/', [DisciplineController::class, 'store']);
        Route::get('/{record}', [DisciplineController::class, 'show']);
        Route::delete('/{record}', [DisciplineController::class, 'destroy']);
        
        // Rapport de discipline d'un élève
        Route::get('/student/report', [DisciplineController::class, 'studentReport']);
    });
});
