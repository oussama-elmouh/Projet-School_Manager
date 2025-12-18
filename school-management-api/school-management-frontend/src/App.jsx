import { useState } from "react";
import api from "./api/client";

function App() {
  const [email, setEmail] = useState("admin1@example.com");
  const [password, setPassword] = useState("password123");
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("auth_token", data.token);
      setUser(data.user);
    } catch (err) {
      setError("Identifiants invalides");
    }
  };

  if (user) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Bonjour, {user.name}</h2>
        <p>Rôle : {user.role}</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 400, margin: "50px auto" }}>
      <h2>Connexion Admin</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>
        <div style={{ marginTop: 10 }}>
          <label>Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" style={{ marginTop: 15 }}>
          Se connecter
        </button>
      </form>
    </div>
  );
}

export default App;
