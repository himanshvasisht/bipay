# BiPay API Playbook

## Enrollment & Auth
- `POST /v1/auth/register`: Register user
- `POST /v1/auth/login`: Login, get JWT + nonce
- `POST /v1/devices/enroll`: Enroll device (public key + attestation)
- `GET /v1/nonce`: Get one-time nonce

## Payments
- `POST /v1/payments/p2p`: P2P payment (biometric signature required)
- `POST /v1/payments/merchant`: Merchant payment

## Accounts & Transactions
- `GET /v1/accounts/{wallet_id}`: Get balance
- `GET /v1/transactions`: List transactions

## Receipts & Notifications
- `GET /v1/receipts/{txn_id}.pdf`: Get receipt

## Errors
- Standardized error codes: INVALID_REQUEST, UNAUTHORIZED, BIOMETRIC_INVALID, INSUFFICIENT_FUNDS, etc.

---
See OpenAPI docs at `/docs` for full details.
