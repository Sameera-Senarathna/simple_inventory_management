"""Application configuration and secret resolution.

Secrets are loaded from the environment (a local .env file in development,
real environment variables in production) and never hardcoded in source.
"""
import os
import secrets
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent

# Load backend/.env if present. Real environment variables take precedence.
load_dotenv(BASE_DIR / ".env")


def _resolve_secret_key() -> str:
    """Return the JWT signing key.

    Priority:
      1. SECRET_KEY environment variable (use this in production).
      2. A locally persisted random key (backend/.jwt_secret), generated on
         first run so tokens survive restarts. This file is gitignored.
    """
    key = os.environ.get("SECRET_KEY")
    if key:
        return key

    key_file = BASE_DIR / ".jwt_secret"
    if key_file.exists():
        return key_file.read_text(encoding="utf-8").strip()

    generated = secrets.token_urlsafe(48)
    key_file.write_text(generated, encoding="utf-8")
    print(
        f"[config] SECRET_KEY not set; generated a local signing key at "
        f"{key_file.name}. Set SECRET_KEY in the environment for production."
    )
    return generated


SECRET_KEY = _resolve_secret_key()
