import { useState, useEffect } from 'react';
import { BusyBee } from '../../lib/busy_bee';

/**
 * RelationshipsDashboard Component
 * 
 * Connects to the Relationships Cell and displays people, interactions,
 * important dates, and relationship health.
 */
export function RelationshipsDashboard({ periodDays = 30 }) {
  const [summary, setSummary] = useState(null);
  const [people, setPeople] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [importantDates, setImportantDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('people');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [summaryData, peopleData, interactionsData, datesData] = await Promise.all([
          BusyBee.Relationships.getSummary({ periodDays }),
          BusyBee.Relationships.getPeople(),
          BusyBee.Relationships.getInteractions({ limit: 10 }),
          BusyBee.Relationships.getImportantDates(),
        ]);
        setSummary(summaryData);
        setPeople(peopleData);
        setInteractions(interactionsData);
        setImportantDates(datesData);
      } catch (err) {
        console.error('Failed to load relationships data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [periodDays]);

  const handleAddPerson = async (data) => {
    const person = await BusyBee.Relationships.addPerson(data);
    setPeople([...people, person]);
    return person;
  };

  const handleAddInteraction = async (data) => {
    const interaction = await BusyBee.Relationships.addInteraction(data);
    setInteractions([interaction, ...interactions]);
    return interaction;
  };

  const handleAddImportantDate = async (data) => {
    const date = await BusyBee.Relationships.addImportantDate(data);
    setImportantDates([...importantDates, date]);
    return date;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
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
          <h2 className="text-2xl font-bold text-gray-900">👥 Relationships</h2>
          <p className="text-sm text-gray-500">People, interactions & connections</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('people')}
            className={`px-3 py-1 rounded-lg ${activeTab === 'people' ? 'bg-pink-500 text-white' : 'bg-gray-100'}`}
          >
            People
          </button>
          <button
            onClick={() => setActiveTab('interactions')}
            className={`px-3 py-1 rounded-lg ${activeTab === 'interactions' ? 'bg-pink-500 text-white' : 'bg-gray-100'}`}
          >
            Interactions
          </button>
          <button
            onClick={() => setActiveTab('dates')}
            className={`px-3 py-1 rounded-lg ${activeTab === 'dates' ? 'bg-pink-500 text-white' : 'bg-gray-100'}`}
          >
            Dates
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard
          title="Total People"
          value={summary?.total_people || 0}
          icon="👥"
        />
        <SummaryCard
          title="Interactions"
          value={summary?.total_interactions || 0}
          icon="💬"
        />
        <SummaryCard
          title="Avg Mood"
          value={summary?.avg_mood_after ? `${summary.avg_mood_after.toFixed(1)}/5` : '--'}
          icon="😊"
        />
        <SummaryCard
          title="Neglected"
          value={summary?.neglected_relationships || 0}
          icon="⚠️"
          alert={summary?.neglected_relationships > 0}
        />
      </div>

      {/* Relationship Health Alert */}
      {summary?.neglected_relationships > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <p className="text-yellow-800">
              You have <strong>{summary.neglected_relationships}</strong> relationship(s) that haven't been connected with in 30+ days. 
              Consider reaching out!
            </p>
          </div>
        </div>
      )}

      {/* People Tab */}
      {activeTab === 'people' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">👥 Your People</h3>
            <AddPersonButton onAdd={handleAddPerson} />
          </div>
          
          {people.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No people added yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {people.map((person) => (
                <PersonCard key={person.id} person={person} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Interactions Tab */}
      {activeTab === 'interactions' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">💬 Recent Interactions</h3>
            <AddInteractionButton people={people} onAdd={handleAddInteraction} />
          </div>
          
          {interactions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No interactions logged yet</p>
          ) : (
            <div className="space-y-3">
              {interactions.map((interaction) => {
                const person = people[interaction.person_id] || {};
                return (
                  <div key={interaction.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <span className="text-2xl">{getInteractionEmoji(interaction.interaction_type)}</span>
                    <div className="flex-1">
                      <p className="font-medium">{person.name || 'Unknown'}</p>
                      <p className="text-sm text-gray-600">{interaction.summary}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(interaction.date).toLocaleDateString()}
                        {interaction.mood_after && ` • Mood: ${interaction.mood_after}/5`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Important Dates Tab */}
      {activeTab === 'dates' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">📅 Upcoming Important Dates</h3>
            <AddImportantDateButton people={people} onAdd={handleAddImportantDate} />
          </div>
          
          {importantDates.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No important dates added yet</p>
          ) : (
            <div className="space-y-3">
              {importantDates.map((date) => {
                const person = people.find(p => p.id === date.person_id);
                return (
                  <div key={date.id} className="flex items-center justify-between p-4 bg-pink-50 rounded-lg border border-pink-100">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getDateEmoji(date.date_type)}</span>
                      <div>
                        <p className="font-medium">{date.title}</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(date.date)}
                          {person && ` • ${person.name}`}
                        </p>
                      </div>
                    </div>
                    {date.recurring && (
                      <span className="text-xs bg-pink-200 text-pink-700 px-2 py-1 rounded">Recurring</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SummaryCard({ title, value, icon, alert }) {
  return (
    <div className={`p-4 rounded-xl border ${alert ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{title}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <p className={`text-2xl font-bold mt-1 ${alert ? 'text-yellow-700' : ''}`}>{value}</p>
    </div>
  );
}

function PersonCard({ person }) {
  const healthColors = {
    flourishing: 'bg-green-100 text-green-700',
    healthy: 'bg-blue-100 text-blue-700',
    struggling: 'bg-yellow-100 text-yellow-700',
    neglected: 'bg-red-100 text-red-700',
    new: 'bg-gray-100 text-gray-700',
  };
  
  const typeEmojis = {
    family: '👨‍👩‍👧',
    friend: '🤝',
    romantic: '💕',
    colleague: '💼',
    mentor: '🎓',
    client: '🤝',
    other: '👤',
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{typeEmojis[person.relationship_type] || '👤'}</span>
          <div>
            <h4 className="font-semibold">{person.name}</h4>
            <p className="text-sm text-gray-500 capitalize">{person.relationship_type}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded text-xs ${healthColors[person.health] || healthColors.new}`}>
          {person.health}
        </span>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Importance</span>
          <div className="flex items-center gap-1">
            {'⭐'.repeat(person.importance)}
          </div>
        </div>
        {person.last_interaction && (
          <p className="text-xs text-gray-400 mt-2">
            Last contact: {person.last_interaction}
          </p>
        )}
        {person.birthday && (
          <p className="text-xs text-gray-400">🎂 {person.birthday}</p>
        )}
      </div>
    </div>
  );
}

function AddPersonButton({ onAdd }) {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    relationship_type: 'friend',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onAdd(formData);
    setShowModal(false);
    setFormData({ name: '', relationship_type: 'friend' });
  };

  return (
    <>
      <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600">
        + Add Person
      </button>
      {showModal && (
        <Modal title="Add Person" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg"
              required
            />
            <select
              value={formData.relationship_type}
              onChange={(e) => setFormData({ ...formData, relationship_type: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="family">Family</option>
              <option value="friend">Friend</option>
              <option value="romantic">Romantic</option>
              <option value="colleague">Colleague</option>
              <option value="mentor">Mentor</option>
              <option value="client">Client</option>
            </select>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 px-4 py-2 bg-pink-500 text-white rounded-lg">Add</button>
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

function AddInteractionButton({ people, onAdd }) {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    person_id: 0,
    interaction_type: 'call',
    summary: '',
    mood_after: 4,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onAdd(formData);
    setShowModal(false);
    setFormData({ person_id: 0, interaction_type: 'call', summary: '', mood_after: 4 });
  };

  return (
    <>
      <button onClick={() => setShowModal(true)} className="text-pink-500 hover:underline">
        + Log Interaction
      </button>
      {showModal && (
        <Modal title="Log Interaction" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <select
              value={formData.person_id}
              onChange={(e) => setFormData({ ...formData, person_id: parseInt(e.target.value) })}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              {people.map((p, i) => (
                <option key={p.id} value={i}>{p.name}</option>
              ))}
            </select>
            <select
              value={formData.interaction_type}
              onChange={(e) => setFormData({ ...formData, interaction_type: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="call">📞 Call</option>
              <option value="text">💬 Text</option>
              <option value="email">📧 Email</option>
              <option value="in_person">🤝 In Person</option>
              <option value="video">📹 Video</option>
            </select>
            <input
              type="text"
              placeholder="What did you talk about?"
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg"
              required
            />
            <div>
              <label className="block text-sm mb-1">How did you feel after?</label>
              <input
                type="range"
                min="1"
                max="5"
                value={formData.mood_after}
                onChange={(e) => setFormData({ ...formData, mood_after: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>1</span>
                <span>5</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 px-4 py-2 bg-pink-500 text-white rounded-lg">Log</button>
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

function AddImportantDateButton({ people, onAdd }) {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    date_type: 'birthday',
    person_id: '',
    recurring: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onAdd({
      ...formData,
      person_id: formData.person_id ? parseInt(formData.person_id) : null,
    });
    setShowModal(false);
    setFormData({ title: '', date: '', date_type: 'birthday', person_id: '', recurring: true });
  };

  return (
    <>
      <button onClick={() => setShowModal(true)} className="text-pink-500 hover:underline">
        + Add Date
      </button>
      {showModal && (
        <Modal title="Add Important Date" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Event title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg"
              required
            />
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg"
              required
            />
            <select
              value={formData.date_type}
              onChange={(e) => setFormData({ ...formData, date_type: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="birthday">🎂 Birthday</option>
              <option value="anniversary">💕 Anniversary</option>
              <option value="holiday">🎄 Holiday</option>
              <option value="other">📅 Other</option>
            </select>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.recurring}
                onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
              />
              <span>Recurring yearly</span>
            </label>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 px-4 py-2 bg-pink-500 text-white rounded-lg">Add</button>
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

function getInteractionEmoji(type) {
  const emojis = {
    call: '📞',
    text: '💬',
    email: '📧',
    in_person: '🤝',
    video: '📹',
    social_media: '📱',
    meeting: '🏢',
  };
  return emojis[type] || '💬';
}

function getDateEmoji(type) {
  const emojis = {
    birthday: '🎂',
    anniversary: '💕',
    holiday: '🎄',
    other: '📅',
  };
  return emojis[type] || '📅';
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
}

export default RelationshipsDashboard;
