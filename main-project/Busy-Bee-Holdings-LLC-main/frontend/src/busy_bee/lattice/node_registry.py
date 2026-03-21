"""Node registry - Registry of all cells in the lattice.

The lattice defines explicit graph relationships between cells.
Each cell is registered as a node in the lattice.
"""

from typing import Dict, List, Optional, Set, Any
from enum import Enum
from pydantic import BaseModel, Field
import uuid


class NodeType(str, Enum):
    """Types of nodes in the lattice."""
    CELL = "cell"
    HIVE = "hive"
    FOUNDATION = "foundation"
    OBSERVATORY = "observatory"


class NodeStatus(str, Enum):
    """Node status."""
    ACTIVE = "active"
    DEPRECATED = "deprecated"
    INACTIVE = "inactive"


class Node(BaseModel):
    """A node in the lattice graph."""
    id: str = Field(..., description="Unique node identifier")
    name: str = Field(..., description="Node name")
    node_type: NodeType = Field(..., description="Type of node")
    description: str = Field(..., description="Node description")
    capabilities: List[str] = Field(default_factory=list, description="Node capabilities")
    dependencies: List[str] = Field(default_factory=list, description="Required dependencies")
    status: NodeStatus = Field(default=NodeStatus.ACTIVE)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        use_enum_values = True


class NodeRegistry:
    """Registry for all nodes in the lattice.
    
    This registry maintains all cells and their capabilities.
    Used for service discovery and dependency resolution.
    """
    
    _nodes: Dict[str, Node] = {}
    
    # Predefined node categories
    CELL_NODES = [
        Node(
            id="finance",
            name="Finance Cell",
            node_type=NodeType.CELL,
            description="Business intelligence for financial operations",
            capabilities=["transactions", "reporting", "budget_tracking"],
            dependencies=["workspace"]
        ),
        Node(
            id="executive",
            name="Executive Cell", 
            node_type=NodeType.CELL,
            description="Executive-level intelligence and KPIs",
            capabilities=["metrics", "briefing", "dashboards"],
            dependencies=["workspace"]
        ),
        Node(
            id="goals",
            name="Goals Cell",
            node_type=NodeType.CELL,
            description="Goal tracking and management",
            capabilities=["goals", "milestones", "okr_tracking"],
            dependencies=["workspace"]
        ),
        Node(
            id="tasks",
            name="Tasks Cell",
            node_type=NodeType.CELL,
            description="Task and workflow management",
            capabilities=["tasks", "workflows", "assignments"],
            dependencies=["workspace"]
        ),
        Node(
            id="analytics",
            name="Analytics Cell",
            node_type=NodeType.CELL,
            description="Data analytics and insights",
            capabilities=["analytics", "visualization", "reporting"],
            dependencies=["workspace"]
        ),
        Node(
            id="recommendation",
            name="Recommendation Cell",
            node_type=NodeType.CELL,
            description="AI-powered recommendations",
            capabilities=["recommendations", "predictions", "personalization"],
            dependencies=["workspace", "analytics"]
        ),
        Node(
            id="memory",
            name="Memory Cell",
            node_type=NodeType.CELL,
            description="Long-term memory and context",
            capabilities=["memory", "context", "history"],
            dependencies=["workspace"]
        ),
    ]
    
    HIVE_NODES = [
        Node(
            id="identity",
            name="Identity Service",
            node_type=NodeType.HIVE,
            description="User identity and authentication",
            capabilities=["authentication", "authorization", "users"],
            dependencies=[]
        ),
        Node(
            id="tenancy",
            name="Tenancy Service",
            node_type=NodeType.HIVE,
            description="Workspace and tenant management",
            capabilities=["workspaces", "tenants", "isolation"],
            dependencies=["identity"]
        ),
        Node(
            id="billing",
            name="Billing Service",
            node_type=NodeType.HIVE,
            description="Billing and subscription management",
            capabilities=["billing", "subscriptions", "invoices"],
            dependencies=["tenancy"]
        ),
    ]
    
    @classmethod
    def register(cls, node: Node) -> None:
        """Register a node in the lattice."""
        cls._nodes[node.id] = node
    
    @classmethod
    def get_node(cls, node_id: str) -> Optional[Node]:
        """Get a node by ID."""
        return cls._nodes.get(node_id)
    
    @classmethod
    def get_all_nodes(cls) -> List[Node]:
        """Get all registered nodes."""
        return list(cls._nodes.values())
    
    @classmethod
    def get_nodes_by_type(cls, node_type: NodeType) -> List[Node]:
        """Get all nodes of a specific type."""
        return [n for n in cls._nodes.values() if n.node_type == node_type]
    
    @classmethod
    def get_cells(cls) -> List[Node]:
        """Get all cell nodes."""
        return cls.get_nodes_by_type(NodeType.CELL)
    
    @classmethod
    def initialize(cls) -> None:
        """Initialize the registry with default nodes."""
        for node in cls.CELL_NODES + cls.HIVE_NODES:
            cls.register(node)
    
    @classmethod
    def resolve_dependencies(cls, node_id: str) -> Set[str]:
        """Resolve all dependencies for a node recursively."""
        node = cls.get_node(node_id)
        if not node:
            return set()
        
        resolved = set(node.dependencies)
        for dep_id in node.dependencies:
            resolved.add(dep_id)
            resolved.update(cls.resolve_dependencies(dep_id))
        
        return resolved


# Initialize registry on module load
NodeRegistry.initialize()
