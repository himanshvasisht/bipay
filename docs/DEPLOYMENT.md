# BiPay Deployment Guide

## Local Development
1. Install Docker & Docker Compose
2. Copy `.env.example` to `.env` and fill secrets
3. Run migrations: `python infra/mongo_migrate.py`
4. Seed test data: `python infra/mongo_seed.py`
5. Start services: `docker-compose -f infra/docker-compose.yml up --build`
6. Access API at `http://localhost:8000/docs`

## Cloud Deployment (Render/Railway)
- Push repo to GitHub
- Connect to Render/Railway, set environment variables
- Deploy Docker image
- Use MongoDB Atlas for production DB

## Testing
- Run `pytest apps/api` for unit/integration tests
- Use Postman collection from `/docs/OPENAPI.md`

---
See README and API Playbook for more details.
