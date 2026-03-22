/**
 * Busy Bee Client SDK
 * 
 * Frontend SDK for interacting with the Flower Architecture backend.
 * Provides typed API for Cells, Hive, Lattice, and Paths.
 * 
 * @version 1.0.0
 */

// ============================================================================
// Types
// ============================================================================

/**
 * @typedef {Object} RequestContext
 * @property {string} user_id
 * @property {string} tenant_id
 * @property {string} workspace_id
 * @property {string} [request_id]
 */

/**
 * @typedef {Object} Workspace
 * @property {string} id
 * @property {string} tenant_id
 * @property {string} name
 * @property {string} [description]
 * @property {string} status
 * @property {string} plan
 * @property {string} owner_id
 */

/**
 * @typedef {Object} Transaction
 * @property {string} id
 * @property {string} workspace_id
 * @property {string} type - 'income' | 'expense' | 'transfer'
 * @property {string} category
 * @property {number} amount
 * @property {string} currency
 * @property {string} description
 * @property {string} date
 */

/**
 * @typedef {Object} FinancialSummary
 * @property {string} workspace_id
 * @property {string} period_start
 * @property {string} period_end
 * @property {number} total_income
 * @property {number} total_expenses
 * @property {number} net_profit
 * @property {number} transaction_count
 * @property {Object.<string, number>} category_breakdown
 */

/**
 * @typedef {Object} Metric
 * @property {string} id
 * @property {string} workspace_id
 * @property {string} category
 * @property {string} name
 * @property {number} value
 * @property {number} [previous_value]
 * @property {string} unit
 * @property {string} timestamp
 */

/**
 * @typedef {Object} ExecutiveBrief
 * @property {string} id
 * @property {string} workspace_id
 * @property {string} title
 * @property {string} summary
 * @property {string[]} key_highlights
 * @property {string[]} key_concerns
 * @property {Metric[]} metrics
 * @property {string[]} recommendations
 * @property {string} created_at
 * @property {string} period_start
 * @property {string} period_end
 */

// ============================================================================
// Configuration
// ============================================================================

const DEFAULT_CONFIG = {
  apiUrl: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};

let _config = { ...DEFAULT_CONFIG };
let _context = null;

/**
 * Configure the Busy Bee client
 * @param {Object} config - Configuration options
 * @param {string} [config.apiUrl] - Base API URL
 * @param {number} [config.timeout] - Request timeout in ms
 */
export function configure(config) {
  _config = { ..._config, ...config };
}

/**
 * Set the current request context (tenant/workspace)
 * @param {RequestContext} context 
 */
export function setContext(context) {
  _context = context;
}

/**
 * Get current context
 * @returns {RequestContext|null}
 */
export function getContext() {
  return _context;
}

// ============================================================================
// API Client
// ============================================================================

async function request(endpoint, options = {}) {
  const url = `${_config.apiUrl}${endpoint}`;
  
  const headers = {
    ..._config.headers,
    ...options.headers,
  };
  
  // Add context headers if available
  if (_context) {
    headers['X-User-ID'] = _context.user_id;
    headers['X-Tenant-ID'] = _context.tenant_id;
    headers['X-Workspace-ID'] = _context.workspace_id;
    if (_context.request_id) {
      headers['X-Request-ID'] = _context.request_id;
    }
  }
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), _config.timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(response.status, error.message || 'Request failed', error);
    }
    
    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new ApiError(408, 'Request timeout');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Custom API Error
 */
class ApiError extends Error {
  constructor(status, message, details = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

// ============================================================================
// Workspace API (Hive Layer)
// ============================================================================

export const WorkspaceAPI = {
  /**
   * Get current workspace
   * @returns {Promise<Workspace>}
   */
  async getCurrent() {
    return request('/workspaces/current');
  },
  
  /**
   * Get all workspaces for tenant
   * @returns {Promise<Workspace[]>}
   */
  async list() {
    return request('/workspaces');
  },
  
  /**
   * Create a new workspace
   * @param {Object} data - Workspace data
   * @returns {Promise<Workspace>}
   */
  async create(data) {
    return request('/workspaces', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  /**
   * Update workspace
   * @param {string} id - Workspace ID
   * @param {Object} data - Update data
   * @returns {Promise<Workspace>}
   */
  async update(id, data) {
    return request(`/workspaces/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};

// ============================================================================
// Finance Cell API
// ============================================================================

export const FinanceAPI = {
  /**
   * Get financial summary for a period
   * @param {Object} params - Query parameters
   * @param {string} params.start - Start date (ISO string)
   * @param {string} params.end - End date (ISO string)
   * @returns {Promise<FinancialSummary>}
   */
  async getSummary(params) {
    const query = new URLSearchParams(params).toString();
    return request(`/finance/summary?${query}`);
  },
  
  /**
   * Get transactions with filters
   * @param {Object} params - Query parameters
   * @returns {Promise<Transaction[]>}
   */
  async getTransactions(params = {}) {
    const query = new URLSearchParams(params).toString();
    return request(`/finance/transactions?${query}`);
  },
  
  /**
   * Add a new transaction
   * @param {Object} data - Transaction data
   * @returns {Promise<Transaction>}
   */
  async addTransaction(data) {
    return request('/finance/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  /**
   * Get current balance
   * @returns {Promise<{balance: number}>}
   */
  async getBalance() {
    return request('/finance/balance');
  },
};

// ============================================================================
// Executive Cell API
// ============================================================================

export const ExecutiveAPI = {
  /**
   * Get metrics
   * @param {Object} params - Query parameters
   * @returns {Promise<Metric[]>}
   */
  async getMetrics(params = {}) {
    const query = new URLSearchParams(params).toString();
    return request(`/executive/metrics?${query}`);
  },
  
  /**
   * Get executive briefs
   * @param {Object} params - Query parameters
   * @returns {Promise<ExecutiveBrief[]>}
   */
  async getBriefs(params = {}) {
    const query = new URLSearchParams(params).toString();
    return request(`/executive/briefs?${query}`);
  },
  
  /**
   * Generate a new executive brief
   * @param {Object} data - Brief generation params
   * @returns {Promise<ExecutiveBrief>}
   */
  async generateBrief(data) {
    return request('/executive/briefs/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  /**
   * Get latest brief
   * @returns {Promise<ExecutiveBrief|null>}
   */
  async getLatestBrief() {
    return request('/executive/briefs/latest');
  },
  
  /**
   * Get dashboard metrics
   * @returns {Promise<Object>}
   */
  async getDashboardMetrics() {
    return request('/executive/dashboard');
  },
};

// ============================================================================
// Lattice API (Service Discovery)
// ============================================================================

export const LatticeAPI = {
  /**
   * Get all available cells
   * @returns {Promise<Object[]>}
   */
  async getCells() {
    return request('/lattice/cells');
  },
  
  /**
   * Get cell by ID
   * @param {string} cellId - Cell ID
   * @returns {Promise<Object>}
   */
  async getCell(cellId) {
    return request(`/lattice/cells/${cellId}`);
  },
  
  /**
   * Check if two cells can communicate
   * @param {string} source - Source cell
   * @param {string} target - Target cell
   * @returns {Promise<{allowed: boolean}>}
   */
  async canCommunicate(source, target) {
    return request(`/lattice/can-communicate?source=${source}&target=${target}`);
  },
  
  /**
   * Validate the lattice graph
   * @returns {Promise<{valid: boolean, issues: string[]}>}
   */
  async validateGraph() {
    return request('/lattice/validate');
  },
};

// ============================================================================
// Paths API (Orchestration)
// ============================================================================

export const PathsAPI = {
  /**
   * Execute executive brief path
   * @param {Object} params - Parameters
   * @returns {Promise<ExecutiveBrief>}
   */
  async executeExecutiveBrief(params) {
    return request('/paths/executive-brief', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },
  
  /**
   * Get available paths
   * @returns {Promise<Object[]>}
   */
  async getPaths() {
    return request('/paths');
  },
};

// ============================================================================
// Audit API (Observatory Layer)
// ============================================================================

export const AuditAPI = {
  /**
   * Get audit events
   * @param {Object} params - Query parameters
   * @returns {Promise<Object[]>}
   */
  async getEvents(params = {}) {
    const query = new URLSearchParams(params).toString();
    return request(`/observatory/audit?${query}`);
  },
  
  /**
   * Log an audit event
   * @param {Object} data - Event data
   * @returns {Promise<Object>}
   */
  async logEvent(data) {
    return request('/observatory/audit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ============================================================================
// Export all
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
  ApiError,
};
