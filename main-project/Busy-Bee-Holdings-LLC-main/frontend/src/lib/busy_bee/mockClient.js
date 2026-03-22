/**
 * Busy Bee Mock Client
 * 
 * In-memory mock implementation for development/demo.
 * Replace with real API calls in production.
 * 
 * @version 1.0.0
 */

// Simple ID generator (no external deps)
const uuidv4 = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
  const r = Math.random() * 16 | 0;
  const v = c === 'x' ? r : (r & 0x3 | 0x8);
  return v.toString(16);
});

// ============================================================================
// In-Memory Storage
// ============================================================================

const _storage = {
  workspaces: new Map(),
  transactions: new Map(),
  metrics: new Map(),
  briefs: new Map(),
};

let _context = null;

// Initialize with demo data
function _initDemoData() {
  if (_storage.workspaces.size === 0) {
    // Create demo workspace
    const workspace = {
      id: 'ws-demo-001',
      tenant_id: 'tenant-demo',
      name: 'Demo Workspace',
      description: 'Your Busy Bee demo workspace',
      status: 'active',
      plan: 'professional',
      owner_id: 'user-demo',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    _storage.workspaces.set(workspace.id, workspace);
    
    // Create demo transactions
    const transactions = [
      { type: 'income', category: 'sales', amount: 15000, description: 'Product sales - Q1' },
      { type: 'income', category: 'services', amount: 8500, description: 'Consulting services' },
      { type: 'expense', category: 'operations', amount: 3200, description: 'Cloud hosting' },
      { type: 'expense', category: 'marketing', amount: 2100, description: 'Ads campaign' },
      { type: 'expense', category: 'salary', amount: 12000, description: 'Team salaries' },
      { type: 'income', category: 'sales', amount: 8750, description: 'Product sales - Q2' },
    ];
    
    transactions.forEach((t, i) => {
      const tx = {
        id: uuidv4(),
        workspace_id: workspace.id,
        type: t.type,
        category: t.category,
        amount: t.amount,
        currency: 'USD',
        description: t.description,
        date: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000).toISOString(),
      };
      if (!_storage.transactions.has(workspace.id)) {
        _storage.transactions.set(workspace.id, []);
      }
      _storage.transactions.get(workspace.id).push(tx);
    });
    
    // Create demo metrics
    const metrics = [
      { category: 'revenue', name: 'Monthly Revenue', value: 23750, previous: 21000, unit: '$' },
      { category: 'revenue', name: 'Annual Revenue', value: 285000, previous: 240000, unit: '$' },
      { category: 'growth', name: 'User Growth', value: 15.3, previous: 12.1, unit: '%' },
      { category: 'engagement', name: 'Active Users', value: 1247, previous: 1089, unit: 'users' },
      { category: 'engagement', name: 'Session Duration', value: 4.2, previous: 3.8, unit: 'min' },
      { category: 'operations', name: 'Uptime', value: 99.9, previous: 99.5, unit: '%' },
      { category: 'customer', name: 'NPS Score', value: 72, previous: 65, unit: '' },
    ];
    
    metrics.forEach(m => {
      const metric = {
        id: uuidv4(),
        workspace_id: workspace.id,
        category: m.category,
        name: m.name,
        value: m.value,
        previous_value: m.previous,
        unit: m.unit,
        timestamp: new Date().toISOString(),
      };
      if (!_storage.metrics.has(workspace.id)) {
        _storage.metrics.set(workspace.id, []);
      }
      _storage.metrics.get(workspace.id).push(metric);
    });
    
    // Create demo brief
    const brief = {
      id: uuidv4(),
      workspace_id: workspace.id,
      title: 'Q2 2026 Executive Summary',
      summary: 'Strong revenue growth of 15% quarter-over-quarter. User engagement metrics show positive trends with 15.3% user growth. Operations remain stable with 99.9% uptime.',
      key_highlights: [
        'Revenue: $23,750 (+13.2%)',
        'User Growth: 15.3% (+3.2pp)',
        'Active Users: 1,247 (+14.5%)',
        'NPS Score: 72 (+7 points)',
      ],
      key_concerns: [
        'Marketing spend increased by 25%',
        'Churn rate slightly elevated',
      ],
      recommendations: [
        'Review marketing ROI and optimize spend',
        'Focus on customer retention programs',
        'Scale successful product features',
      ],
      created_at: new Date().toISOString(),
      period_start: '2026-04-01T00:00:00Z',
      period_end: '2026-06-30T23:59:59Z',
    };
    _storage.briefs.set(workspace.id, [brief]);
  }
}

// Initialize on load
_initDemoData();

// ============================================================================
// Client Interface (same as real client)
// ============================================================================

export function configure(config) {
  // Mock - no-op for now
}

export function setContext(context) {
  _context = context;
}

export function getContext() {
  return _context;
}

// ============================================================================
// Workspace API
// ============================================================================

export const WorkspaceAPI = {
  async getCurrent() {
    const ws = Array.from(_storage.workspaces.values())[0];
    return ws;
  },
  
  async list() {
    return Array.from(_storage.workspaces.values());
  },
  
  async create(data) {
    const workspace = {
      id: uuidv4(),
      ...data,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    _storage.workspaces.set(workspace.id, workspace);
    return workspace;
  },
  
  async update(id, data) {
    const workspace = _storage.workspaces.get(id);
    if (!workspace) throw new Error('Workspace not found');
    const updated = { ...workspace, ...data, updated_at: new Date().toISOString() };
    _storage.workspaces.set(id, updated);
    return updated;
  },
};

// ============================================================================
// Finance API
// ============================================================================

export const FinanceAPI = {
  async getSummary({ start, end }) {
    const ws = await WorkspaceAPI.getCurrent();
    const txs = _storage.transactions.get(ws.id) || [];
    
    const filtered = txs.filter(t => {
      const d = new Date(t.date);
      return d >= new Date(start) && d <= new Date(end);
    });
    
    const income = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    
    const categoryBreakdown = {};
    filtered.forEach(t => {
      categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
    });
    
    return {
      workspace_id: ws.id,
      period_start: start,
      period_end: end,
      total_income: income,
      total_expenses: expenses,
      net_profit: income - expenses,
      transaction_count: filtered.length,
      category_breakdown: categoryBreakdown,
    };
  },
  
  async getTransactions(params = {}) {
    const ws = await WorkspaceAPI.getCurrent();
    let txs = _storage.transactions.get(ws.id) || [];
    
    if (params.type) {
      txs = txs.filter(t => t.type === params.type);
    }
    if (params.category) {
      txs = txs.filter(t => t.category === params.category);
    }
    
    return txs;
  },
  
  async addTransaction(data) {
    const ws = await WorkspaceAPI.getCurrent();
    const tx = {
      id: uuidv4(),
      workspace_id: ws.id,
      ...data,
      date: new Date().toISOString(),
    };
    
    if (!_storage.transactions.has(ws.id)) {
      _storage.transactions.set(ws.id, []);
    }
    _storage.transactions.get(ws.id).push(tx);
    return tx;
  },
  
  async getBalance() {
    const ws = await WorkspaceAPI.getCurrent();
    const txs = _storage.transactions.get(ws.id) || [];
    const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { balance: income - expenses };
  },
};

// ============================================================================
// Executive API
// ============================================================================

export const ExecutiveAPI = {
  async getMetrics(params = {}) {
    const ws = await WorkspaceAPI.getCurrent();
    let metrics = _storage.metrics.get(ws.id) || [];
    
    if (params.category) {
      metrics = metrics.filter(m => m.category === params.category);
    }
    
    return metrics.slice(0, params.limit || 10);
  },
  
  async getBriefs(params = {}) {
    const ws = await WorkspaceAPI.getCurrent();
    const briefs = _storage.briefs.get(ws.id) || [];
    return briefs.slice(0, params.limit || 10);
  },
  
  async generateBrief({ title = 'Executive Summary', periodDays = 30 }) {
    const ws = await WorkspaceAPI.getCurrent();
    const summary = await FinanceAPI.getSummary({
      start: new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString(),
    });
    
    const metrics = await ExecutiveAPI.getMetrics();
    
    const highlights = [];
    if (summary.total_income > 0) highlights.push(`Revenue: $${summary.total_income.toLocaleString()}`);
    if (summary.net_profit > 0) highlights.push(`Net Profit: $${summary.net_profit.toLocaleString()}`);
    highlights.push(`Transactions: ${summary.transaction_count}`);
    
    const concerns = summary.net_profit < 0 ? ['Operating at a loss'] : [];
    
    const brief = {
      id: uuidv4(),
      workspace_id: ws.id,
      title,
      summary: `Executive summary for ${periodDays}-day period. Revenue: $${summary.total_income}, Expenses: $${summary.total_expenses}, Net: $${summary.net_profit}`,
      key_highlights: highlights,
      key_concerns: concerns,
      recommendations: ['Continue monitoring financial health'],
      created_at: new Date().toISOString(),
      period_start: new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString(),
      period_end: new Date().toISOString(),
    };
    
    if (!_storage.briefs.has(ws.id)) {
      _storage.briefs.set(ws.id, []);
    }
    _storage.briefs.get(ws.id).push(brief);
    return brief;
  },
  
  async getLatestBrief() {
    const ws = await WorkspaceAPI.getCurrent();
    const briefs = _storage.briefs.get(ws.id) || [];
    return briefs[0] || null;
  },
  
  async getDashboardMetrics() {
    const ws = await WorkspaceAPI.getCurrent();
    const metrics = await ExecutiveAPI.getMetrics();
    const latestBrief = await ExecutiveAPI.getLatestBrief();
    
    const byCategory = {};
    metrics.forEach(m => {
      byCategory[m.category] = m;
    });
    
    return {
      workspace_id: ws.id,
      total_metrics: metrics.length,
      metrics_by_category: byCategory,
      recent_brief: latestBrief,
    };
  },
};

// ============================================================================
// Lattice API
// ============================================================================

export const LatticeAPI = {
  async getCells() {
    return [
      { id: 'finance', name: 'Finance Cell', capabilities: ['transactions', 'reporting'] },
      { id: 'executive', name: 'Executive Cell', capabilities: ['metrics', 'briefing'] },
      { id: 'goals', name: 'Goals Cell', capabilities: ['goals', 'milestones'] },
      { id: 'tasks', name: 'Tasks Cell', capabilities: ['tasks', 'workflows'] },
    ];
  },
  
  async getCell(cellId) {
    const cells = await LatticeAPI.getCells();
    return cells.find(c => c.id === cellId);
  },
  
  async canCommunicate(source, target) {
    // Allow all in demo
    return { allowed: true };
  },
  
  async validateGraph() {
    return { valid: true, issues: [] };
  },
};

// ============================================================================
// Paths API
// ============================================================================

export const PathsAPI = {
  async executeExecutiveBrief(params) {
    return ExecutiveAPI.generateBrief(params);
  },
  
  async getPaths() {
    return [
      { id: 'executive-brief', name: 'Executive Brief', description: 'Generate executive brief' },
    ];
  },
};

// ============================================================================
// Audit API
// ============================================================================

export const AuditAPI = {
  async getEvents(params = {}) {
    // Return empty for demo
    return [];
  },
  
  async logEvent(data) {
    console.log('[Audit]', data);
    return { success: true };
  },
};

// ============================================================================
// Export
// ============================================================================

export default {
  configure,
  setContext,
  getContext,
  Workspace: WorkspaceAPI,
  Finance: FinanceAPI,
  Executive: ExecutiveAPI,
  Lattice: LatticeAPI,
  Paths: PathsAPI,
  Audit: AuditAPI,
};
