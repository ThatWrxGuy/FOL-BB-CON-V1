"""Executive cell - Business intelligence for executive operations.

This cell contains executive-level intelligence and is independently testable.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field
import uuid


class MetricCategory(str, Enum):
    """Categories for business metrics."""
    REVENUE = "revenue"
    GROWTH = "growth"
    ENGAGEMENT = "engagement"
    OPERATIONS = "operations"
    CUSTOMER = "customer"


class Metric(BaseModel):
    """Business metric."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    workspace_id: str = Field(..., description="Workspace boundary")
    category: MetricCategory = Field(..., description="Metric category")
    name: str = Field(..., description="Metric name")
    value: float = Field(..., description="Metric value")
    previous_value: Optional[float] = Field(None, description="Previous period value")
    unit: str = Field(..., description="Unit of measurement")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    @property
    def change_percentage(self) -> Optional[float]:
        """Calculate percentage change from previous value."""
        if self.previous_value and self.previous_value != 0:
            return ((self.value - self.previous_value) / self.previous_value) * 100
        return None
    
    class Config:
        use_enum_values = True


class ExecutiveBrief(BaseModel):
    """Executive brief - High-level business summary."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    workspace_id: str = Field(..., description="Workspace boundary")
    title: str = Field(..., description="Brief title")
    summary: str = Field(..., description="Executive summary")
    key_highlights: List[str] = Field(default_factory=list)
    key_concerns: List[str] = Field(default_factory=list)
    metrics: List[Metric] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    period_start: datetime = Field(..., description="Report period start")
    period_end: datetime = Field(..., description="Report period end")


class ExecutiveCell:
    """Executive cell - Reusable executive intelligence core.
    
    This cell handles executive-level intelligence:
    - Business metrics tracking
    - Executive brief generation
    - KPI monitoring
    - Strategic recommendations
    """
    
    # In-memory storage (would be replaced with actual database)
    _metrics: Dict[str, List[Metric]] = {}
    _briefs: Dict[str, List[ExecutiveBrief]] = {}
    
    @classmethod
    def add_metric(
        cls,
        workspace_id: str,
        category: MetricCategory,
        name: str,
        value: float,
        unit: str,
        previous_value: Optional[float] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Metric:
        """Add a new metric to the workspace."""
        metric = Metric(
            workspace_id=workspace_id,
            category=category,
            name=name,
            value=value,
            unit=unit,
            previous_value=previous_value,
            metadata=metadata or {}
        )
        
        if workspace_id not in cls._metrics:
            cls._metrics[workspace_id] = []
        
        cls._metrics[workspace_id].append(metric)
        return metric
    
    @classmethod
    def get_metrics(
        cls,
        workspace_id: str,
        category: Optional[MetricCategory] = None,
        limit: int = 10
    ) -> List[Metric]:
        """Get recent metrics for a workspace."""
        metrics = cls._metrics.get(workspace_id, [])
        
        if category:
            metrics = [m for m in metrics if m.category == category]
        
        # Return most recent
        return sorted(metrics, key=lambda m: m.timestamp, reverse=True)[:limit]
    
    @classmethod
    def create_executive_brief(
        cls,
        workspace_id: str,
        title: str,
        period_start: datetime,
        period_end: datetime,
        summary: str,
        key_highlights: Optional[List[str]] = None,
        key_concerns: Optional[List[str]] = None,
        recommendations: Optional[List[str]] = None
    ) -> ExecutiveBrief:
        """Create an executive brief for a period."""
        # Get relevant metrics
        metrics = cls.get_metrics(workspace_id)
        
        brief = ExecutiveBrief(
            workspace_id=workspace_id,
            title=title,
            summary=summary,
            key_highlights=key_highlights or [],
            key_concerns=key_concerns or [],
            metrics=metrics,
            recommendations=recommendations or [],
            period_start=period_start,
            period_end=period_end
        )
        
        if workspace_id not in cls._briefs:
            cls._briefs[workspace_id] = []
        
        cls._briefs[workspace_id].append(brief)
        return brief
    
    @classmethod
    def get_briefs(
        cls,
        workspace_id: str,
        limit: int = 10
    ) -> List[ExecutiveBrief]:
        """Get recent executive briefs for a workspace."""
        briefs = cls._briefs.get(workspace_id, [])
        return sorted(briefs, key=lambda b: b.created_at, reverse=True)[:limit]
    
    @classmethod
    def get_latest_brief(cls, workspace_id: str) -> Optional[ExecutiveBrief]:
        """Get the most recent executive brief."""
        briefs = cls.get_briefs(workspace_id, limit=1)
        return briefs[0] if briefs else None
    
    @classmethod
    def get_dashboard_metrics(cls, workspace_id: str) -> Dict[str, Any]:
        """Get key metrics for executive dashboard."""
        metrics = cls.get_metrics(workspace_id)
        
        # Group by category
        by_category: Dict[str, List[Metric]] = {}
        for metric in metrics:
            if metric.category not in by_category:
                by_category[metric.category] = []
            by_category[metric.category].append(metric)
        
        # Get latest for each category
        latest_by_category = {}
        for category, cat_metrics in by_category.items():
            if cat_metrics:
                latest_by_category[category] = max(cat_metrics, key=lambda m: m.timestamp)
        
        return {
            "workspace_id": workspace_id,
            "total_metrics": len(metrics),
            "metrics_by_category": latest_by_category,
            "recent_brief": cls.get_latest_brief(workspace_id)
        }
