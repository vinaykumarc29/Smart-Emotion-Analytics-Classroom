from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from extensions import db
from models.group import Group
from models.group_member import GroupMember
from models.user import User

# Blueprint specifically for faculty group operations
faculty_group_bp = Blueprint('faculty_group', __name__)

@faculty_group_bp.route('/create', methods=['POST'])
@jwt_required()
def create_group():
    claims = get_jwt()
    if claims.get("role") != "faculty":
        return jsonify({"error": "Unauthorized. Only faculty can create groups."}), 403

    data = request.get_json()
    name = data.get('name')
    faculty_id = get_jwt_identity() 

    new_group = Group(
        name=name,
        faculty_id=faculty_id,
        join_code=Group.generate_join_code()
    )

    db.session.add(new_group)
    db.session.commit()

    return jsonify({"message": "Group created successfully!", "join_code": new_group.join_code}), 201

@faculty_group_bp.route('/', methods=['GET']) # URL will just be /api/faculty/groups/
@jwt_required()
def get_faculty_groups():
    claims = get_jwt()
    if claims.get("role") != "faculty":
        return jsonify({"error": "Unauthorized."}), 403

    faculty_id = get_jwt_identity()
    groups = Group.query.filter_by(faculty_id=faculty_id).all()

    group_list = [{"id": g.id, "name": g.name, "join_code": g.join_code} for g in groups]
    return jsonify({"groups": group_list}), 200

@faculty_group_bp.route('/<int:group_id>', methods=['DELETE'])
@jwt_required()
def delete_group(group_id):
    claims = get_jwt()
    if claims.get("role") != "faculty":
        return jsonify({"error": "Unauthorized."}), 403
    
    faculty_id = get_jwt_identity()
    group = Group.query.filter_by(id=group_id, faculty_id=faculty_id).first()

    if not group:
        return jsonify({"error": "Group not found or access denied."}), 404

    db.session.delete(group)
    db.session.commit()
    return jsonify({"message": "Group deleted successfully!"}), 200

@faculty_group_bp.route('/<int:group_id>/students', methods=['GET'])
@jwt_required()
def get_group_students(group_id):
    claims = get_jwt()
    if claims.get("role") != "faculty":
        return jsonify({"error": "Unauthorized."}), 403

    faculty_id = get_jwt_identity()
    group = Group.query.filter_by(id=group_id, faculty_id=faculty_id).first()
    if not group:
        return jsonify({"error": "Group not found or access denied."}), 404

    students = db.session.query(User).join(GroupMember, User.user_id == GroupMember.student_id)\
        .filter(GroupMember.group_id == group_id).all()

    student_list = [{"user_id": s.user_id, "name": s.name, "email": s.email, "roll_no": s.roll_no} for s in students]
    return jsonify({"group_name": group.name, "total_students": len(student_list), "students": student_list}), 200

@faculty_group_bp.route('/<int:group_id>/remove_student/<int:student_id>', methods=['DELETE'])
@jwt_required()
def remove_student(group_id, student_id):
    claims = get_jwt()
    if claims.get("role") != "faculty":
        return jsonify({"error": "Unauthorized."}), 403

    faculty_id = get_jwt_identity()
    group = Group.query.filter_by(id=group_id, faculty_id=faculty_id).first()
    if not group:
        return jsonify({"error": "Group not found or access denied."}), 404

    membership = GroupMember.query.filter_by(group_id=group_id, student_id=student_id).first()
    if membership:
        db.session.delete(membership)
        db.session.commit()
        return jsonify({"message": "Student removed from group."}), 200
    
    return jsonify({"error": "Student not found in this group."}), 404