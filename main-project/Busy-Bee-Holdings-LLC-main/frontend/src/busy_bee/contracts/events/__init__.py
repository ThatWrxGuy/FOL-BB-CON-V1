"""Events contracts - Event schemas for observatory."""

from datetime import datetime
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field


class BaseEvent(BaseModel):
    """Base event schema for all events."""
    event_type: str = Field(..., description="Type of event")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Event timestamp")
    tenant_id: str = Field(..., description="Tenant identifier")
    workspace_id: str = Field(..., description="Workspace identifier")
    user_id: Optional[str] = Field(None, description="User who triggered the event")
    
    class Config:
        frozen = True


class AuditEvent(BaseEvent):
    """Audit event for tracking user actions."""
    action: str = Field(..., description="Action performed")
    resource_type: str = Field(..., description="Type of resource affected")
    resource_id: str = Field(..., description="ID of affected resource")
    changes: Optional[Dict[str, Any]] = Field(None, description="Changes made")
    result: str = Field("success", description="Result of the action")


class AnalyticsEvent(BaseEvent):
    """Analytics event for tracking usage."""
    event_name: str = Field(..., description="Name of the analytics event")
    properties: Dict[str, Any] = Field(default_factory=dict, description="Event properties")
    session_id: Optional[str] = Field(None, description="Session identifier")


class MonitoringEvent(BaseEvent):
    """Monitoring event for system health."""
    metric_name: str = Field(..., description="Name of the metric")
    value: float = Field(..., description="Metric value")
    unit: str = Field(..., description="Unit of measurement")
    tags: Dict[str, str] = Field(default_factory=dict, description="Metric tags")
