import { useState, useEffect } from "react";
import { useAuth } from "../features/auth/AuthContext";
import api from "../api/axios";
import axios from "axios";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import MainContent from "../components/MainContent";
import ProjectForm from "../components/ProjectForm";
import styles from "./Dashboard.module.css";

interface Project {
  id: string;
  name: string;
  color: string;
}
interface Column {
  id: string;
  title: string;
  tasks: string[];
}

export default function Dashboard() {
  const { state: authState, dispatch } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // GET
  useEffect(() => {
    async function fetchData() {
      try {
        const [projRes, colRes] = await Promise.all([
          api.get("/projects"),
          api.get("/columns"),
        ]);
        setProjects(projRes.data);
        setColumns(colRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // POST
  async function addProject(name: string, color: string) {
    setSaving(true);
    setError(null);
    try {
      const { data } = await api.post("/projects", { name, color });
      setProjects((prev) => [...prev, data]);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || `Erreur ${err.response?.status}`,
        );
      } else {
        setError("Erreur inconnue");
      }
    } finally {
      setSaving(false);
    }
  }

  // PUT
  async function renameProject(project: Project) {
    const newName = prompt("Nouveau nom :", project.name);
    if (!newName || newName === project.name) return;
    try {
      const { data } = await api.put("/projects/" + project.id, {
        ...project,
        name: newName,
      });
      setProjects((prev) => prev.map((p) => (p.id === project.id ? data : p)));
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || `Erreur ${err.response?.status}`,
        );
      } else {
        setError("Erreur inconnue");
      }
    }
  }

  // DELETE
  async function deleteProject(id: string) {
    if (!confirm("Êtes-vous sûr ?")) return;
    try {
      await api.delete("/projects/" + id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || `Erreur ${err.response?.status}`,
        );
      } else {
        setError("Erreur inconnue");
      }
    }
  }

  if (loading) return <div className={styles.loading}>Chargement...</div>;

  return (
    <div className={styles.layout}>
      <Header
        title="TaskFlow"
        onMenuClick={() => setSidebarOpen((p) => !p)}
        userName={authState.user?.name}
        onLogout={() => dispatch({ type: "LOGOUT" })}
      />
      <div className={styles.body}>
        <Sidebar projects={projects} isOpen={sidebarOpen} />
        <div className={styles.content}>
          <div className={styles.toolbar}>
            {error && <div className={styles.error}>{error}</div>}
            {!showForm ? (
              <button
                className={styles.addBtn}
                disabled={saving}
                onClick={() => setShowForm(true)}
              >
                + Nouveau projet
              </button>
            ) : (
              <ProjectForm
                submitLabel="Créer"
                onSubmit={(name, color) => {
                  addProject(name, color);
                  setShowForm(false);
                }}
                onCancel={() => setShowForm(false)}
              />
            )}
          </div>
          {/* Exemple : boutons renommer/supprimer par projet */}
          <div
            style={{
              padding: "0 24px",
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            {projects.map((p) => (
              <div
                key={p.id}
                style={{ display: "flex", gap: 4, alignItems: "center" }}
              >
                <span style={{ fontSize: 13, color: "#555" }}>{p.name}</span>
                <button
                  onClick={() => renameProject(p)}
                  style={{
                    fontSize: 12,
                    padding: "2px 8px",
                    borderRadius: 6,
                    border: "1px solid #ddd",
                    cursor: "pointer",
                    background: "white",
                  }}
                >
                  ✏️
                </button>
                <button
                  onClick={() => deleteProject(p.id)}
                  style={{
                    fontSize: 12,
                    padding: "2px 8px",
                    borderRadius: 6,
                    border: "1px solid #fcc",
                    cursor: "pointer",
                    background: "#fff5f5",
                    color: "#d32f2f",
                  }}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
          <MainContent columns={columns} />
        </div>
      </div>
    </div>
  );
}
