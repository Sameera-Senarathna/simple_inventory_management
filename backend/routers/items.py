from fastapi import APIRouter, HTTPException, status, Depends, Query
from pydantic import BaseModel
from typing import Optional
from database import get_db, STORES
from auth import get_current_user

router = APIRouter(prefix="/items", tags=["items"])


class ItemRequest(BaseModel):
    item_name: str
    store: str


def _validate_store(store: str):
    if store not in STORES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid store. Must be one of: {', '.join(STORES)}",
        )


@router.get("")
def list_items(store: Optional[str] = Query(None), user=Depends(get_current_user)):
    with get_db() as conn:
        if store:
            rows = conn.execute("""
                SELECT i.id, i.item_name, i.store, i.created_at,
                    COALESCE(SUM(CASE WHEN t.transaction_type='fill' THEN t.quantity ELSE 0 END), 0)
                    - COALESCE(SUM(CASE WHEN t.transaction_type='take' THEN t.quantity ELSE 0 END), 0)
                    AS quantity
                FROM items i
                LEFT JOIN transactions t ON t.item_id = i.id
                WHERE i.store = ?
                GROUP BY i.id
                ORDER BY i.item_name
            """, (store,)).fetchall()
        else:
            rows = conn.execute("""
                SELECT i.id, i.item_name, i.store, i.created_at,
                    COALESCE(SUM(CASE WHEN t.transaction_type='fill' THEN t.quantity ELSE 0 END), 0)
                    - COALESCE(SUM(CASE WHEN t.transaction_type='take' THEN t.quantity ELSE 0 END), 0)
                    AS quantity
                FROM items i
                LEFT JOIN transactions t ON t.item_id = i.id
                GROUP BY i.id
                ORDER BY i.item_name
            """).fetchall()
    return [dict(r) for r in rows]


@router.post("", status_code=status.HTTP_201_CREATED)
def create_item(body: ItemRequest, user=Depends(get_current_user)):
    _validate_store(body.store)
    name = body.item_name.strip()
    if not name:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Item name is required")
    with get_db() as conn:
        conn.execute(
            "INSERT INTO items (item_name, store, created_by) VALUES (?, ?, ?)",
            (name, body.store, user["id"]),
        )
        item = conn.execute(
            "SELECT id, item_name, store, created_at FROM items WHERE rowid = last_insert_rowid()"
        ).fetchone()
    return {**dict(item), "quantity": 0}


@router.put("/{item_id}")
def update_item(item_id: int, body: ItemRequest, user=Depends(get_current_user)):
    _validate_store(body.store)
    name = body.item_name.strip()
    if not name:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Item name is required")
    with get_db() as conn:
        result = conn.execute(
            "UPDATE items SET item_name = ?, store = ? WHERE id = ?",
            (name, body.store, item_id),
        )
        if result.rowcount == 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
        item = conn.execute(
            """SELECT i.id, i.item_name, i.store, i.created_at,
                COALESCE(SUM(CASE WHEN t.transaction_type='fill' THEN t.quantity ELSE 0 END), 0)
                - COALESCE(SUM(CASE WHEN t.transaction_type='take' THEN t.quantity ELSE 0 END), 0)
                AS quantity
               FROM items i LEFT JOIN transactions t ON t.item_id = i.id
               WHERE i.id = ? GROUP BY i.id""",
            (item_id,),
        ).fetchone()
    return dict(item)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: int, user=Depends(get_current_user)):
    with get_db() as conn:
        result = conn.execute("DELETE FROM items WHERE id = ?", (item_id,))
        if result.rowcount == 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
