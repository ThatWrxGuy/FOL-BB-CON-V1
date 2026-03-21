"""Routing - Routing policy and path resolution in the lattice.

The routing module handles path resolution between cells,
enforcing the lattice graph structure.
"""

from typing import Dict, List, Optional, Set, Any, Callable
from enum import Enum
from pydantic import BaseModel, Field


class RoutingStrategy(str, Enum):
    """Routing strategies."""
    DIRECT = "direct"           # Direct routing to target
    ROUND_ROBIN = "round_robin" # Load balance across targets
    PRIORITY = "priority"       # Priority-based routing
    FALLBACK = "fallback"      # Fallback to next option


class Route(BaseModel):
    """A route in the lattice."""
    source: str = Field(..., description="Source node")
    target: str = Field(..., description="Target node")
    strategy: RoutingStrategy = Field(default=RoutingStrategy.DIRECT)
    priority: int = Field(default=0, description="Route priority")
    middleware: List[str] = Field(default_factory=list, description="Middleware to apply")


class Router:
    """Router for managing cell-to-cell communication.
    
    The router enforces lattice graph rules and handles
    routing between cells based on policies.
    """
    
    _routes: Dict[str, List[Route]] = {}  # source -> list of routes
    
    @classmethod
    def add_route(cls, route: Route) -> None:
        """Add a route."""
        if route.source not in cls._routes:
            cls._routes[route.source] = []
        cls._routes[route.source].append(route)
        
        # Sort by priority (higher first)
        cls._routes[route.source].sort(key=lambda r: r.priority, reverse=True)
    
    @classmethod
    def get_routes_from(cls, source: str) -> List[Route]:
        """Get all routes from a source node."""
        return cls._routes.get(source, [])
    
    @classmethod
    def resolve_route(cls, source: str, target: str) -> Optional[Route]:
        """Resolve a specific route from source to target."""
        routes = cls._routes.get(source, [])
        for route in routes:
            if route.target == target:
                return route
        return None
    
    @classmethod
    def find_path(cls, source: str, target: str) -> Optional[List[str]]:
        """Find a path from source to target in the lattice."""
        from .edge_registry import EdgeRegistry
        
        # BFS to find path
        visited = set()
        queue = [(source, [source])]
        
        while queue:
            current, path = queue.pop(0)
            
            if current == target:
                return path
            
            if current in visited:
                continue
            
            visited.add(current)
            
            # Get allowed targets from edge registry
            targets = EdgeRegistry.get_allowed_targets(current)
            for t in targets:
                if t not in visited:
                    queue.append((t, path + [t]))
        
        return None
    
    @classmethod
    def can_reach(cls, source: str, target: str) -> bool:
        """Check if source can reach target in the lattice."""
        path = cls.find_path(source, target)
        return path is not None
    
    @classmethod
    def get_all_reachable(cls, source: str) -> Set[str]:
        """Get all nodes reachable from source."""
        from .edge_registry import EdgeRegistry
        
        reachable = set()
        queue = [source]
        visited = set()
        
        while queue:
            current = queue.pop(0)
            
            if current in visited:
                continue
            
            visited.add(current)
            
            targets = EdgeRegistry.get_allowed_targets(current)
            for t in targets:
                if t not in visited:
                    reachable.add(t)
                    queue.append(t)
        
        return reachable


class RouteMiddleware:
    """Middleware for route processing."""
    
    _middleware: Dict[str, Callable] = {}
    
    @classmethod
    def register(cls, name: str, middleware: Callable) -> None:
        """Register a middleware function."""
        cls._middleware[name] = middleware
    
    @classmethod
    def apply(cls, route: Route, data: Any) -> Any:
        """Apply middleware to route data."""
        result = data
        for mw_name in route.middleware:
            mw = cls._middleware.get(mw_name)
            if mw:
                result = mw(result)
        return result
