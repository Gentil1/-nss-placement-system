from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class Applicant(db.Model):
    """An NSS applicant who has submitted the application form."""
    __tablename__ = 'applicants'

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), nullable=False)
    phone = db.Column(db.String(30))
    location = db.Column(db.String(150))
    university = db.Column(db.String(200))
    programme = db.Column(db.String(200))
    qualification = db.Column(db.String(100))
    skills = db.Column(db.Text)
    interests = db.Column(db.Text)
    career_goal = db.Column(db.Text)
    preferred_region = db.Column(db.String(100))
    certificate_filename = db.Column(db.String(255))
    status = db.Column(db.String(50), default='Pending')
    matched_organization_id = db.Column(db.Integer, db.ForeignKey('organizations.id'), nullable=True)
    application_date = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'email': self.email,
            'phone': self.phone,
            'location': self.location,
            'university': self.university,
            'programme': self.programme,
            'qualification': self.qualification,
            'skills': self.skills,
            'interests': self.interests,
            'career_goal': self.career_goal,
            'preferred_region': self.preferred_region,
            'certificate_filename': self.certificate_filename,
            'status': self.status,
            'matched_organization_id': self.matched_organization_id,
            'application_date': self.application_date.isoformat() if self.application_date else None,
        }


class Organization(db.Model):
    """A partner organization offering NSS placement positions."""
    __tablename__ = 'organizations'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    industry = db.Column(db.String(150))
    location = db.Column(db.String(150))
    region = db.Column(db.String(100))
    description = db.Column(db.Text)
    required_skills = db.Column(db.Text)
    preferred_qualification = db.Column(db.String(150))
    positions_available = db.Column(db.Integer, default=1)
    positions_filled = db.Column(db.Integer, default=0)
    contact_email = db.Column(db.String(150))
    contact_person = db.Column(db.String(150))

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'industry': self.industry,
            'location': self.location,
            'region': self.region,
            'description': self.description,
            'required_skills': self.required_skills,
            'preferred_qualification': self.preferred_qualification,
            'positions_available': self.positions_available,
            'positions_filled': self.positions_filled,
            'positions_remaining': max(0, (self.positions_available or 0) - (self.positions_filled or 0)),
            'contact_email': self.contact_email,
            'contact_person': self.contact_person,
        }


class MatchResult(db.Model):
    """An AI-generated candidate match between an applicant and an organization."""
    __tablename__ = 'match_results'

    id = db.Column(db.Integer, primary_key=True)
    applicant_id = db.Column(db.Integer, db.ForeignKey('applicants.id'), nullable=False)
    organization_id = db.Column(db.Integer, db.ForeignKey('organizations.id'), nullable=False)
    match_score = db.Column(db.Float)
    explanation = db.Column(db.Text)
    rank = db.Column(db.Integer)
    status = db.Column(db.String(50), default='Pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'applicant_id': self.applicant_id,
            'organization_id': self.organization_id,
            'match_score': self.match_score,
            'explanation': self.explanation,
            'rank': self.rank,
            'status': self.status,
        }


class EligibleGraduate(db.Model):
    """A graduate pre-registered by their university as eligible for NSS,
    checked against before an applicant is allowed to fill out the full
    application form."""
    __tablename__ = 'eligible_graduates'

    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(200), nullable=False)
    index_number = db.Column(db.String(100), nullable=False, unique=True, index=True)
    date_of_birth = db.Column(db.String(20), nullable=False)
    university_name = db.Column(db.String(200))
    programme = db.Column(db.String(200))
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
        }


class AdminSession(db.Model):
    """
    A real, server-side admin login session. Created on successful
    /api/admin/login and checked by the require_admin_auth decorator on
    every admin-only route.
    """
    __tablename__ = 'admin_sessions'

    id = db.Column(db.Integer, primary_key=True)
    token = db.Column(db.String(128), nullable=False, unique=True, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=False)

    def is_valid(self):
        return datetime.utcnow() < self.expires_at
