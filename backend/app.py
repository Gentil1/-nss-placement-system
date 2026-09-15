from flask import Flask, request, jsonify
from flask_cors import CORS
from config import config
from models import db, Applicant, Organization, MatchResult, EligibleGraduate, AdminSession
import os
import secrets
from datetime import datetime
from functools import wraps
from werkzeug.security import check_password_hash
from werkzeug.utils import secure_filename
from matching import matching_engine
from sklearn.feature_extraction.text import TfidfVectorizer

# Create Flask app
app = Flask(__name__)

# Load config
config_name = os.environ.get('FLASK_ENV', 'development')
app.config.from_object(config[config_name])

# Initialize extensions
db.init_app(app)

# Create database tables on startup. This must happen here (at import time),
# not inside `if __name__ == '__main__'`, because production servers like
# gunicorn (see Procfile: `web: gunicorn app:app`) import this file as a
# module and never execute that block — so tables such as admin_sessions
# were previously never being created in production, only when running
# `python app.py` locally. db.create_all() is safe to call every time the
# app starts: it only creates tables that don't already exist and never
# touches or drops existing ones.
with app.app_context():
    db.create_all()

# CORS: in production, set ALLOWED_ORIGIN to your deployed frontend's URL
# (e.g. https://your-app.vercel.app). Falls back to allowing all origins,
# which is fine for local development and a quick first deployment.
allowed_origin = os.environ.get('ALLOWED_ORIGIN', '*')
CORS(app, origins=allowed_origin)

# Explicitly handle CORS preflight (OPTIONS) requests before Flask's normal
# routing gets involved. Some hosts (including Render) can otherwise return
# a 404 for OPTIONS on routes that only declare methods=['POST'] etc.,
# which makes the browser block the real request before it's ever sent.
@app.before_request
def handle_preflight():
    if request.method == 'OPTIONS':
        response = app.make_default_options_response()
        return response

# Upload folder
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'jpg', 'jpeg', 'png'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB max file size

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


# ============================================
# ADMIN AUTHENTICATION
# ============================================

def require_admin_auth(f):
    """
    Real server-side authentication check. Every admin-only route below
    is wrapped with this — it independently verifies the request's
    Bearer token against the database on every single call. Nothing
    about whether someone is "logged in" is ever decided by the browser.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        token = auth_header.replace('Bearer ', '').strip()

        if not token:
            return jsonify({'success': False, 'message': 'Authentication required'}), 401

        session = AdminSession.query.filter_by(token=token).first()

        if not session or not session.is_valid():
            return jsonify({'success': False, 'message': 'Session expired or invalid. Please log in again.'}), 401

        return f(*args, **kwargs)
    return decorated


@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    """Verify email + password hash server-side, and only on success
    issue a genuine, randomly-generated session token stored in the database."""
    try:
        data = request.get_json()
        email = data.get('email', '').strip()
        password = data.get('password', '')

        if email != app.config['ADMIN_EMAIL'] or not check_password_hash(app.config['ADMIN_PASSWORD_HASH'], password):
            return jsonify({'success': False, 'message': 'Invalid email or password'}), 401

        token = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + app.config['ADMIN_SESSION_LIFETIME']

        session = AdminSession(token=token, expires_at=expires_at)
        db.session.add(session)
        db.session.commit()

        return jsonify({
            'success': True,
            'token': token,
            'email': email
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400


@app.route('/api/admin/logout', methods=['POST'])
@require_admin_auth
def admin_logout():
    """Invalidate the session token server-side, not just on the client."""
    try:
        auth_header = request.headers.get('Authorization', '')
        token = auth_header.replace('Bearer ', '').strip()
        session = AdminSession.query.filter_by(token=token).first()
        if session:
            db.session.delete(session)
            db.session.commit()
        return jsonify({'success': True, 'message': 'Logged out'}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400


@app.route('/api/admin/verify-session', methods=['GET'])
@require_admin_auth
def verify_session():
    """Used on dashboard page load to confirm a stored token is still valid."""
    return jsonify({'success': True, 'message': 'Session valid'}), 200


# ============================================
# APPLICANT ENDPOINTS
# ============================================

@app.route('/api/applicants', methods=['POST'])
def create_applicant():
    """Create new applicant"""
    try:
        data = request.form
        
        # Create new applicant
        applicant = Applicant(
            first_name=data.get('firstName'),
            last_name=data.get('lastName'),
            email=data.get('email'),
            phone=data.get('phone'),
            location=data.get('location'),
            university=data.get('university'),
            programme=data.get('programme'),
            qualification=data.get('qualification'),
            skills=','.join(data.getlist('skills')) if data.getlist('skills') else '',
            interests=','.join(data.getlist('interests')) if data.getlist('interests') else '',
            career_goal=data.get('careerGoal', ''),
            preferred_region=data.get('preferredRegion', ''),
            status='Pending'
        )
        
        # Handle file upload
        if 'certificate' in request.files:
            file = request.files['certificate']
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                # Add timestamp to filename to make it unique
                import time
                filename = f"{int(time.time())}_{filename}"
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                applicant.certificate_filename = filename
        
        db.session.add(applicant)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Application submitted successfully',
            'applicant_id': applicant.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 400


@app.route('/api/applicants', methods=['GET'])
@require_admin_auth
def get_all_applicants():
    try:
        applicants = Applicant.query.all()
        result = []
        for applicant in applicants:
            applicant_dict = applicant.to_dict()
            matches = MatchResult.query.filter_by(applicant_id=applicant.id).order_by(MatchResult.rank).all()
            applicant_dict['matches'] = [
                {
                    'id': m.id,
                    'organization_id': m.organization_id,
                    'organization': Organization.query.get(m.organization_id).to_dict(),
                    'match_score': m.match_score,
                    'explanation': m.explanation,
                    'rank': m.rank,
                    'status': m.status
                }
                for m in matches
            ]
            result.append(applicant_dict)

        return jsonify({
            'success': True,
            'data': result,
            'total': len(result)
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400


@app.route('/api/applicants/<int:applicant_id>', methods=['GET'])
def get_applicant(applicant_id):
    """Get single applicant — intentionally public, used by the applicant-
    facing results page where a graduate checks their own status by ID."""
    try:
        applicant = Applicant.query.get(applicant_id)
        if not applicant:
            return jsonify({'success': False, 'message': 'Applicant not found'}), 404
        
        return jsonify({
            'success': True,
            'data': applicant.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400
    
@app.route('/api/applicants/<int:applicant_id>', methods=['PUT'])
@require_admin_auth
def update_applicant(applicant_id):
    """Update an applicant (e.g. change status). If marking as Matched,
    also pass matched_organization_id to decrement that org's capacity."""
    try:
        applicant = Applicant.query.get(applicant_id)
        if not applicant:
            return jsonify({'success': False, 'message': 'Applicant not found'}), 404

        data = request.get_json()

        if 'status' in data:
            new_status = data['status']
            was_matched_before = applicant.status == 'Matched'

            if new_status == 'Matched' and not was_matched_before:
                org_id = data.get('matched_organization_id')
                if org_id:
                    org = Organization.query.get(org_id)
                    if org:
                        if org.positions_filled >= org.positions_available:
                            return jsonify({'success': False, 'message': f'{org.name} has no remaining positions'}), 400
                        org.positions_filled += 1

            applicant.status = new_status

        db.session.commit()
        return jsonify({'success': True, 'data': applicant.to_dict()}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 400   
    
@app.route('/api/eligible-graduates', methods=['POST'])
@require_admin_auth
def add_eligible_graduate():
    """Add a single eligible graduate (simulates a university submitting one record)"""
    try:
        data = request.get_json()
        existing = EligibleGraduate.query.filter_by(index_number=data.get('index_number')).first()
        if existing:
            return jsonify({'success': False, 'message': 'Index number already exists'}), 400

        grad = EligibleGraduate(
            full_name=data.get('full_name'),
            index_number=data.get('index_number'),
            date_of_birth=data.get('date_of_birth'),
            university_name=data.get('university_name'),
            programme=data.get('programme'),
            gender=data.get('gender', ''),
            graduation_status=data.get('graduation_status', 'Completed')
        )
        db.session.add(grad)
        db.session.commit()
        return jsonify({'success': True, 'data': grad.to_dict()}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 400


@app.route('/api/eligible-graduates/bulk', methods=['POST'])
@require_admin_auth
def bulk_add_eligible_graduates():
    """Add many eligible graduates at once (simulates a university submitting its full list)"""
    try:
        data = request.get_json()
        graduates_list = data.get('graduates', [])
        added = 0
        skipped = 0

        for g in graduates_list:
            existing = EligibleGraduate.query.filter_by(index_number=g.get('index_number')).first()
            if existing:
                skipped += 1
                continue
            grad = EligibleGraduate(
                full_name=g.get('full_name'),
                index_number=g.get('index_number'),
                date_of_birth=g.get('date_of_birth'),
                university_name=g.get('university_name'),
                programme=g.get('programme'),
                gender=g.get('gender', ''),
                graduation_status=g.get('graduation_status', 'Completed')
            )
            db.session.add(grad)
            added += 1

        db.session.commit()
        return jsonify({'success': True, 'message': f'Added {added}, skipped {skipped} duplicates', 'added': added, 'skipped': skipped}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 400


@app.route('/api/eligible-graduates', methods=['GET'])
@require_admin_auth
def get_eligible_graduates():
    """List all eligible graduates (admin view)"""
    try:
        graduates = EligibleGraduate.query.order_by(EligibleGraduate.created_at.desc()).all()
        return jsonify({'success': True, 'data': [g.to_dict() for g in graduates], 'total': len(graduates)}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400


@app.route('/api/eligible-graduates/<int:grad_id>', methods=['DELETE'])
@require_admin_auth
def delete_eligible_graduate(grad_id):
    """Remove an eligible graduate record"""
    try:
        grad = EligibleGraduate.query.get(grad_id)
        if not grad:
            return jsonify({'success': False, 'message': 'Not found'}), 404
        db.session.delete(grad)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Deleted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 400


@app.route('/api/eligible-graduates/verify', methods=['POST'])
def verify_eligibility():
    """
    Check if a student is an eligible, verified graduate before
    letting them proceed to the full application form.
    """
    try:
        data = request.get_json()
        index_number = data.get('index_number', '').strip()
        date_of_birth = data.get('date_of_birth', '').strip()

        grad = EligibleGraduate.query.filter_by(index_number=index_number).first()

        if not grad:
            return jsonify({'success': False, 'message': 'Index number not found. Please contact your university.'}), 404

        if grad.date_of_birth != date_of_birth:
            return jsonify({'success': False, 'message': 'Date of birth does not match our records.'}), 400

        if grad.is_registered:
            return jsonify({'success': False, 'message': 'This index number has already been used to register.'}), 400

        return jsonify({'success': True, 'data': grad.to_dict()}), 200

    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400     


# ============================================
# ORGANIZATION ENDPOINTS
# ============================================

@app.route('/api/organizations', methods=['POST'])
@require_admin_auth
def create_organization():
    """Create a new organization"""
    try:
        data = request.get_json()
        org = Organization(
            name=data.get('name'),
            industry=data.get('industry'),
            location=data.get('location'),
            description=data.get('description', ''),
            required_skills=data.get('required_skills', ''),
            preferred_qualification=data.get('preferred_qualification', ''),
            positions_available=data.get('positions_available', 1),
            contact_email=data.get('contact_email', ''),
            contact_person=data.get('contact_person', '')
        )
        db.session.add(org)
        db.session.commit()
        return jsonify({'success': True, 'data': org.to_dict()}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/api/organizations/<int:org_id>', methods=['PUT'])
@require_admin_auth
def update_organization(org_id):
    """Update an organization"""
    try:
        org = Organization.query.get(org_id)
        if not org:
            return jsonify({'success': False, 'message': 'Organization not found'}), 404

        data = request.get_json()
        org.name = data.get('name', org.name)
        org.industry = data.get('industry', org.industry)
        org.location = data.get('location', org.location)
        org.description = data.get('description', org.description)
        org.required_skills = data.get('required_skills', org.required_skills)
        org.preferred_qualification = data.get('preferred_qualification', org.preferred_qualification)
        org.positions_available = data.get('positions_available', org.positions_available)
        org.contact_email = data.get('contact_email', org.contact_email)
        org.contact_person = data.get('contact_person', org.contact_person)

        db.session.commit()
        return jsonify({'success': True, 'data': org.to_dict()}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 400


@app.route('/api/organizations/<int:org_id>', methods=['DELETE'])
@require_admin_auth
def delete_organization(org_id):
    """Delete an organization"""
    try:
        org = Organization.query.get(org_id)
        if not org:
            return jsonify({'success': False, 'message': 'Organization not found'}), 404

        db.session.delete(org)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Organization deleted'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/api/organizations', methods=['GET'])
@require_admin_auth
def get_all_organizations():
    """Get all organizations"""
    try:
        organizations = Organization.query.all()
        return jsonify({
            'success': True,
            'data': [org.to_dict() for org in organizations],
            'total': len(organizations)
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400


# ============================================
# MATCH RESULTS ENDPOINTS
# ============================================

@app.route('/api/matches', methods=['GET'])
@require_admin_auth
def get_all_matches():
    """Get all matches"""
    try:
        matches = MatchResult.query.all()
        return jsonify({
            'success': True,
            'data': [match.to_dict() for match in matches],
            'total': len(matches)
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400


@app.route('/api/matches/applicant/<int:applicant_id>', methods=['GET'])
def get_matches_for_applicant(applicant_id):
    """Get an applicant's own candidate matches, including the matched
    organization's details. Intentionally public — this is what powers the
    applicant-facing results page (/results?id=...) where a graduate checks
    their own status without logging in."""
    try:
        matches = MatchResult.query.filter_by(applicant_id=applicant_id).order_by(MatchResult.rank).all()
        result = []
        for m in matches:
            org = Organization.query.get(m.organization_id)
            result.append({
                'id': m.id,
                'organization_id': m.organization_id,
                'organization': org.to_dict() if org else None,
                'match_score': m.match_score,
                'explanation': m.explanation,
                'rank': m.rank,
                'status': m.status
            })
        return jsonify({'success': True, 'data': result, 'total': len(result)}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400


# ============================================
# HEALTH CHECK
# ============================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'success': True,
        'message': 'NSS Backend is running!',
        'database': 'Connected'
    }), 200


@app.route('/api/public-stats', methods=['GET'])
def public_stats():
    """Public, aggregate-only counts for the homepage — deliberately does
    not expose any applicant or organization details, just totals."""
    try:
        return jsonify({
            'success': True,
            'data': {
                'applicants': Applicant.query.count(),
                'organizations': Organization.query.count(),
                'matched': Applicant.query.filter_by(status='Matched').count()
            }
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400


# ============================================
# ERROR HANDLERS
# ============================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'success': False, 'message': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'success': False, 'message': 'Internal server error'}), 500


# ============================================
# CREATE DATABASE TABLES
# ============================================

@app.route('/api/init-db', methods=['POST'])
@require_admin_auth
def init_db():
    """Initialize database (create all tables)"""
    try:
        with app.app_context():
            db.create_all()
        return jsonify({
            'success': True,
            'message': 'Database initialized successfully'
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400
    
# ============================================
# MATCHING ENDPOINTS
# ============================================

@app.route('/api/matches/generate', methods=['POST'])
@require_admin_auth
def generate_all_matches():
    """Generate AI matches for all applicants AND automatically assign
    each applicant to their best available organization, respecting capacity."""
    try:
        applicants = Applicant.query.all()
        organizations = Organization.query.all()

        if not applicants or not organizations:
            return jsonify({
                'success': False,
                'message': 'Need at least one applicant and one organization to generate matches'
            }), 400

        # Reset previous matches and assignments — full recalculation
        MatchResult.query.delete()
        for org in organizations:
            org.positions_filled = 0
        for applicant in applicants:
            applicant.matched_organization_id = None
            if applicant.status == 'Matched':
                applicant.status = 'Pending'
        db.session.commit()

        # Generate the candidate match lists (top 5 per applicant, for admin visibility)
        matches = matching_engine.find_matches_for_all_applicants(applicants, organizations)

        # Automatically assign each applicant to their best available organization
        assignments = matching_engine.auto_assign_matches(applicants, organizations)

        auto_matched_count = 0
        for applicant in applicants:
            assignment = assignments.get(applicant.id)
            if assignment:
                org_id, score = assignment
                applicant.status = 'Matched'
                applicant.matched_organization_id = org_id
                org = next((o for o in organizations if o.id == org_id), None)
                if org:
                    org.positions_filled = (org.positions_filled or 0) + 1
                auto_matched_count += 1

        db.session.commit()

        return jsonify({
            'success': True,
            'message': f'Generated {len(matches)} candidate matches and automatically placed {auto_matched_count} applicants',
            'total_matches': len(matches),
            'auto_matched': auto_matched_count
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 400


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000)
