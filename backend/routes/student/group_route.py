from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from extensions import db
from models.group import Group
from models.group_member import GroupMember

# Blueprint specifically for student group operations
student_group_bp = Blueprint('student_group', __name__)

@student_group_bp.route('/join', methods=['POST'])
@jwt_required()
def join_group():
    claims = get_jwt()
    if claims.get("role") != "student":
        return jsonify({"error": "Unauthorized. Only students can join groups."}), 403

    data = request.get_json()
    join_code = data.get('join_code')
    student_id = get_jwt_identity()

    group = Group.query.filter_by(join_code=join_code).first()
    if not group:
        return jsonify({"error": "Invalid join code."}), 404

    existing_member = GroupMember.query.filter_by(group_id=group.id, student_id=student_id).first()
    if existing_member:
        return jsonify({"error": "You are already a member of this group."}), 400

    new_member = GroupMember(group_id=group.id, student_id=student_id)
    db.session.add(new_member)
    db.session.commit()

    return jsonify({"message": f"Successfully joined {group.name}!"}), 200

@student_group_bp.route('/', methods=['GET']) # URL will just be /api/student/groups/
@jwt_required()
def get_student_groups():
    claims = get_jwt()
    if claims.get("role") != "student":
        return jsonify({"error": "Unauthorized."}), 403

    student_id = get_jwt_identity()
    
    enrolled_groups = db.session.query(Group).join(GroupMember).filter(GroupMember.student_id == student_id).all()
    group_list = [{"id": g.id, "name": g.name, "faculty_id": g.faculty_id} for g in enrolled_groups]

    return jsonify({"enrolled_groups": group_list}), 200

@student_group_bp.route('/<int:group_id>/leave', methods=['DELETE'])
@jwt_required()
def leave_group(group_id):
    claims = get_jwt()
    if claims.get("role") != "student":
        return jsonify({"error": "Unauthorized."}), 403

    student_id = get_jwt_identity()
    membership = GroupMember.query.filter_by(group_id=group_id, student_id=student_id).first()

    if not membership:
        return jsonify({"error": "You are not a member of this group."}), 404

    db.session.delete(membership)
    db.session.commit()
    return jsonify({"message": "Successfully left the group."}), 200