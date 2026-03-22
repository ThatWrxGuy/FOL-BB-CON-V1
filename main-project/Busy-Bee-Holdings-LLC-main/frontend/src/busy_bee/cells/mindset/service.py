"""Mindset cell - Mental wellness and journaling.

This cell contains all mindset domain logic and is independently testable.
Tracks journaling, mood, gratitude, affirmations, and mindfulness.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime, date, timedelta
from enum import Enum
from pydantic import BaseModel, Field
import uuid


class MoodLevel(str, Enum):
    """Mood intensity levels."""
    TERRIBLE = 1
    BAD = 2
    OKAY = 3
    GOOD = 4
    GREAT = 5


class MoodTag(str, Enum):
    """Mood tags/emotions."""
    HAPPY = "happy"
    SAD = "sad"
    ANXIOUS = "anxious"
    CALM = "calm"
    STRESSED = "stressed"
    GRATEFUL = "grateful"
    MOTIVATED = "motivated"
    TIRED = "tired"
    EXCITED = "excited"
    FRUSTRATED = "frustrated"
    PEACEFUL = "peaceful"
    OVERWHELMED = "overwhelmed"


class JournalEntry(BaseModel):
    """Journal entry model."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    workspace_id: str = Field(..., description="Workspace boundary")
    user_id: str = Field(..., description="User")
    title: Optional[str] = Field(None, description="Entry title")
    content: str = Field(..., description="Journal content")
    mood: Optional[MoodLevel] = Field(None, description="Mood level 1-5")
    mood_tags: List[str] = Field(default_factory=list, description="Mood tags")
    is_gratitude: bool = Field(default=False, description="Is this a gratitude entry?")
    gratitude_items: List[str] = Field(default_factory=list, description="What they're grateful for")
    date: date = Field(default_factory=date.today)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        use_enum_values = True


class Affirmation(BaseModel):
    """Affirmation model."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    workspace_id: str = Field(..., description="Workspace boundary")
    user_id: str = Field(..., description="User")
    text: str = Field(..., description="Affirmation text")
    category: str = Field(default="general", description="Affirmation category")
    is_favorite: bool = Field(default=False, description="Is this a favorite?")
    times_used: int = Field(default=0, description="Times used/recited")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_used: Optional[datetime] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class MindfulnessSession(BaseModel):
    """Mindfulness/meditation session."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    workspace_id: str = Field(..., description="Workspace boundary")
    user_id: str = Field(..., description="User")
    session_type: str = Field(..., description="meditation, breathing, body_scan, etc")
    duration_minutes: int = Field(..., description="Duration in minutes")
    notes: Optional[str] = Field(None, description="Session notes")
    feeling_after: Optional[str] = Field(None, description="How they felt after")
    date: datetime = Field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class Goal(BaseModel):
    """Mindset goal (not career/finance specific)."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    workspace_id: str = Field(..., description="Workspace boundary")
    user_id: str = Field(..., description="User")
    title: str = Field(..., description="Goal title")
    description: Optional[str] = Field(None, description="Goal description")
    category: str = Field(..., description="Category: meditation, gratitude, growth, etc")
    target_date: Optional[date] = Field(None, description="Target date")
    status: str = Field(default="active", description="Status: active, completed, paused")
    progress: int = Field(default=0, description="Progress 0-100")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class MindsetSummary(BaseModel):
    """Mindset summary report."""
    workspace_id: str
    user_id: str
    period_days: int
    journal_entries: int = 0
    gratitude_entries: int = 0
    average_mood: float = 0.0
    top_moods: List[str] = Field(default_factory=list)
    mindfulness_minutes: int = 0
    total_sessions: int = 0
    affirmations_used: int = 0
    active_goals: int = 0
    goals_completed: int = 0


class MindsetCell:
    """Mindset cell - Reusable mindset intelligence core.
    
    This cell provides:
    - Journal entries with mood tracking
    - Gratitude journaling
    - Affirmations
    - Mindfulness/meditation tracking
    - Mindset goals
    """
    
    def __init__(self):
        self._journal: Dict[str, List[JournalEntry]] = {}
        self._affirmations: Dict[str, List[Affirmation]] = {}
        self._mindfulness: Dict[str, List[MindfulnessSession]] = {}
        self._goals: Dict[str, List[Goal]] = {}
    
    # ==================== Journal ====================
    
    def add_journal_entry(
        self, 
        workspace_id: str, 
        user_id: str, 
        title: str,
        content: str,
        mood: Optional[MoodLevel] = None,
        mood_tags: Optional[List[str]] = None,
        is_gratitude: bool = False,
        gratitude_items: Optional[List[str]] = None
    ) -> JournalEntry:
        """Add a journal entry."""
        entry = JournalEntry(
            workspace_id=workspace_id,
            user_id=user_id,
            title=title,
            content=content,
            mood=mood,
            mood_tags=mood_tags or [],
            is_gratitude=is_gratitude,
            gratitude_items=gratitude_items or []
        )
        
        key = f"{workspace_id}:{user_id}"
        if key not in self._journal:
            self._journal[key] = []
        self._journal[key].append(entry)
        return entry
    
    def get_journal_entries(
        self,
        workspace_id: str,
        user_id: str,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        is_gratitude: Optional[bool] = None
    ) -> List[JournalEntry]:
        """Get journal entries."""
        key = f"{workspace_id}:{user_id}"
        entries = self._journal.get(key, [])
        
        if start_date:
            entries = [e for e in entries if e.date >= start_date]
        if end_date:
            entries = [e for e in entries if e.date <= end_date]
        if is_gratitude is not None:
            entries = [e for e in entries if e.is_gratitude == is_gratitude]
            
        return sorted(entries, key=lambda e: e.created_at, reverse=True)
    
    def get_journal_by_mood(
        self,
        workspace_id: str,
        user_id: str,
        mood: MoodLevel
    ) -> List[JournalEntry]:
        """Get entries by mood."""
        key = f"{workspace_id}:{user_id}"
        entries = self._journal.get(key, [])
        return [e for e in entries if e.mood == mood]
    
    def update_journal_entry(
        self,
        workspace_id: str,
        user_id: str,
        entry_id: str,
        **updates
    ) -> Optional[JournalEntry]:
        """Update a journal entry."""
        key = f"{workspace_id}:{user_id}"
        entries = self._journal.get(key, [])
        for entry in entries:
            if entry.id == entry_id:
                for field, value in updates.items():
                    if hasattr(entry, field):
                        setattr(entry, field, value)
                entry.updated_at = datetime.utcnow()
                return entry
        return None
    
    # ==================== Gratitude ====================
    
    def add_gratitude_entry(
        self,
        workspace_id: str,
        user_id: str,
        gratitude_items: List[str],
        mood: Optional[MoodLevel] = None,
        notes: Optional[str] = None
    ) -> JournalEntry:
        """Add a gratitude journal entry."""
        return self.add_journal_entry(
            workspace_id=workspace_id,
            user_id=user_id,
            title="Gratitude",
            content=notes or "",
            mood=mood,
            is_gratitude=True,
            gratitude_items=gratitude_items
        )
    
    def get_gratitude_entries(
        self,
        workspace_id: str,
        user_id: str,
        limit: int = 10
    ) -> List[JournalEntry]:
        """Get recent gratitude entries."""
        entries = self.get_journal_entries(
            workspace_id, 
            user_id, 
            is_gratitude=True
        )
        return entries[:limit]
    
    # ==================== Affirmations ====================
    
    def add_affirmation(
        self,
        workspace_id: str,
        user_id: str,
        text: str,
        category: str = "general"
    ) -> Affirmation:
        """Add an affirmation."""
        affirmation = Affirmation(
            workspace_id=workspace_id,
            user_id=user_id,
            text=text,
            category=category
        )
        
        key = f"{workspace_id}:{user_id}"
        if key not in self._affirmations:
            self._affirmations[key] = []
        self._affirmations[key].append(affirmation)
        return affirmation
    
    def get_affirmations(
        self,
        workspace_id: str,
        user_id: str,
        category: Optional[str] = None,
        favorites_only: bool = False
    ) -> List[Affirmation]:
        """Get affirmations."""
        key = f"{workspace_id}:{user_id}"
        affirmations = self._affirmations.get(key, [])
        
        if category:
            affirmations = [a for a in affirmations if a.category == category]
        if favorites_only:
            affirmations = [a for a in affirmations if a.is_favorite]
            
        return affirmations
    
    def get_random_affirmation(self, workspace_id: str, user_id: str) -> Optional[Affirmation]:
        """Get a random affirmation."""
        import random
        key = f"{workspace_id}:{user_id}"
        affirmations = self._affirmations.get(key, [])
        if not affirmations:
            return None
        
        selected = random.choice(affirmations)
        selected.times_used += 1
        selected.last_used = datetime.utcnow()
        return selected
    
    def toggle_favorite(
        self,
        workspace_id: str,
        user_id: str,
        affirmation_id: str
    ) -> Optional[Affirmation]:
        """Toggle affirmation favorite status."""
        key = f"{workspace_id}:{user_id}"
        affirmations = self._affirmations.get(key, [])
        for affirmation in affirmations:
            if affirmation.id == affirmation_id:
                affirmation.is_favorite = not affirmation.is_favorite
                return affirmation
        return None
    
    # ==================== Mindfulness ====================
    
    def log_mindfulness_session(
        self,
        workspace_id: str,
        user_id: str,
        session_type: str,
        duration_minutes: int,
        notes: Optional[str] = None,
        feeling_after: Optional[str] = None
    ) -> MindfulnessSession:
        """Log a mindfulness session."""
        session = MindfulnessSession(
            workspace_id=workspace_id,
            user_id=user_id,
            session_type=session_type,
            duration_minutes=duration_minutes,
            notes=notes,
            feeling_after=feeling_after
        )
        
        key = f"{workspace_id}:{user_id}"
        if key not in self._mindfulness:
            self._mindfulness[key] = []
        self._mindfulness[key].append(session)
        return session
    
    def get_mindfulness_sessions(
        self,
        workspace_id: str,
        user_id: str,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        session_type: Optional[str] = None
    ) -> List[MindfulnessSession]:
        """Get mindfulness sessions."""
        key = f"{workspace_id}:{user_id}"
        sessions = self._mindfulness.get(key, [])
        
        if start_date:
            sessions = [s for s in sessions if s.date.date() >= start_date]
        if end_date:
            sessions = [s for s in sessions if s.date.date() <= end_date]
        if session_type:
            sessions = [s for s in sessions if s.session_type == session_type]
            
        return sorted(sessions, key=lambda s: s.date, reverse=True)
    
    # ==================== Goals ====================
    
    def add_mindset_goal(
        self,
        workspace_id: str,
        user_id: str,
        title: str,
        category: str,
        description: Optional[str] = None,
        target_date: Optional[date] = None
    ) -> Goal:
        """Add a mindset goal."""
        goal = Goal(
            workspace_id=workspace_id,
            user_id=user_id,
            title=title,
            description=description,
            category=category,
            target_date=target_date
        )
        
        key = f"{workspace_id}:{user_id}"
        if key not in self._goals:
            self._goals[key] = []
        self._goals[key].append(goal)
        return goal
    
    def get_mindset_goals(
        self,
        workspace_id: str,
        user_id: str,
        category: Optional[str] = None,
        status: Optional[str] = None
    ) -> List[Goal]:
        """Get mindset goals."""
        key = f"{workspace_id}:{user_id}"
        goals = self._goals.get(key, [])
        
        if category:
            goals = [g for g in goals if g.category == category]
        if status:
            goals = [g for g in goals if g.status == status]
            
        return sorted(goals, key=lambda g: g.created_at, reverse=True)
    
    def update_goal_progress(
        self,
        workspace_id: str,
        user_id: str,
        goal_id: str,
        progress: int
    ) -> Optional[Goal]:
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
    
    def get_mindset_summary(
        self,
        workspace_id: str,
        user_id: str,
        period_days: int = 30
    ) -> MindsetSummary:
        """Generate mindset summary."""
        end_date = date.today()
        start_date = end_date - timedelta(days=period_days)
        
        entries = self.get_journal_entries(workspace_id, user_id, start_date, end_date)
        gratitude_entries = [e for e in entries if e.is_gratitude]
        
        # Average mood
        moods_with_values = [e.mood for e in entries if e.mood is not None]
        average_mood = sum(moods_with_values) / len(moods_with_values) if moods_with_values else 0
        
        # Top moods
        all_moods = []
        for e in entries:
            all_moods.extend(e.mood_tags)
        from collections import Counter
        mood_counts = Counter(all_moods)
        top_moods = [m for m, _ in mood_counts.most_common(5)]
        
        # Mindfulness
        sessions = self.get_mindfulness_sessions(workspace_id, user_id, start_date, end_date)
        total_mindfulness_minutes = sum(s.duration_minutes for s in sessions)
        
        # Affirmations
        affirmations = self.get_affirmations(workspace_id, user_id)
        affirmations_used = sum(a.times_used for a in affirmations)
        
        # Goals
        goals = self.get_mindset_goals(workspace_id, user_id)
        active_goals = len([g for g in goals if g.status == "active"])
        goals_completed = len([g for g in goals if g.status == "completed"])
        
        return MindsetSummary(
            workspace_id=workspace_id,
            user_id=user_id,
            period_days=period_days,
            journal_entries=len(entries),
            gratitude_entries=len(gratitude_entries),
            average_mood=average_mood,
            top_moods=top_moods,
            mindfulness_minutes=total_mindfulness_minutes,
            total_sessions=len(sessions),
            affirmations_used=affirmations_used,
            active_goals=active_goals,
            goals_completed=goals_completed
        )
