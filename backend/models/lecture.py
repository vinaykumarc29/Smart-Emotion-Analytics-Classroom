from extensions import db
from datetime import datetime

class Lecture(db.Model):
    __tablename__ = "lectures"

    id = db.Column(db.Integer, primary_key=True)
    # Link to your existing groups table
    group_id = db.Column(db.Integer, db.ForeignKey('groups.id', ondelete="CASCADE"), nullable=False)
    
    topic = db.Column(db.String(200), nullable=False)
    
    # Scheduling & Status
    status = db.Column(db.String(20), default="scheduled") # Can be: 'scheduled', 'live', 'completed'
    scheduled_start = db.Column(db.DateTime, nullable=False)
    scheduled_end = db.Column(db.DateTime, nullable=False)
    
    # Actual run time
    actual_start = db.Column(db.DateTime, nullable=True)
    actual_end = db.Column(db.DateTime, nullable=True)
    
    # Final Averages
    avg_attendance_percentage = db.Column(db.Float, default=0.0)
    dominant_class_mood = db.Column(db.String(50), default="Pending")
    
    # Relationships to easily fetch related data
    attendances = db.relationship('LectureAttendance', backref='lecture', cascade='all, delete-orphan')
    emotion_logs = db.relationship('EmotionLog', backref='lecture', cascade='all, delete-orphan')



