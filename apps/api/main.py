
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, devices, payments, accounts, transactions, receipts, merchants, nonce, add_money, feature_flags, optional_payments, contacts, devices_manage, scheduled_payments, admin, notifications

app = FastAPI(title="BiPay API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/v1/auth", tags=["auth"])
app.include_router(devices.router, prefix="/v1/devices", tags=["devices"])
app.include_router(payments.router, prefix="/v1/payments", tags=["payments"])
app.include_router(accounts.router, prefix="/v1/accounts", tags=["accounts"])
app.include_router(transactions.router, prefix="/v1/transactions", tags=["transactions"])
app.include_router(receipts.router, prefix="/v1/receipts", tags=["receipts"])
app.include_router(merchants.router, prefix="/v1/merchants", tags=["merchants"])
app.include_router(nonce.router, prefix="/v1", tags=["nonce"])
app.include_router(add_money.router, prefix="/v1/accounts", tags=["add_money"])
app.include_router(feature_flags.router, prefix="/v1", tags=["features"])
app.include_router(optional_payments.router, prefix="/v1/payments", tags=["optional_payments"])
app.include_router(contacts.router, prefix="/v1", tags=["contacts"])
app.include_router(devices_manage.router, prefix="/v1", tags=["devices_manage"])
app.include_router(scheduled_payments.router, prefix="/v1", tags=["scheduled_payments"])
app.include_router(admin.router, prefix="/v1/admin", tags=["admin"])
app.include_router(notifications.router, prefix="/v1", tags=["notifications"])

@app.get("/health")
def health():
    return {"status": "ok"}
