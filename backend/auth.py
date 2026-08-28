"""
auth.py — User authentication and management for the COR-HARP API.

Uses SQLite for persistence, SHA-256 password hashing, and SendGrid OTP emails.
Extracted from the Streamlit app.py to run independently.
"""
from __future__ import annotations

import hashlib
import os
import random
import re
import sqlite3
import string
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from dotenv import load_dotenv

# Load .env from the hairp_app directory (where the real .env lives)
_ENV_PATH = Path(__file__).resolve().parent.parent / "hairp_app" / ".env"
load_dotenv(_ENV_PATH)

SENDGRID_API_KEY = os.environ.get("SENDGRID_API_KEY", "")
SENDGRID_SENDER_EMAIL = os.environ.get("SENDGRID_SENDER_EMAIL", "noreply@cor-harp.org")
SENDGRID_SENDER_NAME = os.environ.get("SENDGRID_SENDER_NAME", "COR-HARP Humanitarian AI")
OTP_EXPIRY_SECONDS = int(os.environ.get("OTP_EXPIRY_SECONDS", "300"))

# Allow overriding DB location via env var (Azure: use /home for writable persistent storage)
DB_PATH = Path(os.environ.get("COR_HARP_DB_PATH", Path(__file__).resolve().parent.parent / "hairp_app" / "users.db"))

# In-memory OTP store: {email: (code, sent_at, pending_name, pending_pass)}
_otp_store: Dict[str, Dict[str, Any]] = {}


# ── Database ────────────────────────────────────────────────────────────────

def init_db():
    """Create the users table and seed admin user."""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL,
            clearance_level TEXT DEFAULT 'STANDARD',
            has_seen_onboarding INTEGER DEFAULT 0
        )
    """)
    conn.commit()
    # Migration
    try:
        conn.execute("ALTER TABLE users ADD COLUMN has_seen_onboarding INTEGER DEFAULT 0")
        conn.commit()
    except sqlite3.OperationalError:
        pass
    # Seed admin
    admin_hash = hashlib.sha256("admin".encode()).hexdigest()
    try:
        conn.execute(
            "INSERT INTO users (name, email, password_hash, created_at, clearance_level, has_seen_onboarding) VALUES (?, ?, ?, ?, ?, ?)",
            ("Administrator", "admin", admin_hash, datetime.now().isoformat(), "ADMIN", 1),
        )
        conn.commit()
    except sqlite3.IntegrityError:
        pass
    conn.close()


# ── Helpers ─────────────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def generate_otp() -> str:
    return ''.join(random.choices(string.digits, k=6))


def is_valid_email(email: str) -> bool:
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def is_otp_expired(sent_at: Optional[datetime]) -> bool:
    if sent_at is None:
        return True
    return (datetime.now() - sent_at).total_seconds() > OTP_EXPIRY_SECONDS


# ── Email (SendGrid) ───────────────────────────────────────────────────────

def send_otp_email(target_email: str, otp_code: str, user_name: str) -> Tuple[bool, str]:
    """Send branded OTP email via SendGrid. Returns (success, message)."""
    try:
        import sendgrid
        from sendgrid.helpers.mail import Mail

        sg = sendgrid.SendGridAPIClient(api_key=SENDGRID_API_KEY)
        html_body = f"""
        <html><body style="margin:0;padding:0;background:#0B0E17;font-family:'Segoe UI',system-ui,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#0B0E17;padding:40px 20px;">
        <tr><td align="center"><table width="480" cellpadding="0" cellspacing="0" style="background:#131825;border-radius:12px;border:1px solid rgba(0,158,219,0.2);">
        <tr><td style="background:linear-gradient(135deg,#1F4E79 0%,#0A1628 100%);padding:24px 32px;border-bottom:2px solid #009EDB;">
        <span style="background:#009EDB;color:white;padding:4px 10px;border-radius:3px;font-size:11px;font-weight:700;letter-spacing:1.5px;">COR-HARP</span>
        <span style="color:#4BA3E3;font-size:11px;letter-spacing:1px;float:right;">OPEN SOURCE</span>
        <h1 style="color:white;font-size:20px;margin:12px 0 4px 0;">Email Verification</h1>
        <p style="color:#4BA3E3;font-size:12px;margin:0;">Humanitarian AI Resource Predictor</p>
        </td></tr>
        <tr><td style="padding:32px;">
        <p style="color:#B0BCC8;font-size:14px;">Hello <strong style="color:#4BA3E3;">{user_name}</strong>,</p>
        <p style="color:#B0BCC8;font-size:14px;">Your verification code:</p>
        <div style="background:#0B0E17;border:2px solid #009EDB;border-radius:8px;padding:20px;text-align:center;margin:16px 0;">
        <p style="color:#009EDB;font-size:36px;font-weight:700;letter-spacing:8px;font-family:'Courier New',monospace;margin:0;">{otp_code}</p>
        <p style="color:#5A6872;font-size:11px;">Expires in {OTP_EXPIRY_SECONDS // 60} minutes</p>
        </div>
        <p style="color:#7A8A9A;font-size:12px;">Do not share this code. If you didn't request it, ignore this email.</p>
        </td></tr>
        </table></td></tr></table></body></html>
        """

        message = Mail(
            from_email=(SENDGRID_SENDER_EMAIL, SENDGRID_SENDER_NAME),
            to_emails=target_email,
            subject="COR-HARP: Your Email Verification Code",
            html_content=html_body,
        )
        response = sg.client.mail.send.post(request_body=message)
        if response.status_code in (200, 201, 202):
            return True, "Verification code sent"
        else:
            print(f"[SendGrid] Status {response.status_code}. OTP for {target_email}: {otp_code}")
            return True, f"Email service status {response.status_code} — code logged"
    except ImportError:
        print(f"[OTP FALLBACK] SendGrid not installed. OTP for {target_email}: {otp_code}")
        return True, "SendGrid not installed — code in server logs"
    except Exception as e:
        print(f"[OTP FALLBACK] Email failed: {e}. OTP for {target_email}: {otp_code}")
        return True, "Email failed — code in server logs"


# ── Auth Operations ─────────────────────────────────────────────────────────

def register_user(name: str, email: str, password: str) -> Tuple[bool, str]:
    """Register a new user. Returns (success, message)."""
    if not is_valid_email(email):
        return False, "Invalid email format"
    conn = sqlite3.connect(str(DB_PATH))
    try:
        conn.execute(
            "INSERT INTO users (name, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
            (name, email, hash_password(password), datetime.now().isoformat()),
        )
        conn.commit()
        return True, "Registration successful"
    except sqlite3.IntegrityError:
        return False, "An account with this email already exists"
    finally:
        conn.close()


def authenticate_user(email: str, password: str) -> Tuple[bool, Optional[Dict]]:
    """Authenticate user credentials. Returns (success, user_dict)."""
    # Admin bypass
    if email == "admin" and password == "admin":
        return True, {
            "id": 0, "name": "Administrator", "email": "admin",
            "clearance": "ADMIN", "has_seen_onboarding": True,
        }
    conn = sqlite3.connect(str(DB_PATH))
    row = conn.execute(
        "SELECT id, name, email, password_hash, clearance_level, has_seen_onboarding FROM users WHERE email = ?",
        (email,),
    ).fetchone()
    conn.close()
    if row and row[3] == hash_password(password):
        return True, {
            "id": row[0], "name": row[1], "email": row[2],
            "clearance": row[4], "has_seen_onboarding": bool(row[5]),
        }
    return False, None


def send_registration_otp(name: str, email: str, password: str) -> Tuple[bool, str]:
    """Generate and send OTP for registration. Stores pending registration in memory."""
    if not is_valid_email(email):
        return False, "Invalid email format"
    otp = generate_otp()
    _otp_store[email] = {
        "code": otp,
        "sent_at": datetime.now(),
        "name": name,
        "password": password,
    }
    return send_otp_email(email, otp, name)


def verify_otp_and_register(email: str, otp_code: str) -> Tuple[bool, str, Optional[Dict]]:
    """Verify OTP and complete registration. Returns (success, message, user_dict)."""
    if email not in _otp_store:
        return False, "No pending registration for this email", None
    stored = _otp_store[email]
    if is_otp_expired(stored["sent_at"]):
        del _otp_store[email]
        return False, "OTP expired. Please register again.", None
    if stored["code"] != otp_code:
        return False, "Invalid verification code", None
    # OTP valid — create account
    success, msg = register_user(stored["name"], email, stored["password"])
    del _otp_store[email]
    if success:
        conn = sqlite3.connect(str(DB_PATH))
        row = conn.execute(
            "SELECT id, name, email, clearance_level, has_seen_onboarding FROM users WHERE email = ?",
            (email,),
        ).fetchone()
        conn.close()
        if row:
            return True, "Registration complete", {
                "id": row[0], "name": row[1], "email": row[2],
                "clearance": row[3], "has_seen_onboarding": bool(row[4]),
            }
    return False, msg, None


def get_all_users() -> List[Dict]:
    """List all users (admin only)."""
    conn = sqlite3.connect(str(DB_PATH))
    rows = conn.execute("SELECT id, name, email, created_at, clearance_level, has_seen_onboarding FROM users").fetchall()
    conn.close()
    return [{
        "id": r[0], "name": r[1], "email": r[2], "created": r[3],
        "clearance": r[4], "onboarded": bool(r[5]),
    } for r in rows]


def get_user_count() -> int:
    conn = sqlite3.connect(str(DB_PATH))
    count = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
    conn.close()
    return count


def set_onboarding_seen(user_id: int):
    conn = sqlite3.connect(str(DB_PATH))
    try:
        conn.execute("UPDATE users SET has_seen_onboarding = 1 WHERE id = ?", (user_id,))
        conn.commit()
    except Exception:
        pass
    finally:
        conn.close()
