from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from ..database import get_db
from ..models import Goal, GoalStatus, Milestone, MilestoneStatus, User
from ..schemas import (
    GoalCreate,
    GoalOut,
    GoalSummary,
    GoalUpdate,
    MilestoneCreate,
    MilestoneOut,
    MilestoneUpdate,
)
from ..security import get_current_user

router = APIRouter(prefix="/api/goals", tags=["goals"])


def _recalc_progress(goal: Goal) -> None:
    if not goal.milestones:
        if goal.status == GoalStatus.COMPLETED:
            goal.progress = 100.0
        return
    done = sum(1 for m in goal.milestones if m.status == MilestoneStatus.COMPLETED)
    goal.progress = round(done / len(goal.milestones) * 100, 1)
    if goal.progress == 100.0 and goal.status != GoalStatus.ABANDONED:
        goal.status = GoalStatus.COMPLETED
    elif goal.progress > 0 and goal.status in (GoalStatus.NOT_STARTED, GoalStatus.COMPLETED):
        goal.status = GoalStatus.IN_PROGRESS
    elif goal.progress == 0 and goal.status == GoalStatus.IN_PROGRESS:
        goal.status = GoalStatus.NOT_STARTED


@router.get("/summary", response_model=GoalSummary)
def goal_summary(
    db: Session = Depends(get_db), user: User = Depends(get_current_user)
):
    goals = db.query(Goal).filter(Goal.owner_id == user.id).all()
    return GoalSummary(
        total=len(goals),
        not_started=sum(1 for g in goals if g.status == GoalStatus.NOT_STARTED),
        in_progress=sum(1 for g in goals if g.status == GoalStatus.IN_PROGRESS),
        completed=sum(1 for g in goals if g.status == GoalStatus.COMPLETED),
        abandoned=sum(1 for g in goals if g.status == GoalStatus.ABANDONED),
    )


@router.get("/", response_model=list[GoalOut])
def list_goals(
    status: GoalStatus | None = Query(None),
    category_id: int | None = Query(None),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = (
        db.query(Goal)
        .options(joinedload(Goal.category), joinedload(Goal.milestones))
        .filter(Goal.owner_id == user.id)
    )
    if status:
        q = q.filter(Goal.status == status)
    if category_id:
        q = q.filter(Goal.category_id == category_id)
    return q.order_by(Goal.created_at.desc()).all()


@router.post("/", response_model=GoalOut, status_code=201)
def create_goal(
    payload: GoalCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    goal = Goal(**payload.model_dump(), owner_id=user.id)
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return (
        db.query(Goal)
        .options(joinedload(Goal.category), joinedload(Goal.milestones))
        .filter(Goal.id == goal.id)
        .first()
    )


@router.get("/{goal_id}", response_model=GoalOut)
def get_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    goal = (
        db.query(Goal)
        .options(joinedload(Goal.category), joinedload(Goal.milestones))
        .filter(Goal.id == goal_id, Goal.owner_id == user.id)
        .first()
    )
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    return goal


@router.patch("/{goal_id}", response_model=GoalOut)
def update_goal(
    goal_id: int,
    payload: GoalUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.owner_id == user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(goal, field, value)
    if "status" not in update_data:
        _recalc_progress(goal)
    db.commit()
    db.refresh(goal)
    return (
        db.query(Goal)
        .options(joinedload(Goal.category), joinedload(Goal.milestones))
        .filter(Goal.id == goal.id)
        .first()
    )


@router.delete("/{goal_id}", status_code=204)
def delete_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.owner_id == user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    db.delete(goal)
    db.commit()


# ── Milestones ────────────────────────────────────────────────────────


@router.post("/{goal_id}/milestones", response_model=MilestoneOut, status_code=201)
def add_milestone(
    goal_id: int,
    payload: MilestoneCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.owner_id == user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    ms = Milestone(title=payload.title, goal_id=goal.id)
    db.add(ms)
    db.flush()
    _recalc_progress(goal)
    db.commit()
    db.refresh(ms)
    return ms


@router.patch("/{goal_id}/milestones/{milestone_id}", response_model=MilestoneOut)
def update_milestone(
    goal_id: int,
    milestone_id: int,
    payload: MilestoneUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.owner_id == user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    ms = (
        db.query(Milestone)
        .filter(Milestone.id == milestone_id, Milestone.goal_id == goal_id)
        .first()
    )
    if not ms:
        raise HTTPException(status_code=404, detail="Milestone not found")
    if payload.title is not None:
        ms.title = payload.title
    if payload.status is not None:
        ms.status = payload.status
        if payload.status == MilestoneStatus.COMPLETED:
            ms.completed_at = datetime.now(timezone.utc)
        else:
            ms.completed_at = None
    _recalc_progress(goal)
    db.commit()
    db.refresh(ms)
    return ms


@router.delete("/{goal_id}/milestones/{milestone_id}", status_code=204)
def delete_milestone(
    goal_id: int,
    milestone_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.owner_id == user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    ms = (
        db.query(Milestone)
        .filter(Milestone.id == milestone_id, Milestone.goal_id == goal_id)
        .first()
    )
    if not ms:
        raise HTTPException(status_code=404, detail="Milestone not found")
    db.delete(ms)
    db.flush()
    _recalc_progress(goal)
    db.commit()
