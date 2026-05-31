from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from database import get_db
from auth import hash_password, require_admin

router = APIRouter(prefix="/users", tags=["users"])


class CreateUserRequest(BaseModel):
    email: str
    name: str
    password: str
    is_admin: bool = False


@router.get("")
def list_users(admin=Depends(require_admin)):
    with get_db() as conn:
        rows = conn.execute(
            "SELECT id, email, name, is_admin, created_at FROM users ORDER BY created_at DESC"
        ).fetchall()
    return [dict(r) for r in rows]


@router.post("", status_code=status.HTTP_201_CREATED)
def create_user(body: CreateUserRequest, admin=Depends(require_admin)):
    email = body.email.lower().strip()
    with get_db() as conn:
        existing = conn.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists")
        conn.execute(
            "INSERT INTO users (email, name, password_hash, is_admin) VALUES (?, ?, ?, ?)",
            (email, body.name.strip(), hash_password(body.password), int(body.is_admin)),
        )
        user = conn.execute("SELECT id, email, name, is_admin, created_at FROM users WHERE email = ?", (email,)).fetchone()
    return dict(user)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, admin=Depends(require_admin)):
    if user_id == admin["id"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete yourself")
    with get_db() as conn:
        result = conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
        if result.rowcount == 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
