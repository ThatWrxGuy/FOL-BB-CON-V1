"""Logger - Structured logging for Busy Bee."""

import logging
import sys
from typing import Optional, Any, Dict
from datetime import datetime
import json


class StructuredLogger:
    """Structured logger with tenant context support."""
    
    _loggers: Dict[str, logging.Logger] = {}
    _tenant_context: Optional[Dict[str, str]] = None
    
    @classmethod
    def set_tenant_context(cls, context: Optional[Dict[str, str]]) -> None:
        """Set tenant context for logging."""
        cls._tenant_context = context
    
    @classmethod
    def get_logger(cls, name: str) -> logging.Logger:
        """Get or create a logger."""
        if name not in cls._loggers:
            logger = logging.getLogger(name)
            logger.setLevel(logging.DEBUG)
            
            # Console handler
            handler = logging.StreamHandler(sys.stdout)
            handler.setLevel(logging.DEBUG)
            
            # Formatter
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            handler.setFormatter(formatter)
            
            logger.addHandler(handler)
            cls._loggers[name] = logger
        
        return cls._loggers[name]
    
    @classmethod
    def log(
        cls,
        level: str,
        message: str,
        extra: Optional[Dict[str, Any]] = None
    ) -> None:
        """Log a structured message."""
        logger = cls.get_logger("busy_bee")
        
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "message": message,
        }
        
        if cls._tenant_context:
            log_data["tenant_context"] = cls._tenant_context
        
        if extra:
            log_data["extra"] = extra
        
        log_message = json.dumps(log_data)
        
        if level == "debug":
            logger.debug(log_message)
        elif level == "info":
            logger.info(log_message)
        elif level == "warning":
            logger.warning(log_message)
        elif level == "error":
            logger.error(log_message)
        elif level == "critical":
            logger.critical(log_message)


# Convenience functions
def get_logger(name: str) -> logging.Logger:
    """Get a logger instance."""
    return StructuredLogger.get_logger(name)


def debug(message: str, **kwargs: Any) -> None:
    """Log debug message."""
    StructuredLogger.log("debug", message, kwargs if kwargs else None)


def info(message: str, **kwargs: Any) -> None:
    """Log info message."""
    StructuredLogger.log("info", message, kwargs if kwargs else None)


def warning(message: str, **kwargs: Any) -> None:
    """Log warning message."""
    StructuredLogger.log("warning", message, kwargs if kwargs else None)


def error(message: str, **kwargs: Any) -> None:
    """Log error message."""
    StructuredLogger.log("error", message, kwargs if kwargs else None)


def critical(message: str, **kwargs: Any) -> None:
    """Log critical message."""
    StructuredLogger.log("critical", message, kwargs if kwargs else None)
