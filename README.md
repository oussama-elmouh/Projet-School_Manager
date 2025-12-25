
**Laravel REST API + React (Vite)**

## Overview

School Management System est une application web de gestion scolaire basée sur une **architecture découplée** :

- **Backend** : API REST développée avec Laravel
    
- **Frontend** : Application web développée avec React et Vite
    

Le système permet de gérer l’ensemble des processus scolaires : utilisateurs, classes, élèves, parents, notes, absences, facturation, cantine, transport et messagerie interne.

---

    
- Authentification basée sur **Laravel Sanctum**
    
- Base de données **MySQL**
    

---

## Features

- Gestion des utilisateurs (Admin, Enseignant, Élève, Parent)
    
- Gestion des classes et matières
    
- Gestion des élèves et parents (liaison parent–élève)
    
- Notes et bulletins scolaires
    
- Gestion des absences
    
- Facturation et paiements
    
- Emploi du temps
    
- Messagerie interne
    
- Gestion de la cantine
    
- Gestion du transport scolaire
    

---

## Requirements

### Backend

- PHP 8.2+
    
- Composer
    
- MySQL 8+
    
- Git
    

### Frontend

- Node.js 18+
    
- npm
    

---

## Backend Installation (Laravel API)

### 1. Clone the repository

`git clone https://github.com/oussama-elmouh/Projet-School_Manager.git cd school-management-api`

### 2. Install PHP dependencies

`composer install`

### 3. Environment configuration

`cp .env.example .env`

Edit `.env`:

* APP_NAME="School Management API" <br>
* APP_URL=http://127.0.0.1:8000  <br>
* DB_CONNECTION=mysql <br>
* DB_HOST=127.0.0.1 <br>
* DB_PORT=3306 <br>
* DB_DATABASE=school_management <br>
* DB_USERNAME=root DB_PASSWORD=

### 4. Create the database

`CREATE DATABASE school_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`

### 5. Run migrations and seeders

`php artisan migrate php artisan db:seed`

### 6. Start the Laravel server

`php artisan serve`

The API will be available at:

`http://127.0.0.1:8000/api/v1`

---

## Frontend Installation (React + Vite)

### 1. Install dependencies

`cd school-management-frontend npm install`

### 2. Configure API base URL

Create a `.env` file:

`VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1`

### 3. Start the development server

`npm run dev`

The frontend will be available at:

`http://127.0.0.1:5173`

---

## Authentication

Authentication is handled using **Laravel Sanctum** with token-based access.

### Main endpoints

`POST   /api/v1/auth/register   Register a user (ADMIN, TEACHER, STUDENT, PARENT) POST   /api/v1/auth/login      Login and retrieve token GET    /api/v1/auth/me         Get authenticated user POST   /api/v1/auth/logout     Logout`

### Authorization header

`Authorization: Bearer {TOKEN}`

---

## Main API Endpoints

### Users

`GET    /api/v1/users PATCH  /api/v1/users/{id}/status`

### Classes

`GET    /api/v1/classes POST   /api/v1/classes`

### Students

`GET    /api/v1/students POST   /api/v1/students`

### Parents

`GET    /api/v1/parents POST   /api/v1/parents POST   /api/v1/students/{student}/parents`

### Subjects

`GET    /api/v1/subjects POST   /api/v1/subjects`

### Grades

`GET    /api/v1/grades POST   /api/v1/grades GET    /api/v1/grades/student/bulletin`

### Absences

`GET    /api/v1/absences POST   /api/v1/absences`

### Invoices

`GET    /api/v1/invoices POST   /api/v1/invoices`

### Timetables

`GET    /api/v1/timetables POST   /api/v1/timetables`

### Messaging

`GET    /api/v1/messages POST   /api/v1/messages`

### Cafeteria

`GET    /api/v1/cantine/menus POST   /api/v1/cantine/menus POST   /api/v1/cantine/registrations`

### Transport

`GET    /api/v1/transport/lines POST   /api/v1/transport/lines POST   /api/v1/transport/registrations`

---

## Quick Testing Workflow

1. Start the backend:
    
    `php artisan serve`
    
2. Start the frontend:
    
    `npm run dev`
    
3. Test with Postman or frontend:
    
    - Register an **ADMIN** user
        
    - Login and retrieve token
        
    - Create classes
        
    - Create students and parents
        
    - Link parents to students
        
    - Verify data display
        

---

## Deployment

### Backend

- Apache or Nginx server
    
- PHP 8.2+
    
- MySQL
    
- Properly configure `.env` (`APP_URL`, database, Sanctum)
    

### Frontend

`npm run build`

- Deploy the build folder on Netlify, Vercel or any static hosting
    
- Set `VITE_API_BASE_URL` to the public API URL
    

---

## License

This project is intended for **academic and educational purposes**.  
You may add an open-source license (e.g. MIT) if you plan to publish or reuse the code.
