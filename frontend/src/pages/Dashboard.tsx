import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, Goal, GoalSummary } from "../api";

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

export default function Dashboard() {
  const [summary, setSummary] = useState<GoalSummary | null>(null);
  const [recent, setRecent] = useState<Goal[]>([]);

  useEffect(() => {
    api.get<GoalSummary>("/goals/summary").then(setSummary);
    api.get<Goal[]>("/goals/").then((g) => setRecent(g.slice(0, 5)));
  }, []);

  if (!summary)
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );

  const cards = [
    { label: "Total Goals", value: summary.total, color: "bg-indigo-500" },
    { label: "In Progress", value: summary.in_progress, color: "bg-blue-500" },
    { label: "Completed", value: summary.completed, color: "bg-green-500" },
    { label: "Not Started", value: summary.not_started, color: "bg-gray-400" },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-lg bg-white p-5 shadow transition hover:shadow-md"
          >
            <p className="text-sm text-gray-500">{c.label}</p>
            <p className="mt-1 text-3xl font-bold">{c.value}</p>
            <div className={`mt-2 h-1 w-12 rounded ${c.color}`} />
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Goals</h2>
          <Link
            to="/goals"
            className="text-sm text-indigo-600 hover:underline"
          >
            View all
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="text-sm text-gray-500">
            No goals yet.{" "}
            <Link to="/goals" className="text-indigo-600 hover:underline">
              Create your first goal
            </Link>
          </p>
        ) : (
          <div className="space-y-3">
            {recent.map((g) => (
              <Link
                key={g.id}
                to={`/goals/${g.id}`}
                className="flex items-center justify-between rounded-lg border p-4 transition hover:bg-gray-50"
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
                  {g.category && (
                    <span
                      className="mt-1 inline-block text-xs"
                      style={{ color: g.category.color }}
                    >
                      {g.category.name}
                    </span>
                  )}
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
    </div>
  );
}
