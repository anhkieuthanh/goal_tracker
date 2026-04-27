from sqlalchemy.orm import Session

from .models import Category, Role, User
from .security import hash_password


DEFAULT_CATEGORIES = [
    {"name": "Health & Fitness", "color": "#ef4444", "icon": "heart"},
    {"name": "Career", "color": "#f59e0b", "icon": "briefcase"},
    {"name": "Education", "color": "#3b82f6", "icon": "book"},
    {"name": "Finance", "color": "#10b981", "icon": "dollar"},
    {"name": "Personal", "color": "#8b5cf6", "icon": "user"},
    {"name": "Relationships", "color": "#ec4899", "icon": "users"},
]


def seed_database(db: Session) -> None:
    if db.query(User).first() is not None:
        return

    admin = User(
        email="admin@example.com",
        name="Admin",
        hashed_password=hash_password("admin123"),
        role=Role.ADMIN,
    )
    user = User(
        email="user@example.com",
        name="Demo User",
        hashed_password=hash_password("user123"),
        role=Role.USER,
    )
    db.add_all([admin, user])

    for cat in DEFAULT_CATEGORIES:
        db.add(Category(**cat))

    db.commit()
