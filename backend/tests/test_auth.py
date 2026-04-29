"""Tests for backend/auth.py."""

import datetime

import jwt
import pytest

from auth import app, decode_token, generate_token, _SECRET_KEY, _ALGORITHM


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as c:
        yield c


# ---------------------------------------------------------------------------
# generate_token / decode_token
# ---------------------------------------------------------------------------

class TestGenerateToken:
    def test_returns_string(self):
        token = generate_token("alice")
        assert isinstance(token, str)

    def test_payload_sub(self):
        token = generate_token("alice")
        payload = decode_token(token)
        assert payload["sub"] == "alice"

    def test_default_role_is_user(self):
        token = generate_token("alice")
        payload = decode_token(token)
        assert payload["role"] == "user"

    def test_custom_role(self):
        token = generate_token("bob", role="admin")
        payload = decode_token(token)
        assert payload["role"] == "admin"

    def test_token_has_exp(self):
        token = generate_token("alice")
        payload = decode_token(token)
        assert "exp" in payload

    def test_token_has_iat(self):
        token = generate_token("alice")
        payload = decode_token(token)
        assert "iat" in payload


class TestDecodeToken:
    def test_invalid_signature_raises(self):
        token = generate_token("alice")
        tampered = token[:-4] + "XXXX"
        with pytest.raises(jwt.InvalidTokenError):
            decode_token(tampered)

    def test_expired_token_raises(self):
        now = datetime.datetime.now(datetime.timezone.utc)
        payload = {
            "sub": "alice",
            "role": "user",
            "iat": now,
            "exp": now - datetime.timedelta(seconds=1),
        }
        expired_token = jwt.encode(payload, _SECRET_KEY, algorithm=_ALGORITHM)
        with pytest.raises(jwt.ExpiredSignatureError):
            decode_token(expired_token)

    def test_wrong_secret_raises(self):
        token = jwt.encode({"sub": "alice"}, "wrong-secret", algorithm=_ALGORITHM)
        with pytest.raises(jwt.InvalidTokenError):
            decode_token(token)


# ---------------------------------------------------------------------------
# POST /login
# ---------------------------------------------------------------------------

class TestLoginEndpoint:
    def test_valid_credentials_returns_token(self, client):
        resp = client.post("/login", json={"username": "admin", "password": "secret"})
        assert resp.status_code == 200
        data = resp.get_json()
        assert "token" in data
        # token should be decodable
        payload = decode_token(data["token"])
        assert payload["sub"] == "admin"
        assert payload["role"] == "admin"

    def test_wrong_password_returns_401(self, client):
        resp = client.post("/login", json={"username": "admin", "password": "wrong"})
        assert resp.status_code == 401

    def test_unknown_user_returns_401(self, client):
        resp = client.post("/login", json={"username": "nobody", "password": "secret"})
        assert resp.status_code == 401

    def test_missing_username_returns_400(self, client):
        resp = client.post("/login", json={"password": "secret"})
        assert resp.status_code == 400

    def test_missing_password_returns_400(self, client):
        resp = client.post("/login", json={"username": "admin"})
        assert resp.status_code == 400

    def test_empty_body_returns_400(self, client):
        resp = client.post("/login", json={})
        assert resp.status_code == 400

    def test_non_json_body_returns_400(self, client):
        resp = client.post("/login", data="not-json", content_type="text/plain")
        assert resp.status_code == 400


# ---------------------------------------------------------------------------
# GET /protected
# ---------------------------------------------------------------------------

class TestProtectedEndpoint:
    def _auth_header(self, user_id="admin", role="admin"):
        token = generate_token(user_id, role=role)
        return {"Authorization": f"Bearer {token}"}

    def test_valid_token_returns_200(self, client):
        resp = client.get("/protected", headers=self._auth_header())
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["message"] == "Hello, admin!"
        assert data["role"] == "admin"

    def test_no_auth_header_returns_401(self, client):
        resp = client.get("/protected")
        assert resp.status_code == 401

    def test_malformed_header_returns_401(self, client):
        resp = client.get("/protected", headers={"Authorization": "Token abc"})
        assert resp.status_code == 401

    def test_invalid_token_returns_401(self, client):
        resp = client.get("/protected", headers={"Authorization": "Bearer invalid.token.here"})
        assert resp.status_code == 401

    def test_expired_token_returns_401(self, client):
        now = datetime.datetime.now(datetime.timezone.utc)
        payload = {
            "sub": "alice",
            "role": "user",
            "iat": now,
            "exp": now - datetime.timedelta(seconds=1),
        }
        token = jwt.encode(payload, _SECRET_KEY, algorithm=_ALGORITHM)
        resp = client.get("/protected", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 401
        assert resp.get_json()["error"] == "Token has expired"
