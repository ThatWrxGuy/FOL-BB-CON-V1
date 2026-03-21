"""Request context middleware - Gateway request context handling."""

from typing import Optional, Callable, Any, Dict
from contextvars import ContextVar
import uuid

# Context variable for storing current request context
_current_context: ContextVar[Optional[Dict[str, Any]]] = ContextVar('current_context', default=None)


class RequestContextMiddleware:
    """Middleware for managing request context throughout the request lifecycle.
    
    This middleware ensures every request has proper tenant isolation
    by maintaining context throughout the request.
    """
    
    @staticmethod
    def create_context(
        user_id: str,
        tenant_id: str,
        workspace_id: str,
        request_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create a new request context."""
        return {
            "user_id": user_id,
            "tenant_id": tenant_id,
            "workspace_id": workspace_id,
            "request_id": request_id or str(uuid.uuid4()),
            "metadata": {}
        }
    
    @staticmethod
    def set_context(context: Dict[str, Any]) -> None:
        """Set the current request context."""
        _current_context.set(context)
    
    @staticmethod
    def get_context() -> Optional[Dict[str, Any]]:
        """Get the current request context."""
        return _current_context.get()
    
    @staticmethod
    def clear_context() -> None:
        """Clear the current request context."""
        _current_context.set(None)
    
    @staticmethod
    def get_user_id() -> Optional[str]:
        """Get current user ID from context."""
        context = _current_context.get()
        return context.get("user_id") if context else None
    
    @staticmethod
    def get_tenant_id() -> Optional[str]:
        """Get current tenant ID from context."""
        context = _current_context.get()
        return context.get("tenant_id") if context else None
    
    @staticmethod
    def get_workspace_id() -> Optional[str]:
        """Get current workspace ID from context."""
        context = _current_context.get()
        return context.get("workspace_id") if context else None
    
    @staticmethod
    def get_request_id() -> Optional[str]:
        """Get current request ID from context."""
        context = _current_context.get()
        return context.get("request_id") if context else None
    
    @staticmethod
    def set_metadata(key: str, value: Any) -> None:
        """Set metadata in the current context."""
        context = _current_context.get()
        if context:
            context["metadata"][key] = value
    
    @staticmethod
    def get_metadata(key: str) -> Optional[Any]:
        """Get metadata from the current context."""
        context = _current_context.get()
        return context.get("metadata", {}).get(key) if context else None


def with_context(context: Dict[str, Any]) -> Callable:
    """Decorator to wrap a function with request context."""
    def decorator(func: Callable) -> Callable:
        def wrapper(*args, **kwargs):
            previous_context = _current_context.get()
            try:
                _current_context.set(context)
                return func(*args, **kwargs)
            finally:
                _current_context.set(previous_context)
        return wrapper
    return decorator
