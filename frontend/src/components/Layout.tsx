import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { User } from "../api";

interface Props {
  user: User;
  onLogout: () => void;
  children: ReactNode;
}

const NAV = [
  { to: "/", label: "Dashboard" },
  { to: "/goals", label: "Goals" },
];

export default function Layout({ user, onLogout, children }: Props) {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen">
      <header className="bg-indigo-600 text-white shadow">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-xl font-bold tracking-tight">
            Goal Tracker
          </Link>

          <nav className="flex items-center gap-6">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={`text-sm font-medium transition ${
                  pathname === n.to
                    ? "text-white underline underline-offset-4"
                    : "text-indigo-200 hover:text-white"
                }`}
              >
                {n.label}
              </Link>
            ))}

            <span className="text-sm text-indigo-200">{user.name}</span>
            <button
              onClick={onLogout}
              className="rounded bg-indigo-500 px-3 py-1 text-sm hover:bg-indigo-400"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
