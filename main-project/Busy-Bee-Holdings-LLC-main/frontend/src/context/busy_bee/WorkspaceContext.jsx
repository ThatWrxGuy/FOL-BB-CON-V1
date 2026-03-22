import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BusyBee } from '../lib/busy_bee';

/**
 * Workspace Context
 * 
 * Provides workspace/tenant isolation for the entire app.
 * Every request is tagged with user_id, tenant_id, workspace_id.
 */

const WorkspaceContext = createContext(null);

/**
 * @typedef {Object} WorkspaceState
 * @property {Object|null} workspace - Current workspace
 * @property {boolean} loading - Loading state
 * @property {string|null} error - Error message
 * @property {Object|null} context - Request context {user_id, tenant_id, workspace_id}
 */

/**
 * Workspace Provider Component
 * 
 * Wraps the app and provides workspace context.
 * Automatically initializes with demo data.
 */
export function WorkspaceProvider({ children, user }) {
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [context, setContextState] = useState(null);
  const [financialSummary, setFinancialSummary] = useState(null);
  const [metrics, setMetrics] = useState([]);
  const [latestBrief, setLatestBrief] = useState(null);
  const [healthSummary, setHealthSummary] = useState(null);
  const [careerSummary, setCareerSummary] = useState(null);
  const [mindsetSummary, setMindsetSummary] = useState(null);
  const [relationshipsSummary, setRelationshipsSummary] = useState(null);

  // Initialize workspace on mount
  useEffect(() => {
    async function initWorkspace() {
      try {
        setLoading(true);
        
        // Get or create workspace
        let ws = await BusyBee.Workspace.getCurrent();
        
        if (!ws) {
          // Create demo workspace
          ws = await BusyBee.Workspace.create({
            tenant_id: user?.id || 'user-demo',
            name: `${user?.name || 'Demo'}'s Workspace`,
            owner_id: user?.id || 'user-demo',
          });
        }
        
        setWorkspace(ws);
        
        // Set request context
        const ctx = {
          user_id: user?.id || 'user-demo',
          tenant_id: ws.tenant_id,
          workspace_id: ws.id,
        };
        setContextState(ctx);
        BusyBee.setContext(ctx);
        
        // Load initial data
        await loadWorkspaceData(ws.id);
        
      } catch (err) {
        console.error('Failed to initialize workspace:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    initWorkspace();
  }, [user?.id]);

  // Load workspace data
  const loadWorkspaceData = useCallback(async (workspaceId) => {
    try {
      // Load financial summary (last 30 days)
      const end = new Date().toISOString();
      const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const summary = await BusyBee.Finance.getSummary({ start, end });
      setFinancialSummary(summary);
      
      // Load metrics
      const mets = await BusyBee.Executive.getMetrics({ limit: 10 });
      setMetrics(mets);
      
      // Load latest brief
      const brief = await BusyBee.Executive.getLatestBrief();
      setLatestBrief(brief);
      
      // Load health summary
      const health = await BusyBee.Health.getSummary({ periodDays: 30 });
      setHealthSummary(health);
      
      // Load career summary
      const career = await BusyBee.Career.getSummary({ periodDays: 30 });
      setCareerSummary(career);
      
      // Load mindset summary
      const mindset = await BusyBee.Mindset.getSummary({ periodDays: 30 });
      setMindsetSummary(mindset);
      
      // Load relationships summary
      const relationships = await BusyBee.Relationships.getSummary({ periodDays: 30 });
      setRelationshipsSummary(relationships);
      
    } catch (err) {
      console.error('Failed to load workspace data:', err);
    }
  }, []);

  // Refresh workspace data
  const refresh = useCallback(async () => {
    if (workspace?.id) {
      await loadWorkspaceData(workspace.id);
    }
  }, [workspace, loadWorkspaceData]);

  // Create new workspace
  const createWorkspace = useCallback(async (data) => {
    try {
      const ws = await BusyBee.Workspace.create({
        ...data,
        tenant_id: context?.tenant_id || user?.id,
        owner_id: user?.id,
      });
      setWorkspace(ws);
      return ws;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [context, user]);

  // Switch workspace
  const switchWorkspace = useCallback(async (workspaceId) => {
    try {
      const ws = await BusyBee.Workspace.getCurrent(workspaceId);
      setWorkspace(ws);
      
      // Update context
      const ctx = {
        ...context,
        workspace_id: ws.id,
      };
      setContextState(ctx);
      BusyBee.setContext(ctx);
      
      // Reload data
      await loadWorkspaceData(ws.id);
      
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [context, loadWorkspaceData]);

  /**
   * @type {WorkspaceState}
   */
  const value = {
    // State
    workspace,
    loading,
    error,
    context,
    financialSummary,
    metrics,
    latestBrief,
    healthSummary,
    careerSummary,
    mindsetSummary,
    relationshipsSummary,
    // Actions
    refresh,
    createWorkspace,
    switchWorkspace,
    // Cell APIs
    finance: BusyBee.Finance,
    executive: BusyBee.Executive,
    health: BusyBee.Health,
    career: BusyBee.Career,
    mindset: BusyBee.Mindset,
    relationships: BusyBee.Relationships,
    lattice: BusyBee.Lattice,
    paths: BusyBee.Paths,
    audit: BusyBee.Audit,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

/**
 * Hook to use workspace context
 * @returns {WorkspaceState}
 */
export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  
  return context;
}

/**
 * Hook to use finance cell
 * @returns {Object}
 */
export function useFinance() {
  const { finance, financialSummary, refresh } = useWorkspace();
  return { ...finance, summary: financialSummary, refresh };
}

/**
 * Hook to use executive cell
 * @returns {Object}
 */
export function useExecutive() {
  const { executive, metrics, latestBrief, refresh } = useWorkspace();
  return { ...executive, metrics, latestBrief, refresh };
}

/**
 * Hook to use lattice (service discovery)
 * @returns {Object}
 */
export function useLattice() {
  const { lattice } = useWorkspace();
  return lattice;
}

/**
 * Hook to use paths (orchestration)
 * @returns {Object}
 */
export function usePaths() {
  const { paths } = useWorkspace();
  return paths;
}

/**
 * Hook to use audit
 * @returns {Object}
 */
export function useAudit() {
  const { audit } = useWorkspace();
  return audit;
}

export default WorkspaceContext;
