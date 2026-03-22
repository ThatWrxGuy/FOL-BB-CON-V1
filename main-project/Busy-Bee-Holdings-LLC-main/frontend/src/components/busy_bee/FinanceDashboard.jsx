import { useState, useEffect } from 'react';
import { useFinance } from '../../context/busy_bee';

/**
 * FinanceDashboard Component
 * 
 * Connects to the Finance Cell and displays financial data.
 * Part of the Flower Architecture frontend integration.
 */
export function FinanceDashboard({ periodDays = 30 }) {
  const finance = useFinance();
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load financial data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        const end = new Date().toISOString();
        const start = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString();
        
        // Get summary
        const summaryData = await finance.getSummary({ start, end });
        setSummary(summaryData);
        
        // Get transactions
        const txData = await finance.getTransactions();
        setTransactions(txData.slice(0, 10)); // Latest 10
        
        // Get balance
        const balanceData = await finance.getBalance();
        setBalance(balanceData.balance);
        
      } catch (err) {
        console.error('Failed to load finance data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [finance, periodDays]);

  // Add new transaction
  const handleAddTransaction = async (data) => {
    try {
      const newTx = await finance.addTransaction(data);
      setTransactions([newTx, ...transactions]);
      // Refresh summary
      const end = new Date().toISOString();
      const start = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString();
      const summaryData = await finance.getSummary({ start, end });
      setSummary(summaryData);
      const balanceData = await finance.getBalance();
      setBalance(balanceData.balance);
      return newTx;
    } catch (err) {
      console.error('Failed to add transaction:', err);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">💰 Finance</h2>
          <p className="text-sm text-gray-500">Last {periodDays} days</p>
        </div>
        <AddTransactionButton onAdd={handleAddTransaction} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard
          title="Balance"
          value={formatCurrency(balance)}
          trend={summary?.net_profit >= 0 ? 'positive' : 'negative'}
        />
        <SummaryCard
          title="Income"
          value={formatCurrency(summary?.total_income || 0)}
          icon="📈"
          variant="success"
        />
        <SummaryCard
          title="Expenses"
          value={formatCurrency(summary?.total_expenses || 0)}
          icon="📉"
          variant="danger"
        />
        <SummaryCard
          title="Net Profit"
          value={formatCurrency(summary?.net_profit || 0)}
          trend={summary?.net_profit >= 0 ? 'positive' : 'negative'}
        />
      </div>

      {/* Category Breakdown */}
      {summary?.category_breakdown && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">📊 Category Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(summary.category_breakdown).map(([category, amount]) => (
              <CategoryCard key={category} category={category} amount={amount} />
            ))}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">📝 Recent Transactions</h3>
        {transactions.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No transactions yet</p>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <TransactionRow key={tx.id} transaction={tx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Summary Card Component
 */
function SummaryCard({ title, value, icon, trend, variant }) {
  const trendColors = {
    positive: 'text-green-600',
    negative: 'text-red-600',
  };
  
  const variantColors = {
    success: 'bg-green-50 border-green-200',
    danger: 'bg-red-50 border-red-200',
  };

  return (
    <div className={`p-4 rounded-xl border ${variantColors[variant] || 'bg-gray-50 border-gray-200'}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{title}</span>
        {icon && <span className="text-xl">{icon}</span>}
      </div>
      <p className={`text-2xl font-bold mt-1 ${trend ? trendColors[trend] : ''}`}>
        {value}
      </p>
    </div>
  );
}

/**
 * Category Card Component
 */
function CategoryCard({ category, amount }) {
  const icons = {
    sales: '🛒',
    services: '🛠️',
    operations: '⚙️',
    marketing: '📣',
    salary: '👥',
    infrastructure: '🏗️',
    other: '📦',
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2">
        <span>{icons[category] || '📦'}</span>
        <span className="capitalize text-gray-700">{category}</span>
      </div>
      <span className="font-semibold">{formatCurrency(amount)}</span>
    </div>
  );
}

/**
 * Transaction Row Component
 */
function TransactionRow({ transaction }) {
  const isIncome = transaction.type === 'income';
  
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div>
        <p className="font-medium text-gray-900">{transaction.description}</p>
        <p className="text-sm text-gray-500 capitalize">{transaction.category}</p>
      </div>
      <div className={`font-semibold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
        {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
      </div>
    </div>
  );
}

/**
 * Add Transaction Button/Modal
 */
function AddTransactionButton({ onAdd }) {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    type: 'expense',
    category: 'operations',
    amount: '',
    description: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onAdd({
        ...formData,
        amount: parseFloat(formData.amount),
      });
      setShowModal(false);
      setFormData({ type: 'expense', category: 'operations', amount: '', description: '' });
    } catch (err) {
      alert('Failed to add transaction');
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
      >
        + Add Transaction
      </button>
      
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Transaction</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="sales">Sales</option>
                  <option value="services">Services</option>
                  <option value="operations">Operations</option>
                  <option value="marketing">Marketing</option>
                  <option value="salary">Salary</option>
                  <option value="infrastructure">Infrastructure</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// Helper: Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export default FinanceDashboard;
