from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from extensions import db
from models.lecture import Lecture
from models.emotion_log import EmotionLog
import cv2
import numpy as np
import base64
from deepface import DeepFace

student_lecture_bp = Blueprint('student_lecture', __name__)

@student_lecture_bp.route('/<int:lecture_id>/log_emotion', methods=['POST'])
@jwt_required()
def log_live_emotion(lecture_id):
    claims = get_jwt()
    if claims.get("role") != "student":
        return jsonify({"error": "Unauthorized"}), 403

    student_id = get_jwt_identity()
    
    # 1. Verify Lecture is Live
    lecture = Lecture.query.get(lecture_id)
    if not lecture or lecture.status != "live":
        return jsonify({"error": "Lecture is not currently live."}), 400

    try:
        data = request.get_json()
        image_data = data.get('image')

        if not image_data:
            return jsonify({"error": "No image data provided"}), 400

        # 2. Decode Base64 Image
        encoded_data = image_data.split(',')[1]
        nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # 3. Analyze with DeepFace (Fast Mode)
        # using 'opencv' backend is faster than default for real-time
        analysis = DeepFace.analyze(img, 
                                    actions=['emotion'], 
                                    detector_backend='opencv', 
                                    enforce_detection=False, 
                                    silent=True)
        
        detected_emotion = "Neutral" # Default
        
        if analysis and isinstance(analysis, list) and len(analysis) > 0:
            # Check confidence (if available) or just take dominant emotion
            # DeepFace format is usually [{'dominant_emotion': 'happy', ...}]
            face_data = analysis[0]
            raw_emotion = face_data.get('dominant_emotion', 'neutral')

            # 4. Map Raw Emotion to Classroom Metrics
            if raw_emotion in ['happy', 'neutral']: 
                detected_emotion = 'Focused'
            elif raw_emotion in ['sad', 'fear']: 
                detected_emotion = 'Confused'
            elif raw_emotion in ['angry', 'disgust']: 
                detected_emotion = 'Distracted'
            elif raw_emotion == 'surprise':
                detected_emotion = 'Focused' # Surprise can be positive engagement
            else: 
                detected_emotion = 'Bored'
        else:
            return jsonify({"status": "no_face_detected"}), 200

        # 5. Save to Database
        new_log = EmotionLog(
            lecture_id=lecture_id,
            student_id=student_id,
            emotion=detected_emotion
        )
        
        db.session.add(new_log)
        db.session.commit()

        print(f"Student {student_id} -> {detected_emotion}") # Debug log

        return jsonify({"status": "success", "emotion": detected_emotion}), 201

    except Exception as e:
        print(f"Error analyzing face: {e}")
        return jsonify({"error": "Image processing failed"}), 500