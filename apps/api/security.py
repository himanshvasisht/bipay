from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from config import config
from datetime import datetime, timedelta

# Use configuration instead of direct os.getenv
JWT_PUBLIC_KEY = config.JWT_PUBLIC_KEY_PEM
JWT_ALGORITHM = config.JWT_ALGORITHM

class JWTBearer(HTTPBearer):
    def __init__(self, auto_error: bool = True):
        super(JWTBearer, self).__init__(auto_error=auto_error)

    async def __call__(self, request: Request):
        credentials: HTTPAuthorizationCredentials = await super(JWTBearer, self).__call__(request)
        if credentials:
            try:
                payload = jwt.decode(credentials.credentials, JWT_PUBLIC_KEY, algorithms=[JWT_ALGORITHM])
                request.state.user = payload
                return payload
            except JWTError as e:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED, 
                    detail=f"Invalid JWT token: {str(e)}"
                )
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="Authorization header missing"
            )

def create_jwt_token(user_data: dict) -> str:
    """Create JWT token for user authentication"""
    from jose import jwt
    
    # Token expiration
    expires_at = datetime.utcnow() + timedelta(hours=config.JWT_EXPIRATION_HOURS)
    
    # Create payload
    payload = {
        "sub": user_data.get("user_id"),
        "email": user_data.get("email"),
        "iat": datetime.utcnow(),
        "exp": expires_at,
        "iss": "bipay-api",
        "aud": "bipay-users"
    }
    
    # Sign with private key
    token = jwt.encode(payload, config.JWT_PRIVATE_KEY_PEM, algorithm=JWT_ALGORITHM)
    return token
