"""Workspace model - Multi-tenant workspace boundary."""

from datetime import datetime
from typing import Optional, List
from enum import Enum
from pydantic import BaseModel, Field


class WorkspaceStatus(str, Enum):
    """Workspace status enum."""
    ACTIVE = "active"
    SUSPENDED = "suspended"
    ARCHIVED = "archived"


class WorkspacePlan(str, Enum):
    """Workspace plan types."""
    FREE = "free"
    STARTER = "starter"
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"


class Workspace(BaseModel):
    """Workspace model - The fundamental multi-tenant boundary.
    
    Each workspace represents an isolated boundary where all
    business logic operates. Every data point belongs to a workspace.
    """
    id: str = Field(..., description="Unique workspace identifier")
    tenant_id: str = Field(..., description="Parent tenant organization ID")
    name: str = Field(..., description="Workspace name")
    description: Optional[str] = Field(None, description="Workspace description")
    status: WorkspaceStatus = Field(default=WorkspaceStatus.ACTIVE, description="Workspace status")
    plan: WorkspacePlan = Field(default=WorkspacePlan.FREE, description="Workspace plan")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation timestamp")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Last update timestamp")
    owner_id: str = Field(..., description="Workspace owner user ID")
    settings: dict = Field(default_factory=dict, description="Workspace-specific settings")
    metadata: dict = Field(default_factory=dict, description="Additional metadata")
    
    class Config:
        use_enum_values = True
        frozen = False
    
    def is_active(self) -> bool:
        """Check if workspace is active."""
        return self.status == WorkspaceStatus.ACTIVE
    
    def can_access(self, user_id: str, role: str = "member") -> bool:
        """Check if user can access workspace.
        
        In a real implementation, this would check workspace membership.
        """
        return self.is_active()


class WorkspaceUser(BaseModel):
    """Workspace user association."""
    workspace_id: str = Field(..., description="Workspace ID")
    user_id: str = Field(..., description="User ID")
    role: str = Field(..., description="User role in workspace")
    joined_at: datetime = Field(default_factory=datetime.utcnow, description="When user joined")
    
    class Config:
        frozen = True
