# Goal Tracker

A full-stack goal tracking application built with **FastAPI** + **React**.

## Features

- User authentication (register / login / JWT)
- Create, edit, and delete goals
- Organize goals by **category** and **priority**
- Set deadlines for goals
- Break goals into **milestones** (sub-tasks)
- Automatic progress calculation based on milestone completion
- Filter goals by status and category
- Dashboard with summary statistics

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Backend  | Python, FastAPI, SQLAlchemy, SQLite |
| Frontend | TypeScript, React, Vite, Tailwind   |
| Auth     | JWT (python-jose), bcrypt           |

## Quick Start

### Backend

```bash
cd backend
uv sync
DATABASE_URL=sqlite:///./app.db uv run uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

### Demo Accounts

| Role  | Email              | Password |
|-------|--------------------|----------|
| Admin | admin@example.com  | admin123 |
| User  | user@example.com   | user123  |

## API Endpoints

| Method | Path                                    | Description             |
|--------|-----------------------------------------|-------------------------|
| POST   | `/api/auth/register`                    | Create account          |
| POST   | `/api/auth/login`                       | Login                   |
| GET    | `/api/auth/me`                          | Current user            |
| GET    | `/api/categories/`                      | List categories         |
| POST   | `/api/categories/`                      | Create category (admin) |
| GET    | `/api/goals/summary`                    | Goal statistics         |
| GET    | `/api/goals/`                           | List goals (filterable) |
| POST   | `/api/goals/`                           | Create goal             |
| GET    | `/api/goals/{id}`                       | Get goal detail         |
| PATCH  | `/api/goals/{id}`                       | Update goal             |
| DELETE | `/api/goals/{id}`                       | Delete goal             |
| POST   | `/api/goals/{id}/milestones`            | Add milestone           |
| PATCH  | `/api/goals/{id}/milestones/{ms_id}`    | Update milestone        |
| DELETE | `/api/goals/{id}/milestones/{ms_id}`    | Delete milestone        |
