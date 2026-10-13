from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from utils._config import settings

security = HTTPBearer()

class AuthHandler:
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    secret = settings.jwt_secret
    algorithm = settings.jwt_algorithm

    def get_password_hash(self, password: str) -> str:
        return self.pwd_context.hash(password)

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return self.pwd_context.verify(plain_password, hashed_password)

    def encode_token(self, user_id: int) -> str:
        payload = {
            "exp": datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes),
            "iat": datetime.now(timezone.utc),
            "sub": str(user_id)
        }
        return jwt.encode(payload, self.secret, algorithm=self.algorithm)

    def get_current_user_id(self, credentials: HTTPAuthorizationCredentials = Depends(security)) -> int:
        token = credentials.credentials
        try:
            payload = jwt.decode(token, self.secret, algorithms=[self.algorithm])
            user_id = payload.get("sub")
            if user_id is None:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
            return int(user_id)
        except JWTError:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

auth_handler = AuthHandler()