#!/usr/bin/env python3
"""Run backend (FastAPI) and frontend (Vite) together.

Press Ctrl+C once to stop BOTH processes (and their child processes).

Usage:
    python start.py
"""
import os
import signal
import subprocess
import sys
import time

ROOT = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(ROOT, "backend")
FRONTEND_DIR = os.path.join(ROOT, "frontend")
IS_WINDOWS = os.name == "nt"


def backend_python():
    """Prefer the venv interpreter if present, else the current one."""
    if IS_WINDOWS:
        venv_py = os.path.join(BACKEND_DIR, "venv", "Scripts", "python.exe")
    else:
        venv_py = os.path.join(BACKEND_DIR, "venv", "bin", "python")
    return venv_py if os.path.exists(venv_py) else sys.executable


def spawn(cmd, cwd):
    """Start a process in its own process group so we can kill its whole tree.

    `cmd` may be a list (exe + args) or a string. On Windows we use shell=True
    so shims like npm.cmd resolve; elsewhere we start a new session.
    """
    if IS_WINDOWS:
        return subprocess.Popen(
            cmd, cwd=cwd, shell=isinstance(cmd, str),
            creationflags=subprocess.CREATE_NEW_PROCESS_GROUP,
        )
    return subprocess.Popen(cmd, cwd=cwd, preexec_fn=os.setsid)


def kill(proc):
    """Terminate a process and all of its children."""
    if proc is None or proc.poll() is not None:
        return
    try:
        if IS_WINDOWS:
            # /T kills the child tree (uvicorn reloader, node, etc.)
            subprocess.run(
                ["taskkill", "/PID", str(proc.pid), "/T", "/F"],
                stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
            )
        else:
            os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
    except Exception:
        pass


def main():
    backend = frontend = None
    try:
        print("Starting backend on http://localhost:8000 ...")
        backend = spawn(
            [backend_python(), "-m", "uvicorn", "main:app", "--reload", "--port", "8000"],
            cwd=BACKEND_DIR,
        )

        print("Starting frontend on http://localhost:5173 ...")
        frontend = spawn(
            "npm run dev" if IS_WINDOWS else ["npm", "run", "dev"],
            cwd=FRONTEND_DIR,
        )

        print("\nBoth running. Press Ctrl+C to stop both.\n")

        # Wait until either exits; if one dies, stop the other too.
        while backend.poll() is None and frontend.poll() is None:
            time.sleep(0.5)
    except KeyboardInterrupt:
        pass
    finally:
        print("\nShutting down...")
        kill(frontend)
        kill(backend)
        print("Stopped.")


if __name__ == "__main__":
    main()
