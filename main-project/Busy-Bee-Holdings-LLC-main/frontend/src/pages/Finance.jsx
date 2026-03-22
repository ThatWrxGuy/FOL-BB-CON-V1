/**
 * Busy Bee Finance - Design System Implementation
 * Now with Flower Architecture integration!
 */

import { useState, useEffect } from 'react';
import { FiPlus, FiTrendingUp, FiTrendingDown, FiCreditCard } from 'react-icons/fi';
import {
  PageContainer,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  Progress,
  Grid,
  StatCard,
  LoadingOverlay,
  EmptyState,
} from '../components';

// Busy Bee SDK - Flower Architecture
import { useWorkspace } from '../context/busy_bee';

// Mock data for design demonstration
const mockFinanceData = {
  netWorth: 12543.67,
  netWorthChange: 3.2,
  totalIncome: 8500,
  totalSpending: 4230.5,
  avgDaily: 141.02,
  netFlow: 4269.5,
  spendingByCategory: [
    { category: 'Housing', amount: 1800, percentage: 42, icon: '🏠' },
    { category: 'Food', amount: 890, percentage: 21, icon: '🍔' },
    { category: 'Transport', amount: 450, percentage: 11, icon: '🚗' },
    { category: 'Utilities', amount: 320, percentage: 8, icon: '💡' },
    { category: 'Entertainment', amount: 270, percentage: 6, icon: '🎬' },
  ],
  insights: [
    'Your spending is 12% lower than last month',
    'You saved $500 more than average this month',
    'Housing costs are within recommended 30% range',
  ],
  accounts: [
    { id: 1, name: 'Chase Checking', balance: 4520.0, type: 'checking' },
    { id: 2, name: 'Chase Savings', balance: 8023.67, type: 'savings' },
  ],
  transactions: [
    { id: 1, date: '2024-01-15', merchant: 'Whole Foods', amount: 156.32, category: 'Food' },
    { id: 2, date: '2024-01-14', merchant: 'Uber', amount: 24.5, category: 'Transport' },
    { id: 3, date: '2024-01-13', merchant: 'Netflix', amount: 15.99, category: 'Entertainment' },
    { id: 4, date: '2024-01-12', merchant: 'Electric Co', amount: 145.0, category: 'Utilities' },
    { id: 5, date: '2024-01-11', merchant: 'Rent Payment', amount: 1800.0, category: 'Housing' },
  ],
};

function Finance() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(mockFinanceData);
  
  // Flower Architecture - Workspace integration
  const { workspace, financialSummary, refresh } = useWorkspace() || {};

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Use real data from workspace when available
  useEffect(() => {
    if (financialSummary) {
      setData({
        netWorth: financialSummary.net_profit || 0,
        netWorthChange: ((financialSummary.net_profit - financialSummary.total_expenses) / financialSummary.total_expenses * 100) || 0,
        totalIncome: financialSummary.total_income || 0,
        totalSpending: financialSummary.total_expenses || 0,
        netFlow: financialSummary.net_profit || 0,
        avgDaily: (financialSummary.net_profit / 30) || 0,
        spendingByCategory: Object.entries(financialSummary.category_breakdown || {}).map(([category, amount]) => ({
          category,
          amount,
          percentage: Math.round((amount / financialSummary.total_expenses) * 100),
          icon: getCategoryIcon(category),
        })),
        insights: financialSummary.net_profit > 0 
          ? ['Your business is profitable!', 'Revenue exceeds expenses']
          : ['Consider reviewing expenses', 'Focus on revenue growth'],
        accounts: [],
        transactions: [],
      });
    }
  }, [financialSummary]);

  if (loading) {
    return <LoadingOverlay message="Loading finance data..." />;
  }

  return (
    <PageContainer
      title="Finance"
      subtitle="Track your income, spending, and net worth"
      actions={
        <Button>
          <FiPlus className="w-4 h-4 mr-2" />
          Link Account
        </Button>
      }
    >
      {/* Net Worth Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-foreground-muted text-sm">Net Worth</p>
              <p className="text-4xl font-bold text-foreground mt-1">
                ${data.netWorth.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <div className="flex items-center gap-1 mt-2 text-success">
                <FiTrendingUp size={16} />
                <span className="text-sm font-medium">+{data.netWorthChange}% this month</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-primary/10">
              <FiCreditCard className="w-10 h-10 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <Grid cols={{ default: 2, md: 4 }} className="mb-6">
        <StatCard
          label="Total Income"
          value={`$${data.totalIncome.toLocaleString()}`}
          icon={FiTrendingUp}
          className="text-success"
        />
        <StatCard
          label="Total Spending"
          value={`$${data.totalSpending.toLocaleString()}`}
          icon={FiTrendingDown}
          className="text-destructive"
        />
        <StatCard label="Avg Daily" value={`$${data.avgDaily.toFixed(2)}`} />
        <StatCard
          label="Net Flow"
          value={`$${data.netFlow.toLocaleString()}`}
          trend={data.netFlow >= 0 ? 12 : -8}
        />
      </Grid>

      {/* Charts and Insights Grid */}
      <Grid cols={{ default: 1, lg: 2 }} className="mb-6 gap-6">
        {/* Spending by Category */}
        <Card>
          <CardHeader title="Spending by Category" />
          <CardContent className="space-y-4">
            {data.spendingByCategory.map((cat) => (
              <div key={cat.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{cat.icon}</span>
                    <span className="font-medium text-foreground capitalize">{cat.category}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${cat.amount.toFixed(2)}</p>
                    <p className="text-xs text-foreground-muted">{cat.percentage}%</p>
                  </div>
                </div>
                <Progress value={cat.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Insights */}
        <Card>
          <CardHeader title="Insights" />
          <CardContent className="space-y-3">
            {data.insights.map((insight, i) => (
              <div key={i} className="p-3 rounded-lg bg-primary/10 text-foreground text-sm">
                {insight}
              </div>
            ))}
          </CardContent>
        </Card>
      </Grid>

      {/* Recent Transactions */}
      <Card>
        <CardHeader title="Recent Transactions" />
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {data.transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="text-foreground-muted text-sm">{tx.date}</div>
                  <div>
                    <p className="font-medium text-foreground">{tx.merchant}</p>
                    <p className="text-sm text-foreground-muted">{tx.category}</p>
                  </div>
                </div>
                <p className="font-semibold text-foreground">${tx.amount.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

// Helper function for category icons
function getCategoryIcon(category) {
  const icons = {
    sales: '🛒',
    services: '🛠️',
    operations: '⚙️',
    marketing: '📣',
    salary: '👥',
    infrastructure: '🏗️',
    housing: '🏠',
    food: '🍔',
    transport: '🚗',
    utilities: '💡',
    entertainment: '🎬',
    other: '📦',
  };
  return icons[category.toLowerCase()] || '📦';
}

export default Finance;
