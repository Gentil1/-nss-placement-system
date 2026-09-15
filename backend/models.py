from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Applicant(db.Model):
    """Applicant Model"""
    __tablename__ = 'applicants'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # Personal Information
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    location = db.Column(db.String(100), nullable=False)
    preferred_region = db.Column(db.String(100), nullable=True)
    
    # Academic Information
    university = db.Column(db.String(200), nullable=False)
    programme = db.Column(db.String(200), nullable=False)
    qualification = db.Column(db.String(50), nullable=False)  # Diploma, Bachelor, Master
    
    # Skills (stored as comma-separated string)
    skills = db.Column(db.Text, default='')
    
    # Interests (stored as comma-separated string)
    interests = db.Column(db.Text, default='')
    
    # Career Goals
    career_goal = db.Column(db.Text, default='')
    
    # Certificate File (stored as filename)
    certificate_filename = db.Column(db.String(300), nullable=True)
    
    # Status
    status = db.Column(db.String(50), default='Pending')  # Pending, Under Review, Matched, Placed
    index_number = db.Column(db.String(50), nullable=True)
    matched_organization_id = db.Column(db.Integer, db.ForeignKey('organizations.id'), nullable=True)
    application_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """Convert applicant to dictionary"""
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'email': self.email,
            'phone': self.phone,
            'location': self.location,
            'preferred_region': self.preferred_region,
            'university': self.university,
            'programme': self.programme,
            'qualification': self.qualification,
            'skills': self.skills.split(',') if self.skills else [],
            'interests': self.interests.split(',') if self.interests else [],
            'career_goal': self.career_goal,
            'status': self.status,
            'index_number': self.index_number,
            'matched_organization_id': self.matched_organization_id,
            'application_date': self.application_date.isoformat() if self.application_date else None
        }


class Organization(db.Model):
    """Organization Model"""
    __tablename__ = 'organizations'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # Organization Information
    name = db.Column(db.String(200), nullable=False, unique=True)
    industry = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(100), nullable=False)
    region = db.Column(db.String(100), nullable=True)
    description = db.Column(db.Text, default='')
    
    # Requirements (stored as comma-separated string)
    required_skills = db.Column(db.Text, default='')
    preferred_qualification = db.Column(db.String(100), default='')
    
    # Positions Available
    positions_available = db.Column(db.Integer, default=1)
    positions_filled = db.Column(db.Integer, default=0)
    
    # Contact Information
    contact_email = db.Column(db.String(120), nullable=False)
    contact_person = db.Column(db.String(100), default='')
    
    created_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """Convert organization to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'industry': self.industry,
            'location': self.location,
            'description': self.description,
            'required_skills': self.required_skills.split(',') if self.required_skills else [],
            'preferred_qualification': self.preferred_qualification,
            'positions_available': self.positions_available,
            'positions_filled': self.positions_filled,
            'positions_remaining': max(0, self.positions_available - self.positions_filled),
            'contact_email': self.contact_email,
            'contact_person': self.contact_person,
            'region': self.region,
        }


class MatchResult(db.Model):
    """Match Result Model"""
    __tablename__ = 'match_results'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # Foreign Keys
    applicant_id = db.Column(db.Integer, db.ForeignKey('applicants.id'), nullable=False)
    organization_id = db.Column(db.Integer, db.ForeignKey('organizations.id'), nullable=False)
    
    # Match Score (0-100)
    match_score = db.Column(db.Float, nullable=False)
    
    # Explanation
    explanation = db.Column(db.Text, default='')
    
    # Rank (1st match, 2nd match, etc)
    rank = db.Column(db.Integer, default=0)
    
    # Status
    status = db.Column(db.String(50), default='Pending')  # Pending, Accepted, Rejected
    
    created_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    applicant = db.relationship('Applicant', backref='matches')
    organization = db.relationship('Organization', backref='matches')
    
    def to_dict(self):
        """Convert match result to dictionary"""
        return {
            'id': self.id,
            'applicant_id': self.applicant_id,
            'organization_id': self.organization_id,
            'match_score': round(self.match_score, 2),
            'explanation': self.explanation,
            'rank': self.rank,
            'status': self.status,
            'created_date': self.created_date.isoformat() if self.created_date else None,
            'organization': self.organization.to_dict() if self.organization else None,
        }
        
class EligibleGraduate(db.Model):
    """
    Represents a graduate submitted as eligible by their university —
    mirrors NSA's real process where universities submit verified
    graduate lists before students can register for service.
    """
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(200), nullable=False)
    index_number = db.Column(db.String(50), nullable=False, unique=True)
    date_of_birth = db.Column(db.String(20), nullable=False)  # stored as YYYY-MM-DD
    university_name = db.Column(db.String(200), nullable=False)
    programme = db.Column(db.String(200), nullable=False)
    gender = db.Column(db.String(20))
    graduation_status = db.Column(db.String(50), default='Completed')
    is_registered = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'full_name': self.full_name,
            'index_number': self.index_number,
            'date_of_birth': self.date_of_birth,
            'university_name': self.university_name,
            'programme': self.programme,
            'gender': self.gender,
            'graduation_status': self.graduation_status,
            'is_registered': self.is_registered,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        class AdminSession(db.Model):
    __tablename__ = 'admin_sessions'

    id = db.Column(db.Integer, primary_key=True)
    token = db.Column(db.String(128), nullable=False, unique=True, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=False)

    def is_valid(self):
        return datetime.utcnow() < self.expires_at
