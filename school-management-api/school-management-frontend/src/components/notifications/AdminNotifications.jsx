import { useEffect, useState } from "react";
import { subscribeNotifications } from "../../services/notifications";

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeNotifications((notif) => {
      setNotifications((prev) => [notif, ...prev]);
    });

    return unsubscribe;
  }, []);

  return (
    <div className="relative">
      {/* Icône cloche */}
      <button
        onClick={() => setOpen(!open)}
        className="relative text-xl"
        title="Notifications"
      >
        🔔
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
            {notifications.length}
          </span>
        )}
      </button>

      {/* Panneau notifications */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg z-50">
          <div className="p-3 font-semibold border-b">
            Notifications
          </div>
          <ul className="max-h-64 overflow-y-auto">
            {notifications.length === 0 && (
              <li className="p-3 text-sm text-gray-500">
                Aucune notification
              </li>
            )}

            {notifications.map((n) => (
              <li
                key={n.id}
                className={`p-3 text-sm border-b ${
                  n.type === "warning"
                    ? "bg-yellow-50"
                    : n.type === "alert"
                    ? "bg-red-50"
                    : "bg-blue-50"
                }`}
              >
                <div>{n.message}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {n.time}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
