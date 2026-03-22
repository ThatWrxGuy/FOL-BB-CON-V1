"""Relationships cell - Social connections and relationship tracking.

This cell contains all relationship domain logic and is independently testable.
Tracks people, interactions, important dates, and relationship health.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime, date, timedelta
from enum import Enum
from pydantic import BaseModel, Field
import uuid


class RelationshipType(str, Enum):
    """Types of relationships."""
    FAMILY = "family"
    FRIEND = "friend"
    ROMANTIC = "romantic"
    COLLEAGUE = "colleague"
    MENTOR = "mentor"
    CLIENT = "client"
    OTHER = "other"


class InteractionType(str, Enum):
    """Types of interactions."""
    CALL = "call"
    TEXT = "text"
    EMAIL = "email"
    IN_PERSON = "in_person"
    VIDEO = "video"
    SOCIAL_MEDIA = "social_media"
    MEETING = "meeting"


class RelationshipHealth(str, Enum):
    """Relationship health status."""
    FLOURISHING = "flourishing"
    HEALTHY = "healthy"
    STRUGGLING = "struggling"
    NEGLECTED = "neglected"
    NEW = "new"


class Person(BaseModel):
    """Person/contact model."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    workspace_id: str = Field(..., description="Workspace boundary")
    user_id: str = Field(..., description="User")
    name: str = Field(..., description="Person's name")
    relationship_type: RelationshipType = Field(..., description="Type of relationship")
    nickname: Optional[str] = Field(None, description="Nickname")
    email: Optional[str] = Field(None, description="Email")
    phone: Optional[str] = Field(None, description="Phone")
    birthday: Optional[date] = Field(None, description="Birthday")
    anniversary: Optional[date] = Field(None, description="Anniversary")
    company: Optional[str] = Field(None, description="Company")
    role: Optional[str] = Field(None, description="Role/Job")
    notes: Optional[str] = Field(None, description="Notes")
    tags: List[str] = Field(default_factory=list, description="Tags")
    health: RelationshipHealth = Field(default=RelationshipHealth.NEW, description="Relationship health")
    importance: int = Field(default=5, description="Importance 1-10")
    last_interaction: Optional[date] = Field(None, description="Last interaction date")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        use_enum_values = True


class Interaction(BaseModel):
    """Interaction/activity with someone."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    workspace_id: str = Field(..., description="Workspace boundary")
    user_id: str = Field(..., description="User")
    person_id: str = Field(..., description="Person ID")
    interaction_type: InteractionType = Field(..., description="Type of interaction")
    summary: str = Field(..., description="Interaction summary")
    notes: Optional[str] = Field(None, description="Detailed notes")
    mood_after: Optional[int] = Field(None, description="Mood after (1-5)")
    date: datetime = Field(default_factory=datetime.utcnow)
    duration_minutes: Optional[int] = Field(None, description="Duration")
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        use_enum_values = True


class ImportantDate(BaseModel):
    """Important date to remember."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    workspace_id: str = Field(..., description="Workspace boundary")
    user_id: str = Field(..., description="User")
    person_id: Optional[str] = Field(None, description="Related person ID")
    title: str = Field(..., description="Event title")
    date_type: str = Field(..., description="birthday, anniversary, holiday, etc")
    date: date = Field(..., description="The date")
    recurring: bool = Field(default=True, description="Recurring yearly")
    reminder_days: int = Field(default=7, description="Days before to remind")
    notes: Optional[str] = Field(None, description="Notes")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class RelationshipGoal(BaseModel):
    """Goal related to relationships."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    workspace_id: str = Field(..., description="Workspace boundary")
    user_id: str = Field(..., description="User")
    title: str = Field(..., description="Goal title")
    description: Optional[str] = Field(None, description="Description")
    person_id: Optional[str] = Field(None, description="Related person ID")
    target_date: Optional[date] = Field(None, description="Target date")
    status: str = Field(default="active", description="Status")
    progress: int = Field(default=0, description="Progress 0-100")
    category: str = Field(..., description="Category: connect, deepen, reconnect")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class RelationshipsSummary(BaseModel):
    """Relationships summary report."""
    workspace_id: str
    user_id: str
    period_days: int
    total_people: int = 0
    by_type: Dict[str, int] = Field(default_factory=dict)
    total_interactions: int = 0
    avg_mood_after: float = 0.0
    neglected_relationships: int = 0
    upcoming_important_dates: int = 0
    active_goals: int = 0
    goals_completed: int = 0


class RelationshipsCell:
    """Relationships cell - Reusable relationship intelligence core.
    
    This cell provides:
    - People/contacts management
    - Interaction tracking
    - Important dates
    - Relationship goals
    - Relationship health insights
    """
    
    def __init__(self):
        self._people: Dict[str, List[Person]] = {}
        self._interactions: Dict[str, List[Interaction]] = {}
        self._important_dates: Dict[str, List[ImportantDate]] = {}
        self._goals: Dict[str, List[RelationshipGoal]] = {}
    
    # ==================== People ====================
    
    def add_person(
        self,
        workspace_id: str,
        user_id: str,
        name: str,
        relationship_type: RelationshipType,
        **kwargs
    ) -> Person:
        """Add a person to track."""
        person = Person(
            workspace_id=workspace_id,
            user_id=user_id,
            name=name,
            relationship_type=relationship_type,
            **kwargs
        )
        
        key = f"{workspace_id}:{user_id}"
        if key not in self._people:
            self._people[key] = []
        self._people[key].append(person)
        return person
    
    def get_people(
        self,
        workspace_id: str,
        user_id: str,
        relationship_type: Optional[RelationshipType] = None,
        health: Optional[RelationshipHealth] = None
    ) -> List[Person]:
        """Get all people."""
        key = f"{workspace_id}:{user_id}"
        people = self._people.get(key, [])
        
        if relationship_type:
            people = [p for p in people if p.relationship_type == relationship_type]
        if health:
            people = [p for p in people if p.health == health]
            
        return sorted(people, key=lambda p: p.importance, reverse=True)
    
    def get_person(self, workspace_id: str, user_id: str, person_id: str) -> Optional[Person]:
        """Get a specific person."""
        key = f"{workspace_id}:{user_id}"
        people = self._people.get(key, [])
        for person in people:
            if person.id == person_id:
                return person
        return None
    
    def update_person(
        self,
        workspace_id: str,
        user_id: str,
        person_id: str,
        **updates
    ) -> Optional[Person]:
        """Update a person."""
        key = f"{workspace_id}:{user_id}"
        people = self._people.get(key, [])
        for person in people:
            if person.id == person_id:
                for field, value in updates.items():
                    if hasattr(person, field):
                        setattr(person, field, value)
                return person
        return None
    
    def delete_person(self, workspace_id: str, user_id: str, person_id: str) -> bool:
        """Delete a person."""
        key = f"{workspace_id}:{user_id}"
        people = self._people.get(key, [])
        for i, person in enumerate(people):
            if person.id == person_id:
                del people[i]
                return True
        return False
    
    # ==================== Interactions ====================
    
    def log_interaction(
        self,
        workspace_id: str,
        user_id: str,
        person_id: str,
        interaction_type: InteractionType,
        summary: str,
        **kwargs
    ) -> Interaction:
        """Log an interaction."""
        interaction = Interaction(
            workspace_id=workspace_id,
            user_id=user_id,
            person_id=person_id,
            interaction_type=interaction_type,
            summary=summary,
            **kwargs
        )
        
        key = f"{workspace_id}:{user_id}"
        if key not in self._interactions:
            self._interactions[key] = []
        self._interactions[key].append(interaction)
        
        # Update person's last interaction
        self.update_person(
            workspace_id, 
            user_id, 
            person_id, 
            last_interaction=date.today()
        )
        
        return interaction
    
    def get_interactions(
        self,
        workspace_id: str,
        user_id: str,
        person_id: Optional[str] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[Interaction]:
        """Get interactions."""
        key = f"{workspace_id}:{user_id}"
        interactions = self._interactions.get(key, [])
        
        if person_id:
            interactions = [i for i in interactions if i.person_id == person_id]
        if start_date:
            interactions = [i for i in interactions if i.date.date() >= start_date]
        if end_date:
            interactions = [i for i in interactions if i.date.date() <= end_date]
            
        return sorted(interactions, key=lambda i: i.date, reverse=True)
    
    def get_recent_interactions(
        self,
        workspace_id: str,
        user_id: str,
        limit: int = 10
    ) -> List[Interaction]:
        """Get recent interactions."""
        return self.get_interactions(workspace_id, user_id)[:limit]
    
    # ==================== Important Dates ====================
    
    def add_important_date(
        self,
        workspace_id: str,
        user_id: str,
        title: str,
        date: date,
        date_type: str,
        **kwargs
    ) -> ImportantDate:
        """Add an important date."""
        important_date = ImportantDate(
            workspace_id=workspace_id,
            user_id=user_id,
            title=title,
            date=date,
            date_type=date_type,
            **kwargs
        )
        
        key = f"{workspace_id}:{user_id}"
        if key not in self._important_dates:
            self._important_dates[key] = []
        self._important_dates[key].append(important_date)
        return important_date
    
    def get_important_dates(
        self,
        workspace_id: str,
        user_id: str,
        days_ahead: int = 30,
        person_id: Optional[str] = None
    ) -> List[ImportantDate]:
        """Get upcoming important dates."""
        key = f"{workspace_id}:{user_id}"
        dates = self._important_dates.get(key, [])
        
        today = date.today()
        end_date = today + timedelta(days=days_ahead)
        
        upcoming = []
        for d in dates:
            # Handle recurring dates
            check_date = d.date
            if d.recurring:
                # For recurring, check this year's date
                check_date = date(today.year, d.date.month, d.date.day)
                if check_date < today:
                    check_date = date(today.year + 1, d.date.month, d.date.day)
            
            if check_date >= today and check_date <= end_date:
                if person_id is None or d.person_id == person_id:
                    upcoming.append(d)
        
        return sorted(upcoming, key=lambda d: d.date)
    
    def get_important_dates_for_person(
        self,
        workspace_id: str,
        user_id: str,
        person_id: str
    ) -> List[ImportantDate]:
        """Get all important dates for a person."""
        key = f"{workspace_id}:{user_id}"
        dates = self._important_dates.get(key, [])
        return [d for d in dates if d.person_id == person_id]
    
    # ==================== Goals ====================
    
    def add_relationship_goal(
        self,
        workspace_id: str,
        user_id: str,
        title: str,
        category: str,
        **kwargs
    ) -> RelationshipGoal:
        """Add a relationship goal."""
        goal = RelationshipGoal(
            workspace_id=workspace_id,
            user_id=user_id,
            title=title,
            category=category,
            **kwargs
        )
        
        key = f"{workspace_id}:{user_id}"
        if key not in self._goals:
            self._goals[key] = []
        self._goals[key].append(goal)
        return goal
    
    def get_relationship_goals(
        self,
        workspace_id: str,
        user_id: str,
        status: Optional[str] = None,
        person_id: Optional[str] = None
    ) -> List[RelationshipGoal]:
        """Get relationship goals."""
        key = f"{workspace_id}:{user_id}"
        goals = self._goals.get(key, [])
        
        if status:
            goals = [g for g in goals if g.status == status]
        if person_id:
            goals = [g for g in goals if g.person_id == person_id]
            
        return sorted(goals, key=lambda g: g.created_at, reverse=True)
    
    def update_goal_progress(
        self,
        workspace_id: str,
        user_id: str,
        goal_id: str,
        progress: int
    ) -> Optional[RelationshipGoal]:
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
    
    def get_relationships_summary(
        self,
        workspace_id: str,
        user_id: str,
        period_days: int = 30
    ) -> RelationshipsSummary:
        """Generate relationships summary."""
        people = self.get_people(workspace_id, user_id)
        
        # Count by type
        by_type = {}
        for person in people:
            by_type[person.relationship_type] = by_type.get(person.relationship_type, 0) + 1
        
        # Interactions
        end_date = date.today()
        start_date = end_date - timedelta(days=period_days)
        interactions = self.get_interactions(workspace_id, user_id, start_date=start_date, end_date=end_date)
        
        # Average mood
        moods = [i.mood_after for i in interactions if i.mood_after is not None]
        avg_mood = sum(moods) / len(moods) if moods else 0
        
        # Neglected relationships (no interaction in 30 days)
        neglected = len([p for p in people if p.last_interaction and 
                       (date.today() - p.last_interaction).days > 30])
        
        # Upcoming important dates
        upcoming_dates = self.get_important_dates(workspace_id, user_id, days_ahead=30)
        
        # Goals
        goals = self.get_relationship_goals(workspace_id, user_id)
        active_goals = len([g for g in goals if g.status == "active"])
        goals_completed = len([g for g in goals if g.status == "completed"])
        
        return RelationshipsSummary(
            workspace_id=workspace_id,
            user_id=user_id,
            period_days=period_days,
            total_people=len(people),
            by_type=by_type,
            total_interactions=len(interactions),
            avg_mood_after=avg_mood,
            neglected_relationships=neglected,
            upcoming_important_dates=len(upcoming_dates),
            active_goals=active_goals,
            goals_completed=goals_completed
        )
