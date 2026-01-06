let listeners = [];

const fakeNotifications = [
  { id: 1, message: "Nouvelle facture créée", type: "info" },
  { id: 2, message: "Absence non justifiée signalée", type: "warning" },
  { id: 3, message: "Classe 3ème A proche de la capacité maximale", type: "alert" },
];

export function subscribeNotifications(callback) {
  listeners.push(callback);

  // Simule l'arrivée d'une notification toutes les 10 secondes
  const interval = setInterval(() => {
    const notification =
      fakeNotifications[Math.floor(Math.random() * fakeNotifications.length)];

    callback({
      ...notification,
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
    });
  }, 10000);

  return () => clearInterval(interval);
}
