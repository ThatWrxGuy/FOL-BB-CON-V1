/**
 * Busy Bee Goals - Design System Implementation
 */

import { useState, useEffect } from 'react';
import { FiPlus, FiSearch, FiTarget, FiCheck, FiClock, FiMoreVertical } from 'react-icons/fi';
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
  Input,
  LoadingOverlay,
  EmptyState,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '../components';

// Constants
const DOMAIN_META = {
  health: { emoji: '🏃', label: 'Health' },
  career: { emoji: '💼', label: 'Career' },
  mindset: { emoji: '🧠', label: 'Mindset' },
  habits: { emoji: '🔄', label: 'Habits' },
  relationships: { emoji: '👥', label: 'Relationships' },
  finance: { emoji: '💰', label: 'Finance' },
};

const STATUS_COLORS = {
  active: 'success',
  completed: 'info',
  paused: 'secondary',
};

// Mock data
const mockGoals = [
  {
    id: 1,
    title: 'Run 5K three times per week',
    progress: 75,
    status: 'active',
    category: 'Health',
    domain: 'health',
  },
  {
    id: 2,
    title: 'Save $10,000 emergency fund',
    progress: 45,
    status: 'active',
    category: 'Finance',
    domain: 'finance',
  },
  {
    id: 3,
    title: 'Morning meditation routine',
    progress: 90,
    status: 'active',
    category: 'Mindset',
    domain: 'mindset',
  },
  {
    id: 4,
    title: 'Complete professional certification',
    progress: 30,
    status: 'paused',
    category: 'Career',
    domain: 'career',
  },
  {
    id: 5,
    title: 'Read 24 books this year',
    progress: 60,
    status: 'active',
    category: 'Learning',
    domain: 'mindset',
  },
  {
    id: 6,
    title: 'Weekly family game night',
    progress: 100,
    status: 'completed',
    category: 'Relationships',
    domain: 'relationships',
  },
];

function GoalCard({ goal, onClick }) {
  const domain = DOMAIN_META[goal.domain] || { emoji: '🎯', label: goal.category };

  return (
    <Card hover className="cursor-pointer" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{domain.emoji}</span>
            <div>
              <h3 className="font-medium text-foreground">{goal.title}</h3>
              <p className="text-xs text-foreground-muted">{domain.label}</p>
            </div>
          </div>
          <button className="p-1 hover:bg-secondary rounded">
            <FiMoreVertical className="w-4 h-4 text-foreground-muted" />
          </button>
        </div>

        <Progress value={goal.progress} className="h-2 mb-3" />

        <div className="flex items-center justify-between">
          <Badge variant={STATUS_COLORS[goal.status]}>{goal.status}</Badge>
          <span className="text-sm text-foreground-muted">{goal.progress}%</span>
        </div>
      </CardContent>
    </Card>
  );
}

function Goals() {
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setGoals(mockGoals);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredGoals = goals.filter((goal) => {
    const matchesFilter = filter === 'all' || goal.status === filter;
    const matchesSearch =
      goal.title.toLowerCase().includes(search.toLowerCase()) ||
      goal.category.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: goals.length,
    active: goals.filter((g) => g.status === 'active').length,
    completed: goals.filter((g) => g.status === 'completed').length,
    paused: goals.filter((g) => g.status === 'paused').length,
  };

  if (loading) {
    return <LoadingOverlay message="Loading goals..." />;
  }

  return (
    <PageContainer
      title="Goals"
      subtitle="Track your personal goals and milestones"
      actions={
        <Button>
          <FiPlus className="w-4 h-4 mr-2" />
          New Goal
        </Button>
      }
    >
      {/* Stats */}
      <Grid cols={{ default: 2, sm: 4 }} className="mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-sm text-foreground-muted">Total Goals</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-success">{stats.active}</p>
            <p className="text-sm text-foreground-muted">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-info">{stats.completed}</p>
            <p className="text-sm text-foreground-muted">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground-muted">{stats.paused}</p>
            <p className="text-sm text-foreground-muted">Paused</p>
          </CardContent>
        </Card>
      </Grid>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
          <input
            type="text"
            placeholder="Search goals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-card text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="paused">Paused</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Goals Grid */}
      {filteredGoals.length > 0 ? (
        <Grid cols={{ default: 1, md: 2, lg: 3 }} className="gap-4">
          {filteredGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onClick={() => console.log('Goal clicked:', goal.id)}
            />
          ))}
        </Grid>
      ) : (
        <EmptyState
          icon={FiTarget}
          title="No goals found"
          description={
            search ? 'Try adjusting your search' : 'Create your first goal to get started'
          }
          action={
            <Button>
              <FiPlus className="w-4 h-4 mr-2" />
              Create Goal
            </Button>
          }
        />
      )}
    </PageContainer>
  );
}

export default Goals;
