import { useState } from "react";
import { useProjects, useDebounce } from "../hooks/useProjects";
import { useAuth } from "../hooks/useAuth";
import { projectService } from "../services/api";
import type { Project } from "../types";

export function Dashboard() {
  const { user, token, logout } = useAuth();
  const { projects, loading, error, pagination, refetch, deleteProject } =
    useProjects();
  const [search, setSearch] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [creating, setCreating] = useState(false);

  const debouncedSearch = useDebounce(search, 300);
  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(debouncedSearch.toLowerCase()),
  );

  const handleCreate = async () => {
    if (!newProjectName.trim() || !token) return;
    setCreating(true);
    try {
      await projectService.create(token, { name: newProjectName });
      setNewProjectName("");
      refetch();
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <h1>Preconstruction Projects</h1>
        <div>
          <span style={{ marginRight: 16 }}>
            {user?.name} ({user?.role})
          </span>
          <button onClick={logout}>Logout</button>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <input
          type="text"
          placeholder="New project name..."
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        />
        <button
          onClick={handleCreate}
          disabled={creating || !newProjectName.trim()}
        >
          {creating ? "Creating..." : "Create Project"}
        </button>
      </div>

      <input
        type="search"
        placeholder="Search projects..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: 16, width: "100%" }}
      />

      {loading && <p>Loading projects...</p>}
      {error && (
        <p style={{ color: "red" }}>
          {error} <button onClick={() => refetch()}>Retry</button>
        </p>
      )}

      {!loading && filtered.length === 0 && (
        <p>No projects found. Create your first one above.</p>
      )}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {filtered.map((project: Project) => (
          <li
            key={project.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 16,
              marginBottom: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <h3 style={{ margin: "0 0 4px" }}>{project.name}</h3>
              {project.description && (
                <p style={{ margin: "0 0 8px", color: "#666" }}>
                  {project.description}
                </p>
              )}
              <span
                style={{
                  fontSize: 12,
                  color: project.status === "active" ? "green" : "#999",
                }}
              >
                {project.status} · {project.documents.length} documents
              </span>
            </div>
            <button
              onClick={() => deleteProject(project.id)}
              style={{
                color: "red",
                background: "none",
                border: "1px solid red",
                cursor: "pointer",
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      {pagination.pages > 1 && (
        <div>
          Page {pagination.page} of {pagination.pages} ({pagination.total}{" "}
          total)
          {pagination.page > 1 && (
            <button onClick={() => refetch(pagination.page - 1)}>← Prev</button>
          )}
          {pagination.page < pagination.pages && (
            <button onClick={() => refetch(pagination.page + 1)}>Next →</button>
          )}
        </div>
      )}
    </div>
  );
}
