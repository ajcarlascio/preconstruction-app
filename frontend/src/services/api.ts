import type { User, Project, PaginatedResponse } from '../types'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
  const data = await res.json() as T

  if (!res.ok) {
    const err = data as { error?: string }
    throw new Error(err.error || `Request failed: ${res.status}`)
  }
  return data
}

export const authService = {
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string) =>
    request<{ user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),
}

export const projectService = {
  getAll: (token: string, page = 1) =>
    request<PaginatedResponse<Project>>(`/projects?page=${page}`, {}, token),

  getById: (token: string, id: string) =>
    request<Project>(`/projects/${id}`, {}, token),

  create: (token: string, data: { name: string; description?: string }) =>
    request<Project>('/projects', { method: 'POST', body: JSON.stringify(data) }, token),

  update: (token: string, id: string, data: Partial<Pick<Project, 'name' | 'status'>>) =>
    request<{ message: string }>(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }, token),

  delete: (token: string, id: string) =>
    request<void>(`/projects/${id}`, { method: 'DELETE' }, token),
}