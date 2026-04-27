"""JWT token creation and verification."""

from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt

from openaxis.core.config import settings

ALGORITHM = "HS256"


def create_access_token(data: dict) -> str:
    """Create a signed JWT access token with expiry."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    to_encode["exp"] = expire
    return jwt.encode(to_encode, settings.secret_key, algorithm=ALGORITHM)


def verify_token(token: str) -> dict:
    """Decode and verify a JWT token. Raises ValueError on failure."""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
        return payload
    except JWTError as exc:
        raise ValueError("Invalid or expired token") from exc


_pwd_context = None


def _get_context():
    global _pwd_context
    if _pwd_context is None:
        from passlib.context import CryptContext

        _pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
    return _pwd_context


def hash_password(password: str) -> str:
    return _get_context().hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return _get_context().verify(plain, hashed)
