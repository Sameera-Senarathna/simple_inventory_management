from fastapi import APIRouter, HTTPException, status, Depends, Query
from pydantic import BaseModel
from typing import Optional
from datetime import date
from database import get_db
from auth import get_current_user

router = APIRouter(prefix="/transactions", tags=["transactions"])


class TransactionRequest(BaseModel):
    item_id: int
    transaction_type: str
    quantity: int
    date: date
    note: Optional[str] = None


@router.post("", status_code=status.HTTP_201_CREATED)
def create_transaction(body: TransactionRequest, user=Depends(get_current_user)):
    if body.transaction_type not in ("fill", "take"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="type must be 'fill' or 'take'")
    if body.quantity <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Quantity must be positive")

    with get_db() as conn:
        item = conn.execute("SELECT id FROM items WHERE id = ?", (body.item_id,)).fetchone()
        if not item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

        if body.transaction_type == "take":
            row = conn.execute("""
                SELECT COALESCE(SUM(CASE WHEN transaction_type='fill' THEN quantity ELSE 0 END), 0)
                     - COALESCE(SUM(CASE WHEN transaction_type='take' THEN quantity ELSE 0 END), 0)
                     AS qty FROM transactions WHERE item_id = ?
            """, (body.item_id,)).fetchone()
            if row["qty"] < body.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient quantity. Available: {row['qty']}",
                )

        conn.execute(
            "INSERT INTO transactions (item_id, transaction_type, quantity, date, note, created_by) VALUES (?, ?, ?, ?, ?, ?)",
            (body.item_id, body.transaction_type, body.quantity, str(body.date), body.note, user["id"]),
        )
        tx = conn.execute(
            """SELECT t.*, u.name as user_name FROM transactions t
               LEFT JOIN users u ON u.id = t.created_by
               WHERE t.rowid = last_insert_rowid()"""
        ).fetchone()
    return dict(tx)


@router.get("")
def list_transactions(
    item_id: Optional[int] = Query(None),
    user=Depends(get_current_user),
):
    with get_db() as conn:
        if item_id:
            rows = conn.execute("""
                SELECT t.*, u.name as user_name, i.item_name
                FROM transactions t
                LEFT JOIN users u ON u.id = t.created_by
                LEFT JOIN items i ON i.id = t.item_id
                WHERE t.item_id = ?
                ORDER BY t.date DESC, t.created_at DESC
            """, (item_id,)).fetchall()
        else:
            rows = conn.execute("""
                SELECT t.*, u.name as user_name, i.item_name
                FROM transactions t
                LEFT JOIN users u ON u.id = t.created_by
                LEFT JOIN items i ON i.id = t.item_id
                ORDER BY t.date DESC, t.created_at DESC
                LIMIT 100
            """).fetchall()
    return [dict(r) for r in rows]
