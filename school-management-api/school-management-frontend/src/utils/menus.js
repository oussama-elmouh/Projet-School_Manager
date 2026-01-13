// src/utils/menus.js
export const getMenusByRole = (role) => {
  const menus = {
    ADMIN: [
       { label: "📊 Tableau de bord", to: "/dashboard" },
    { label: "🏫 Classes", to: "/classes" },
    { label: "👨‍🎓 Élèves", to: "/students" },
    { label: "👩‍🏫 Professeurs", to: "/teachers" },
    { label: "📑 Factures", to: "/invoices" },
    { label: "⛔ Absences", to: "/absences" },
    { label: "📝 Notes", to: "/grades" },
    { label: "📘 Notes des élèves", to: "/admin/student-grades" },
    { label: "🗓️ Emploi du temps", to: "/emploi" },
    { label: "💳 Paiements", to: "/admin/payments" },



    ],
    TEACHER: [
      { label: "Dashboard", to: "/dashboard" },
      { label: "Mes classes", to: "/teacher/classes" },
      { label: "Emplois", to: "/teacher/timetable" },
      { label: "Notes", to: "/teacher/grades" },
      { label: "📊 Notes", to: "/grades" }
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
