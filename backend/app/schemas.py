from datetime import datetime

from pydantic import BaseModel, EmailStr

from .models import GoalPriority, GoalStatus, MilestoneStatus, Role


# ── Auth ──────────────────────────────────────────────────────────────
class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    name: str
    role: Role
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ── Category ──────────────────────────────────────────────────────────
class CategoryCreate(BaseModel):
    name: str
    color: str = "#6366f1"
    icon: str = "target"


class CategoryOut(BaseModel):
    id: int
    name: str
    color: str
    icon: str

    model_config = {"from_attributes": True}


# ── Milestone ─────────────────────────────────────────────────────────
class MilestoneCreate(BaseModel):
    title: str


class MilestoneUpdate(BaseModel):
    title: str | None = None
    status: MilestoneStatus | None = None


class MilestoneOut(BaseModel):
    id: int
    title: str
    status: MilestoneStatus
    created_at: datetime
    completed_at: datetime | None = None

    model_config = {"from_attributes": True}


# ── Goal ──────────────────────────────────────────────────────────────
class GoalCreate(BaseModel):
    title: str
    description: str = ""
    priority: GoalPriority = GoalPriority.MEDIUM
    deadline: datetime | None = None
    category_id: int | None = None


class GoalUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: GoalStatus | None = None
    priority: GoalPriority | None = None
    deadline: datetime | None = None
    category_id: int | None = None


class GoalOut(BaseModel):
    id: int
    title: str
    description: str
    status: GoalStatus
    priority: GoalPriority
    progress: float
    deadline: datetime | None = None
    created_at: datetime
    updated_at: datetime
    owner_id: int
    category_id: int | None = None
    category: CategoryOut | None = None
    milestones: list[MilestoneOut] = []

    model_config = {"from_attributes": True}


class GoalSummary(BaseModel):
    total: int
    not_started: int
    in_progress: int
    completed: int
    abandoned: int
