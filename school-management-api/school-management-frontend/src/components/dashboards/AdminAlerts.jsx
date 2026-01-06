import { useEffect, useState } from "react";
import api from "../../api/client";

export default function AdminAlerts() {
  const alerts = [
    {
      id: 1,
      icon: "💳",
      title: "Factures en retard",
      description: "3 factures nécessitent une intervention",
      color: "yellow",
    },
    {
      id: 2,
      icon: "🚫",
      title: "Absences non justifiées",
      description: "5 absences aujourd’hui sans justification",
      color: "red",
    },
    {
      id: 3,
      icon: "🏫",
      title: "Classes presque pleines",
      description: "2 classes dépassent 90 % de capacité",
      color: "blue",
    },
  ];

  const colorMap = {
    yellow: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-800",
      badge: "bg-yellow-100 text-yellow-800",
    },
    red: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      badge: "bg-red-100 text-red-800",
    },
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800",
      badge: "bg-blue-100 text-blue-800",
    },
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
        ⚠️ Alertes importantes
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {alerts.map((alert) => {
          const c = colorMap[alert.color];

          return (
            <div
              key={alert.id}
              className={`rounded-lg border p-4 ${c.bg} ${c.border}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{alert.icon}</span>
                  <div>
                    <p className={`font-semibold ${c.text}`}>
                      {alert.title}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {alert.description}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${c.badge}`}
                >
                  Alerte
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


