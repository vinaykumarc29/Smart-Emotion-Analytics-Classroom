from extensions import db
from datetime import datetime

class EmotionLog(db.Model):
    __tablename__ = "emotion_logs"

    id = db.Column(db.Integer, primary_key=True)
    lecture_id = db.Column(db.Integer, db.ForeignKey('lectures.id', ondelete="CASCADE"), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('users.user_id', ondelete="CASCADE"), nullable=False)
    
    # Live data point from the Python Face script
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    emotion = db.Column(db.String(50), nullable=False)