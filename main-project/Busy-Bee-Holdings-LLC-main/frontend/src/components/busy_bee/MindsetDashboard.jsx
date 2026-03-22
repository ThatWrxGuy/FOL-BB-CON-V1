import { useState, useEffect } from 'react';
import { BusyBee } from '../../lib/busy_bee';

/**
 * MindsetDashboard Component
 * 
 * Connects to the Mindset Cell and displays journaling, mood tracking,
 * affirmations, and mindfulness data.
 */
export function MindsetDashboard({ periodDays = 30 }) {
  const [summary, setSummary] = useState(null);
  const [journalEntries, setJournalEntries] = useState([]);
  const [affirmations, setAffirmations] = useState([]);
  const [randomAffirmation, setRandomAffirmation] = useState(null);
  const [mindfulness, setMindfulness] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('journal');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [summaryData, entries, affs, randomAff, sessions] = await Promise.all([
          BusyBee.Mindset.getSummary({ periodDays }),
          BusyBee.Mindset.getJournalEntries({ limit: 10 }),
          BusyBee.Mindset.getAffirmations(),
          BusyBee.Mindset.getRandomAffirmation(),
          BusyBee.Mindset.getMindfulnessSessions(),
        ]);
        setSummary(summaryData);
        setJournalEntries(entries);
        setAffirmations(affs);
        setRandomAffirmation(randomAff);
        setMindfulness(sessions.slice(0, 5));
      } catch (err) {
        console.error('Failed to load mindset data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [periodDays]);

  const handleAddJournalEntry = async (data) => {
    const entry = await BusyBee.Mindset.addJournalEntry(data);
    setJournalEntries([entry, ...journalEntries]);
    const newSummary = await BusyBee.Mindset.getSummary({ periodDays });
    setSummary(newSummary);
    return entry;
  };

  const handleAddAffirmation = async (data) => {
    const affirmation = await BusyBee.Mindset.addAffirmation(data);
    setAffirmations([...affirmations, affirmation]);
    return affirmation;
  };

  const handleAddMindfulness = async (data) => {
    const session = await BusyBee.Mindset.addMindfulnessSession(data);
    setMindfulness([session, ...mindfulness]);
    return session;
  };

  const handleGetNewAffirmation = async () => {
    const aff = await BusyBee.Mindset.getRandomAffirmation();
    setRandomAffirmation(aff);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🧠 Mindset</h2>
          <p className="text-sm text-gray-500">Journal, gratitude & mindfulness</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('journal')}
            className={`px-3 py-1 rounded-lg ${activeTab === 'journal' ? 'bg-purple-500 text-white' : 'bg-gray-100'}`}
          >
            📝 Journal
          </button>
          <button
            onClick={() => setActiveTab('affirmations')}
            className={`px-3 py-1 rounded-lg ${activeTab === 'affirmations' ? 'bg-purple-500 text-white' : 'bg-gray-100'}`}
          >
            ✨ Affirmations
          </button>
          <button
            onClick={() => setActiveTab('mindfulness')}
            className={`px-3 py-1 rounded-lg ${activeTab === 'mindfulness' ? 'bg-purple-500 text-white' : 'bg-gray-100'}`}
          >
            🧘 Mindfulness
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard
          title="Journal Entries"
          value={summary?.journal_entries || 0}
          icon="📝"
        />
        <SummaryCard
          title="Gratitude"
          value={summary?.gratitude_entries || 0}
          icon="🙏"
        />
        <SummaryCard
          title="Avg Mood"
          value={summary?.average_mood ? `${summary.average_mood.toFixed(1)}/5` : '--'}
          icon={getMoodEmoji(summary?.average_mood)}
        />
        <SummaryCard
          title="Mindfulness"
          value={`${summary?.mindfulness_minutes || 0}m`}
          icon="🧘"
        />
      </div>

      {/* Daily Affirmation Banner */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100 text-sm">✨ Daily Affirmation</p>
            <p className="text-2xl font-bold mt-1">
              "{randomAffirmation?.text || 'Start your day with positivity!'}"
            </p>
          </div>
          <button
            onClick={handleGetNewAffirmation}
            className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
          >
            🔄 New
          </button>
        </div>
      </div>

      {/* Journal Tab */}
      {activeTab === 'journal' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">📝 Recent Journal Entries</h3>
            <JournalEntryButton onAdd={handleAddJournalEntry} />
          </div>
          
          {journalEntries.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No journal entries yet. Start writing!</p>
          ) : (
            <div className="space-y-4">
              {journalEntries.map((entry) => (
                <JournalEntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Affirmations Tab */}
      {activeTab === 'affirmations' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">✨ Your Affirmations</h3>
            <AffirmationButton onAdd={handleAddAffirmation} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {affirmations.map((aff) => (
              <div key={aff.id} className={`p-4 rounded-lg ${aff.is_favorite ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50'}`}>
                <div className="flex items-start justify-between">
                  <p className="font-medium">"{aff.text}"</p>
                  {aff.is_favorite && <span className="text-purple-500">❤️</span>}
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span className="capitalize">{aff.category}</span>
                  <span>Used {aff.times_used || 0}x</span>
                </div>
              </div>
            ))}
            {affirmations.length === 0 && (
              <p className="col-span-2 text-gray-500 text-center py-4">No affirmations yet. Add your first one!</p>
            )}
          </div>
        </div>
      )}

      {/* Mindfulness Tab */}
      {activeTab === 'mindfulness' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">🧘 Recent Sessions</h3>
              <MindfulnessButton onAdd={handleAddMindfulness} />
            </div>
            
            {mindfulness.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No mindfulness sessions yet</p>
            ) : (
              <div className="space-y-3">
                {mindfulness.map((session) => (
                  <div key={session.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getSessionEmoji(session.session_type)}</span>
                      <div>
                        <p className="font-medium capitalize">{session.session_type}</p>
                        <p className="text-sm text-gray-500">{session.duration_minutes} min • {session.feeling_after}</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-400">
                      {new Date(session.date).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Top Moods */}
      {summary?.top_moods?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-3">🎭 Your Top Moods</h3>
          <div className="flex flex-wrap gap-2">
            {summary.top_moods.map((mood) => (
              <span key={mood} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm capitalize">
                {mood}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ title, value, icon }) {
  return (
    <div className="p-4 rounded-xl border bg-gray-50 border-gray-200">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{title}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

function JournalEntryCard({ entry }) {
  const moodColors = {
    1: 'bg-red-100 text-red-700',
    2: 'bg-orange-100 text-orange-700',
    3: 'bg-yellow-100 text-yellow-700',
    4: 'bg-green-100 text-green-700',
    5: 'bg-emerald-100 text-emerald-700',
  };
  
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-semibold">{entry.title}</h4>
          <p className="text-sm text-gray-500">{entry.date}</p>
        </div>
        <div className="flex items-center gap-2">
          {entry.is_gratitude && <span className="text-lg">🙏</span>}
          {entry.mood && (
            <span className={`px-2 py-1 rounded text-xs ${moodColors[entry.mood] || 'bg-gray-100'}`}>
              {getMoodEmoji(entry.mood)} {entry.mood}/5
            </span>
          )}
        </div>
      </div>
      <p className="text-gray-700">{entry.content}</p>
      {entry.mood_tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {entry.mood_tags.map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full capitalize">
              {tag}
            </span>
          ))}
        </div>
      )}
      {entry.gratitude_items?.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <p className="text-sm text-gray-500">Grateful for:</p>
          <ul className="text-sm text-gray-700">
            {entry.gratitude_items.map((item, i) => (
              <li key={i}>• {item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function JournalEntryButton({ onAdd }) {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mood: 3,
    mood_tags: [],
    is_gratitude: false,
    gratitude_items: [],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onAdd(formData);
    setShowModal(false);
    setFormData({ title: '', content: '', mood: 3, mood_tags: [], is_gratitude: false, gratitude_items: [] });
  };

  const moodOptions = [
    { value: 1, emoji: '😢', label: 'Terrible' },
    { value: 2, emoji: '😔', label: 'Bad' },
    { value: 3, emoji: '😐', label: 'Okay' },
    { value: 4, emoji: '😊', label: 'Good' },
    { value: 5, emoji: '🤩', label: 'Great' },
  ];

  return (
    <>
      <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600">
        + New Entry
      </button>
      {showModal && (
        <Modal title="New Journal Entry" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Entry title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg"
              required
            />
            <textarea
              placeholder="How are you feeling? What's on your mind?"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg h-32"
              required
            />
            <div>
              <label className="block text-sm font-medium mb-2">How do you feel?</label>
              <div className="flex gap-2">
                {moodOptions.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, mood: m.value })}
                    className={`flex-1 p-2 rounded-lg ${formData.mood === m.value ? 'bg-purple-100 border-2 border-purple-500' : 'bg-gray-100'}`}
                  >
                    <span className="block text-xl">{m.emoji}</span>
                    <span className="text-xs">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_gratitude}
                  onChange={(e) => setFormData({ ...formData, is_gratitude: e.target.checked })}
                />
                <span className="font-medium">🙏 This is a gratitude entry</span>
              </label>
            </div>
            {formData.is_gratitude && (
              <div>
                <label className="block text-sm font-medium mb-1">What are you grateful for? (comma separated)</label>
                <input
                  type="text"
                  placeholder="Health, Family, Work..."
                  onChange={(e) => setFormData({ ...formData, gratitude_items: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
            )}
            <div className="flex gap-2">
              <button type="submit" className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg">
                Save Entry
              </button>
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

function AffirmationButton({ onAdd }) {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ text: '', category: 'confidence' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onAdd(formData);
    setShowModal(false);
    setFormData({ text: '', category: 'confidence' });
  };

  return (
    <>
      <button onClick={() => setShowModal(true)} className="text-purple-500 hover:underline">
        + Add
      </button>
      {showModal && (
        <Modal title="New Affirmation" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              placeholder="I am..."
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg h-24"
              required
            />
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="confidence">Confidence</option>
              <option value="growth">Growth</option>
              <option value="mindset">Mindset</option>
              <option value="self-worth">Self-Worth</option>
            </select>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg">Add</button>
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

function MindfulnessButton({ onAdd }) {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ session_type: 'meditation', duration_minutes: 10, feeling_after: 'calm' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onAdd(formData);
    setShowModal(false);
    setFormData({ session_type: 'meditation', duration_minutes: 10, feeling_after: 'calm' });
  };

  return (
    <>
      <button onClick={() => setShowModal(true)} className="text-purple-500 hover:underline">
        + Log Session
      </button>
      {showModal && (
        <Modal title="Log Mindfulness Session" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <select
              value={formData.session_type}
              onChange={(e) => setFormData({ ...formData, session_type: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="meditation">Meditation</option>
              <option value="breathing">Breathing</option>
              <option value="body_scan">Body Scan</option>
              <option value="yoga">Yoga</option>
            </select>
            <input
              type="number"
              placeholder="Duration (minutes)"
              value={formData.duration_minutes}
              onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
              className="w-full p-2 border border-gray-300 rounded-lg"
              required
            />
            <select
              value={formData.feeling_after}
              onChange={(e) => setFormData({ ...formData, feeling_after: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="calm">Calm</option>
              <option value="relaxed">Relaxed</option>
              <option value="peaceful">Peaceful</option>
              <option value="focused">Focused</option>
              <option value="energized">Energized</option>
            </select>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg">Log</button>
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
}

function getMoodEmoji(mood) {
  if (!mood) return '😐';
  if (mood <= 1) return '😢';
  if (mood <= 2) return '😔';
  if (mood <= 3) return '😐';
  if (mood <= 4) return '😊';
  return '🤩';
}

function getSessionEmoji(type) {
  const emojis = {
    meditation: '🧘',
    breathing: '🌬️',
    body_scan: '🔍',
    yoga: '🧘‍♀️',
  };
  return emojis[type] || '🧘';
}

export default MindsetDashboard;
