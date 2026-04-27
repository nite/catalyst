"""FastAPI router that exposes registered MCP tools and resources over HTTP."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from openaxis.core.mcp.registry import get_resources, get_tools


def create_mcp_router(prefix: str = "/mcp") -> APIRouter:
    """Return a FastAPI router with MCP-compliant tool and resource endpoints.

    Mount this router in your FastAPI app::

        from openaxis.core.mcp.router import create_mcp_router
        app.include_router(create_mcp_router())
    """
    router = APIRouter(prefix=prefix, tags=["mcp"])

    # ── Tools ──────────────────────────────────────────────────────────────

    @router.get("/tools", summary="List registered MCP tools")
    async def list_tools():
        return [
            {
                "name": t.name,
                "description": t.description,
                "inputSchema": t.parameters,
            }
            for t in get_tools().values()
        ]

    class ToolCallRequest(BaseModel):
        name: str
        arguments: dict = {}

    @router.post("/tools/call", summary="Invoke an MCP tool by name")
    async def call_tool(request: ToolCallRequest):
        tools = get_tools()
        if request.name not in tools:
            raise HTTPException(status_code=404, detail=f"Tool '{request.name}' not found")
        result = await tools[request.name].func(**request.arguments)
        return {"result": result}

    # ── Resources ──────────────────────────────────────────────────────────

    @router.get("/resources", summary="List registered MCP resources")
    async def list_resources():
        return [
            {"uri": r.uri, "description": r.description}
            for r in get_resources().values()
        ]

    class ResourceReadRequest(BaseModel):
        uri: str

    @router.post("/resources/read", summary="Read an MCP resource by URI")
    async def read_resource(request: ResourceReadRequest):
        resources = get_resources()
        if request.uri not in resources:
            raise HTTPException(
                status_code=404, detail=f"Resource '{request.uri}' not found"
            )
        result = await resources[request.uri].func()
        return {"uri": request.uri, "contents": result}

    return router
