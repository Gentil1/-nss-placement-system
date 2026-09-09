from app import app, db
from models import Organization

# Sample organizations
organizations = [
    {
        'name': 'MTN Ghana',
        'industry': 'Telecommunications',
        'location': 'Accra',
        'description': 'Leading telecommunications company providing mobile, data, and financial services',
        'required_skills': 'Communication, Customer Service, IT Support, Problem Solving',
        'preferred_qualification': 'Diploma, Bachelor',
        'positions_available': 5,
        'contact_email': 'careers@mtn.com.gh',
        'contact_person': 'HR Department'
    },
    {
        'name': 'Consolidated Bank Ghana',
        'industry': 'Finance',
        'location': 'Accra',
        'description': 'Financial institution providing banking and investment services',
        'required_skills': 'Finance, Accounting, Data Analysis, Customer Relations',
        'preferred_qualification': 'Bachelor',
        'positions_available': 3,
        'contact_email': 'recruitment@cbg.com.gh',
        'contact_person': 'Finance Team'
    },
    {
        'name': 'Soft Techniques',
        'industry': 'Technology',
        'location': 'Accra',
        'description': 'Software development and IT solutions company',
        'required_skills': 'Python, JavaScript, Database Management, Problem Solving, Networking',
        'preferred_qualification': 'Bachelor',
        'positions_available': 4,
        'contact_email': 'jobs@softtechniques.com',
        'contact_person': 'Tech Lead'
    },
    {
        'name': 'Ghana Education Service',
        'industry': 'Education',
        'location': 'Accra',
        'description': 'Government education institution focused on teaching and learning',
        'required_skills': 'Communication, Leadership, Teamwork, Teaching',
        'preferred_qualification': 'Diploma, Bachelor',
        'positions_available': 10,
        'contact_email': 'recruitment@ges.edu.gh',
        'contact_person': 'Education Officer'
    },
    {
        'name': 'CARE International',
        'industry': 'NGO/Development',
        'location': 'Accra',
        'description': 'International NGO working on poverty reduction and community development',
        'required_skills': 'Communication, Teamwork, Leadership, Problem Solving, Data Analysis',
        'preferred_qualification': 'Diploma, Bachelor',
        'positions_available': 6,
        'contact_email': 'careers@careinternational.org.gh',
        'contact_person': 'HR Manager'
    },
    {
        'name': 'Ashanti Gold Mining',
        'industry': 'Manufacturing',
        'location': 'Obuasi',
        'description': 'Mining company focused on gold extraction and processing',
        'required_skills': 'Problem Solving, Teamwork, Data Analysis, Leadership',
        'preferred_qualification': 'Diploma, Bachelor',
        'positions_available': 8,
        'contact_email': 'hr@ashantigold.com',
        'contact_person': 'Operations Manager'
    },
]

def seed_organizations():
    """Add sample organizations to database"""
    with app.app_context():
        # Check if organizations already exist
        existing = Organization.query.count()
        
        if existing > 0:
            print(f"Database already has {existing} organizations. Skipping seed.")
            return
        
        try:
            for org_data in organizations:
                org = Organization(**org_data)
                db.session.add(org)
            
            db.session.commit()
            print(f"✅ Successfully added {len(organizations)} organizations!")
            
            # Display what was added
            all_orgs = Organization.query.all()
            print("\nOrganizations in database:")
            for org in all_orgs:
                print(f"  - {org.name} ({org.industry})")
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error: {e}")

if __name__ == '__main__':
    seed_organizations()