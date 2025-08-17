BiPay - Local Run & Test Guide

This repository contains:
- backend/: FastAPI backend (in-memory mock DB by default, optional MongoDB via MONGO_URI)
- PayNow/: Consumer React + Vite app
- BiPayMerchantPortal/: Merchant React + Vite app

Quickstart (backend):
1. Create and activate a Python venv (Windows PowerShell):

```powershell
python -m venv .venv; .\.venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
```

2. Run backend (development):

```powershell
cd backend
uvicorn app.main:app --reload
```

Notes:
- By default the backend uses an in-memory mock DB. To use MongoDB, set `MONGO_URI` and optionally `MONGO_DB_NAME` before starting.

Quickstart (frontend):
1. Install dependencies and run PayNow (consumer):

```powershell
cd PayNow\PayNow
npm install
npm run dev
```

2. Install dependencies and run BiPayMerchantPortal (merchant):

```powershell
cd BiPayMerchantPortal\BiPayMerchantPortal
npm install
npm run dev
```

Environment:
- Frontends default to backend base `http://localhost:8000`. To override, set environment variable `REACT_APP_API_BASE`.

Smoke tests (after both backend and frontend running):
- Open consumer app, register a new user (fingerprint field can be any non-empty string for demo). Verify registration returns and dashboard shows balance.
- Login and perform a Send payment to another user id. Verify backend logs and frontend updates.
- Open merchant portal, add items to cart and simulate get/payment flows.
- Open websocket at `ws://localhost:8000/ws/transactions` (browser or WS client) and verify transaction events are broadcast on payments.

If anything fails during `npm install` or `uvicorn` start, send me the terminal logs and I'll iterate quickly.
