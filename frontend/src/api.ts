const BASE = "/api";

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(url: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...opts.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  get: <T>(url: string) => request<T>(url),
  post: <T>(url: string, data: unknown) =>
    request<T>(url, { method: "POST", body: JSON.stringify(data) }),
  patch: <T>(url: string, data: unknown) =>
    request<T>(url, { method: "PATCH", body: JSON.stringify(data) }),
  del: (url: string) => request(url, { method: "DELETE" }),
};

// ── Types ────────────────────────────────────────────────────────────

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

export interface Category {
  id: number;
  name: string;
  color: string;
  icon: string;
}

export type GoalStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "abandoned";
export type GoalPriority = "low" | "medium" | "high";
export type MilestoneStatus = "pending" | "completed";

export interface Milestone {
  id: number;
  title: string;
  status: MilestoneStatus;
  created_at: string;
  completed_at: string | null;
}

export interface Goal {
  id: number;
  title: string;
  description: string;
  status: GoalStatus;
  priority: GoalPriority;
  progress: number;
  deadline: string | null;
  created_at: string;
  updated_at: string;
  owner_id: number;
  category_id: number | null;
  category: Category | null;
  milestones: Milestone[];
}

export interface GoalSummary {
  total: number;
  not_started: number;
  in_progress: number;
  completed: number;
  abandoned: number;
}
