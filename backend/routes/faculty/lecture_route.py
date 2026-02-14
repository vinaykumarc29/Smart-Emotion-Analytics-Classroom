from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from extensions import db
from models.lecture import Lecture
from models.group import Group
from datetime import datetime , timedelta
from models.lecture_attendance import LectureAttendance
from models.emotion_log import EmotionLog
from models.group_member import GroupMember
from models.user import User


# Create a new Blueprint for faculty lectures
faculty_lecture_bp = Blueprint('faculty_lecture', __name__)

@faculty_lecture_bp.route('/create', methods=['POST'])
@jwt_required()
def schedule_lecture():
    claims = get_jwt()
    if claims.get("role") != "faculty":
        return jsonify({"error": "Unauthorized. Only faculty can schedule lectures."}), 403

    data = request.get_json()
    group_id = data.get('group_id')
    topic = data.get('topic')
    scheduled_start_str = data.get('scheduled_start') # Expected format: "YYYY-MM-DD HH:MM:SS"
    scheduled_end_str = data.get('scheduled_end')     # Expected format: "YYYY-MM-DD HH:MM:SS"

    faculty_id = get_jwt_identity()

    # Verify the group belongs to this faculty member
    group = Group.query.filter_by(id=group_id, faculty_id=faculty_id).first()
    if not group:
        return jsonify({"error": "Group not found or you do not have permission."}), 404

    try:
        # Convert string dates from frontend into Python DateTime objects
        start_time = datetime.strptime(scheduled_start_str, "%Y-%m-%d %H:%M:%S")
        end_time = datetime.strptime(scheduled_end_str, "%Y-%m-%d %H:%M:%S")

        new_lecture = Lecture(
            group_id=group.id,
            topic=topic,
            scheduled_start=start_time,
            scheduled_end=end_time,
            status="scheduled"
        )

        db.session.add(new_lecture)
        db.session.commit()

        return jsonify({"message": "Lecture scheduled successfully!", "lecture_id": new_lecture.id}), 201

    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD HH:MM:SS"}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    


# ... (Keep your existing schedule_lecture route here) ...

@faculty_lecture_bp.route('/<int:lecture_id>/start', methods=['POST'])
@jwt_required()
def start_lecture(lecture_id):
    claims = get_jwt()
    if claims.get("role") != "faculty":
        return jsonify({"error": "Unauthorized"}), 403

    faculty_id = get_jwt_identity()
    lecture = Lecture.query.get(lecture_id)

    if not lecture:
        return jsonify({"error": "Lecture not found"}), 404

    # Verify faculty owns this group
    group = Group.query.filter_by(id=lecture.group_id, faculty_id=faculty_id).first()
    if not group:
        return jsonify({"error": "Access denied"}), 403

    lecture.status = "live"
    lecture.actual_start = datetime.utcnow()
    db.session.commit()

    return jsonify({"message": "Lecture is now LIVE! Camera tracking can begin."}), 200


@faculty_lecture_bp.route('/<int:lecture_id>/end', methods=['POST'])
@jwt_required()
def end_lecture(lecture_id):
    claims = get_jwt()
    if claims.get("role") != "faculty":
        return jsonify({"error": "Unauthorized"}), 403

    lecture = Lecture.query.get(lecture_id)
    if not lecture or lecture.status != "live":
        return jsonify({"error": "Lecture is not currently live."}), 400

    # 1. Stop the clock
    lecture.status = "completed"
    lecture.actual_end = datetime.utcnow()
    
    # Calculate duration in minutes (minimum 1 minute)
    duration_seconds = (lecture.actual_end - lecture.actual_start).total_seconds()
    total_duration_minutes = max(1, int(duration_seconds / 60))

    enrolled_members = GroupMember.query.filter_by(group_id=lecture.group_id).all()
    total_students_count = len(enrolled_members)

    class_total_percentage = 0
    class_mood_counts = {}

    # --- CONFIGURATION: How often does the student frontend send a photo? ---
    CAPTURE_INTERVAL_SECONDS = 5  # Must match your frontend setInterval (10000ms)
    # -----------------------------------------------------------------------

    for member in enrolled_members:
        logs = EmotionLog.query.filter_by(lecture_id=lecture.id, student_id=member.student_id).all()
        
        # ✅ FIXED MATH: Convert raw log count to actual minutes
        # Example: 6 logs * 10 seconds = 60 seconds = 1 minute
        minutes_detected = (len(logs) * CAPTURE_INTERVAL_SECONDS) / 60
        
        # Round to 2 decimal places for cleaner database storage
        minutes_detected = round(minutes_detected, 2)

        # Calculate percentage
        attendance_pct = min(100.0, (minutes_detected / total_duration_minutes) * 100)
        
        # Dominant Mood Logic
        student_moods = [log.emotion for log in logs]
        if student_moods:
            dominant_mood = max(set(student_moods), key=student_moods.count) 
        else:
            dominant_mood = "Absent"

        attendance_record = LectureAttendance(
            lecture_id=lecture.id,
            student_id=member.student_id,
            total_minutes_detected=minutes_detected, # Now stores accurate minutes!
            attendance_percentage=attendance_pct,
            dominant_mood=dominant_mood
        )
        db.session.add(attendance_record)

        class_total_percentage += attendance_pct
        if dominant_mood != "Absent":
            class_mood_counts[dominant_mood] = class_mood_counts.get(dominant_mood, 0) + 1

    if total_students_count > 0:
        lecture.avg_attendance_percentage = class_total_percentage / total_students_count
    
    if class_mood_counts:
        lecture.dominant_class_mood = max(class_mood_counts, key=class_mood_counts.get)
    else:
        lecture.dominant_class_mood = "Absent"

    db.session.commit()

    return jsonify({
        "message": "Lecture ended. Statistics updated.",
        "duration_minutes": total_duration_minutes,
        "class_avg": round(lecture.avg_attendance_percentage, 2)
    }), 200


@faculty_lecture_bp.route('/start_instant', methods=['POST'])
@jwt_required()
def start_instant_lecture():
    claims = get_jwt()
    if claims.get("role") != "faculty":
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    group_id = data.get('group_id')
    topic = data.get('topic')

    if not group_id or not topic:
        return jsonify({"error": "Group ID and Topic are required"}), 400

    faculty_id = get_jwt_identity()

    # Verify the group belongs to this faculty member
    group = Group.query.filter_by(id=group_id, faculty_id=faculty_id).first()
    if not group:
        return jsonify({"error": "Group not found or access denied."}), 404

    now = datetime.utcnow()

    # Create and start the lecture simultaneously
    new_lecture = Lecture(
        group_id=group.id,
        topic=topic,
        status="live", # <-- Automatically set to live!
        scheduled_start=now, 
        scheduled_end=now, # We can just set these to 'now' since it wasn't scheduled in advance
        actual_start=now   # <-- The clock starts ticking immediately!
    )

    db.session.add(new_lecture)
    db.session.commit()

    return jsonify({
        "message": "Lecture created and is now LIVE!", 
        "lecture_id": new_lecture.id
    }), 201



@faculty_lecture_bp.route('/<int:lecture_id>/live_status', methods=['GET'])
@jwt_required()
def get_live_status(lecture_id):
    claims = get_jwt()
    if claims.get("role") != "faculty":
        return jsonify({"error": "Unauthorized"}), 403

    lecture = Lecture.query.get(lecture_id)
    if not lecture or lecture.status != "live":
        return jsonify({"error": "Lecture not live"}), 400

    # 1. Find everyone enrolled in this class
    enrolled_members = GroupMember.query.filter_by(group_id=lecture.group_id).all()
    
    live_students = []
    # Initialize counts for the graph
    mood_counts = {"Focused": 0, "Confused": 0, "Bored": 0, "Distracted": 0, "Happy": 0}
    total_active = 0

    # ✅ NEW: Define the "Active" Window (30 Seconds)
    # Any log older than this is considered "stale" (student disconnected)
    cutoff_time = datetime.utcnow() - timedelta(seconds=30)

    # 2. Get the VERY LATEST emotion log for each student (WITHIN WINDOW)
    for member in enrolled_members:
        user = User.query.get(member.student_id)
        
        # ✅ UPDATED QUERY: Added .filter(EmotionLog.timestamp >= cutoff_time)
        latest_log = EmotionLog.query.filter(
            EmotionLog.lecture_id == lecture_id, 
            EmotionLog.student_id == member.student_id,
            EmotionLog.timestamp >= cutoff_time  # <--- THIS IS THE FIX
        ).order_by(EmotionLog.timestamp.desc()).first()

        current_emotion = "Offline" # Default state if no recent log found

        if latest_log:
            current_emotion = latest_log.emotion
            total_active += 1 # Only count them as active if they have RECENT data
            
            # Update graph counts
            if current_emotion in mood_counts:
                mood_counts[current_emotion] += 1
            elif current_emotion == "Neutral": # Map Neutral to Focused if needed, or ignore
                 mood_counts["Focused"] += 1

        live_students.append({
            "name": user.name,
            "rollNo": user.roll_no,
            "emotion": current_emotion # Will be "Offline" if they left >30s ago
        })

    # Calculate overall engagement score (Focused + Happy count)
    engagement_score = 0
    if total_active > 0:
        positive_moods = mood_counts.get("Focused", 0) + mood_counts.get("Happy", 0)
        engagement_score = int((positive_moods / total_active) * 100)

    return jsonify({
        "total_active": total_active,
        "engagement_score": engagement_score,
        "mood_distribution": mood_counts,
        "students": live_students
    }), 200


@faculty_lecture_bp.route('/group/<int:group_id>', methods=['GET'])
@jwt_required()
def get_scheduled_lectures(group_id):
    claims = get_jwt()
    if claims.get("role") != "faculty":
        return jsonify({"error": "Unauthorized"}), 403

    faculty_id = get_jwt_identity()
    
    # Verify faculty owns this group
    group = Group.query.filter_by(id=group_id, faculty_id=faculty_id).first()
    if not group:
        return jsonify({"error": "Group not found or access denied."}), 404

    # Fetch only lectures that are scheduled but haven't started
    scheduled_lectures = Lecture.query.filter_by(group_id=group_id, status="scheduled").all()
    
    lecture_list = [{
        "id": lec.id, 
        "topic": lec.topic, 
        "scheduled_start": lec.scheduled_start.strftime("%Y-%m-%d %H:%M") 
    } for lec in scheduled_lectures]

    return jsonify({"scheduled_lectures": lecture_list}), 200

@faculty_lecture_bp.route('/group/<int:group_id>/current', methods=['GET'])
@jwt_required()
def get_current_live_lecture(group_id):
    # ... (Auth checks same as other routes) ...
    claims = get_jwt()
    if claims.get("role") != "faculty": return jsonify({"error": "Unauthorized"}), 403
    faculty_id = get_jwt_identity()

    # Find if any lecture in this group is 'live'
    live_lecture = Lecture.query.filter_by(group_id=group_id, status='live').first()
    
    if live_lecture:
        return jsonify({
            "active": True,
            "lecture_id": live_lecture.id,
            "topic": live_lecture.topic,
            "start_time": live_lecture.actual_start.isoformat()
        }), 200
    
    return jsonify({"active": False}), 200
