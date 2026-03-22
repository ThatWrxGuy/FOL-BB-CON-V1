import { useState, useEffect } from 'react';
import { BusyBee } from '../../lib/busy_bee';

/**
 * HealthDashboard Component
 * 
 * Connects to the Health Cell and displays health/fitness data.
 */
export function HealthDashboard({ periodDays = 30 }) {
  const [summary, setSummary] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [sleep, setSleep] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [summaryData, workoutData, sleepData, vitalsData] = await Promise.all([
          BusyBee.Health.getSummary({ periodDays }),
          BusyBee.Health.getWorkouts(),
          BusyBee.Health.getSleepLogs(),
          BusyBee.Health.getVitals(),
        ]);
        setSummary(summaryData);
        setWorkouts(workoutData.slice(0, 5));
        setSleep(sleepData.slice(0, 3));
        setVitals(vitalsData.slice(0, 3));
      } catch (err) {
        console.error('Failed to load health data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [periodDays]);

  const handleAddWorkout = async (data) => {
    const workout = await BusyBee.Health.addWorkout(data);
    setWorkouts([workout, ...workouts]);
    const newSummary = await BusyBee.Health.getSummary({ periodDays });
    setSummary(newSummary);
    return workout;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
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
          <h2 className="text-2xl font-bold text-gray-900">🏃 Health</h2>
          <p className="text-sm text-gray-500">Last {periodDays} days</p>
        </div>
        <AddWorkoutButton onAdd={handleAddWorkout} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard
          title="Workouts"
          value={summary?.total_workouts || 0}
          icon="🏋️"
          subtitle={`${summary?.total_workout_minutes || 0} min`}
        />
        <SummaryCard
          title="Calories Burned"
          value={summary?.total_calories_burned || 0}
          icon="🔥"
          subtitle="this period"
        />
        <SummaryCard
          title="Avg Sleep"
          value={`${(summary?.average_sleep_hours || 0).toFixed(1)}h`}
          icon="😴"
          subtitle="per night"
        />
        <SummaryCard
          title="Weight"
          value={summary?.current_weight ? `${summary.current_weight}kg` : '--'}
          icon="⚖️"
          subtitle={summary?.weight_change_kg ? `${summary.weight_change_kg > 0 ? '+' : ''}${summary.weight_change_kg}kg` : 'no change'}
          trend={summary?.weight_change_kg < 0 ? 'positive' : null}
        />
      </div>

      {/* Vitals Card */}
      {vitals.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">❤️ Latest Vitals</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <VitalCard label="BP" value={`${vitals[0]?.blood_pressure_systolic || '--'}/${vitals[0]?.blood_pressure_diastolic || '--'}`} />
            <VitalCard label="Heart Rate" value={`${vitals[0]?.heart_rate_bpm || '--'} bpm`} />
            <VitalCard label="Weight" value={`${vitals[0]?.weight_kg || '--'} kg`} />
            <VitalCard label="Height" value={`${vitals[0]?.height_cm || '--'} cm`} />
          </div>
        </div>
      )}

      {/* Workouts */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">🏋️ Recent Workouts</h3>
        {workouts.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No workouts logged yet</p>
        ) : (
          <div className="space-y-3">
            {workouts.map((w) => (
              <WorkoutRow key={w.id} workout={w} />
            ))}
          </div>
        )}
      </div>

      {/* Sleep */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">😴 Sleep Logs</h3>
        {sleep.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No sleep logged yet</p>
        ) : (
          <div className="space-y-3">
            {sleep.map((s) => (
              <SleepRow key={s.id} sleep={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon, subtitle, trend }) {
  return (
    <div className="p-4 rounded-xl border bg-gray-50 border-gray-200">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{title}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <p className={`text-2xl font-bold mt-1 ${trend === 'positive' ? 'text-green-600' : ''}`}>
        {value}
      </p>
      <p className="text-xs text-gray-400">{subtitle}</p>
    </div>
  );
}

function VitalCard({ label, value }) {
  return (
    <div className="text-center p-3 bg-gray-50 rounded-lg">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

function WorkoutRow({ workout }) {
  const icons = {
    running: '🏃',
    weight_training: '🏋️',
    cardio: '🚴',
    yoga: '🧘',
    swimming: '🏊',
    hiit: '⚡',
    cycling: '🚴',
    walking: '🚶',
  };
  
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icons[workout.workout_type] || '🏃'}</span>
        <div>
          <p className="font-medium capitalize">{workout.workout_type.replace('_', ' ')}</p>
          <p className="text-sm text-gray-500">{workout.duration_minutes} min • {workout.calories_burned || 0} cal</p>
        </div>
      </div>
      <span className="text-sm text-gray-400">
        {new Date(workout.date).toLocaleDateString()}
      </span>
    </div>
  );
}

function SleepRow({ sleep }) {
  const qualityColors = {
    excellent: 'text-green-600',
    good: 'text-blue-600',
    fair: 'text-yellow-600',
    poor: 'text-red-600',
  };
  
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div>
        <p className="font-medium">{sleep.hours_slept}h slept</p>
        <p className="text-sm text-gray-500">{sleep.date}</p>
      </div>
      <span className={`capitalize font-medium ${qualityColors[sleep.sleep_quality]}`}>
        {sleep.sleep_quality}
      </span>
    </div>
  );
}

function AddWorkoutButton({ onAdd }) {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    workout_type: 'running',
    duration_minutes: 30,
    calories_burned: 200,
    intensity: 'moderate',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onAdd({
      ...formData,
      duration_minutes: parseInt(formData.duration_minutes),
      calories_burned: parseInt(formData.calories_burned),
    });
    setShowModal(false);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
      >
        + Log Workout
      </button>
      
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Log Workout</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={formData.workout_type}
                  onChange={(e) => setFormData({ ...formData, workout_type: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="running">Running</option>
                  <option value="weight_training">Weight Training</option>
                  <option value="cardio">Cardio</option>
                  <option value="yoga">Yoga</option>
                  <option value="swimming">Swimming</option>
                  <option value="hiit">HIIT</option>
                  <option value="cycling">Cycling</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Duration (min)</label>
                <input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Calories Burned</label>
                <input
                  type="number"
                  value={formData.calories_burned}
                  onChange={(e) => setFormData({ ...formData, calories_burned: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Log
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
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

export default HealthDashboard;
