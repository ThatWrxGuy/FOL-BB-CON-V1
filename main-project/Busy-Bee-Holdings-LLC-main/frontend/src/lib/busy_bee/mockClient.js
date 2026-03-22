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
  health: {
    workouts: new Map(),
    meals: new Map(),
    sleep: new Map(),
    vitals: new Map(),
  },
  career: {
    jobs: new Map(),
    skills: new Map(),
    certifications: new Map(),
    contacts: new Map(),
    goals: new Map(),
  },
  mindset: {
    journal: new Map(),
    affirmations: new Map(),
    mindfulness: new Map(),
    goals: new Map(),
  },
  relationships: {
    people: new Map(),
    interactions: new Map(),
    importantDates: new Map(),
    goals: new Map(),
  },
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
    
    // Create demo health data
    const workouts = [
      { workout_type: 'running', duration_minutes: 30, calories_burned: 300, distance_km: 5, intensity: 'moderate' },
      { workout_type: 'weight_training', duration_minutes: 45, calories_burned: 250, intensity: 'high' },
      { workout_type: 'yoga', duration_minutes: 60, calories_burned: 150, intensity: 'light' },
      { workout_type: 'hiit', duration_minutes: 20, calories_burned: 280, intensity: 'high' },
      { workout_type: 'swimming', duration_minutes: 40, calories_burned: 350, intensity: 'moderate' },
    ];
    
    const healthKey = workspace.id;
    _storage.health.workouts.set(healthKey, workouts.map((w, i) => ({
      id: uuidv4(),
      workspace_id: workspace.id,
      user_id: 'user-demo',
      ...w,
      date: new Date(Date.now() - i * 3 * 24 * 60 * 60 * 1000).toISOString(),
    })));
    
    // Demo sleep data
    _storage.health.sleep.set(healthKey, [
      { sleep_quality: 'good', hours_slept: 7.5, bed_time: '2026-03-20T23:00:00Z', wake_time: '2026-03-21T06:30:00Z', date: '2026-03-20' },
      { sleep_quality: 'excellent', hours_slept: 8.0, bed_time: '2026-03-19T22:30:00Z', wake_time: '2026-03-20T06:30:00Z', date: '2026-03-19' },
      { sleep_quality: 'fair', hours_slept: 6.0, bed_time: '2026-03-18T01:00:00Z', wake_time: '2026-03-18T07:00:00Z', date: '2026-03-18' },
    ]);
    
    // Demo vitals
    _storage.health.vitals.set(healthKey, [
      { weight_kg: 75, height_cm: 180, blood_pressure_systolic: 120, blood_pressure_diastolic: 80, heart_rate_bpm: 72, date: '2026-03-21' },
      { weight_kg: 75.5, height_cm: 180, blood_pressure_systolic: 118, blood_pressure_diastolic: 78, heart_rate_bpm: 70, date: '2026-03-15' },
    ]);
    
    // Demo career data
    const careerKey = workspace.id;
    _storage.career.skills.set(careerKey, [
      { name: 'JavaScript', category: 'tech', level: 'expert', years_experience: 8 },
      { name: 'Python', category: 'tech', level: 'advanced', years_experience: 5 },
      { name: 'Leadership', category: 'soft', level: 'advanced', years_experience: 4 },
      { name: 'React', category: 'tech', level: 'expert', years_experience: 6 },
      { name: 'Project Management', category: 'soft', level: 'intermediate', years_experience: 3 },
    ]);
    
    _storage.career.jobs.set(careerKey, [
      { company: 'Tech Corp', position: 'Senior Developer', status: 'interview', applied_date: '2026-03-15', location: 'San Francisco', employment_type: 'full_time' },
      { company: 'StartupXYZ', position: 'Tech Lead', status: 'applied', applied_date: '2026-03-18', location: 'Remote', employment_type: 'full_time' },
      { company: 'BigCorp Inc', position: 'Engineering Manager', status: 'screening', applied_date: '2026-03-10', location: 'New York', employment_type: 'full_time' },
    ]);
    
    _storage.career.certifications.set(careerKey, [
      { name: 'AWS Solutions Architect', provider: 'Amazon', status: 'completed', issue_date: '2025-06-15' },
      { name: 'PMP', provider: 'PMI', status: 'in_progress', issue_date: '2026-01-01' },
    ]);
    
    _storage.career.contacts.set(careerKey, [
      { contact_name: 'Jane Smith', company: 'Tech Corp', role: 'CTO', met_through: 'Conference' },
      { contact_name: 'John Doe', company: 'StartupXYZ', role: 'CEO', met_through: 'LinkedIn' },
    ]);
    
    _storage.career.goals.set(careerKey, [
      { title: 'Get AWS Certification', status: 'completed', progress: 100, category: 'certification' },
      { title: 'Learn Machine Learning', status: 'active', progress: 45, category: 'skill' },
      { title: 'Network with 10 CTOs', status: 'active', progress: 30, category: 'networking' },
    ]);
    
    // Demo mindset/journal data
    const mindsetKey = workspace.id;
    _storage.mindset.journal.set(mindsetKey, [
      { 
        title: 'Morning Reflection', 
        content: 'Today I feel grateful for the opportunity to work on this project. Feeling motivated and ready to tackle challenges.',
        mood: 4,
        mood_tags: ['grateful', 'motivated'],
        is_gratitude: true,
        gratitude_items: ['Health', 'Family', 'Work'],
        date: '2026-03-21'
      },
      { 
        title: 'Afternoon Check-in', 
        content: 'Feeling a bit stressed about the deadline but confident we can pull through. Took a short walk which helped.',
        mood: 3,
        mood_tags: ['stressed', 'calm'],
        is_gratitude: false,
        date: '2026-03-20'
      },
      { 
        title: 'Gratitude List', 
        content: 'Grateful for the support from my team today.',
        mood: 5,
        mood_tags: ['grateful', 'happy'],
        is_gratitude: true,
        gratitude_items: ['Team members', 'Good health', 'Sunny weather'],
        date: '2026-03-19'
      },
    ]);
    
    _storage.mindset.affirmations.set(mindsetKey, [
      { text: 'I am capable of achieving my goals', category: 'confidence', is_favorite: true, times_used: 5 },
      { text: 'Every day I am growing stronger', category: 'growth', is_favorite: true, times_used: 3 },
      { text: 'I embrace challenges as opportunities', category: 'mindset', is_favorite: false, times_used: 2 },
      { text: 'I am worthy of success and happiness', category: 'self-worth', is_favorite: false, times_used: 1 },
    ]);
    
    _storage.mindfulness.set(mindsetKey, [
      { session_type: 'meditation', duration_minutes: 10, feeling_after: 'calm', date: '2026-03-21T08:00:00Z' },
      { session_type: 'breathing', duration_minutes: 5, feeling_after: 'relaxed', date: '2026-03-20T14:00:00Z' },
      { session_type: 'meditation', duration_minutes: 15, feeling_after: 'peaceful', date: '2026-03-19T07:30:00Z' },
    ]);
    
    // Demo relationships data
    const relKey = workspace.id;
    _storage.relationships.people.set(relKey, [
      { name: 'Sarah Johnson', relationship_type: 'friend', health: 'healthy', importance: 9, birthday: '1990-05-15', last_interaction: '2026-03-20' },
      { name: 'Mike Chen', relationship_type: 'colleague', health: 'healthy', importance: 7, company: 'TechCorp', last_interaction: '2026-03-19' },
      { name: 'Mom', relationship_type: 'family', health: 'flourishing', importance: 10, birthday: '1965-08-22', last_interaction: '2026-03-18' },
      { name: 'Alex Rivera', relationship_type: 'mentor', health: 'healthy', importance: 8, role: 'Senior Engineer', last_interaction: '2026-03-15' },
      { name: 'Jordan Lee', relationship_type: 'romantic', health: 'healthy', importance: 10, anniversary: '2024-01-01', last_interaction: '2026-03-21' },
    ]);
    
    _storage.relationships.interactions.set(relKey, [
      { person_id: 0, interaction_type: 'call', summary: 'Caught up on life updates', mood_after: 5, date: '2026-03-20T18:00:00Z' },
      { person_id: 1, interaction_type: 'in_person', summary: 'Team standup meeting', mood_after: 4, date: '2026-03-19T10:00:00Z' },
      { person_id: 2, interaction_type: 'video', summary: 'Weekly call', mood_after: 5, date: '2026-03-18T20:00:00Z' },
    ]);
    
    _storage.relationships.importantDates.set(relKey, [
      { title: "Sarah's Birthday", date: '2026-05-15', date_type: 'birthday', person_id: 0, recurring: true },
      { title: 'Mom Birthday', date: '2026-08-22', date_type: 'birthday', person_id: 2, recurring: true },
      { title: 'Anniversary', date: '2027-01-01', date_type: 'anniversary', recurring: true },
    ]);
    
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
// Health API
// ============================================================================

export const HealthAPI = {
  async getSummary(params = {}) {
    const ws = await WorkspaceAPI.getCurrent();
    const periodDays = params.periodDays || 30;
    const workouts = _storage.health.workouts.get(ws.id) || [];
    const sleep = _storage.health.sleep.get(ws.id) || [];
    const vitals = _storage.health.vitals.get(ws.id) || [];
    
    const totalWorkouts = workouts.length;
    const totalMinutes = workouts.reduce((s, w) => s + (w.duration_minutes || 0), 0);
    const totalCalories = workouts.reduce((s, w) => s + (w.calories_burned || 0), 0);
    
    const avgSleep = sleep.length > 0 
      ? sleep.reduce((s, s_) => s + s_.hours_slept, 0) / sleep.length 
      : 0;
    
    const currentWeight = vitals.length > 0 ? vitals[0].weight_kg : null;
    const weightChange = vitals.length > 1 
      ? (vitals[0].weight_kg || 0) - (vitals[vitals.length - 1].weight_kg || 0)
      : 0;
    
    return {
      workspace_id: ws.id,
      user_id: _context?.user_id || 'user-demo',
      period_days: periodDays,
      total_workouts: totalWorkouts,
      total_workout_minutes: totalMinutes,
      total_calories_burned: totalCalories,
      average_sleep_hours: avgSleep,
      sleep_quality_avg: 2.5,
      meals_logged: 0,
      current_weight: currentWeight,
      weight_change_kg: weightChange,
    };
  },
  
  async getWorkouts(params = {}) {
    const ws = await WorkspaceAPI.getCurrent();
    return _storage.health.workouts.get(ws.id) || [];
  },
  
  async addWorkout(data) {
    const ws = await WorkspaceAPI.getCurrent();
    const workout = {
      id: uuidv4(),
      workspace_id: ws.id,
      user_id: _context?.user_id || 'user-demo',
      ...data,
      date: new Date().toISOString(),
    };
    if (!_storage.health.workouts.has(ws.id)) {
      _storage.health.workouts.set(ws.id, []);
    }
    _storage.health.workouts.get(ws.id).unshift(workout);
    return workout;
  },
  
  async getSleepLogs(params = {}) {
    const ws = await WorkspaceAPI.getCurrent();
    return _storage.health.sleep.get(ws.id) || [];
  },
  
  async addSleepLog(data) {
    const ws = await WorkspaceAPI.getCurrent();
    const log = {
      id: uuidv4(),
      workspace_id: ws.id,
      user_id: _context?.user_id || 'user-demo',
      ...data,
    };
    if (!_storage.health.sleep.has(ws.id)) {
      _storage.health.sleep.set(ws.id, []);
    }
    _storage.health.sleep.get(ws.id).unshift(log);
    return log;
  },
  
  async getVitals(params = {}) {
    const ws = await WorkspaceAPI.getCurrent();
    return _storage.health.vitals.get(ws.id) || [];
  },
  
  async addVitals(data) {
    const ws = await WorkspaceAPI.getCurrent();
    const vital = {
      id: uuidv4(),
      workspace_id: ws.id,
      user_id: _context?.user_id || 'user-demo',
      ...data,
      date: new Date().toISOString().split('T')[0],
    };
    if (!_storage.health.vitals.has(ws.id)) {
      _storage.health.vitals.set(ws.id, []);
    }
    _storage.health.vitals.get(ws.id).unshift(vital);
    return vital;
  },
};

// ============================================================================
// Career API
// ============================================================================

export const CareerAPI = {
  async getSummary(params = {}) {
    const ws = await WorkspaceAPI.getCurrent();
    const skills = _storage.career.skills.get(ws.id) || [];
    const jobs = _storage.career.jobs.get(ws.id) || [];
    const certs = _storage.career.certifications.get(ws.id) || [];
    const contacts = _storage.career.contacts.get(ws.id) || [];
    const goals = _storage.career.goals.get(ws.id) || [];
    
    const jobsByStatus = {};
    jobs.forEach(j => {
      jobsByStatus[j.status] = (jobsByStatus[j.status] || 0) + 1;
    });
    
    const skillsByLevel = {};
    skills.forEach(s => {
      skillsByLevel[s.level] = (skillsByLevel[s.level] || 0) + 1;
    });
    
    const activeCerts = certs.filter(c => c.status === 'completed' || c.status === 'in_progress').length;
    const completedGoals = goals.filter(g => g.status === 'completed').length;
    
    return {
      workspace_id: ws.id,
      user_id: _context?.user_id || 'user-demo',
      period_days: params.periodDays || 30,
      total_applications: jobs.length,
      applications_by_status: jobsByStatus,
      total_skills: skills.length,
      skills_by_level: skillsByLevel,
      active_certifications: activeCerts,
      networking_contacts: contacts.length,
      career_goals: goals.length,
      goals_completed: completedGoals,
    };
  },
  
  async getSkills(params = {}) {
    const ws = await WorkspaceAPI.getCurrent();
    return _storage.career.skills.get(ws.id) || [];
  },
  
  async addSkill(data) {
    const ws = await WorkspaceAPI.getCurrent();
    const skill = {
      id: uuidv4(),
      workspace_id: ws.id,
      user_id: _context?.user_id || 'user-demo',
      ...data,
    };
    if (!_storage.career.skills.has(ws.id)) {
      _storage.career.skills.set(ws.id, []);
    }
    _storage.career.skills.get(ws.id).push(skill);
    return skill;
  },
  
  async getJobs(params = {}) {
    const ws = await WorkspaceAPI.getCurrent();
    let jobs = _storage.career.jobs.get(ws.id) || [];
    if (params.status) {
      jobs = jobs.filter(j => j.status === params.status);
    }
    return jobs;
  },
  
  async addJob(data) {
    const ws = await WorkspaceAPI.getCurrent();
    const job = {
      id: uuidv4(),
      workspace_id: ws.id,
      user_id: _context?.user_id || 'user-demo',
      applied_date: new Date().toISOString().split('T')[0],
      ...data,
    };
    if (!_storage.career.jobs.has(ws.id)) {
      _storage.career.jobs.set(ws.id, []);
    }
    _storage.career.jobs.get(ws.id).push(job);
    return job;
  },
  
  async getCertifications(params = {}) {
    const ws = await WorkspaceAPI.getCurrent();
    return _storage.career.certifications.get(ws.id) || [];
  },
  
  async getContacts(params = {}) {
    const ws = await WorkspaceAPI.getCurrent();
    return _storage.career.contacts.get(ws.id) || [];
  },
  
  async addContact(data) {
    const ws = await WorkspaceAPI.getCurrent();
    const contact = {
      id: uuidv4(),
      workspace_id: ws.id,
      user_id: _context?.user_id || 'user-demo',
      ...data,
    };
    if (!_storage.career.contacts.has(ws.id)) {
      _storage.career.contacts.set(ws.id, []);
    }
    _storage.career.contacts.get(ws.id).push(contact);
    return contact;
  },
  
  async getCareerGoals(params = {}) {
    const ws = await WorkspaceAPI.getCurrent();
    let goals = _storage.career.goals.get(ws.id) || [];
    if (params.status) {
      goals = goals.filter(g => g.status === params.status);
    }
    return goals;
  },
  
  async addCareerGoal(data) {
    const ws = await WorkspaceAPI.getCurrent();
    const goal = {
      id: uuidv4(),
      workspace_id: ws.id,
      user_id: _context?.user_id || 'user-demo',
      created_at: new Date().toISOString(),
      ...data,
    };
    if (!_storage.career.goals.has(ws.id)) {
      _storage.career.goals.set(ws.id, []);
    }
    _storage.career.goals.get(ws.id).push(goal);
    return goal;
  },
};

// ============================================================================
// Mindset API (Journaling + Mindfulness)
// ============================================================================

export const MindsetAPI = {
  async getSummary(params = {}) {
    const ws = await WorkspaceAPI.getCurrent();
    const journal = _storage.mindset.journal.get(ws.id) || [];
    const affirmations = _storage.mindset.affirmations.get(ws.id) || [];
    const mindfulness = _storage.mindfulness.get(ws.id) || [];
    
    const gratitudeEntries = journal.filter(e => e.is_gratitude);
    const moods = journal.filter(e => e.mood).map(e => e.mood);
    const avgMood = moods.length > 0 ? moods.reduce((a, b) => a + b, 0) / moods.length : 0;
    
    const allTags = journal.flatMap(e => e.mood_tags || []);
    const tagCounts = {};
    allTags.forEach(t => tagCounts[t] = (tagCounts[t] || 0) + 1);
    const topMoods = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(t => t[0]);
    
    const totalMindfulnessMinutes = mindfulness.reduce((s, m) => s + (m.duration_minutes || 0), 0);
    const affirmationsUsed = affirmations.reduce((s, a) => s + (a.times_used || 0), 0);
    
    return {
      workspace_id: ws.id,
      user_id: _context?.user_id || 'user-demo',
      period_days: params.periodDays || 30,
      journal_entries: journal.length,
      gratitude_entries: gratitudeEntries.length,
      average_mood: avgMood,
      top_moods: topMoods,
      mindfulness_minutes: totalMindfulnessMinutes,
      total_sessions: mindfulness.length,
      affirmations_used: affirmationsUsed,
    };
  },
  
  async getJournalEntries(params = {}) {
    const ws = await WorkspaceAPI.getCurrent();
    let entries = _storage.mindset.journal.get(ws.id) || [];
    if (params.isGratitude) {
      entries = entries.filter(e => e.is_gratitude);
    }
    return entries.slice(0, params.limit || 20);
  },
  
  async addJournalEntry(data) {
    const ws = await WorkspaceAPI.getCurrent();
    const entry = {
      id: uuidv4(),
      workspace_id: ws.id,
      user_id: _context?.user_id || 'user-demo',
      created_at: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      ...data,
    };
    if (!_storage.mindset.journal.has(ws.id)) {
      _storage.mindset.journal.set(ws.id, []);
    }
    _storage.mindset.journal.get(ws.id).unshift(entry);
    return entry;
  },
  
  async getAffirmations(params = {}) {
    const ws = await WorkspaceAPI.getCurrent();
    let affirmations = _storage.mindset.affirmations.get(ws.id) || [];
    if (params.favoritesOnly) {
      affirmations = affirmations.filter(a => a.is_favorite);
    }
    return affirmations;
  },
  
  async addAffirmation(data) {
    const ws = await WorkspaceAPI.getCurrent();
    const affirmation = {
      id: uuidv4(),
      workspace_id: ws.id,
      user_id: _context?.user_id || 'user-demo',
      created_at: new Date().toISOString(),
      is_favorite: false,
      times_used: 0,
      ...data,
    };
    if (!_storage.mindset.affirmations.has(ws.id)) {
      _storage.mindset.affirmations.set(ws.id, []);
    }
    _storage.mindset.affirmations.get(ws.id).push(affirmation);
    return affirmation;
  },
  
  async getRandomAffirmation() {
    const ws = await WorkspaceAPI.getCurrent();
    const affirmations = _storage.mindset.affirmations.get(ws.id) || [];
    if (affirmations.length === 0) return null;
    const random = affirmations[Math.floor(Math.random() * affirmations.length)];
    random.times_used = (random.times_used || 0) + 1;
    return random;
  },
  
  async getMindfulnessSessions(params = {}) {
    const ws = await WorkspaceAPI.getCurrent();
    return _storage.mindfulness.get(ws.id) || [];
  },
  
  async addMindfulnessSession(data) {
    const ws = await WorkspaceAPI.getCurrent();
    const session = {
      id: uuidv4(),
      workspace_id: ws.id,
      user_id: _context?.user_id || 'user-demo',
      date: new Date().toISOString(),
      ...data,
    };
    if (!_storage.mindfulness.has(ws.id)) {
      _storage.mindfulness.set(ws.id, []);
    }
    _storage.mindfulness.get(ws.id).unshift(session);
    return session;
  },
};

// ============================================================================
// Relationships API
// ============================================================================

export const RelationshipsAPI = {
  async getSummary(params = {}) {
    const ws = await WorkspaceAPI.getCurrent();
    const people = _storage.relationships.people.get(ws.id) || [];
    const interactions = _storage.relationships.interactions.get(ws.id) || [];
    const importantDates = _storage.relationships.importantDates.get(ws.id) || [];
    
    const byType = {};
    people.forEach(p => {
      byType[p.relationship_type] = (byType[p.relationship_type] || 0) + 1;
    });
    
    const moods = interactions.filter(i => i.mood_after).map(i => i.mood_after);
    const avgMood = moods.length > 0 ? moods.reduce((a, b) => a + b, 0) / moods.length : 0;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const neglected = people.filter(p => {
      if (!p.last_interaction) return true;
      return new Date(p.last_interaction) < thirtyDaysAgo;
    }).length;
    
    return {
      workspace_id: ws.id,
      user_id: _context?.user_id || 'user-demo',
      period_days: params.periodDays || 30,
      total_people: people.length,
      by_type: byType,
      total_interactions: interactions.length,
      avg_mood_after: avgMood,
      neglected_relationships: neglected,
      upcoming_important_dates: importantDates.length,
    };
  },
  
  async getPeople(params = {}) {
    const ws = await WorkspaceAPI.getCurrent();
    let people = _storage.relationships.people.get(ws.id) || [];
    if (params.relationshipType) {
      people = people.filter(p => p.relationship_type === params.relationshipType);
    }
    return people;
  },
  
  async addPerson(data) {
    const ws = await WorkspaceAPI.getCurrent();
    const person = {
      id: uuidv4(),
      workspace_id: ws.id,
      user_id: _context?.user_id || 'user-demo',
      created_at: new Date().toISOString(),
      importance: 5,
      health: 'new',
      ...data,
    };
    if (!_storage.relationships.people.has(ws.id)) {
      _storage.relationships.people.set(ws.id, []);
    }
    _storage.relationships.people.get(ws.id).push(person);
    return person;
  },
  
  async getInteractions(params = {}) {
    const ws = await WorkspaceAPI.getCurrent();
    let interactions = _storage.relationships.interactions.get(ws.id) || [];
    if (params.personId) {
      interactions = interactions.filter(i => i.person_id === params.personId);
    }
    return interactions.slice(0, params.limit || 20);
  },
  
  async addInteraction(data) {
    const ws = await WorkspaceAPI.getCurrent();
    const interaction = {
      id: uuidv4(),
      workspace_id: ws.id,
      user_id: _context?.user_id || 'user-demo',
      date: new Date().toISOString(),
      ...data,
    };
    if (!_storage.relationships.interactions.has(ws.id)) {
      _storage.relationships.interactions.set(ws.id, []);
    }
    _storage.relationships.interactions.get(ws.id).unshift(interaction);
    return interaction;
  },
  
  async getImportantDates(params = {}) {
    const ws = await WorkspaceAPI.getCurrent();
    return _storage.relationships.importantDates.get(ws.id) || [];
  },
  
  async addImportantDate(data) {
    const ws = await WorkspaceAPI.getCurrent();
    const date = {
      id: uuidv4(),
      workspace_id: ws.id,
      user_id: _context?.user_id || 'user-demo',
      created_at: new Date().toISOString(),
      ...data,
    };
    if (!_storage.relationships.importantDates.has(ws.id)) {
      _storage.relationships.importantDates.set(ws.id, []);
    }
    _storage.relationships.importantDates.get(ws.id).push(date);
    return date;
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
  Health: HealthAPI,
  Career: CareerAPI,
  Mindset: MindsetAPI,
  Relationships: RelationshipsAPI,
  Lattice: LatticeAPI,
  Paths: PathsAPI,
  Audit: AuditAPI,
};
