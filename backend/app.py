from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager  # <--- 1. IMPORT THIS
from extensions import db
from routes.auth_route import auth_bp
from config import SQLALCHEMY_DATABASE_URI
# from config import Config  <-- OPTIONAL: If you have a config.py file

def create_app():
    app = Flask(__name__)
    
    # --- ADD THESE LINES ---
    # format: mysql+pymysql://username:password@host/databasename
    app.config["SQLALCHEMY_DATABASE_URI"] = SQLALCHEMY_DATABASE_URI 
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    # -----------------------

    app.config["JWT_SECRET_KEY"] = "$vinay5453"

    db.init_app(app)
    CORS(app)
    jwt = JWTManager(app)
    print("✅ DB connected!!")

    app.register_blueprint(auth_bp, url_prefix='/api/auth') 

    return app

if __name__ == '__main__':
    print("----------------------------------------------------------------")
    print("🚀 Server is starting...")
    print("----------------------------------------------------------------")
    
    app = create_app() # This now has the config inside it
    
    app.run(debug=True)