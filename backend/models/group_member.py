from extensions import db

class GroupMember(db.Model):
    __tablename__ = "group_members"

    id = db.Column(db.Integer, primary_key=True)
    # ondelete="CASCADE" ensures that if a group is deleted, all student memberships for that group are automatically erased
    group_id = db.Column(db.Integer, db.ForeignKey('groups.id', ondelete="CASCADE"), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('users.user_id', ondelete="CASCADE"), nullable=False)