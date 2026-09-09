# NSS AI-Powered Placement System

An intelligent placement platform that matches National Service Personnel graduates with organizations using AI-driven compatibility scoring — built as a final year capstone project.

## Overview

Graduates apply through a guided multi-step form. Behind the scenes, an AI matching engine analyzes each applicant's skills, academic background, and career interests against organizations' requirements, producing ranked recommendations with human-readable explanations for each match. Admins review these recommendations, manage organizations, and track placement progress through a dedicated dashboard.

## Features

**Applicant Portal**
- 5-step guided application (personal details → academic background → skills → interests → certificate upload)
- Application status tracking

**Admin Dashboard**
- Overview with live stats and charts (skills breakdown, status distribution)
- Applicant management — search, filter, sort, view full profiles, export to CSV
- AI match recommendations per applicant, with scores and explanations
- Organization management — add, edit, delete placement partners
- Analytics — average match score, match rate, top organizations, qualification breakdown
- One-click "Mark as Matched" workflow

**AI Matching Engine**
- TF-IDF vectorization + cosine similarity, comparing applicant profiles (skills, programme, interests, qualification, career goals) against organization requirements
- Batch-optimized: builds one shared vocabulary and computes all similarity scores in a single matrix operation, rather than refitting per applicant-organization pair
- Generates a plain-language explanation for every match

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), Tailwind CSS, Recharts, Lucide icons |
| Backend | Flask, Flask-SQLAlchemy |
| Database | SQLite |
| AI/ML | scikit-learn (TF-IDF, cosine similarity), NumPy |

## Project Structure

## Setup

### Prerequisites
- Python 3.11+
- Node.js & npm

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt --trusted-host pypi.org --trusted-host files.pythonhosted.org
python seed_organizations.py   # adds sample organizations
python app.py
```
Backend runs on `http://localhost:5000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:3000`.

### Generate AI Matches

After applicants have submitted and organizations exist in the database:

```bash
cd backend
python generate_matches.py
```

Or trigger it via the API directly: `POST /api/matches/generate`

## Demo Credentials

Admin login: `admin@nss.com` / `admin123`

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/applicants` | Submit a new application |
| GET | `/api/applicants` | Get all applicants (includes their matches) |
| GET | `/api/applicants/<id>` | Get a single applicant |
| PUT | `/api/applicants/<id>` | Update applicant (e.g. status) |
| POST | `/api/organizations` | Create an organization |
| GET | `/api/organizations` | Get all organizations |
| PUT | `/api/organizations/<id>` | Update an organization |
| DELETE | `/api/organizations/<id>` | Delete an organization |
| POST | `/api/matches/generate` | Run AI matching for all applicants |
| GET | `/api/matches/applicant/<id>` | Get matches for one applicant |
| GET | `/api/matches` | Get all matches |
| GET | `/api/health` | Health check |

## Known Limitations & Next Steps

This is a functional capstone prototype. For production use at scale, the following would be needed:
- **Pagination** — applicant lists currently load in full; would need server-side pagination for large datasets
- **PostgreSQL** — SQLite is fine for development but limits concurrent writes under real multi-admin usage
- **Background job processing** — match generation currently runs synchronously; a queue (e.g. Celery) would be needed for very large applicant pools
- **Authentication** — current admin login is a demo implementation; production would need proper hashed passwords and session management

## Author

Built by Gentil as a final year capstone project.