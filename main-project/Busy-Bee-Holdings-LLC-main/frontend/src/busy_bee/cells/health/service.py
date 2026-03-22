"""Health cell - Personal health and wellness tracking.

This cell contains all health domain logic and is independently testable.
Tracks workouts, meals, sleep, vitals, and wellness goals.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime, date, timedelta
from enum import Enum
from pydantic import BaseModel, Field
import uuid


class WorkoutType(str, Enum):
    """Types of workouts."""
    RUNNING = "running"
    WEIGHT_TRAINING = "weight_training"
    CARDIO = "cardio"
    YOGA = "yoga"
    SWIMMING = "swimming"
    CYCLING = "cycling"
    HIIT = "hiit"
    SPORTS = "sports"
    WALKING = "walking"
    OTHER = "other"


class MealType(str, Enum):
    """Types of meals."""
    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    DINNER = "dinner"
    SNACK = "snack"


class SleepQuality(str, Enum):
    """Sleep quality ratings."""
    EXCELLENT = "excellent"
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"


class Workout(BaseModel):
    """Workout session model."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    workspace_id: str = Field(..., description="Workspace boundary")
    user_id: str = Field(..., description="User who performed workout")
    workout_type: WorkoutType = Field(..., description="Type of workout")
    duration_minutes: int = Field(..., description="Duration in minutes")
    calories_burned: Optional[int] = Field(None, description="Calories burned")
    distance_km: Optional[float] = Field(None, description="Distance in km")
    intensity: str = Field(default="moderate", description="Intensity level")
    notes: Optional[str] = Field(None, description="Notes")
    date: datetime = Field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        use_enum_values = True


class Meal(BaseModel):
    """Meal log model."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    workspace_id: str = Field(..., description="Workspace boundary")
    user_id: str = Field(..., description="User who logged meal")
    meal_type: MealType = Field(..., description="Type of meal")
    description: str = Field(..., description="Meal description")
    calories: Optional[int] = Field(None, description="Calories")
    protein_g: Optional[float] = Field(None, description="Protein in grams")
    carbs_g: Optional[float] = Field(None, description="Carbs in grams")
    fat_g: Optional[float] = Field(None, description="Fat in grams")
    date: datetime = Field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        use_enum_values = True


class SleepLog(BaseModel):
    """Sleep log model."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    workspace_id: str = Field(..., description="Workspace boundary")
    user_id: str = Field(..., description="User who logged sleep")
    sleep_quality: SleepQuality = Field(..., description="Sleep quality")
    hours_slept: float = Field(..., description="Hours slept")
    bed_time: datetime = Field(..., description="Bed time")
    wake_time: datetime = Field(..., description="Wake time")
    notes: Optional[str] = Field(None, description="Notes")
    date: date = Field(default_factory=date.today)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        use_enum_values = True


class Vitals(BaseModel):
    """Vital signs model."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    workspace_id: str = Field(..., description="Workspace boundary")
    user_id: str = Field(..., description="User")
    weight_kg: Optional[float] = Field(None, description="Weight in kg")
    height_cm: Optional[float] = Field(None, description="Height in cm")
    blood_pressure_systolic: Optional[int] = Field(None, description="Systolic BP")
    blood_pressure_diastolic: Optional[int] = Field(None, description="Diastolic BP")
    heart_rate_bpm: Optional[int] = Field(None, description="Heart rate")
    temperature_celsius: Optional[float] = Field(None, description="Body temperature")
    oxygen_saturation: Optional[int] = Field(None, description="SpO2 %")
    date: date = Field(default_factory=date.today)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class HealthSummary(BaseModel):
    """Health summary report."""
    workspace_id: str
    user_id: str
    period_start: date
    period_end: date
    total_workouts: int = 0
    total_workout_minutes: int = 0
    total_calories_burned: int = 0
    average_sleep_hours: float = 0.0
    sleep_quality_avg: float = 0.0
    meals_logged: int = 0
    average_calories_per_day: float = 0.0
    current_weight: Optional[float] = None
    weight_change_kg: float = 0.0


class HealthCell:
    """Health cell - Reusable health intelligence core.
    
    This cell provides:
    - Workout tracking and analytics
    - Meal logging and nutrition tracking
    - Sleep monitoring
    - Vitals tracking
    - Health summary generation
    """
    
    def __init__(self):
        self._workouts: Dict[str, List[Workout]] = {}
        self._meals: Dict[str, List[Meal]] = {}
        self._sleep: Dict[str, List[SleepLog]] = {}
        self._vitals: Dict[str, List[Vitals]] = {}
    
    def log_workout(self, workspace_id: str, user_id: str, workout: Workout) -> Workout:
        """Log a workout session."""
        workout.workspace_id = workspace_id
        workout.user_id = user_id
        key = f"{workspace_id}:{user_id}"
        if key not in self._workouts:
            self._workouts[key] = []
        self._workouts[key].append(workout)
        return workout
    
    def get_workouts(
        self, 
        workspace_id: str, 
        user_id: str,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[Workout]:
        """Get workouts for a user within a date range."""
        key = f"{workspace_id}:{user_id}"
        workouts = self._workouts.get(key, [])
        if start_date:
            workouts = [w for w in workouts if w.date.date() >= start_date]
        if end_date:
            workouts = [w for w in workouts if w.date.date() <= end_date]
        return sorted(workouts, key=lambda w: w.date, reverse=True)
    
    def log_meal(self, workspace_id: str, user_id: str, meal: Meal) -> Meal:
        """Log a meal."""
        meal.workspace_id = workspace_id
        meal.user_id = user_id
        key = f"{workspace_id}:{user_id}"
        if key not in self._meals:
            self._meals[key] = []
        self._meals[key].append(meal)
        return meal
    
    def get_meals(
        self,
        workspace_id: str,
        user_id: str,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[Meal]:
        """Get meals for a user within a date range."""
        key = f"{workspace_id}:{user_id}"
        meals = self._meals.get(key, [])
        if start_date:
            meals = [m for m in meals if m.date.date() >= start_date]
        if end_date:
            meals = [m for m in meals if m.date.date() <= end_date]
        return sorted(meals, key=lambda m: m.date, reverse=True)
    
    def log_sleep(self, workspace_id: str, user_id: str, sleep: SleepLog) -> SleepLog:
        """Log sleep."""
        sleep.workspace_id = workspace_id
        sleep.user_id = user_id
        key = f"{workspace_id}:{user_id}"
        if key not in self._sleep:
            self._sleep[key] = []
        self._sleep[key].append(sleep)
        return sleep
    
    def get_sleep_logs(
        self,
        workspace_id: str,
        user_id: str,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[SleepLog]:
        """Get sleep logs for a user within a date range."""
        key = f"{workspace_id}:{user_id}"
        sleep_logs = self._sleep.get(key, [])
        if start_date:
            sleep_logs = [s for s in sleep_logs if s.date >= start_date]
        if end_date:
            sleep_logs = [s for s in sleep_logs if s.date <= end_date]
        return sorted(sleep_logs, key=lambda s: s.date, reverse=True)
    
    def log_vitals(self, workspace_id: str, user_id: str, vitals: Vitals) -> Vitals:
        """Log vital signs."""
        vitals.workspace_id = workspace_id
        vitals.user_id = user_id
        key = f"{workspace_id}:{user_id}"
        if key not in self._vitals:
            self._vitals[key] = []
        self._vitals[key].append(vitals)
        return vitals
    
    def get_latest_vitals(self, workspace_id: str, user_id: str) -> Optional[Vitals]:
        """Get latest vitals for a user."""
        key = f"{workspace_id}:{user_id}"
        vitals_list = self._vitals.get(key, [])
        if not vitals_list:
            return None
        return sorted(vitals_list, key=lambda v: v.date, reverse=True)[0]
    
    def get_vitals_history(
        self,
        workspace_id: str,
        user_id: str,
        limit: int = 30
    ) -> List[Vitals]:
        """Get vitals history."""
        key = f"{workspace_id}:{user_id}"
        vitals_list = self._vitals.get(key, [])
        return sorted(vitals_list, key=lambda v: v.date, reverse=True)[:limit]
    
    def get_health_summary(
        self,
        workspace_id: str,
        user_id: str,
        period_days: int = 30
    ) -> HealthSummary:
        """Generate health summary for a period."""
        end_date = date.today()
        start_date = end_date - timedelta(days=period_days)
        
        workouts = self.get_workouts(workspace_id, user_id, start_date, end_date)
        meals = self.get_meals(workspace_id, user_id, start_date, end_date)
        sleep_logs = self.get_sleep_logs(workspace_id, user_id, start_date, end_date)
        vitals_history = self.get_vitals_history(workspace_id, user_id, limit=period_days)
        
        total_workouts = len(workouts)
        total_workout_minutes = sum(w.duration_minutes for w in workouts)
        total_calories_burned = sum(w.calories_burned or 0 for w in workouts)
        
        if sleep_logs:
            average_sleep_hours = sum(s.hours_slept for s in sleep_logs) / len(sleep_logs)
            sleep_quality_map = {"excellent": 4, "good": 3, "fair": 2, "poor": 1}
            sleep_quality_avg = sum(sleep_quality_map.get(s.sleep_quality, 2) for s in sleep_logs) / len(sleep_logs)
        else:
            average_sleep_hours = 0.0
            sleep_quality_avg = 0.0
        
        meals_logged = len(meals)
        total_calories = sum(m.calories or 0 for m in meals)
        average_calories_per_day = total_calories / period_days if period_days > 0 else 0
        
        current_weight = None
        weight_change_kg = 0.0
        if vitals_history:
            current_weight = vitals_history[0].weight_kg
            if len(vitals_history) > 1:
                oldest = vitals_history[-1]
                if oldest.weight_kg and current_weight:
                    weight_change_kg = current_weight - oldest.weight_kg
        
        return HealthSummary(
            workspace_id=workspace_id,
            user_id=user_id,
            period_start=start_date,
            period_end=end_date,
            total_workouts=total_workouts,
            total_workout_minutes=total_workout_minutes,
            total_calories_burned=total_calories_burned,
            average_sleep_hours=average_sleep_hours,
            sleep_quality_avg=sleep_quality_avg,
            meals_logged=meals_logged,
            average_calories_per_day=average_calories_per_day,
            current_weight=current_weight,
            weight_change_kg=weight_change_kg
        )
