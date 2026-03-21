"""Foundation package - Config, logging, utilities, observability primitives."""

from .logging.logger import StructuredLogger, get_logger, debug, info, warning, error, critical

__all__ = [
    "StructuredLogger",
    "get_logger",
    "debug",
    "info",
    "warning", 
    "error",
    "critical"
]
