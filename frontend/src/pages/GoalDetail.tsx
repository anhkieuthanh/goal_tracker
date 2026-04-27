import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, Category, Goal, GoalPriority, GoalStatus } from "../api";

const STATUS_OPTIONS: { value: GoalStatus; label: string }[] = [
  { value: "not_started", label: "Not Started" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "abandoned", label: "Abandoned" },
];

const STATUS_COLORS: Record<string, string> = {
  not_started: "bg-gray-100 text-gray-700",
  in_progress: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  abandoned: "bg-red-100 text-red-700",
};

export default function GoalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState(false);
  const [newMilestone, setNewMilestone] = useState("");

  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPriority, setEditPriority] = useState<GoalPriority>("medium");
  const [editStatus, setEditStatus] = useState<GoalStatus>("not_started");
  const [editDeadline, setEditDeadline] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");

  const fetchGoal = () => {
    api.get<Goal>(`/goals/${id}`).then((g) => {
      setGoal(g);
      setEditTitle(g.title);
      setEditDesc(g.description);
      setEditPriority(g.priority);
      setEditStatus(g.status);
      setEditDeadline(g.deadline ? g.deadline.slice(0, 16) : "");
      setEditCategoryId(g.category_id ? String(g.category_id) : "");
    });
  };

  useEffect(() => {
    fetchGoal();
    api.get<Category[]>("/categories/").then(setCategories);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const saveEdit = async (e: FormEvent) => {
    e.preventDefault();
    await api.patch(`/goals/${id}`, {
      title: editTitle,
      description: editDesc,
      priority: editPriority,
      status: editStatus,
      deadline: editDeadline || null,
      category_id: editCategoryId ? Number(editCategoryId) : null,
    });
    setEditing(false);
    fetchGoal();
  };

  const deleteGoal = async () => {
    if (!confirm("Delete this goal?")) return;
    await api.del(`/goals/${id}`);
    navigate("/goals");
  };

  const addMilestone = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMilestone.trim()) return;
    await api.post(`/goals/${id}/milestones`, { title: newMilestone.trim() });
    setNewMilestone("");
    fetchGoal();
  };

  const toggleMilestone = async (msId: number, currentStatus: string) => {
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    await api.patch(`/goals/${id}/milestones/${msId}`, { status: newStatus });
    fetchGoal();
  };

  const deleteMilestone = async (msId: number) => {
    await api.del(`/goals/${id}/milestones/${msId}`);
    fetchGoal();
  };

  if (!goal)
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );

  return (
    <div className="mx-auto max-w-3xl">
      <button
        onClick={() => navigate("/goals")}
        className="mb-4 text-sm text-indigo-600 hover:underline"
      >
        &larr; Back to Goals
      </button>

      <div className="rounded-lg bg-white p-6 shadow">
        {editing ? (
          <form onSubmit={saveEdit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium">Title</label>
                <input
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded border px-3 py-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium">
                  Description
                </label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={3}
                  className="w-full rounded border px-3 py-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) =>
                    setEditStatus(e.target.value as GoalStatus)
                  }
                  className="w-full rounded border px-3 py-2"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Priority
                </label>
                <select
                  value={editPriority}
                  onChange={(e) =>
                    setEditPriority(e.target.value as GoalPriority)
                  }
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
                  value={editCategoryId}
                  onChange={(e) => setEditCategoryId(e.target.value)}
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
                  value={editDeadline}
                  onChange={(e) => setEditDeadline(e.target.value)}
                  className="w-full rounded border px-3 py-2"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="submit"
                className="rounded bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded border px-4 py-2 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold">{goal.title}</h1>
                {goal.description && (
                  <p className="mt-2 text-gray-600">{goal.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(true)}
                  className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50"
                >
                  Edit
                </button>
                <button
                  onClick={deleteGoal}
                  className="rounded border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLORS[goal.status]}`}
              >
                {
                  STATUS_OPTIONS.find((s) => s.value === goal.status)
                    ?.label
                }
              </span>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm capitalize">
                {goal.priority} priority
              </span>
              {goal.category && (
                <span
                  className="rounded-full px-3 py-1 text-sm"
                  style={{
                    backgroundColor: goal.category.color + "20",
                    color: goal.category.color,
                  }}
                >
                  {goal.category.name}
                </span>
              )}
              {goal.deadline && (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">
                  Due: {new Date(goal.deadline).toLocaleDateString()}
                </span>
              )}
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Progress</span>
                <span>{goal.progress}%</span>
              </div>
              <div className="mt-1 h-3 rounded-full bg-gray-200">
                <div
                  className="h-3 rounded-full bg-indigo-500 transition-all"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Milestones */}
      <div className="mt-6 rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold">Milestones</h2>

        <form onSubmit={addMilestone} className="mb-4 flex gap-2">
          <input
            value={newMilestone}
            onChange={(e) => setNewMilestone(e.target.value)}
            placeholder="Add a milestone..."
            className="flex-1 rounded border px-3 py-2 focus:border-indigo-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
          >
            Add
          </button>
        </form>

        {goal.milestones.length === 0 ? (
          <p className="text-sm text-gray-500">
            No milestones yet. Break your goal into smaller steps!
          </p>
        ) : (
          <ul className="space-y-2">
            {goal.milestones.map((ms) => (
              <li
                key={ms.id}
                className="flex items-center justify-between rounded border p-3"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleMilestone(ms.id, ms.status)}
                    className={`h-5 w-5 rounded border-2 transition ${
                      ms.status === "completed"
                        ? "border-green-500 bg-green-500"
                        : "border-gray-300 hover:border-indigo-500"
                    }`}
                  >
                    {ms.status === "completed" && (
                      <svg
                        viewBox="0 0 20 20"
                        fill="white"
                        className="h-full w-full"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                  <span
                    className={
                      ms.status === "completed"
                        ? "text-gray-400 line-through"
                        : ""
                    }
                  >
                    {ms.title}
                  </span>
                </div>
                <button
                  onClick={() => deleteMilestone(ms.id)}
                  className="text-sm text-red-400 hover:text-red-600"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
