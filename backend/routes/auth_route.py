from flask import Blueprint, request, jsonify
from extensions import db  
from models.user import User
from werkzeug.security import generate_password_hash # For password security
from flask_jwt_extended import create_access_token # To generate token
from werkzeug.security import check_password_hash


# Create the Blueprint
auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    # 1. Get the JSON data sent from the frontend/Postman
    data = request.get_json()

    # 2. Extract fields (using .get avoids errors if a field is missing)
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'student') # Default to student if not provided
    roll_no = data.get('roll_no')
    collage = data.get('collage') 

    # 3. Validation: Check if email already exists
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already exists"}), 400

    # 4. Hash the password (NEVER store plain text passwords!)
    hashed_password = generate_password_hash(password)

    # 5. Create new User instance
    new_user = User(
        name=name,
        email=email,
        password=hashed_password,
        role=role,
        roll_no=roll_no,
        collage=collage
    )

    try:
        # 6. Add to DB and Commit
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "User registered successfully!"}), 201
    except Exception as e:
        db.session.rollback() # Undo changes if error occurs
        return jsonify({"error": str(e)}), 500
    
     

# ... (keep your signup route here) ...
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # 1. Find user by email
    user = User.query.filter_by(email=email).first()

    # 2. Check if user exists AND password is correct
    if not user or not check_password_hash(user.password, password):
        return jsonify({"error": "Invalid email or password"}), 401

    # 3. Create a JWT Token
    # You can store the user_id and role inside the token
    access_token = create_access_token(identity=str(user.user_id), additional_claims={"role": user.role})

    return jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "user": {
            "name": user.name,
            "role": user.role,
            "email": user.email
        }
    }), 200
