import { useState, useEffect } from 'react';
import { useExecutive } from '../../context/busy_bee';

/**
 * ExecutiveDashboard Component
 * 
 * Connects to the Executive Cell and displays KPIs/metrics.
 * Part of the Flower Architecture frontend integration.
 */
export function ExecutiveDashboard({ periodDays = 30 }) {
  const executive = useExecutive();
  const [metrics, setMetrics] = useState([]);
  const [latestBrief, setLatestBrief] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load executive data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // Get metrics
        const mets = await executive.getMetrics({ limit: 10 });
        setMetrics(mets);
        
        // Get latest brief
        const brief = await executive.getLatestBrief();
        setLatestBrief(brief);
        
      } catch (err) {
        console.error('Failed to load executive data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [executive]);

  // Generate new brief
  const handleGenerateBrief = async (title) => {
    try {
      const brief = await executive.generateBrief({ title, periodDays });
      setLatestBrief(brief);
      return brief;
    } catch (err) {
      console.error('Failed to generate brief:', err);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
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

  // Group metrics by category
  const metricsByCategory = metrics.reduce((acc, m) => {
    if (!acc[m.category]) acc[m.category] = [];
    acc[m.category].push(m);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📊 Executive</h2>
          <p className="text-sm text-gray-500">KPIs and Business Intelligence</p>
        </div>
        <GenerateBriefButton onGenerate={handleGenerateBrief} />
      </div>

      {/* Metrics Grid by Category */}
      {Object.entries(metricsByCategory).map(([category, categoryMetrics]) => (
        <div key={category} className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4 capitalize">
            {getCategoryIcon(category)} {category}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryMetrics.map((metric) => (
              <MetricCard key={metric.id} metric={metric} />
            ))}
          </div>
        </div>
      ))}

      {/* Latest Executive Brief */}
      {latestBrief && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-purple-900">📋 {latestBrief.title}</h3>
              <p className="text-sm text-purple-600 mt-1">
                Generated: {new Date(latestBrief.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <p className="mt-4 text-gray-700">{latestBrief.summary}</p>
          
          {latestBrief.key_highlights?.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-green-700 mb-2">✅ Key Highlights</h4>
              <ul className="space-y-1">
                {latestBrief.key_highlights.map((h, i) => (
                  <li key={i} className="text-gray-600 text-sm flex items-center gap-2">
                    <span className="text-green-500">✓</span> {h}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {latestBrief.key_concerns?.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-orange-700 mb-2">⚠️ Key Concerns</h4>
              <ul className="space-y-1">
                {latestBrief.key_concerns.map((c, i) => (
                  <li key={i} className="text-gray-600 text-sm flex items-center gap-2">
                    <span className="text-orange-500">!</span> {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {latestBrief.recommendations?.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-blue-700 mb-2">💡 Recommendations</h4>
              <ul className="space-y-1">
                {latestBrief.recommendations.map((r, i) => (
                  <li key={i} className="text-gray-600 text-sm flex items-center gap-2">
                    <span className="text-blue-500">→</span> {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Metric Card Component
 */
function MetricCard({ metric }) {
  const changePercent = metric.previous_value 
    ? ((metric.value - metric.previous_value) / metric.previous_value * 100).toFixed(1)
    : null;
  
  const isPositive = changePercent && parseFloat(changePercent) > 0;
  const isNegative = changePercent && parseFloat(changePercent) < 0;

  return (
    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{metric.name}</span>
        {changePercent && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            isPositive ? 'bg-green-100 text-green-700' : 
            isNegative ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-600'
          }`}>
            {isPositive ? '↑' : isNegative ? '↓' : ''} {Math.abs(changePercent)}%
          </span>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-bold text-gray-900">
          {formatValue(metric.value, metric.unit)}
        </span>
      </div>
      {metric.previous_value && (
        <p className="text-xs text-gray-400 mt-1">
          Previous: {formatValue(metric.previous_value, metric.unit)}
        </p>
      )}
    </div>
  );
}

/**
 * Generate Brief Button
 */
function GenerateBriefButton({ onGenerate }) {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      await onGenerate(title || 'Executive Summary');
      setShowModal(false);
      setTitle('');
    } catch (err) {
      alert('Failed to generate brief');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
      >
        📋 Generate Brief
      </button>
      
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Generate Executive Brief</h3>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Brief Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Q2 2026 Summary"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={generating}
                  className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
                >
                  {generating ? 'Generating...' : 'Generate'}
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

// Helper: Get category icon
function getCategoryIcon(category) {
  const icons = {
    revenue: '💰',
    growth: '📈',
    engagement: '👥',
    operations: '⚙️',
    customer: '😊',
  };
  return icons[category] || '📊';
}

// Helper: Format value
function formatValue(value, unit) {
  if (unit === '$') return `$${value.toLocaleString()}`;
  if (unit === '%') return `${value}%`;
  if (unit === 'users') return value.toLocaleString();
  return `${value} ${unit}`.trim();
}

export default ExecutiveDashboard;
