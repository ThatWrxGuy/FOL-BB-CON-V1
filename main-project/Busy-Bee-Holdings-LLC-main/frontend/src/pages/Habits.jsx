/**
 * Busy Bee Habits Dashboard - Design System Implementation
 * Habit tracking, streaks, and routine management
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiTrendingUp, FiTrendingDown, FiRepeat, FiCheck, FiClock, FiTarget, FiZap, FiCalendar, FiAward } from 'react-icons/fi';
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
  Skeleton,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '../components';

// ─── Configuration ───────────────────────────────────────────────────────────

const HABITS_METRICS = {
  color: '#F59E0B',
  emoji: '🔄',
  label: 'Habits',
};

// ─── Mock Data - EXAMPLES ONLY for users to reference ───────────────────────────
// In production, this would be empty or fetched from user's personal data
// These examples show the types of habit goals users might create

const mockStats = [
  { label: 'Overall Score', value: '65', trend: 5, icon: FiRepeat },
  { label: 'Active Habits', value: '8', trend: 2, icon: FiCheck },
  { label: 'Current Streak', value: '14', trend: 3, icon: FiZap },
  { label: 'Best Streak', value: '28', trend: 0, icon: FiAward },
];

const mockHabits = [
  { id: 1, name: 'Morning workout', streak: 14, completed: true, frequency: 'Daily', category: 'Health' },
  { id: 2, name: 'Read 30 minutes', streak: 8, completed: true, frequency: 'Daily', category: 'Learning' },
  { id: 3, name: 'Drink 8 glasses of water', streak: 21, completed: true, frequency: 'Daily', category: 'Health' },
  { id: 4, name: 'Meditation', streak: 5, completed: false, frequency: 'Daily', category: 'Wellness' },
  { id: 5, name: 'No social media before noon', streak: 12, completed: true, frequency: 'Daily', category: 'Productivity' },
  { id: 6, name: 'Weekly meal prep', streak: 4, completed: false, frequency: 'Weekly', category: 'Health' },
  { id: 7, name: 'Journaling', streak: 0, completed: false, frequency: 'Daily', category: 'Wellness' },
  { id: 8, name: 'Go to bed by 10pm', streak: 3, completed: true, frequency: 'Daily', category: 'Health' },
];

const mockWeeklyActivity = [
  { day: 'Mon', habits: 6 },
  { day: 'Tue', habits: 7 },
  { day: 'Wed', habits: 5 },
  { day: 'Thu', habits: 8 },
  { day: 'Fri', habits: 6 },
  { day: 'Sat', habits: 4 },
  { day: 'Sun', habits: 3 },
];

const mockGoals = [
  { id: 1, title: 'Build consistent morning routine', progress: 70, status: 'active', target: '14/21 days' },
  { id: 2, title: 'Reduce screen time', progress: 45, status: 'active', target: '3/5 days avg' },
  { id: 3, title: 'Develop reading habit', progress: 85, status: 'active', target: '21/25 days' },
  { id: 4, title: 'Habit stacking with coffee', progress: 100, status: 'completed', target: 'Done' },
];

const mockRoutines = [
  { 
    id: 1, 
    name: 'Morning Routine', 
    habits: ['Wake up at 6am', 'Drink water', 'Exercise', 'Meditation', 'Breakfast'],
    time: '6:00 AM - 8:00 AM',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  },
  { 
    id: 2, 
    name: 'Evening Routine', 
    habits: ['No screens after 9pm', 'Read', 'Journal', 'Sleep by 10pm'],
    time: '9:00 PM - 10:00 PM',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
];

const mockInsights = [
  { label: 'Best day', value: 'Thursday', icon: FiAward },
  { label: 'Completion rate', value: '78%', icon: FiCheck },
  { label: 'Most consistent', value: 'Water intake', icon: FiZap },
  { label: 'Needs work', value: 'Journaling', icon: FiClock },
];

// ─── Components ───────────────────────────────────────────────────────────────

function StatCardNew({ icon: Icon, label, value, trend, loading }) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-4 w-20 mb-3" />
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-24" />
        </CardContent>
      </Card>
    );
  }

  const isPositive = trend > 0;
  const isNegative = trend < 0;

  return (
    <Card hover className="cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="p-2 rounded-lg bg-amber-500/10">
            <Icon className="w-5 h-5 text-amber-500" />
          </div>
          {trend != null && (
            <span
              className={`flex items-center gap-1 text-sm font-medium ${
                isPositive ? 'text-amber-500' : isNegative ? 'text-red-500' : 'text-gray-500'
              }`}
            >
              {isPositive && <FiTrendingUp size={14} />}
              {isNegative && <FiTrendingDown size={14} />}
              {Math.abs(trend)}%
            </span>
          )}
        </div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 mt-1">{label}</p>
      </CardContent>
    </Card>
  );
}

function HabitCard({ habit, onToggle }) {
  const categoryColors = {
    Health: 'bg-emerald-100 text-emerald-700',
    Learning: 'bg-blue-100 text-blue-700',
    Wellness: 'bg-purple-100 text-purple-700',
    Productivity: 'bg-gray-100 text-gray-700',
  };

  return (
    <Card hover className="cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onToggle(habit.id)}
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
              habit.completed 
                ? 'bg-amber-500 border-amber-500 text-white' 
                : 'border-gray-300 hover:border-amber-500'
            }`}
          >
            {habit.completed && <FiCheck size={14} />}
          </button>
          <div className="flex-1">
            <h3 className={`font-medium ${habit.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
              {habit.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[habit.category] || 'bg-gray-100'}`}>
                {habit.category}
              </span>
              <span className="text-xs text-gray-500">{habit.frequency}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-amber-500">
              <FiZap size={14} />
              <span className="font-bold">{habit.streak}</span>
            </div>
            <span className="text-xs text-gray-500">day streak</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function GoalCard({ goal }) {
  const statusColors = {
    active: 'success',
    completed: 'info',
    paused: 'secondary',
  };

  return (
    <Card hover className="cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-medium text-gray-900 flex-1 line-clamp-1">{goal.title}</h3>
          <Badge variant={statusColors[goal.status]}>{goal.status}</Badge>
        </div>
        <Progress value={goal.progress} className="h-2 mb-3" />
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">{goal.progress}% complete</span>
          <span className="text-xs text-gray-400">{goal.target}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function RoutineCard({ routine }) {
  return (
    <Card hover>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-medium text-gray-900">{routine.name}</h3>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <FiClock size={12} /> {routine.time}
            </p>
          </div>
          <div className="flex gap-1">
            {routine.days.map(day => (
              <span key={day} className={`text-xs px-1.5 py-0.5 rounded ${
                day.length === 3 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100'
              }`}>
                {day.charAt(0)}
              </span>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          {routine.habits.map((habit, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
              <FiCheck size={12} className="text-amber-500" />
              {habit}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function InsightCard({ insight }) {
  const Icon = insight.icon;
  return (
    <Card hover>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-100">
            <Icon className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">{insight.label}</p>
            <p className="font-medium text-gray-900">{insight.value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityBar({ day, habits }) {
  const maxHabits = Math.max(...mockWeeklyActivity.map(d => d.habits));
  const height = (habits / maxHabits) * 100;
  
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-8 h-24 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className="absolute bottom-0 w-full bg-amber-500 rounded-full transition-all"
          style={{ height: `${height}%` }}
        />
      </div>
      <span className="text-xs text-gray-500">{day}</span>
    </div>
  );
}

// ─── Main Habits Dashboard ───────────────────────────────────────────────────

function Habits() {
  const [loading, setLoading] = useState(true);
  const [habits, setHabits] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHabits(mockHabits);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const toggleHabit = (id) => {
    setHabits(habits.map(h => 
      h.id === id ? { ...h, completed: !h.completed } : h
    ));
  };

  return (
    <PageContainer
      title="Habits Dashboard"
      subtitle="Build consistent routines and track your daily habits"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <FiRepeat className="w-4 h-4 mr-2" />
            Log Habits
          </Button>
          <Button size="sm">
            <FiPlus className="w-4 h-4 mr-2" />
            New Habit
          </Button>
        </div>
      }
    >
      {/* Stats Grid */}
      <Grid cols={{ default: 1, sm: 2, lg: 4 }} className="mb-6">
        {mockStats.map((stat, index) => (
          <StatCardNew key={index} {...stat} loading={loading} />
        ))}
      </Grid>

      {/* Main Content */}
      <Tabs defaultValue="today" className="space-y-6">
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="routines">Routines</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="today">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Habits List */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader title="Daily Habits" />
                <CardContent className="space-y-3">
                  {loading ? (
                    <>
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </>
                  ) : (
                    habits.map((habit) => (
                      <HabitCard key={habit.id} habit={habit} onToggle={toggleHabit} />
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader title="Weekly Activity" />
                <CardContent>
                  <div className="flex justify-between gap-2">
                    {mockWeeklyActivity.map((day) => (
                      <ActivityBar key={day.day} day={day.day} habits={day.habits} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader title="Today's Progress" />
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="relative w-32 h-32 mx-auto">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="#E5E7EB"
                          strokeWidth="12"
                          fill="none"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="#F59E0B"
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={`${(habits.filter(h => h.completed).length / habits.length) * 352} 352`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-gray-900">
                          {habits.filter(h => h.completed).length}/{habits.length}
                        </span>
                        <span className="text-xs text-gray-500">completed</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader title="Quick Stats" />
                <CardContent className="space-y-3">
                  <InsightCard insight={mockInsights[0]} />
                  <InsightCard insight={mockInsights[1]} />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="routines">
          <Card>
            <CardHeader 
              title="My Routines" 
              action={
                <Button size="sm">
                  <FiPlus className="w-4 h-4 mr-2" />
                  New Routine
                </Button>
              }
            />
            <CardContent>
              <Grid cols={{ default: 1, md: 2 }} className="gap-4">
                {mockRoutines.map((routine) => (
                  <RoutineCard key={routine.id} routine={routine} />
                ))}
              </Grid>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader title="Habit Goals" />
                <CardContent className="space-y-4">
                  {mockGoals.map((goal) => (
                    <GoalCard key={goal.id} goal={goal} />
                  ))}
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader title="All Insights" />
                <CardContent className="space-y-3">
                  {mockInsights.map((insight, idx) => (
                    <InsightCard key={idx} insight={insight} />
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="insights">
          <Card>
            <CardHeader title="Habit Insights" />
            <CardContent>
              <Grid cols={{ default: 1, sm: 2, lg: 4 }} className="gap-4">
                {mockInsights.map((insight, idx) => (
                  <InsightCard key={idx} insight={insight} />
                ))}
              </Grid>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}

export default Habits;
