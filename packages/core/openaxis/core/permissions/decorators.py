"""@require_permission decorator for FastAPI route handlers."""

import functools

from fastapi import HTTPException, status


def require_permission(*allowed_roles: str):
    """Decorator that gates a route on the user's role.

    The route must have a ``current_user`` parameter (dict from JWT payload).

    Usage::

        @router.post("/admin/thing")
        @require_permission("admin")
        async def admin_only(current_user: dict = Depends(get_current_user)):
            ...

        @router.post("/thing")
        @require_permission("admin", "user")
        async def user_or_admin(current_user: dict = Depends(get_current_user)):
            ...
    """

    def decorator(func):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            user = kwargs.get("current_user") or (args[0] if args else None)
            role = user.get("role") if isinstance(user, dict) else None
            if role not in allowed_roles:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Requires one of roles: {list(allowed_roles)}",
                )
            return await func(*args, **kwargs)

        return wrapper

    return decorator
