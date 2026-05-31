# Deployment Guide — Surgical Item Inventory

How to host this app on a server that **already runs another app (codedrill)** behind
Nginx on **port 80**, accessed by **IP only (`173.249.42.113`), no domain, no HTTPS**.

Because there is no domain, the two apps cannot be separated by `server_name`. Instead
we use **path-based routing**: codedrill stays at `/`, and this app is served under
`/surgical/`.

## Final layout

| App | URL | Frontend (Nginx) | Backend (uvicorn) |
|---|---|---|---|
| codedrill (existing) | `http://173.249.42.113/` | port 80, root `/` | `127.0.0.1:8000` |
| **surgical (this app)** | `http://173.249.42.113/surgical/` | port 80, path `/surgical/` | `127.0.0.1:8001` |

---

## 1. Code changes (already applied in this repo)

These were needed so the React SPA works under the `/surgical/` sub-path and does not
collide with codedrill's existing `/api/`.

| File | Change | Why |
|---|---|---|
| `frontend/vite.config.js` | `base: "/surgical/"` on build (`/` in dev) | Built assets load from `/surgical/assets/...` |
| `frontend/src/App.jsx` | `<BrowserRouter basename="/surgical">` | React Router resolves routes under the sub-path |
| `frontend/src/api/client.js` | API base → `/surgical/api` | Avoids colliding with codedrill's `/api/` |
| `frontend/src/api/client.js` | 401 redirect → `/surgical/login` | Stays inside the sub-path |
| `backend/main.py` | Removed trailing space in seeded admin email | `uchithald@gmail.com` was stored as `"...gmail.com "` |

> Dev mode (`npm run dev`) is unaffected — `base` stays `/` locally.

**Default admin login:** `uchithald@gmail.com` / `Sameera@SriLanka#123`

---

## 2. Copy the code to the server

```bash
sudo mkdir -p /opt/surgical
sudo chown $USER:$USER /opt/surgical
# copy the project here (git clone / scp / rsync) so you have:
#   /opt/surgical/backend
#   /opt/surgical/frontend
```

---

## 3. Set up the Python backend

```bash
cd /opt/surgical/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install uvicorn          # if not already in requirements

# smoke test on the new port (8001, not 8000 — that's codedrill's)
uvicorn main:app --host 127.0.0.1 --port 8001
# visit http://127.0.0.1:8001/health -> {"status":"ok"}, then Ctrl+C
```

> The SQLite file `surgical_inventory.db` is created in the working directory
> (`/opt/surgical/backend/`). The systemd service below pins that directory.

---

## 4. Start the backend manually

Run uvicorn yourself when you want the app up. Pick one of the options below.

### Option A — foreground (simplest, stops when you log out)

```bash
cd /opt/surgical/backend
source venv/bin/activate
uvicorn main:app --host 127.0.0.1 --port 8001
```

Leave this terminal open. Press `Ctrl+C` to stop. The process ends when the SSH session
closes — fine for quick checks, not for leaving it running.

### Option B — keep running after logout (recommended for manual hosting)

Use a detached session so the backend survives closing your terminal:

```bash
cd /opt/surgical/backend
source venv/bin/activate
nohup uvicorn main:app --host 127.0.0.1 --port 8001 > backend.log 2>&1 &
echo $!                       # prints the PID — note it down
```

- Check logs: `tail -f /opt/surgical/backend/backend.log`
- Confirm it's up: `curl http://127.0.0.1:8001/health` -> `{"status":"ok"}`
- Stop it: `kill <PID>` (or `pkill -f "uvicorn main:app"`)

> Alternatively use `tmux` or `screen`: start a session, run the foreground command from
> Option A, then detach (`Ctrl+B D` in tmux). Reattach later with `tmux attach`.

> **Note:** with manual start the backend does **not** restart automatically after a server
> reboot — you must run the command again. (A systemd service would do that for you if you
> change your mind later.)

---

## 5. Build the frontend

```bash
cd /opt/surgical/frontend
npm install
npm run build          # outputs to /opt/surgical/frontend/dist with the /surgical/ base
```

---

## 6. Update the existing Nginx config

Edit the **existing codedrill `server` block** (do **not** add a new one) and add the two
`NEW` location blocks:

```nginx
server {
    listen 80;
    server_name 173.249.42.113;

    # ---- existing codedrill app ----
    root /opt/codedrill/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
    location /api/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # ---- NEW: surgical app frontend ----
    location /surgical/ {
        alias /opt/surgical/frontend/dist/;
        try_files $uri $uri/ /surgical/index.html;
    }

    # ---- NEW: surgical app API ----
    location /surgical/api/ {
        proxy_pass http://127.0.0.1:8001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Why this works:

- `/surgical/api/` is a **more specific** prefix than `/surgical/`, so Nginx matches it first.
- The trailing slash on `proxy_pass http://127.0.0.1:8001/;` strips the `/surgical/api/`
  prefix, so `/surgical/api/auth/login` reaches the backend as `/auth/login` (matching the
  FastAPI routes).
- `alias` (not `root`) maps `/surgical/` to `/opt/surgical/frontend/dist/`.

---

## 7. Apply and test

```bash
sudo nginx -t              # validate config
sudo systemctl reload nginx
```

Then in a browser:

- `http://173.249.42.113/` -> codedrill (unchanged)
- `http://173.249.42.113/surgical/` -> surgical login
  - log in with `uchithald@gmail.com` / `Sameera@SriLanka#123`

No firewall change needed — port 80 is reused.

---

## Notes & hardening

- **Changing the sub-path** (e.g. to `/inventory/`): edit it in **two places** — `base`
  in `frontend/vite.config.js` and the two `location` blocks in Nginx (then rebuild the
  frontend). The router `basename` and API base read from Vite's `BASE_URL` automatically.
- **No HTTPS:** login passwords and JWTs travel in clear text over HTTP. Fine for testing;
  for real use, get a domain + free Let's Encrypt certificate (`certbot`).
- **JWT secret:** if `backend/auth.py` hardcodes the secret, move it to an environment
  variable (e.g. `Environment=SECRET_KEY=...` in the systemd unit) so tokens can't be forged.
- **Backups:** the entire dataset is one file — `/opt/surgical/backend/surgical_inventory.db`.
  Back it up regularly.
- **Redeploying the frontend:** re-run `npm run build`; Nginx serves the new `dist/`
  immediately (no reload needed). After backend code changes, stop the running uvicorn
  process (`Ctrl+C`, or `kill <PID>`) and start it again as in step 4.
