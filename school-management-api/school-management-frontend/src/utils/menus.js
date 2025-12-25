// src/utils/menus.js
export const getMenusByRole = (role) => {
  const menus = {
    ADMIN: [
      { label: "Dashboard", to: "/dashboard" },
      { label: "Classes", to: "/classes" },
      { label: "Élèves", to: "/students" },
      { label: "Profs", to: "/teachers" },
      { label: "Factures", to: "/invoices" }
    ],
    TEACHER: [
      { label: "Dashboard", to: "/dashboard" },
      { label: "Mes classes", to: "/teacher/classes" },
      { label: "Emplois", to: "/teacher/timetable" },
      { label: "Notes", to: "/teacher/grades" }
    ],
    STUDENT: [
      { label: "Dashboard", to: "/dashboard" },
      { label: "Mes notes", to: "/student/grades" },
      { label: "Emploi", to: "/student/timetable" },
      { label: "Absences", to: "/student/absences" }
    ]
  };
  return menus[role] || [];
};
