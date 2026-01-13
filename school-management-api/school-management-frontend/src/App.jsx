import { Routes, Route, Navigate } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import ClassesPage from "./pages/ClassesPage.jsx";
import StudentsPage from "./pages/StudentsPage.jsx";
import TeachersPage from "./pages/TeachersPage.jsx";
import GradesPage from "./pages/GradesPage.jsx";
import StudentGradesAdminPage from "./pages/StudentGradesAdminPage.jsx";
import AbsencesByStudentPage from "./pages/AbsencesByStudentPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";
 import InvoiceMonthlyAdminPage from "./pages/InvoiceMonthlyAdminPage";

import TeacherClassStudentsPage from "./pages/teacher/TeacherClassStudentsPage.jsx";
import TimeTableAdminPage from "./pages/TimeTableAdminPage.jsx";
//import GradesPage from './pages/teacher/GradesPage.jsx';


// Dans tes routes :

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      {/* Routes protégées */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/classes" element={<ClassesPage />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/teachers" element={<TeachersPage />} />
          <Route path="/teacher/classes/:classId/students" element={<TeacherClassStudentsPage />} />
          <Route path="/absences" element={<AbsencesByStudentPage />} />
          <Route path="/grades" element={<GradesPage />} />
         <Route path="/admin/student-grades" element={<StudentGradesAdminPage />} />
         <Route path="/emploi" element={<TimeTableAdminPage />} />
         <Route path="/admin/payments" element={<InvoiceMonthlyAdminPage />} />



         {/*  <Route path="/grades" element={<GradesPage />} />*/}

          {/* tu pourras ajouter /students, /parents, etc. */}
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default App;
