"""Edge registry - Defines allowed cross-cell connections and routing policies.

The edge registry defines which cells can communicate with each other
and under what conditions. This prevents accidental cross-cell coupling.
"""

from typing import Dict, List, Optional, Set, Any
from enum import Enum
from pydantic import BaseModel, Field
import uuid


class EdgeType(str, Enum):
    """Types of edges between nodes."""
    DATA_FLOW = "data_flow"      # One-way data flow
    BIDIRECTIONAL = "bidirectional"  # Two-way communication
    DEPENDENCY = "dependency"     # One node depends on another
    TRIGGER = "trigger"          # One node can trigger another


class EdgePolicy(BaseModel):
    """Policy for edge communication."""
    allow: bool = Field(True, description="Whether communication is allowed")
    rate_limit: Optional[int] = Field(None, description="Requests per minute limit")
    requires_context: bool = Field(True, description="Requires tenant context")
    retry_policy: Optional[Dict[str, Any]] = Field(None, description="Retry configuration")


class Edge(BaseModel):
    """An edge connecting two nodes in the lattice."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    source: str = Field(..., description="Source node ID")
    target: str = Field(..., description="Target node ID")
    edge_type: EdgeType = Field(..., description="Type of edge")
    description: str = Field(..., description="Edge description")
    policy: EdgePolicy = Field(default_factory=EdgePolicy)
    
    class Config:
        use_enum_values = True


class EdgeRegistry:
    """Registry for edges between nodes.
    
    This registry defines allowed cross-cell connections and
    enforces communication policies.
    """
    
    _edges: Dict[str, Edge] = {}
    _outgoing_edges: Dict[str, List[str]] = {}  # node_id -> list of target node_ids
    _incoming_edges: Dict[str, List[str]] = {}  # node_id -> list of source node_ids
    
    # Predefined edges between cells
    DEFAULT_EDGES = [
        Edge(
            id="finance_to_executive",
            source="finance",
            target="executive",
            edge_type=EdgeType.DATA_FLOW,
            description="Financial metrics flow to executive reporting",
            policy=EdgePolicy(requires_context=True)
        ),
        Edge(
            id="executive_to_finance",
            source="executive",
            target="finance",
            edge_type=EdgeType.DATA_FLOW,
            description="Executive can query financial data",
            policy=EdgePolicy(requires_context=True)
        ),
        Edge(
            id="goals_to_executive",
            source="goals",
            target="executive",
            edge_type=EdgeType.DATA_FLOW,
            description="Goal progress flows to executive briefing",
            policy=EdgePolicy(requires_context=True)
        ),
        Edge(
            id="tasks_to_executive",
            source="tasks",
            target="executive",
            edge_type=EdgeType.DATA_FLOW,
            description="Task metrics flow to executive dashboard",
            policy=EdgePolicy(requires_context=True)
        ),
        Edge(
            id="analytics_to_recommendation",
            source="analytics",
            target="recommendation",
            edge_type=EdgeType.DATA_FLOW,
            description="Analytics data powers recommendations",
            policy=EdgePolicy(requires_context=True)
        ),
        Edge(
            id="recommendation_to_memory",
            source="recommendation",
            target="memory",
            edge_type=EdgeType.DATA_FLOW,
            description="Recommendations stored in memory",
            policy=EdgePolicy(requires_context=True)
        ),
        Edge(
            id="workspace_to_cells",
            source="tenancy",
            target="finance",
            edge_type=EdgeType.DEPENDENCY,
            description="Finance cell requires workspace context",
            policy=EdgePolicy(requires_context=True)
        ),
        Edge(
            id="workspace_to_executive",
            source="tenancy",
            target="executive",
            edge_type=EdgeType.DEPENDENCY,
            description="Executive cell requires workspace context",
            policy=EdgePolicy(requires_context=True)
        ),
    ]
    
    @classmethod
    def register(cls, edge: Edge) -> None:
        """Register an edge in the lattice."""
        cls._edges[edge.id] = edge
        
        # Update outgoing edges
        if edge.source not in cls._outgoing_edges:
            cls._outgoing_edges[edge.source] = []
        if edge.target not in cls._outgoing_edges[edge.source]:
            cls._outgoing_edges[edge.source].append(edge.target)
        
        # Update incoming edges
        if edge.target not in cls._incoming_edges:
            cls._incoming_edges[edge.target] = []
        if edge.source not in cls._incoming_edges[edge.target]:
            cls._incoming_edges[edge.target].append(edge.source)
    
    @classmethod
    def get_edge(cls, edge_id: str) -> Optional[Edge]:
        """Get an edge by ID."""
        return cls._edges.get(edge_id)
    
    @classmethod
    def get_all_edges(cls) -> List[Edge]:
        """Get all registered edges."""
        return list(cls._edges.values())
    
    @classmethod
    def get_outgoing_edges(cls, node_id: str) -> List[Edge]:
        """Get all edges from a node."""
        return [
            e for e in cls._edges.values() 
            if e.source == node_id
        ]
    
    @classmethod
    def get_incoming_edges(cls, node_id: str) -> List[Edge]:
        """Get all edges to a node."""
        return [
            e for e in cls._edges.values() 
            if e.target == node_id
        ]
    
    @classmethod
    def can_communicate(cls, source: str, target: str) -> bool:
        """Check if two nodes can communicate."""
        for edge in cls._edges.values():
            if edge.source == source and edge.target == target:
                return edge.policy.allow
        return False
    
    @classmethod
    def get_allowed_targets(cls, source: str) -> List[str]:
        """Get all nodes that can be communicated with from source."""
        return cls._outgoing_edges.get(source, [])
    
    @classmethod
    def get_allowed_sources(cls, target: str) -> List[str]:
        """Get all nodes that can communicate to target."""
        return cls._incoming_edges.get(target, [])
    
    @classmethod
    def initialize(cls) -> None:
        """Initialize the registry with default edges."""
        for edge in cls.DEFAULT_EDGES:
            cls.register(edge)
    
    @classmethod
    def validate_graph(cls) -> Dict[str, Any]:
        """Validate the edge graph for issues."""
        issues = []
        
        # Check for cycles
        for node_id in cls._outgoing_edges:
            if cls._has_cycle(node_id, set()):
                issues.append(f"Cycle detected involving {node_id}")
        
        # Check for isolated nodes
        all_nodes = set(cls._outgoing_edges.keys()) | set(cls._incoming_edges.keys())
        for node_id in all_nodes:
            if not cls._outgoing_edges.get(node_id) and not cls._incoming_edges.get(node_id):
                issues.append(f"Isolated node: {node_id}")
        
        return {
            "valid": len(issues) == 0,
            "issues": issues
        }
    
    @classmethod
    def _has_cycle(cls, node_id: str, visited: Set[str]) -> bool:
        """Check if there's a cycle starting from node_id."""
        if node_id in visited:
            return True
        
        visited.add(node_id)
        
        for target in cls._outgoing_edges.get(node_id, []):
            if cls._has_cycle(target, visited.copy()):
                return True
        
        return False


# Initialize registry on module load
EdgeRegistry.initialize()
