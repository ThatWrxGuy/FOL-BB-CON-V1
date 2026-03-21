"""Executive brief path - Orchestration flow for executive brief generation.

This path demonstrates how to orchestrate multiple cells to generate
an executive brief. Paths orchestrate flows using cells, never the reverse.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta

from ..contracts.domain.context import RequestContext
from ..cells.finance.service import FinanceCell, TransactionType, TransactionCategory
from ..cells.executive.service import ExecutiveCell, ExecutiveBrief, MetricCategory
from ..lattice.node_registry import NodeRegistry
from ..lattice.edge_registry import EdgeRegistry
from ..lattice.routing import Router


class ExecutiveBriefPath:
    """Orchestration path for generating executive briefs.
    
    This path demonstrates proper orchestration:
    1. Validates workspace context
    2. Gathers data from finance cell
    3. Gathers data from executive cell
    4. Synthesizes into an executive brief
    """
    
    @classmethod
    def generate_brief(
        cls,
        context: RequestContext,
        title: str,
        period_days: int = 30
    ) -> ExecutiveBrief:
        """Generate an executive brief for the given context.
        
        Args:
            context: Tenant context with workspace isolation
            title: Title for the brief
            period_days: Number of days to include in the report
            
        Returns:
            ExecutiveBrief with synthesized data from all cells
        """
        # Validate that we can access the finance cell
        if not Router.can_reach("tenancy", "finance"):
            raise PermissionError("Cannot access finance cell from workspace")
        
        if not Router.can_reach("tenancy", "executive"):
            raise PermissionError("Cannot access executive cell from workspace")
        
        # Calculate period
        period_end = datetime.utcnow()
        period_start = period_end - timedelta(days=period_days)
        
        # Gather finance data
        finance_summary = FinanceCell.get_financial_summary(
            context.workspace_id,
            period_start,
            period_end
        )
        
        # Gather executive metrics
        metrics = ExecutiveCell.get_metrics(context.workspace_id)
        
        # Synthesize key highlights from finance
        highlights = []
        if finance_summary.total_income > 0:
            highlights.append(f"Total revenue: ${finance_summary.total_income:,.2f}")
        if finance_summary.net_profit > 0:
            highlights.append(f"Net profit: ${finance_summary.net_profit:,.2f}")
        if finance_summary.transaction_count > 0:
            highlights.append(f"Total transactions: {finance_summary.transaction_count}")
        
        # Identify concerns
        concerns = []
        if finance_summary.total_expenses > finance_summary.total_income:
            concerns.append("Expenses exceed revenue - review cost structure")
        if finance_summary.net_profit < 0:
            concerns.append("Operating at a loss - immediate action required")
        
        # Add category breakdown as highlights
        for category, amount in list(finance_summary.category_breakdown.items())[:3]:
            highlights.append(f"{category}: ${amount:,.2f}")
        
        # Generate summary
        summary = (
            f"Executive brief for {period_days}-day period. "
            f"Revenue: ${finance_summary.total_income:,.2f}, "
            f"Expenses: ${finance_summary.total_expenses:,.2f}, "
            f"Net: ${finance_summary.net_profit:,.2f}. "
            f"Track {len(metrics)} metrics across the organization."
        )
        
        # Create recommendations
        recommendations = []
        if finance_summary.net_profit < 0:
            recommendations.append("Implement cost reduction measures")
        if finance_summary.total_income > 0 and finance_summary.total_expenses / finance_summary.total_income > 0.8:
            recommendations.append("Review operational efficiency")
        if len(metrics) < 5:
            recommendations.append("Expand metric tracking coverage")
        
        # Create the brief
        brief = ExecutiveCell.create_executive_brief(
            workspace_id=context.workspace_id,
            title=title,
            period_start=period_start,
            period_end=period_end,
            summary=summary,
            key_highlights=highlights,
            key_concerns=concerns,
            recommendations=recommendations
        )
        
        return brief
    
    @classmethod
    def validate_prerequisites(cls, context: RequestContext) -> Dict[str, Any]:
        """Validate that all prerequisites for the path are met.
        
        Returns:
            Dict with validation results
        """
        results = {
            "valid": True,
            "errors": [],
            "warnings": [],
            "cell_dependencies": []
        }
        
        # Check workspace exists and is active
        from ..hive.tenancy.workspace_service import WorkspaceService
        workspace = WorkspaceService.get_workspace(context.workspace_id)
        
        if not workspace:
            results["valid"] = False
            results["errors"].append("Workspace not found")
        elif not workspace.is_active():
            results["valid"] = False
            results["errors"].append("Workspace is not active")
        
        # Check cell connectivity
        required_cells = ["finance", "executive"]
        for cell in required_cells:
            if Router.can_reach("tenancy", cell):
                results["cell_dependencies"].append({
                    "cell": cell,
                    "accessible": True
                })
            else:
                results["warnings"].append(f"Cell '{cell}' may not be accessible")
        
        return results


class PathExecutor:
    """Executor for running orchestration paths.
    
    This provides a consistent interface for running paths
    with proper error handling and logging.
    """
    
    @staticmethod
    def execute(
        path_class: Any,
        method_name: str,
        context: RequestContext,
        **kwargs
    ) -> Any:
        """Execute a path method with error handling.
        
        Args:
            path_class: The path class to execute
            method_name: Name of the method to call
            context: Request context
            **kwargs: Arguments to pass to the method
            
        Returns:
            Result from the path method
            
        Raises:
            PermissionError: If prerequisites are not met
            ValueError: If input is invalid
        """
        method = getattr(path_class, method_name, None)
        if not method:
            raise ValueError(f"Method {method_name} not found on {path_class}")
        
        # Validate prerequisites
        if hasattr(path_class, "validate_prerequisites"):
            validation = path_class.validate_prerequisites(context)
            if not validation["valid"]:
                raise PermissionError(
                    f"Prerequisites not met: {validation['errors']}"
                )
        
        # Execute
        return method(context, **kwargs)
