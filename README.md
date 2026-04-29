# AuthFlow Platform — Sprint Knowledge Assistant

A demo project showcasing AI-powered knowledge management across Confluence, Jira, GitHub, and Gmail using Claude + Atlassian Rovo connectors.

---

## What This Demonstrates

```
Confluence (docs/knowledge)
    +
Jira (work tracking)
    +                         →  Claude synthesizes  →  Gmail (action)
GitHub (code/PRs)
    +
Cross-source reasoning
```

| Capability | Demonstrated by |
|---|---|
| Knowledge retrieval | Confluence page queries |
| Work item tracking | Jira story queries |
| Cross-source reasoning | Jira story + linked Confluence page |
| Code traceability | GitHub PR ↔ Jira story links |
| Automated action | Gmail sprint summary email |
| Onboarding use case | New developer query |

---

## Connector Checklist

| Connector | Status |
|---|---|
| Atlassian Rovo (Confluence + Jira) | ✅ Enabled |
| GitHub | ✅ Enabled |
| Gmail | ✅ Enabled |

---

## Step 1: Confluence Pages to Create

Create these 5 pages in your Confluence space:

### Page 1: Project Overview
```
Project: AuthFlow Platform
Goal: Build a secure user authentication system
Timeline: Sprint 1 (Apr 28 - May 9, 2026)
Team:
  - Prathika (Tech Lead)
  - Dev 1 (Backend)
  - Dev 2 (Frontend)
Tech Stack: FastAPI, React, PostgreSQL, JWT
Status: In Progress
```

### Page 2: Technical Architecture
```
System Design:
  - Frontend: React SPA
  - Backend: FastAPI REST API
  - Auth: JWT tokens with refresh mechanism
  - Database: PostgreSQL for user storage
  - Deployment: Docker + GitHub Actions CI/CD

Key Design Decisions:
  - Stateless authentication via JWT
  - Bcrypt for password hashing
  - Token expiry: 7 days
```

### Page 3: Feature — User Authentication
```
Overview: Implement secure login/signup flow

Acceptance Criteria:
  - User can register with email + password
  - User can login and receive JWT token
  - Invalid credentials return 401
  - Passwords hashed with bcrypt
  - Token expires in 7 days

API Endpoints:
  POST /api/auth/register
  POST /api/auth/login
  GET  /api/auth/me

Dependencies: PROJ-1, PROJ-2
```

### Page 4: Onboarding Guide
```
Welcome to AuthFlow Platform!

Prerequisites:
  - Python 3.12+
  - Node.js 18+
  - Docker Desktop
  - Git access to github.com/[your-org]/authflow-platform

Setup Steps:
  1. Clone the repository
  2. Copy .env.example to .env
  3. Run: docker-compose up
  4. Visit http://localhost:3000

First Tasks:
  - Read Technical Architecture page
  - Pick up a Jira story tagged "good-first-issue"
  - Join #authflow Slack channel
```

### Page 5: Team Contacts
```
Prathika (Tech Lead)
  - Email: jprat716@gmail.com
  - Owns: Architecture decisions, code reviews
  - Jira: @prathika

Responsibilities:
  - Backend: Dev 1
  - Frontend: Dev 2
  - DevOps: Dev 1
  - QA: Dev 2
```

---

## Step 2: Jira Stories to Create

| Story | Title | Priority | Confluence Link |
|---|---|---|---|
| PROJ-1 | Implement login page | High | Feature: User Authentication |
| PROJ-2 | Set up CI/CD pipeline | High | Technical Architecture |
| PROJ-3 | Write API documentation | Medium | Feature: User Authentication |
| PROJ-4 | Implement JWT refresh | Medium | Feature: User Authentication |
| PROJ-5 | New developer onboarding | Low | Onboarding Guide |

For each story, set:
- **Sprint:** Sprint 1
- **Assignee:** Prathika
- **Label:** `authflow`
- **Link:** Attach the corresponding Confluence page

---

## Step 3: GitHub Repo Structure

```
authflow-platform/
├── README.md
├── backend/
│   └── auth.py              # JWT implementation
├── frontend/
│   └── Login.jsx            # Login form component
├── .github/
│   └── workflows/
│       └── ci.yml           # CI/CD pipeline
└── docker-compose.yml
```

### Branches to Create
```
feature/PROJ-1-login-page
feature/PROJ-2-cicd-setup
```

### PRs to Open
| PR | Title | References |
|---|---|---|
| PR #1 | PROJ-1 - Implement login page | Jira: PROJ-1, Confluence: Feature: User Authentication |
| PR #2 | PROJ-2 - Set up CI/CD | Jira: PROJ-2, Confluence: Technical Architecture |

PR description template:
```markdown
## Summary
Implements [feature name] per PROJ-X acceptance criteria.

## Jira Story
[PROJ-X](https://your-jira.atlassian.net/browse/PROJ-X)

## Confluence Spec
[Feature: User Authentication](https://your-confluence.atlassian.net/...)

## Changes
- ...
```

---

## Step 4: Demo Queries

Test these in Claude.ai chat (with Rovo + GitHub + Gmail connectors active):

| # | Query | Sources hit |
|---|---|---|
| 1 | "What is the AuthFlow platform about?" | Confluence: Project Overview |
| 2 | "What are the acceptance criteria for the login feature?" | Confluence: Feature: User Authentication |
| 3 | "What user stories are in Sprint 1?" | Jira |
| 4 | "I'm a new developer joining the project, what do I need to do?" | Confluence: Project Overview + Onboarding Guide + Jira open stories |
| 5 | "What are the acceptance criteria for PROJ-1?" | Jira + linked Confluence page |
| 6 | "What code changes were made for the authentication feature?" | GitHub PR #1 + Confluence spec + Jira PROJ-1 |
| 7 | "Is PROJ-1 merged and deployed?" | Jira status + GitHub PR status |
| 8 | "Show me everything related to authentication — docs, tickets, and code" | Confluence + Jira + GitHub |
| 9 | "Summarize Sprint 1 progress and email it to jprat716@gmail.com" | Jira sprint data → Gmail send |

---

## Setup Checklist

- [ ] Create 5 Confluence pages
- [ ] Create 5 Jira stories with Confluence links
- [ ] Create GitHub repo `authflow-platform`
- [ ] Create branches: `feature/PROJ-1-login-page`, `feature/PROJ-2-cicd-setup`
- [ ] Open PR #1 and PR #2 with Jira + Confluence references in descriptions
- [ ] Test all 9 queries in Claude.ai
- [ ] Verify Query 9 sends Gmail successfully

---

## Tech Stack

- **Backend:** FastAPI (Python 3.12)
- **Frontend:** React 18
- **Auth:** JWT (python-jose) + bcrypt
- **Database:** PostgreSQL 15
- **CI/CD:** GitHub Actions
- **Infrastructure:** Docker + Docker Compose
- **AI Layer:** Claude + Atlassian Rovo + GitHub + Gmail connectors
