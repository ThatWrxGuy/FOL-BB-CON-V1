"""Audit events - Event schemas for tracking user actions."""

from datetime import datetime
from typing import Any, Dict, Optional
from enum import Enum


class AuditAction(str, Enum):
    """Audit action types."""
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"
    READ = "read"
    LOGIN = "login"
    LOGOUT = "logout"
    EXPORT = "export"
    IMPORT = "import"


class AuditEvent:
    """Audit event for tracking user actions.
    
    The observatory can read across layers for telemetry but
    must not become a hidden execution layer.
    """
    
    def __init__(
        self,
        tenant_id: str,
        workspace_id: str,
        user_id: Optional[str],
        action: AuditAction,
        resource_type: str,
        resource_id: str,
        changes: Optional[Dict[str, Any]] = None,
        result: str = "success",
        metadata: Optional[Dict[str, Any]] = None
    ):
        self.event_id = f"audit_{datetime.utcnow().timestamp()}"
        self.timestamp = datetime.utcnow()
        self.tenant_id = tenant_id
        self.workspace_id = workspace_id
        self.user_id = user_id
        self.action = action
        self.resource_type = resource_type
        self.resource_id = resource_id
        self.changes = changes or {}
        self.result = result
        self.metadata = metadata or {}
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "event_id": self.event_id,
            "timestamp": self.timestamp.isoformat(),
            "tenant_id": self.tenant_id,
            "workspace_id": self.workspace_id,
            "user_id": self.user_id,
            "action": self.action.value,
            "resource_type": self.resource_type,
            "resource_id": self.resource_id,
            "changes": self.changes,
            "result": self.result,
            "metadata": self.metadata
        }


class AuditLogger:
    """Audit logger for storing and querying audit events."""
    
    _events: list = []
    
    @classmethod
    def log(cls, event: AuditEvent) -> None:
        """Log an audit event."""
        cls._events.append(event)
    
    @classmethod
    def log_action(
        cls,
        tenant_id: str,
        workspace_id: str,
        user_id: Optional[str],
        action: AuditAction,
        resource_type: str,
        resource_id: str,
        **kwargs
    ) -> None:
        """Log an action with convenience parameters."""
        event = AuditEvent(
            tenant_id=tenant_id,
            workspace_id=workspace_id,
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            **kwargs
        )
        cls.log(event)
    
    @classmethod
    def get_events(
        cls,
        tenant_id: Optional[str] = None,
        workspace_id: Optional[str] = None,
        user_id: Optional[str] = None,
        action: Optional[AuditAction] = None,
        limit: int = 100
    ) -> list:
        """Query audit events."""
        results = cls._events
        
        if tenant_id:
            results = [e for e in results if e.tenant_id == tenant_id]
        if workspace_id:
            results = [e for e in results if e.workspace_id == workspace_id]
        if user_id:
            results = [e for e in results if e.user_id == user_id]
        if action:
            results = [e for e in results if e.action == action]
        
        # Sort by timestamp descending
        results = sorted(results, key=lambda e: e.timestamp, reverse=True)
        
        return results[:limit]
