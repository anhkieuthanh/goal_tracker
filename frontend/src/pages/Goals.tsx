import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  api,
  Category,
  Goal,
  GoalPriority,
  GoalStatus,
} from "../api";

const STATUS_COLORS: Record<string, string> = {
  not_started: "bg-gray-100 text-gray-700",
  in_progress: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  abandoned: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  completed: "Completed",
  abandoned: "Abandoned",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "text-gray-500",
  medium: "text-yellow-600",
  high: "text-red-600",
};

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filterStatus, setFilterStatus] = useState<GoalStatus | "">("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<GoalPriority>("medium");
  const [deadline, setDeadline] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [formError, setFormError] = useState("");

  const fetchGoals = () => {
    let url = "/goals/?";
    if (filterStatus) url += `status=${filterStatus}&`;
    if (filterCategory) url += `category_id=${filterCategory}&`;
    api.get<Goal[]>(url).then(setGoals);
  };

  useEffect(() => {
    fetchGoals();
    api.get<Category[]>("/categories/").then(setCategories);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, filterCategory]);

  const createGoal = async (e: FormEvent) => {
    e.preventDefault();
    setFormError("");
    try {
      await api.post("/goals/", {
        title,
        description,
        priority,
        deadline: deadline || null,
        category_id: categoryId ? Number(categoryId) : null,
      });
      setTitle("");
      setDescription("");
      setPriority("medium");
      setDeadline("");
      setCategoryId("");
      setShowForm(false);
      fetchGoals();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to create");
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Goals</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          {showForm ? "Cancel" : "+ New Goal"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={createGoal}
          className="mb-6 rounded-lg bg-white p-6 shadow"
        >
          <h2 className="mb-4 text-lg font-semibold">New Goal</h2>
          {formError && (
            <p className="mb-3 rounded bg-red-50 p-2 text-sm text-red-600">
              {formError}
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">Title</label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded border px-3 py-2 focus:border-indigo-500 focus:outline-none"
                placeholder="e.g. Learn TypeScript"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full rounded border px-3 py-2 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as GoalPriority)}
                className="w-full rounded border px-3 py-2"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded border px-3 py-2"
              >
                <option value="">None</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Deadline
              </label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded border px-3 py-2"
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 rounded bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Create Goal
          </button>
        </form>
      )}

      <div className="mb-4 flex gap-3">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as GoalStatus | "")}
          className="rounded border px-3 py-1.5 text-sm"
        >
          <option value="">All statuses</option>
          <option value="not_started">Not Started</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="abandoned">Abandoned</option>
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="rounded border px-3 py-1.5 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {goals.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow">
          <p className="text-gray-500">No goals found. Create one above!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((g) => (
            <Link
              key={g.id}
              to={`/goals/${g.id}`}
              className="flex items-center justify-between rounded-lg bg-white p-4 shadow transition hover:shadow-md"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium">{g.title}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[g.status]}`}
                  >
                    {STATUS_LABELS[g.status]}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                  {g.category && (
                    <span style={{ color: g.category.color }}>
                      {g.category.name}
                    </span>
                  )}
                  {g.deadline && (
                    <span>
                      Due: {new Date(g.deadline).toLocaleDateString()}
                    </span>
                  )}
                  <span>
                    {g.milestones.length} milestone
                    {g.milestones.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              <div className="ml-4 flex items-center gap-4">
                <span
                  className={`text-xs font-medium uppercase ${PRIORITY_COLORS[g.priority]}`}
                >
                  {g.priority}
                </span>
                <div className="w-24">
                  <div className="h-2 rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-indigo-500 transition-all"
                      style={{ width: `${g.progress}%` }}
                    />
                  </div>
                  <p className="mt-0.5 text-right text-xs text-gray-500">
                    {g.progress}%
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
