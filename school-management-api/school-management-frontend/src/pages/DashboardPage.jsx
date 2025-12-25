import AdminDashboard from "../components/dashboards/AdminDashboard";


export default function DashboardPage() {
  const user = JSON.parse(localStorage.getItem("auth_user") || "{}");
  const role = user.role;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">
        Tableau de bord {role}
      </h1>

      {role === "ADMIN" && <AdminDashboard />}
      {/* plus tard : TeacherDashboard, StudentDashboard, etc. */}
    </div>
  );
}
