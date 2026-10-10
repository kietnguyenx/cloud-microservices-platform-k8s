from datetime import datetime, timedelta, timezone
from typing import Union
import bcrypt
from jose import jwt, ExpiredSignatureError, JWTError
from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from utils._config import settings


class AuthHandler:
    security = HTTPBearer()

    def __init__(self):
        self.secret = settings.JWT_SECRET_KEY
        self.algorithm = settings.JWT_ALGORITHM
        self.expire_minutes = settings.ACCESS_TOKEN_EXPIRE_MINUTES

    def get_password_hash(self, password: str) -> str:
        """Hashes plain text password using standard bcrypt."""
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verifies plain password against hashed password."""
        try:
            return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
        except Exception:
            return False

    def encode_token(self, user_id: Union[int, str]) -> str:
        """Generates JWT token with expiration and user subject claim."""
        now = datetime.now(timezone.utc)
        expiration = now + timedelta(minutes=self.expire_minutes)
        payload = {
            "exp": expiration,
            "iat": now,
            "sub": str(user_id)
        }
        return jwt.encode(payload, self.secret, algorithm=self.algorithm)

    def decode_token(self, token: str) -> int:
        """Decodes and validates JWT token, returning user_id as integer."""
        try:
            payload = jwt.decode(token=token, key=self.secret, algorithms=[self.algorithm])
            user_id = payload.get("sub")
            if not user_id:
                raise HTTPException(status_code=401, detail="Invalid token: missing subject claim")
            return int(user_id)
        except ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token signature has expired")
        except (JWTError, ValueError):
            raise HTTPException(status_code=401, detail="Invalid or corrupted authentication token")

    def get_current_user_id(self, auth: HTTPAuthorizationCredentials = Security(security)) -> int:
        """FastAPI dependency to extract and verify authenticated user_id."""
        if not auth or not auth.credentials:
            raise HTTPException(status_code=401, detail="Missing authorization header")
        return self.decode_token(auth.credentials)

    # Backward compatibility alias
    get_user_id = get_current_user_id


auth_handler = AuthHandler()
