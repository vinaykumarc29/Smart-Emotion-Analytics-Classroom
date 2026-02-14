from extensions import db

class LectureAttendance(db.Model):
    __tablename__ = "lecture_attendance"

    id = db.Column(db.Integer, primary_key=True)
    lecture_id = db.Column(db.Integer, db.ForeignKey('lectures.id', ondelete="CASCADE"), nullable=False)
    # Link to your existing users table
    student_id = db.Column(db.Integer, db.ForeignKey('users.user_id', ondelete="CASCADE"), nullable=False)
    
    # Final performance metrics for the dashboard
    total_minutes_detected = db.Column(db.Integer, default=0)
    attendance_percentage = db.Column(db.Float, default=0.0)
    dominant_mood = db.Column(db.String(50), default="Absent")