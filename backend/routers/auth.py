from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from database import get_db
from auth import verify_password, create_token

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/login")
def login(body: LoginRequest):
    with get_db() as conn:
        user = conn.execute(
            "SELECT * FROM users WHERE email = ?", (body.email.lower().strip(),)
        ).fetchone()

    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_token(user["id"], user["email"], bool(user["is_admin"]))
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "is_admin": bool(user["is_admin"]),
        },
    }
