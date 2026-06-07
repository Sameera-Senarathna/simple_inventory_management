# Quick Redeploy Guide

How to push new changes live after the app is already deployed.

**Repo on server:** `/opt/surgical/simple_inventory_management/`
**Backend:** manual uvicorn on `127.0.0.1:8001` · **Frontend:** Nginx serves `frontend/dist/` under `/surgical/`

---

## Step 1 — Push your changes (local / Windows)

```bash
cd "d:/Learning Project/surgical item inventory"
git add -A
git commit -m "describe your change"
git push origin main
```

## Step 2 — Pull on the server

```bash
ssh root@173.249.42.113
cd /opt/surgical/simple_inventory_management
git pull origin main
```

> Note which parts changed — you only need to redo the steps below for what actually changed.

---

## Step 3 — Redeploy the frontend (only if `frontend/` changed)

```bash
cd /opt/surgical/simple_inventory_management/frontend

# only when package.json changed (new/updated dependencies):
npm install

npm run build         # rebuilds dist/ with the /surgical/ base
```

Nginx serves the new `dist/` immediately — no Nginx restart needed.
Then **hard-refresh** the browser (`Ctrl+Shift+R`) to bypass cached HTML.

---

## Step 4 — Restart the backend (only if `backend/` changed)

Stop the running uvicorn, then start it again.

```bash
# find and stop the current process
pkill -f "uvicorn main:app"

# start it again (detached, survives logout)
cd /opt/surgical/simple_inventory_management/backend
source venv/bin/activate
nohup uvicorn main:app --host 127.0.0.1 --port 8001 > backend.log 2>&1 &
```

> Only run `pip install -r requirements.txt` first if backend dependencies changed.

---

## Step 5 — Verify

```bash
# backend up?
curl http://127.0.0.1:8001/health        # -> {"status":"ok"}

# tail backend logs if something looks off
tail -f /opt/surgical/simple_inventory_management/backend/backend.log
```

In the browser: open `http://173.249.42.113/surgical/` and hard-refresh.

---

## Cheat sheet

| What changed | Steps to run |
|---|---|
| Frontend code only | 1 → 2 → 3 |
| Backend code only | 1 → 2 → 4 |
| Both | 1 → 2 → 3 → 4 |
| New npm dependency | add `npm install` in step 3 |
| New Python dependency | add `pip install -r requirements.txt` in step 4 |

---

## Notes

- **Nginx config changes** are *not* part of normal redeploys. If you ever edit the Nginx
  config, run `sudo nginx -t && sudo systemctl reload nginx`.
- **The database is never overwritten** by a redeploy — `surgical_inventory.db` is gitignored
  and lives only on the server.
- If `git pull` complains about local changes on the server (e.g. an edited `dist/` from a
  prior manual build), reset the tree first: `git checkout -- .` then pull. Your gitignored
  files (db, node_modules) are untouched.
