"""Finance cell - Business intelligence for financial operations.

This cell contains all financial domain logic and is independently testable.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field
import uuid


class TransactionType(str, Enum):
    """Types of financial transactions."""
    INCOME = "income"
    EXPENSE = "expense"
    TRANSFER = "transfer"


class TransactionCategory(str, Enum):
    """Transaction categories."""
    SALES = "sales"
    SERVICES = "services"
    OPERATIONS = "operations"
    MARKETING = "marketing"
    SALARY = "salary"
    INFRASTRUCTURE = "infrastructure"
    OTHER = "other"


class Transaction(BaseModel):
    """Financial transaction model."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    workspace_id: str = Field(..., description="Workspace boundary")
    type: TransactionType = Field(..., description="Transaction type")
    category: TransactionCategory = Field(..., description="Transaction category")
    amount: float = Field(..., description="Transaction amount")
    currency: str = Field(default="USD", description="Currency code")
    description: str = Field(..., description="Transaction description")
    date: datetime = Field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        use_enum_values = True


class FinancialSummary(BaseModel):
    """Financial summary report."""
    workspace_id: str
    period_start: datetime
    period_end: datetime
    total_income: float = 0.0
    total_expenses: float = 0.0
    net_profit: float = 0.0
    transaction_count: int = 0
    category_breakdown: Dict[str, float] = Field(default_factory=dict)


class FinanceCell:
    """Finance cell - Reusable financial intelligence core.
    
    This cell handles all financial operations including:
    - Transaction management
    - Financial reporting
    - Budget tracking
    """
    
    # In-memory storage (would be replaced with actual database)
    _transactions: Dict[str, List[Transaction]] = {}
    
    @classmethod
    def add_transaction(
        cls,
        workspace_id: str,
        transaction_type: TransactionType,
        category: TransactionCategory,
        amount: float,
        description: str,
        currency: str = "USD",
        date: Optional[datetime] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Transaction:
        """Add a new transaction to the workspace."""
        transaction = Transaction(
            workspace_id=workspace_id,
            type=transaction_type,
            category=category,
            amount=amount,
            currency=currency,
            description=description,
            date=date or datetime.utcnow(),
            metadata=metadata or {}
        )
        
        if workspace_id not in cls._transactions:
            cls._transactions[workspace_id] = []
        
        cls._transactions[workspace_id].append(transaction)
        return transaction
    
    @classmethod
    def get_transactions(
        cls,
        workspace_id: str,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        transaction_type: Optional[TransactionType] = None,
        category: Optional[TransactionCategory] = None
    ) -> List[Transaction]:
        """Get filtered transactions for a workspace."""
        transactions = cls._transactions.get(workspace_id, [])
        
        filtered = transactions
        if start_date:
            filtered = [t for t in filtered if t.date >= start_date]
        if end_date:
            filtered = [t for t in filtered if t.date <= end_date]
        if transaction_type:
            filtered = [t for t in filtered if t.type == transaction_type]
        if category:
            filtered = [t for t in filtered if t.category == category]
        
        return filtered
    
    @classmethod
    def get_financial_summary(
        cls,
        workspace_id: str,
        period_start: datetime,
        period_end: datetime
    ) -> FinancialSummary:
        """Generate financial summary for a period."""
        transactions = cls.get_transactions(
            workspace_id,
            start_date=period_start,
            end_date=period_end
        )
        
        total_income = sum(
            t.amount for t in transactions if t.type == TransactionType.INCOME
        )
        total_expenses = sum(
            t.amount for t in transactions if t.type == TransactionType.EXPENSE
        )
        
        # Category breakdown
        category_breakdown = {}
        for t in transactions:
            if t.category not in category_breakdown:
                category_breakdown[t.category] = 0.0
            category_breakdown[t.category] += t.amount
        
        return FinancialSummary(
            workspace_id=workspace_id,
            period_start=period_start,
            period_end=period_end,
            total_income=total_income,
            total_expenses=total_expenses,
            net_profit=total_income - total_expenses,
            transaction_count=len(transactions),
            category_breakdown=category_breakdown
        )
    
    @classmethod
    def get_balance(cls, workspace_id: str) -> float:
        """Calculate current balance for a workspace."""
        transactions = cls._transactions.get(workspace_id, [])
        income = sum(t.amount for t in transactions if t.type == TransactionType.INCOME)
        expenses = sum(t.amount for t in transactions if t.type == TransactionType.EXPENSE)
        return income - expenses
