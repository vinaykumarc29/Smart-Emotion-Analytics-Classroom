from extensions import db
import uuid

class Group(db.Model):
    __tablename__ = "groups"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    # Links to the User table (specifically, a faculty member)
    faculty_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    join_code = db.Column(db.String(10), unique=True, nullable=False)

    # Helper function to generate a random 6-character code
    @staticmethod
    def generate_join_code():
        return uuid.uuid4().hex[:6].upper()