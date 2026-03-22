"""Career cell - Professional development tracking.

This cell contains all career domain logic and is independently testable.
Tracks skills, jobs, certifications, networking, and career goals.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime, date, timedelta
from enum import Enum
from pydantic import BaseModel, Field
import uuid


class EmploymentType(str, Enum):
    """Types of employment."""
    FULL_TIME = "full_time"
    PART_TIME = "part_time"
    CONTRACT = "contract"
    FREELANCE = "freelance"
    INTERNSHIP = "internship"
    SELF_EMPLOYED = "self_employed"


class JobStatus(str, Enum):
    """Job application status."""
    APPLIED = "applied"
    SCREENING = "screening"
    INTERVIEW = "interview"
    OFFER = "offer"
    REJECTED = "rejected"
    ACCEPTED = "accepted"
    WITHDRAWN = "withdrawn"


class SkillLevel(str, Enum):
    """Skill proficiency levels."""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"


class CertificationStatus(str, Enum):
    """Certification status."""
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    EXPIRED = "expired"
    RENEWAL_DUE = "renewal_due"


class Job(BaseModel):
    """Job application model."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    workspace_id: str = Field(..., description="Workspace boundary")
    user_id: str = Field(..., description="User")
    company: str = Field(..., description="Company name")
    position: str = Field(..., description="Job position")
    location: Optional[str] = Field(None, description="Job location")
    employment_type: Optional[EmploymentType] = Field(None, description="Employment type")
    salary_min: Optional[int] = Field(None, description="Minimum salary")
    salary_max: Optional[int] = Field(None, description="Maximum salary")
    status: JobStatus = Field(..., description="Application status")
    applied_date: date = Field(default_factory=date.today)
    notes: Optional[str] = Field(None, description="Notes")
    job_url: Optional[str] = Field(None, description="Job posting URL")
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        use_enum_values = True


class Skill(BaseModel):
    """Skill model."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    workspace_id: str = Field(..., description="Workspace boundary")
    user_id: str = Field(..., description="User")
    name: str = Field(..., description="Skill name")
    category: str = Field(..., description="Skill category (tech, soft, language)")
    level: SkillLevel = Field(..., description="Proficiency level")
    years_experience: Optional[float] = Field(None, description="Years of experience")
    last_used: Optional[date] = Field(None, description="Last used date")
    notes: Optional[str] = Field(None, description="Notes")
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        use_enum_values = True


class Certification(BaseModel):
    """Certification model."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    workspace_id: str = Field(..., description="Workspace boundary")
    user_id: str = Field(..., description="User")
    name: str = Field(..., description="Certification name")
    provider: str = Field(..., description="Certification provider")
    issue_date: date = Field(..., description="Date issued")
    expiry_date: Optional[date] = Field(None, description="Expiry date")
    status: CertificationStatus = Field(..., description="Status")
    credential_id: Optional[str] = Field(None, description="Credential ID")
    credential_url: Optional[str] = Field(None, description="Credential URL")
    notes: Optional[str] = Field(None, description="Notes")
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        use_enum_values = True


class NetworkingContact(BaseModel):
    """Networking contact model."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    workspace_id: str = Field(..., description="Workspace boundary")
    user_id: str = Field(..., description="User (who made the connection)")
    contact_name: str = Field(..., description="Contact name")
    company: Optional[str] = Field(None, description="Contact's company")
    role: Optional[str] = Field(None, description="Contact's role")
    email: Optional[str] = Field(None, description="Email")
    linkedin_url: Optional[str] = Field(None, description="LinkedIn URL")
    met_through: Optional[str] = Field(None, description="How you met")
    last_contacted: Optional[date] = Field(None, description="Last contact date")
    notes: Optional[str] = Field(None, description="Notes")
    metadata: Dict[str, Any] = Field(default_factory=dict)


class CareerGoal(BaseModel):
    """Career goal model."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    workspace_id: str = Field(..., description="Workspace boundary")
    user_id: str = Field(..., description="User")
    title: str = Field(..., description="Goal title")
    description: Optional[str] = Field(None, description="Goal description")
    target_date: Optional[date] = Field(None, description="Target completion date")
    status: str = Field(default="active", description="Status (active, completed, paused)")
    progress: int = Field(default=0, description="Progress 0-100")
    category: str = Field(..., description="Category (promotion, skill, job, certification)")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class CareerSummary(BaseModel):
    """Career summary report."""
    workspace_id: str
    user_id: str
    period_days: int
    total_applications: int = 0
    applications_by_status: Dict[str, int] = Field(default_factory=dict)
    total_skills: int = 0
    skills_by_level: Dict[str, int] = Field(default_factory=dict)
    active_certifications: int = 0
    networking_contacts: int = 0
    career_goals: int = 0
    goals_completed: int = 0


class CareerCell:
    """Career cell - Reusable career intelligence core.
    
    This cell provides:
    - Job application tracking
    - Skills management
    - Certification tracking
    - Networking contacts
    - Career goals
    - Career summary generation
    """
    
    def __init__(self):
        self._jobs: Dict[str, List[Job]] = {}
        self._skills: Dict[str, List[Skill]] = {}
        self._certifications: Dict[str, List[Certification]] = {}
        self._contacts: Dict[str, List[NetworkingContact]] = {}
        self._goals: Dict[str, List[CareerGoal]] = {}
    
    # ==================== Jobs ====================
    
    def add_job(self, workspace_id: str, user_id: str, job: Job) -> Job:
        """Add a job application."""
        job.workspace_id = workspace_id
        job.user_id = user_id
        key = f"{workspace_id}:{user_id}"
        if key not in self._jobs:
            self._jobs[key] = []
        self._jobs[key].append(job)
        return job
    
    def get_jobs(
        self,
        workspace_id: str,
        user_id: str,
        status: Optional[JobStatus] = None
    ) -> List[Job]:
        """Get job applications."""
        key = f"{workspace_id}:{user_id}"
        jobs = self._jobs.get(key, [])
        if status:
            jobs = [j for j in jobs if j.status == status]
        return sorted(jobs, key=lambda j: j.applied_date, reverse=True)
    
    def update_job_status(self, workspace_id: str, user_id: str, job_id: str, status: JobStatus) -> Optional[Job]:
        """Update job application status."""
        key = f"{workspace_id}:{user_id}"
        jobs = self._jobs.get(key, [])
        for job in jobs:
            if job.id == job_id:
                job.status = status
                return job
        return None
    
    # ==================== Skills ====================
    
    def add_skill(self, workspace_id: str, user_id: str, skill: Skill) -> Skill:
        """Add a skill."""
        skill.workspace_id = workspace_id
        skill.user_id = user_id
        key = f"{workspace_id}:{user_id}"
        if key not in self._skills:
            self._skills[key] = []
        self._skills[key].append(skill)
        return skill
    
    def get_skills(
        self,
        workspace_id: str,
        user_id: str,
        category: Optional[str] = None,
        level: Optional[SkillLevel] = None
    ) -> List[Skill]:
        """Get skills."""
        key = f"{workspace_id}:{user_id}"
        skills = self._skills.get(key, [])
        if category:
            skills = [s for s in skills if s.category == category]
        if level:
            skills = [s for s in skills if s.level == level]
        return sorted(skills, key=lambda s: s.name)
    
    def update_skill_level(self, workspace_id: str, user_id: str, skill_id: str, level: SkillLevel) -> Optional[Skill]:
        """Update skill level."""
        key = f"{workspace_id}:{user_id}"
        skills = self._skills.get(key, [])
        for skill in skills:
            if skill.id == skill_id:
                skill.level = level
                return skill
        return None
    
    # ==================== Certifications ====================
    
    def add_certification(self, workspace_id: str, user_id: str, cert: Certification) -> Certification:
        """Add a certification."""
        cert.workspace_id = workspace_id
        cert.user_id = user_id
        key = f"{workspace_id}:{user_id}"
        if key not in self._certifications:
            self._certifications[key] = []
        self._certifications[key].append(cert)
        return cert
    
    def get_certifications(
        self,
        workspace_id: str,
        user_id: str,
        status: Optional[CertificationStatus] = None
    ) -> List[Certification]:
        """Get certifications."""
        key = f"{workspace_id}:{user_id}"
        certs = self._certifications.get(key, [])
        if status:
            certs = [c for c in certs if c.status == status]
        return sorted(certs, key=lambda c: c.issue_date, reverse=True)
    
    # ==================== Networking ====================
    
    def add_contact(self, workspace_id: str, user_id: str, contact: NetworkingContact) -> NetworkingContact:
        """Add a networking contact."""
        contact.workspace_id = workspace_id
        contact.user_id = user_id
        key = f"{workspace_id}:{user_id}"
        if key not in self._contacts:
            self._contacts[key] = []
        self._contacts[key].append(contact)
        return contact
    
    def get_contacts(
        self,
        workspace_id: str,
        user_id: str,
        company: Optional[str] = None
    ) -> List[NetworkingContact]:
        """Get networking contacts."""
        key = f"{workspace_id}:{user_id}"
        contacts = self._contacts.get(key, [])
        if company:
            contacts = [c for c in contacts if c.company == company]
        return sorted(contacts, key=lambda c: c.contact_name)
    
    # ==================== Goals ====================
    
    def add_career_goal(self, workspace_id: str, user_id: str, goal: CareerGoal) -> CareerGoal:
        """Add a career goal."""
        goal.workspace_id = workspace_id
        goal.user_id = user_id
        key = f"{workspace_id}:{user_id}"
        if key not in self._goals:
            self._goals[key] = []
        self._goals[key].append(goal)
        return goal
    
    def get_career_goals(
        self,
        workspace_id: str,
        user_id: str,
        status: Optional[str] = None
    ) -> List[CareerGoal]:
        """Get career goals."""
        key = f"{workspace_id}:{user_id}"
        goals = self._goals.get(key, [])
        if status:
            goals = [g for g in goals if g.status == status]
        return sorted(goals, key=lambda g: g.created_at, reverse=True)
    
    def update_goal_progress(self, workspace_id: str, user_id: str, goal_id: str, progress: int) -> Optional[CareerGoal]:
        """Update goal progress."""
        key = f"{workspace_id}:{user_id}"
        goals = self._goals.get(key, [])
        for goal in goals:
            if goal.id == goal_id:
                goal.progress = min(100, max(0, progress))
                if goal.progress >= 100:
                    goal.status = "completed"
                return goal
        return None
    
    # ==================== Summary ====================
    
    def get_career_summary(
        self,
        workspace_id: str,
        user_id: str,
        period_days: int = 30
    ) -> CareerSummary:
        """Generate career summary."""
        jobs = self.get_jobs(workspace_id, user_id)
        skills = self.get_skills(workspace_id, user_id)
        certs = self.get_certifications(workspace_id, user_id)
        contacts = self.get_contacts(workspace_id, user_id)
        goals = self.get_career_goals(workspace_id, user_id)
        
        # Applications by status
        applications_by_status = {}
        for job in jobs:
            applications_by_status[job.status] = applications_by_status.get(job.status, 0) + 1
        
        # Skills by level
        skills_by_level = {}
        for skill in skills:
            skills_by_level[skill.level] = skills_by_level.get(skill.level, 0) + 1
        
        # Active certifications
        active_certs = [c for c in certs if c.status in ["completed", "in_progress"]]
        
        # Goals completed
        goals_completed = len([g for g in goals if g.status == "completed"])
        
        return CareerSummary(
            workspace_id=workspace_id,
            user_id=user_id,
            period_days=period_days,
            total_applications=len(jobs),
            applications_by_status=applications_by_status,
            total_skills=len(skills),
            skills_by_level=skills_by_level,
            active_certifications=len(active_certs),
            networking_contacts=len(contacts),
            career_goals=len(goals),
            goals_completed=goals_completed
        )
