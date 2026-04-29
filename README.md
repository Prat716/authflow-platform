# authflow-platform

A lightweight authentication service built with Flask (backend) and React (frontend),
using JSON Web Tokens (JWT) for stateless session management.

## Architecture

Full system design, data-flow diagrams, and deployment topology are documented on
the internal Confluence page:
**[AuthFlow Platform – Architecture Overview](https://confluence.example.com/display/ENG/AuthFlow+Platform+Architecture)**

## Repository structure

```
authflow-platform/
├── backend/
│   ├── auth.py          # Flask app – JWT generation, validation, protected routes
│   ├── requirements.txt # Python dependencies
│   └── tests/
│       └── test_auth.py # pytest test suite
├── frontend/
│   ├── Login.jsx        # React login form component
│   ├── package.json     # Node project manifest (Vite + Vitest + ESLint)
│   └── src/
│       └── Login.test.jsx
└── .github/
    └── workflows/
        └── ci.yml       # CI/CD pipeline (lint + test for both layers)
```

## Quick start

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
JWT_SECRET_KEY=<strong-secret> flask --app auth run
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Environment variables

| Variable           | Description                              | Default (dev only)   |
|--------------------|------------------------------------------|----------------------|
| `JWT_SECRET_KEY`   | HMAC-SHA256 signing secret               | `dev-secret-key`     |
| `TOKEN_EXPIRY_HOURS` | Token lifetime in hours               | `1`                  |