"""Auth router — /auth/register, /auth/login, /auth/me."""

import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from openaxis.core.auth.deps import get_current_user
from openaxis.core.auth.jwt import create_access_token, hash_password, verify_password
from openaxis.core.auth.models import User
from openaxis.core.auth.schemas import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])


def _make_router(get_session):
    """Return an auth router bound to the provided session dependency.

    Usage::

        from openaxis.core.auth.router import _make_router
        auth_router = _make_router(get_session)
        app.include_router(auth_router)
    """
    r = APIRouter(prefix="/auth", tags=["auth"])

    @r.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
    async def register(payload: RegisterRequest, session: AsyncSession = Depends(get_session)):
        result = await session.execute(select(User).where(User.email == payload.email))
        if result.scalar_one_or_none():
            raise HTTPException(status_code=409, detail="Email already registered")
        user = User(
            email=payload.email,
            hashed_password=hash_password(payload.password),
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
        token = create_access_token({"sub": user.email, "role": user.role, "id": user.id})
        logger.info("New user registered: %s", user.email)
        return TokenResponse(access_token=token)

    @r.post("/login", response_model=TokenResponse)
    async def login(payload: LoginRequest, session: AsyncSession = Depends(get_session)):
        result = await session.execute(select(User).where(User.email == payload.email))
        user = result.scalar_one_or_none()
        if not user or not verify_password(payload.password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        if not user.is_active:
            raise HTTPException(status_code=403, detail="Account is disabled")
        token = create_access_token({"sub": user.email, "role": user.role, "id": user.id})
        return TokenResponse(access_token=token)

    @r.get("/me", response_model=UserResponse)
    async def me(
        current_user: dict = Depends(get_current_user),
        session: AsyncSession = Depends(get_session),
    ):
        result = await session.execute(
            select(User).where(User.email == current_user["sub"])
        )
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return UserResponse.model_validate(user)

    return r
