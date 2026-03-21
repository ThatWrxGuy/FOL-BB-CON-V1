"""UI contracts - UI component interfaces and props."""

from typing import Any, Dict, Optional
from pydantic import BaseModel, Field


class ComponentProps(BaseModel):
    """Base component props."""
    class_name: Optional[str] = Field(None, description="Additional CSS classes")


class CardProps(ComponentProps):
    """Card component props."""
    title: Optional[str] = Field(None, description="Card title")
    description: Optional[str] = Field(None, description="Card description")
    variant: str = Field("default", description="Card variant")


class ButtonProps(ComponentProps):
    """Button component props."""
    variant: str = Field("primary", description="Button variant")
    size: str = Field("md", description="Button size")
    disabled: bool = Field(False, description="Whether button is disabled")
    loading: bool = Field(False, description="Whether button is loading")


class InputProps(ComponentProps):
    """Input component props."""
    label: Optional[str] = Field(None, description="Input label")
    placeholder: Optional[str] = Field(None, description="Input placeholder")
    error: Optional[str] = Field(None, description="Error message")
    required: bool = Field(False, description="Whether field is required")


class TableProps(ComponentProps):
    """Table component props."""
    columns: list = Field(default_factory=list, description="Table columns")
    data: list = Field(default_factory=list, description="Table data")
    loading: bool = Field(False, description="Whether table is loading")
