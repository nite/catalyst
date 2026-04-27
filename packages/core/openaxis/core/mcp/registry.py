"""Global tool and resource registry for MCP endpoints."""

from dataclasses import dataclass, field
from typing import Callable


@dataclass
class ToolEntry:
    name: str
    description: str
    func: Callable
    parameters: dict = field(default_factory=dict)  # JSON Schema object


@dataclass
class ResourceEntry:
    uri: str
    description: str
    func: Callable


_tools: dict[str, ToolEntry] = {}
_resources: dict[str, ResourceEntry] = {}


def register_tool(entry: ToolEntry) -> None:
    _tools[entry.name] = entry


def register_resource(entry: ResourceEntry) -> None:
    _resources[entry.uri] = entry


def get_tools() -> dict[str, ToolEntry]:
    return dict(_tools)


def get_resources() -> dict[str, ResourceEntry]:
    return dict(_resources)


def clear_registry() -> None:
    """Clear all registrations — used in tests."""
    _tools.clear()
    _resources.clear()
