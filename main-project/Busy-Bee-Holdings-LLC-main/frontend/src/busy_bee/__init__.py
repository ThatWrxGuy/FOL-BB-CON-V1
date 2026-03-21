"""Busy Bee Flower Architecture - Multi-tenant intelligence platform.

This package implements the Flower architecture with:
- hive: Identity, tenancy, connectors, billing, platform gateway
- cells: Reusable domain intelligence cores
- lattice: Explicit graph relationships and routing policy
- paths: Orchestration and execution flows
- contracts: Public DTOs, API schemas, events, UI contracts
- foundation: Config, logging, utilities, observability primitives
- observatory: Analytics, audit, monitoring, operational intelligence
"""

from .contracts.domain.context import RequestContext, TenantContext
from .hive.tenancy.workspace_model import Workspace, WorkspaceStatus, WorkspacePlan
from .hive.tenancy.workspace_service import WorkspaceService
from .cells.finance.service import FinanceCell
from .cells.executive.service import ExecutiveCell

__version__ = "1.0.0"

__all__ = [
    # Context
    "RequestContext",
    "TenantContext",
    # Workspace
    "Workspace",
    "WorkspaceStatus",
    "WorkspacePlan", 
    "WorkspaceService",
    # Cells
    "FinanceCell",
    "ExecutiveCell"
]
