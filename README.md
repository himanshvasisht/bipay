# BiPay Backend

This is the backend for BiPay, a biometric-first payment platform.

## Structure
- `/apps/api`: FastAPI app (main backend)
- `/apps/workers`: Background workers (Kafka/RabbitMQ, receipts, notifications)
- `/infra`: Docker, docker-compose, infra configs
- `/docs`: Documentation, API Playbook

## Quickstart
1. Install Docker & Docker Compose
2. Copy `.env.example` to `.env` and fill secrets
3. Run: `docker-compose up --build`

## Features
- Real biometric verification (Android Keystore attestation, FIDO2)
- Double-entry ledger, ACID payments
- MongoDB, Redis, Kafka/RabbitMQ
- Secure REST APIs, JWT, OAuth2, mTLS
- Observability: Prometheus, OpenTelemetry, Loki
- Audit trails, compliance posture

## Docs
- OpenAPI: `/docs` (auto-generated)
- API Playbook: `/docs/API_PLAYBOOK.md`

## Testing
- Synthetic test keys and golden tests for biometric signature verification
- Seed scripts for MongoDB

---
See `/docs` for full API and integration details.
