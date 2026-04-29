"""
auth.py – JWT-based authentication service.

Endpoints
---------
POST /login       Accept {username, password}, return a signed JWT on success.
GET  /protected   Example route that requires a valid Bearer token.
"""

import datetime
import os
from functools import wraps

import jwt
from flask import Flask, jsonify, request

app = Flask(__name__)

# ---------------------------------------------------------------------------
# Configuration – always override JWT_SECRET_KEY in production.
# ---------------------------------------------------------------------------
_SECRET_KEY: str = os.environ.get("JWT_SECRET_KEY", "dev-secret-key")
_TOKEN_EXPIRY_HOURS: int = int(os.environ.get("TOKEN_EXPIRY_HOURS", "1"))
_ALGORITHM = "HS256"


# ---------------------------------------------------------------------------
# Token helpers
# ---------------------------------------------------------------------------

def generate_token(user_id: str, role: str = "user") -> str:
    """Return a signed JWT for *user_id* that expires after the configured TTL."""
    now = datetime.datetime.now(datetime.timezone.utc)
    payload = {
        "sub": user_id,
        "role": role,
        "iat": now,
        "exp": now + datetime.timedelta(hours=_TOKEN_EXPIRY_HOURS),
    }
    return jwt.encode(payload, _SECRET_KEY, algorithm=_ALGORITHM)


def decode_token(token: str) -> dict:
    """Decode and verify *token*.  Raises :class:`jwt.PyJWTError` on failure."""
    return jwt.decode(token, _SECRET_KEY, algorithms=[_ALGORITHM])


# ---------------------------------------------------------------------------
# Auth decorator
# ---------------------------------------------------------------------------

def require_auth(f):
    """Flask route decorator that enforces a valid Bearer JWT."""

    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid Authorization header"}), 401
        token = auth_header[len("Bearer "):]
        try:
            payload = decode_token(token)
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401
        return f(payload, *args, **kwargs)

    return decorated


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.route("/login", methods=["POST"])
def login():
    """Authenticate a user and return a JWT.

    Expected JSON body::

        {"username": "...", "password": "..."}

    Returns 200 with ``{"token": "<jwt>"}`` on success, or 400/401 on failure.

    .. note::
        The credential check here is a placeholder.  Replace with a real lookup
        against a hashed-password store (e.g. bcrypt + a database) before going
        to production.
    """
    data = request.get_json(silent=True) or {}
    username: str = data.get("username", "").strip()
    password: str = data.get("password", "")

    if not username or not password:
        return jsonify({"error": "username and password are required"}), 400

    # TODO: replace with a real credential lookup.
    if username == "admin" and password == "secret":
        token = generate_token(user_id=username, role="admin")
        return jsonify({"token": token}), 200

    return jsonify({"error": "Invalid credentials"}), 401


@app.route("/protected", methods=["GET"])
@require_auth
def protected(payload: dict):
    """A sample protected endpoint – requires a valid Bearer token."""
    return jsonify({"message": f"Hello, {payload['sub']}!", "role": payload["role"]}), 200


if __name__ == "__main__":  # pragma: no cover
    app.run(debug=False)
