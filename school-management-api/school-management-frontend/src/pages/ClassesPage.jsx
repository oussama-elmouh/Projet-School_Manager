import { useEffect, useState } from "react";
import api from "../api/client";

export default function ClassesPage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchClasses = async () => {
    try {
      const { data } = await api.get("/classes");
      // si ton backend renvoie { data: [...] } avec une Resource, adapte ici :
      setClasses(data.data || data);
    } catch (err) {
      console.error("Erreur chargement classes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  if (loading) return <p>Chargement des classes...</p>;

  return (
    <div>
      <h1>Liste des classes</h1>
      {classes.length === 0 ? (
        <p>Aucune classe trouvée.</p>
      ) : (
        <table
          style={{
            width: "100%",
            marginTop: 15,
            borderCollapse: "collapse",
            background: "white",
          }}
        >
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ddd", padding: 8 }}>ID</th>
              <th style={{ borderBottom: "1px solid #ddd", padding: 8 }}>Nom</th>
              <th style={{ borderBottom: "1px solid #ddd", padding: 8 }}>
                Niveau
              </th>
              <th style={{ borderBottom: "1px solid #ddd", padding: 8 }}>
                Année
              </th>
              <th style={{ borderBottom: "1px solid #ddd", padding: 8 }}>
                Effectif
              </th>
            </tr>
          </thead>
          <tbody>
            {classes.map((classe) => (
              <tr key={classe.id}>
                <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                  {classe.id}
                </td>
                <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                  {classe.name}
                </td>
                <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                  {classe.level}
                </td>
                <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                  {classe.academic_year}
                </td>
                <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                  {classe.students_count ?? "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
