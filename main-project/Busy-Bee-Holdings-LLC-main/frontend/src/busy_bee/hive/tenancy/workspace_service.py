"""Workspace service - Manages workspace lifecycle and access."""

from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

from .workspace_model import Workspace, WorkspaceUser, WorkspaceStatus, WorkspacePlan


class WorkspaceService:
    """Service for managing workspaces.
    
    The workspace service owns workspace lifecycle, membership,
    and isolation boundaries. All workspace operations flow through here.
    """
    
    # In-memory storage for demo (would be replaced with actual DB)
    _workspaces: Dict[str, Workspace] = {}
    _memberships: Dict[str, List[WorkspaceUser]] = {}
    
    @classmethod
    def create_workspace(
        cls,
        tenant_id: str,
        name: str,
        owner_id: str,
        description: Optional[str] = None,
        plan: WorkspacePlan = WorkspacePlan.FREE
    ) -> Workspace:
        """Create a new workspace."""
        workspace = Workspace(
            id=str(uuid.uuid4()),
            tenant_id=tenant_id,
            name=name,
            description=description,
            owner_id=owner_id,
            plan=plan,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        cls._workspaces[workspace.id] = workspace
        
        # Add owner as workspace admin
        membership = WorkspaceUser(
            workspace_id=workspace.id,
            user_id=owner_id,
            role="admin"
        )
        cls._memberships[workspace.id] = [membership]
        
        return workspace
    
    @classmethod
    def get_workspace(cls, workspace_id: str) -> Optional[Workspace]:
        """Get workspace by ID."""
        return cls._workspaces.get(workspace_id)
    
    @classmethod
    def get_workspaces_by_tenant(cls, tenant_id: str) -> List[Workspace]:
        """Get all workspaces for a tenant."""
        return [
            ws for ws in cls._workspaces.values()
            if ws.tenant_id == tenant_id
        ]
    
    @classmethod
    def get_workspaces_for_user(cls, user_id: str) -> List[Workspace]:
        """Get all workspaces a user has access to."""
        result = []
        for workspace_id, memberships in cls._memberships.items():
            if any(m.user_id == user_id for m in memberships):
                ws = cls._workspaces.get(workspace_id)
                if ws:
                    result.append(ws)
        return result
    
    @classmethod
    def update_workspace(
        cls,
        workspace_id: str,
        **updates: Any
    ) -> Optional[Workspace]:
        """Update workspace fields."""
        workspace = cls._workspaces.get(workspace_id)
        if not workspace:
            return None
        
        for key, value in updates.items():
            if hasattr(workspace, key):
                setattr(workspace, key, value)
        
        workspace.updated_at = datetime.utcnow()
        return workspace
    
    @classmethod
    def archive_workspace(cls, workspace_id: str) -> bool:
        """Archive a workspace."""
        workspace = cls._workspaces.get(workspace_id)
        if not workspace:
            return False
        
        workspace.status = WorkspaceStatus.ARCHIVED
        workspace.updated_at = datetime.utcnow()
        return True
    
    @classmethod
    def add_user_to_workspace(
        cls,
        workspace_id: str,
        user_id: str,
        role: str = "member"
    ) -> Optional[WorkspaceUser]:
        """Add a user to a workspace."""
        workspace = cls._workspaces.get(workspace_id)
        if not workspace:
            return None
        
        membership = WorkspaceUser(
            workspace_id=workspace_id,
            user_id=user_id,
            role=role
        )
        
        if workspace_id not in cls._memberships:
            cls._memberships[workspace_id] = []
        
        cls._memberships[workspace_id].append(membership)
        return membership
    
    @classmethod
    def remove_user_from_workspace(cls, workspace_id: str, user_id: str) -> bool:
        """Remove a user from a workspace."""
        memberships = cls._memberships.get(workspace_id, [])
        initial_count = len(memberships)
        cls._memberships[workspace_id] = [
            m for m in memberships if m.user_id != user_id
        ]
        return len(cls._memberships[workspace_id]) < initial_count
    
    @classmethod
    def get_workspace_members(cls, workspace_id: str) -> List[WorkspaceUser]:
        """Get all members of a workspace."""
        return cls._memberships.get(workspace_id, [])
    
    @classmethod
    def has_access(cls, workspace_id: str, user_id: str) -> bool:
        """Check if user has access to workspace."""
        memberships = cls._memberships.get(workspace_id, [])
        return any(m.user_id == user_id for m in memberships)
