from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db, get_db, STORES
from auth import hash_password
from routers import auth, users, items, transactions


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    _seed_admin()
    yield


app = FastAPI(title="Surgical Item Inventory", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(items.router)
app.include_router(transactions.router)


def _seed_admin():
    with get_db() as conn:
        existing = conn.execute("SELECT id FROM users WHERE email = 'uchithald@gmail.com'").fetchone()
        if not existing:
            conn.execute(
                "INSERT INTO users (email, name, password_hash, is_admin, must_change_password) VALUES (?, ?, ?, 1, 1)",
                ("uchithald@gmail.com", "Admin", hash_password("Sameera@SriLanka#123")),
            )


@app.get("/stores")
def get_stores():
    return STORES


@app.get("/health")
def health():
    return {"status": "ok"}
