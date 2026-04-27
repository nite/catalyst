"""@mcp_tool and @mcp_resource decorators."""

import functools
import inspect
from typing import Callable, get_args, get_origin

from openaxis.core.mcp.registry import ResourceEntry, ToolEntry, register_resource, register_tool

_PY_TO_JSON: dict[type, str] = {
    int: "integer",
    float: "number",
    str: "string",
    bool: "boolean",
    list: "array",
    dict: "object",
}

_SKIP_PARAMS = {"self", "session", "db", "current_user"}


def _build_input_schema(func: Callable) -> dict:
    """Inspect function signature and build a JSON Schema for its parameters."""
    sig = inspect.signature(func)
    props: dict[str, dict] = {}
    required: list[str] = []

    for name, param in sig.parameters.items():
        if name in _SKIP_PARAMS:
            continue

        annotation = param.annotation
        # Strip Optional[X] → X
        origin = get_origin(annotation)
        if origin is type(None):
            annotation = str
        elif origin is not None:
            args = [a for a in get_args(annotation) if a is not type(None)]
            annotation = args[0] if args else str

        json_type = _PY_TO_JSON.get(annotation, "string")
        props[name] = {"type": json_type}

        if param.default is inspect.Parameter.empty:
            required.append(name)
        else:
            props[name]["default"] = param.default

    return {"type": "object", "properties": props, "required": required}


def mcp_tool(name: str | None = None, description: str | None = None):
    """Register an async function as an MCP tool.

    Usage::

        @mcp_tool(name="get_top_articles", description="Returns ranked articles")
        async def get_top_articles(limit: int = 10) -> list:
            ...
    """

    def decorator(func: Callable) -> Callable:
        tool_name = name or func.__name__
        tool_desc = description or (inspect.getdoc(func) or "").strip()
        schema = _build_input_schema(func)
        register_tool(ToolEntry(name=tool_name, description=tool_desc, func=func, parameters=schema))

        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            return await func(*args, **kwargs)

        return wrapper

    return decorator


def mcp_resource(uri: str, description: str | None = None):
    """Register an async function as an MCP resource.

    Usage::

        @mcp_resource("openaxis://sigwire/trending")
        async def trending_articles():
            \"\"\"Returns today's top articles.\"\"\"
            ...
    """

    def decorator(func: Callable) -> Callable:
        desc = description or (inspect.getdoc(func) or "").strip()
        register_resource(ResourceEntry(uri=uri, description=desc, func=func))

        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            return await func(*args, **kwargs)

        return wrapper

    return decorator
