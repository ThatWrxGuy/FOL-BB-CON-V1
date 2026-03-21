"""Domain context contract - Request context with tenant isolation."""

from typing import Optional
from pydantic import BaseModel, Field


class RequestContext(BaseModel):
    """Tenant context contract ensuring request isolation.
    
    Every request is traceable to user_id, tenant_id, and workspace_id.
    This is the foundational contract for multi-tenant isolation.
    """
    user_id: str = Field(..., description="Authenticated user identifier")
    tenant_id: str = Field(..., description="Tenant or organization identifier")
    workspace_id: str = Field(..., description="Workspace boundary identifier")
    request_id: Optional[str] = Field(None, description="Unique request identifier for tracing")
    
    class Config:
        frozen = True


class TenantContext:
    """Tenant context holder for request-scoped isolation."""
    
    def __init__(self, user_id: str, tenant_id: str, workspace_id: str, request_id: Optional[str] = None):
        self.user_id = user_id
        self.tenant_id = tenant_id
        self.workspace_id = workspace_id
        self.request_id = request_id or self._generate_request_id()
    
    @staticmethod
    def _generate_request_id() -> str:
        """Generate a unique request ID."""
        import uuid
        return str(uuid.uuid4())
    
    def to_dict(self) -> dict:
        """Convert to dictionary representation."""
        return {
            "user_id": self.user_id,
            "tenant_id": self.tenant_id,
            "workspace_id": self.workspace_id,
            "request_id": self.request_id
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> "TenantContext":
        """Create from dictionary representation."""
        return cls(
            user_id=data["user_id"],
            tenant_id=data["tenant_id"],
            workspace_id=data["workspace_id"],
            request_id=data.get("request_id")
        )
