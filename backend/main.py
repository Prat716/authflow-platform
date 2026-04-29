from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware

from auth import (
    UserCreate, UserLogin, Token,
    hash_password, verify_password, create_access_token, get_current_user, TokenData,
)

app = FastAPI(title="AuthFlow Platform API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory user store — replace with PostgreSQL in production
_users: dict[str, str] = {}


@app.post("/api/auth/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user: UserCreate):
    if user.email in _users:
        raise HTTPException(status_code=400, detail="Email already registered")
    _users[user.email] = hash_password(user.password)
    token = create_access_token({"sub": user.email})
    return Token(access_token=token, token_type="bearer")


@app.post("/api/auth/login", response_model=Token)
def login(user: UserLogin):
    hashed = _users.get(user.email)
    if not hashed or not verify_password(user.password, hashed):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token({"sub": user.email})
    return Token(access_token=token, token_type="bearer")


@app.get("/api/auth/me")
def me(current_user: TokenData = Depends(get_current_user)):
    return {"email": current_user.email}
