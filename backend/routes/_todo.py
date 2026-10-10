from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from services._database import TodoModelDB, get_db
from models._pydantic_models import (
    TodoCreateSchema,
    TodoUpdateSchema,
    TodoResponseModelPydantic
)
from utils._jwt_util import auth_handler

router = APIRouter(tags=['Todo'])


@router.get("/todos", summary="Get all todos for authenticated user", response_model=List[TodoResponseModelPydantic])
@router.get("/todos/", include_in_schema=False)
def get_todos(
    completed: Optional[bool] = Query(None, description="Filter by completion status (true/false)"),
    search: Optional[str] = Query(None, description="Search todos by title or description"),
    skip: int = Query(0, ge=0, description="Offset for pagination"),
    limit: int = Query(100, ge=1, le=500, description="Limit records per page"),
    db: Session = Depends(get_db),
    user_id: int = Depends(auth_handler.get_current_user_id)
):
    query = db.query(TodoModelDB).filter(TodoModelDB.user_id == user_id)

    if completed is not None:
        query = query.filter(TodoModelDB.completed == completed)

    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                TodoModelDB.title.ilike(search_pattern),
                TodoModelDB.description.ilike(search_pattern)
            )
        )

    # Order by newest first
    todos = query.order_by(TodoModelDB.id.desc()).offset(skip).limit(limit).all()
    return todos


@router.post("/todos", response_model=TodoResponseModelPydantic, status_code=status.HTTP_201_CREATED, summary="Create a new todo")
@router.post("/todos/", include_in_schema=False)
def create_todo(
    todo: TodoCreateSchema,
    db: Session = Depends(get_db),
    user_id: int = Depends(auth_handler.get_current_user_id)
):
    db_todo = TodoModelDB(
        title=todo.title,
        description=todo.description or "",
        completed=todo.completed,
        user_id=user_id
    )
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return db_todo


@router.get("/todos/{todo_id}", response_model=TodoResponseModelPydantic, summary="Get single todo by ID")
def get_single_todo(
    todo_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(auth_handler.get_current_user_id)
):
    db_todo = db.query(TodoModelDB).filter(
        TodoModelDB.id == todo_id,
        TodoModelDB.user_id == user_id
    ).first()

    if db_todo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Todo with ID {todo_id} was not found"
        )
    return db_todo


@router.put("/todos/{todo_id}", response_model=TodoResponseModelPydantic, summary="Update an existing todo")
def update_todo(
    todo_id: int,
    updated_todo: TodoUpdateSchema,
    db: Session = Depends(get_db),
    user_id: int = Depends(auth_handler.get_current_user_id)
):
    db_todo = db.query(TodoModelDB).filter(
        TodoModelDB.id == todo_id,
        TodoModelDB.user_id == user_id
    ).first()

    if db_todo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Todo with ID {todo_id} was not found"
        )

    # Use model_dump to support partial updates safely in Pydantic v2
    update_data = updated_todo.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_todo, key, value)

    db.commit()
    db.refresh(db_todo)
    return db_todo


@router.patch("/todos/{todo_id}/toggle", response_model=TodoResponseModelPydantic, summary="Toggle completed status of a todo")
def toggle_todo_completed(
    todo_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(auth_handler.get_current_user_id)
):
    db_todo = db.query(TodoModelDB).filter(
        TodoModelDB.id == todo_id,
        TodoModelDB.user_id == user_id
    ).first()

    if db_todo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Todo with ID {todo_id} was not found"
        )

    db_todo.completed = not db_todo.completed
    db.commit()
    db.refresh(db_todo)
    return db_todo


@router.delete("/todos/{todo_id}", summary="Delete a todo")
def delete_todo(
    todo_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(auth_handler.get_current_user_id)
):
    db_todo = db.query(TodoModelDB).filter(
        TodoModelDB.id == todo_id,
        TodoModelDB.user_id == user_id
    ).first()

    if db_todo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Todo with ID {todo_id} was not found"
        )

    db.delete(db_todo)
    db.commit()
    return {"message": f"Todo {todo_id} deleted successfully", "id": todo_id}