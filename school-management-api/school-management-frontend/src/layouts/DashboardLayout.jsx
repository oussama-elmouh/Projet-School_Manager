// src/layouts/DashboardLayout.jsx
import { getMenusByRole } from "../utils/menus";
import { Link, Outlet, useNavigate } from "react-router-dom";

export default function DashboardLayout() {

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("auth_user") || "{}");
  const menus = getMenusByRole(user.role); // fonction qui retourne les liens selon rôle
  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    navigate("/login");
  };
  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-gradient-to-b from-indigo-600 to-indigo-800 text-white p-6">
        <h2 className="text-xl font-bold mb-6">School Admin</h2>
        <nav className="space-y-2 mb-8">
          {menus.map((menu) => (
            <Link key={menu.to} to={menu.to} className="block py-2 px-4 rounded-lg hover:bg-indigo-700">
              {menu.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="w-full py-2 bg-red-500 rounded-lg hover:bg-red-600"
        >
          Déconnexion
        </button>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
