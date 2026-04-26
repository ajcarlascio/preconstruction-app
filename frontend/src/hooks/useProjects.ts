import { useState, useEffect, useCallback } from "react";
import type { Project, PaginatedResponse } from "../types";
import { projectService } from "../services/api";
import { useAuth } from "./useAuth";

export function useProjects() {
  const { token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });

  const fetchProjects = useCallback(
    async (page = 1) => {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        const result: PaginatedResponse<Project> = await projectService.getAll(
          token,
          page,
        );
        setProjects(result.items);
        setPagination({
          page: result.page,
          total: result.total,
          pages: result.pages,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load projects",
        );
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  //useEffect(async () => { fetchProjects(); }, [fetchProjects]);

  const deleteProject = useCallback(
    async (id: string) => {
      if (!token) return;
      await projectService.delete(token, id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    },
    [token],
  );

  return {
    projects,
    loading,
    error,
    pagination,
    refetch: fetchProjects,
    deleteProject,
  };
}

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
