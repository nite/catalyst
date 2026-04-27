"""Tests for MCP decorators and registry."""

import pytest

from openaxis.core.mcp.registry import clear_registry, get_resources, get_tools


@pytest.fixture(autouse=True)
def clean_registry():
    """Ensure registry is empty before and after each test."""
    clear_registry()
    yield
    clear_registry()


def test_mcp_tool_registers_function():
    from openaxis.core.mcp.decorators import mcp_tool

    @mcp_tool(name="test_tool", description="A test tool")
    async def my_tool(query: str, limit: int = 5):
        return []

    tools = get_tools()
    assert "test_tool" in tools
    assert tools["test_tool"].description == "A test tool"


def test_mcp_tool_builds_input_schema():
    from openaxis.core.mcp.decorators import mcp_tool

    @mcp_tool(name="schema_tool")
    async def my_tool(text: str, count: int = 10):
        """Tool with schema."""
        return []

    schema = get_tools()["schema_tool"].parameters
    assert schema["type"] == "object"
    assert "text" in schema["properties"]
    assert schema["properties"]["text"]["type"] == "string"
    assert "count" in schema["properties"]
    assert schema["properties"]["count"]["type"] == "integer"
    assert "text" in schema["required"]
    assert "count" not in schema["required"]  # has a default


def test_mcp_resource_registers_function():
    from openaxis.core.mcp.decorators import mcp_resource

    @mcp_resource("openaxis://test/resource")
    async def my_resource():
        """Test resource."""
        return {"data": "test"}

    resources = get_resources()
    assert "openaxis://test/resource" in resources
    assert resources["openaxis://test/resource"].description == "Test resource."


@pytest.mark.asyncio
async def test_mcp_tool_callable():
    from openaxis.core.mcp.decorators import mcp_tool

    @mcp_tool(name="callable_tool")
    async def add(a: int, b: int) -> int:
        return a + b

    result = await get_tools()["callable_tool"].func(a=2, b=3)
    assert result == 5


@pytest.mark.asyncio
async def test_mcp_router_list_tools(clean_registry):
    from fastapi.testclient import TestClient
    from fastapi import FastAPI
    from openaxis.core.mcp.decorators import mcp_tool
    from openaxis.core.mcp.router import create_mcp_router

    @mcp_tool(name="listed_tool", description="Listed")
    async def listed():
        return []

    app = FastAPI()
    app.include_router(create_mcp_router())

    with TestClient(app) as client:
        resp = client.get("/mcp/tools")
        assert resp.status_code == 200
        names = [t["name"] for t in resp.json()]
        assert "listed_tool" in names


@pytest.mark.asyncio
async def test_mcp_router_call_tool(clean_registry):
    from fastapi.testclient import TestClient
    from fastapi import FastAPI
    from openaxis.core.mcp.decorators import mcp_tool
    from openaxis.core.mcp.router import create_mcp_router

    @mcp_tool(name="echo_tool")
    async def echo(message: str) -> str:
        """Echo the input."""
        return message

    app = FastAPI()
    app.include_router(create_mcp_router())

    with TestClient(app) as client:
        resp = client.post(
            "/mcp/tools/call", json={"name": "echo_tool", "arguments": {"message": "hello"}}
        )
        assert resp.status_code == 200
        assert resp.json()["result"] == "hello"
