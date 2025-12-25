import { Link, Outlet, useNavigate } from "react-router-dom";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("auth_user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    navigate("/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 220,
          background: "#1f2937",
          color: "white",
          padding: "20px 15px",
        }}
      >
        <h2 style={{ fontSize: 20, marginBottom: 20 }}>School Admin</h2>
        <p style={{ fontSize: 12, marginBottom: 20 }}>
          Connecté : {user?.name} ({user?.role})
        </p>
        <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Link to="/dashboard" style={{ color: "white" }}>
            Dashboard
          </Link>
          <Link to="/classes" style={{ color: "white" }}>
            Classes
          </Link>
          <Link to="/students" style={{ color: "white" }}>
            Élèves
          </Link>
        </nav>
        <button
          onClick={handleLogout}
          style={{ marginTop: 30, padding: "6px 10px", fontSize: 14 }}
        >
          Déconnexion
        </button>
      </aside>

      {/* Contenu */}
      <main style={{ flex: 1, padding: 20, background: "#f3f4f6" }}>
        <Outlet />
      </main>
    </div>
  );
}
