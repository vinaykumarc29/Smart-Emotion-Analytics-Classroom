from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from extensions import db
from config import SQLALCHEMY_DATABASE_URI
from datetime import timedelta

# --- IMPORT YOUR MODULAR BLUEPRINTS ---
from routes.auth_route import auth_bp
from routes.faculty.group_route import faculty_group_bp  
from routes.student.group_route import student_group_bp  

def create_app():
    app = Flask(__name__)
    
    # --- CONFIGURATION ---
    app.config["SQLALCHEMY_DATABASE_URI"] = SQLALCHEMY_DATABASE_URI 
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = "$vinay5453" # Keep this safe!
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=30)

    # --- INITIALIZE EXTENSIONS ---
    db.init_app(app)
    CORS(app)
    jwt = JWTManager(app)
    
    # Automatically create tables if they don't exist yet
    with app.app_context():
        db.create_all()
        print("✅ Database tables checked/created!")

    # --- REGISTER BLUEPRINTS WITH CLEAN URLS ---
    # Auth endpoints (e.g., /api/auth/login)
    app.register_blueprint(auth_bp, url_prefix='/api/auth') 
    
    # Faculty group endpoints (e.g., /api/faculty/groups/create)
    app.register_blueprint(faculty_group_bp, url_prefix='/api/faculty/groups') 
    
    # Student group endpoints (e.g., /api/student/groups/join)
    app.register_blueprint(student_group_bp, url_prefix='/api/student/groups') 


    # ... (your other blueprint registrations) ...

    # Add this debug line!
    print("--- THESE ARE THE URLS FLASK KNOWS ABOUT ---")
    print(app.url_map)
    print("--------------------------------------------")

    return app


if __name__ == '__main__':
    print("----------------------------------------------------------------")
    print("🚀 Server is starting with modular routes...")
    print("----------------------------------------------------------------")
    app = create_app()
    app.run(debug=True)