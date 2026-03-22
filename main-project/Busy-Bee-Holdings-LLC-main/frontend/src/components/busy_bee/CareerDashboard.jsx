import { useState, useEffect } from 'react';
import { BusyBee } from '../../lib/busy_bee';

/**
 * CareerDashboard Component
 * 
 * Connects to the Career Cell and displays career data.
 */
export function CareerDashboard({ periodDays = 30 }) {
  const [summary, setSummary] = useState(null);
  const [skills, setSkills] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [summaryData, skillsData, jobsData, certsData, goalsData] = await Promise.all([
          BusyBee.Career.getSummary({ periodDays }),
          BusyBee.Career.getSkills(),
          BusyBee.Career.getJobs(),
          BusyBee.Career.getCertifications(),
          BusyBee.Career.getCareerGoals(),
        ]);
        setSummary(summaryData);
        setSkills(skillsData);
        setJobs(jobsData);
        setCertifications(certsData);
        setGoals(goalsData);
      } catch (err) {
        console.error('Failed to load career data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [periodDays]);

  const handleAddSkill = async (data) => {
    const skill = await BusyBee.Career.addSkill(data);
    setSkills([...skills, skill]);
    return skill;
  };

  const handleAddJob = async (data) => {
    const job = await BusyBee.Career.addJob(data);
    setJobs([job, ...jobs]);
    return job;
  };

  const handleAddGoal = async (data) => {
    const goal = await BusyBee.Career.addCareerGoal(data);
    setGoals([goal, ...goals]);
    return goal;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
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
          <h2 className="text-2xl font-bold text-gray-900">💼 Career</h2>
          <p className="text-sm text-gray-500">Track your professional growth</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1 rounded-lg ${activeTab === 'overview' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-3 py-1 rounded-lg ${activeTab === 'jobs' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          >
            Jobs
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`px-3 py-1 rounded-lg ${activeTab === 'skills' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          >
            Skills
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard
          title="Job Applications"
          value={summary?.total_applications || 0}
          icon="📝"
          subtitle="Active applications"
        />
        <SummaryCard
          title="Skills"
          value={summary?.total_skills || 0}
          icon="🎯"
          subtitle="On your profile"
        />
        <SummaryCard
          title="Certifications"
          value={summary?.active_certifications || 0}
          icon="📜"
          subtitle="Active"
        />
        <SummaryCard
          title="Career Goals"
          value={`${summary?.goals_completed || 0}/${summary?.career_goals || 0}`}
          icon="🏆"
          subtitle="Completed"
        />
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Skills by Level */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">🎯 Skills by Level</h3>
              <AddSkillButton onAdd={handleAddSkill} />
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <SkillBadge key={skill.id} skill={skill} />
              ))}
              {skills.length === 0 && (
                <p className="text-gray-500">No skills added yet</p>
              )}
            </div>
          </div>

          {/* Career Goals */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">🎯 Career Goals</h3>
              <AddGoalButton onAdd={handleAddGoal} />
            </div>
            <div className="space-y-3">
              {goals.map((goal) => (
                <GoalRow key={goal.id} goal={goal} />
              ))}
              {goals.length === 0 && (
                <p className="text-gray-500">No career goals set yet</p>
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === 'jobs' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">📝 Job Applications</h3>
            <AddJobButton onAdd={handleAddJob} />
          </div>
          <div className="space-y-3">
            {jobs.map((job) => (
              <JobRow key={job.id} job={job} />
            ))}
            {jobs.length === 0 && (
              <p className="text-gray-500">No job applications yet</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'skills' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">🎯 All Skills</h3>
            <AddSkillButton onAdd={handleAddSkill} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skills.map((skill) => (
              <div key={skill.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{skill.name}</p>
                    <p className="text-sm text-gray-500 capitalize">{skill.category}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    skill.level === 'expert' ? 'bg-purple-100 text-purple-700' :
                    skill.level === 'advanced' ? 'bg-blue-100 text-blue-700' :
                    skill.level === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {skill.level}
                  </span>
                </div>
                {skill.years_experience && (
                  <p className="text-xs text-gray-400 mt-2">{skill.years_experience} years experience</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">📜 Certifications</h3>
        <div className="space-y-3">
          {certifications.map((cert) => (
            <div key={cert.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div>
                <p className="font-medium">{cert.name}</p>
                <p className="text-sm text-gray-500">{cert.provider} • {cert.issue_date}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs ${
                cert.status === 'completed' ? 'bg-green-100 text-green-700' :
                cert.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {cert.status.replace('_', ' ')}
              </span>
            </div>
          ))}
          {certifications.length === 0 && (
            <p className="text-gray-500">No certifications yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon, subtitle }) {
  return (
    <div className="p-4 rounded-xl border bg-gray-50 border-gray-200">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{title}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <p className="text-2xl font-bold mt-1">{value}</p>
      <p className="text-xs text-gray-400">{subtitle}</p>
    </div>
  );
}

function SkillBadge({ skill }) {
  const colors = {
    tech: 'bg-blue-100 text-blue-700',
    soft: 'bg-purple-100 text-purple-700',
    language: 'bg-green-100 text-green-700',
  };
  
  return (
    <span className={`px-3 py-1 rounded-full text-sm ${colors[skill.category] || 'bg-gray-100'}`}>
      {skill.name}
    </span>
  );
}

function GoalRow({ goal }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex-1">
        <p className="font-medium">{goal.title}</p>
        <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 rounded-full"
            style={{ width: `${goal.progress}%` }}
          />
        </div>
      </div>
      <span className="ml-4 text-sm text-gray-500">{goal.progress}%</span>
    </div>
  );
}

function JobRow({ job }) {
  const statusColors = {
    applied: 'bg-gray-100 text-gray-700',
    screening: 'bg-yellow-100 text-yellow-700',
    interview: 'bg-blue-100 text-blue-700',
    offer: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  };
  
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div>
        <p className="font-medium">{job.position}</p>
        <p className="text-sm text-gray-500">{job.company} • {job.location}</p>
      </div>
      <span className={`px-2 py-1 rounded text-xs capitalize ${statusColors[job.status]}`}>
        {job.status}
      </span>
    </div>
  );
}

function AddSkillButton({ onAdd }) {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', category: 'tech', level: 'intermediate' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onAdd(formData);
    setShowModal(false);
    setFormData({ name: '', category: 'tech', level: 'intermediate' });
  };

  return (
    <>
      <button onClick={() => setShowModal(true)} className="text-blue-500 hover:underline text-sm">
        + Add Skill
      </button>
      {showModal && (
        <Modal title="Add Skill" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Skill name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg"
              required
            />
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="tech">Tech</option>
              <option value="soft">Soft Skill</option>
              <option value="language">Language</option>
            </select>
            <select
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg">
                Add
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

function AddJobButton({ onAdd }) {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    location: '',
    status: 'applied',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onAdd(formData);
    setShowModal(false);
    setFormData({ company: '', position: '', location: '', status: 'applied' });
  };

  return (
    <>
      <button onClick={() => setShowModal(true)} className="text-blue-500 hover:underline text-sm">
        + Add Application
      </button>
      {showModal && (
        <Modal title="Add Job Application" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg"
              required
            />
            <input
              type="text"
              placeholder="Position"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg"
              required
            />
            <input
              type="text"
              placeholder="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
            <div className="flex gap-2">
              <button type="submit" className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg">
                Add
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

function AddGoalButton({ onAdd }) {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', category: 'skill', status: 'active', progress: 0 });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onAdd(formData);
    setShowModal(false);
    setFormData({ title: '', category: 'skill', status: 'active', progress: 0 });
  };

  return (
    <>
      <button onClick={() => setShowModal(true)} className="text-blue-500 hover:underline text-sm">
        + Add Goal
      </button>
      {showModal && (
        <Modal title="Add Career Goal" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Goal title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg"
              required
            />
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="skill">Skill</option>
              <option value="certification">Certification</option>
              <option value="job">Job</option>
              <option value="networking">Networking</option>
            </select>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg">
                Add
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

export default CareerDashboard;
