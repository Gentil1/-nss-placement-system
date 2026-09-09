from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from models import db, MatchResult

class AIMatchingEngine:
    """
    AI-powered matching engine using cosine similarity
    to match applicants with organizations.

    Optimized for scale: builds ONE shared vocabulary across all
    applicants and organizations, then computes all similarity
    scores in a single matrix operation instead of pair-by-pair.
    """

    def __init__(self):
        self.vectorizer = TfidfVectorizer(lowercase=True, stop_words='english')

    def create_applicant_profile(self, applicant):
        """Create a text profile from applicant data"""
        profile_parts = [
            ' '.join(applicant.skills.split(',')) if applicant.skills else '',
            applicant.programme,
            ' '.join(applicant.interests.split(',')) if applicant.interests else '',
            applicant.qualification,
            applicant.career_goal if applicant.career_goal else '',
            # Repeat region a few times to give it real weight in the similarity score,
            # similar to how skills/interests naturally repeat across the profile
            (applicant.preferred_region + ' ') * 3 if applicant.preferred_region else '',
        ]
        return ' '.join([p for p in profile_parts if p]).lower()

    def create_organization_profile(self, organization):
        """Create a text profile from organization requirements"""
        profile_parts = [
            ' '.join(organization.required_skills.split(',')) if organization.required_skills else '',
            organization.industry,
            organization.preferred_qualification if organization.preferred_qualification else '',
            organization.description if organization.description else '',
            (organization.region + ' ') * 3 if organization.region else '',
        ]
        return ' '.join([p for p in profile_parts if p]).lower()

    def generate_explanation(self, applicant, organization, match_score):
        """Generate human-readable explanation for the match"""
        explanations = []

        applicant_skills = set([s.strip().lower() for s in (applicant.skills or '').split(',')])
        org_skills = set([s.strip().lower() for s in (organization.required_skills or '').split(',')])

        skill_matches = applicant_skills & org_skills
        if skill_matches:
            explanations.append(f"Strong technical skills match: {', '.join(list(skill_matches)[:3])}")

        if applicant.preferred_region and organization.region and applicant.preferred_region.lower() == organization.region.lower():
            explanations.append(f"Located in your preferred region: {organization.region}")

        applicant_interests = set([i.strip().lower() for i in (applicant.interests or '').split(',')])
        if organization.industry.lower() in applicant_interests or any(
            interest in organization.industry.lower() for interest in applicant_interests
        ):
            explanations.append(f"Career interests align with {organization.industry}")

        if applicant.qualification.lower() in (organization.preferred_qualification or '').lower():
            explanations.append("Educational qualification matches organization requirements")

        if match_score >= 80:
            explanations.append("Excellent overall compatibility")
        elif match_score >= 60:
            explanations.append("Good compatibility with potential for growth")
        elif match_score >= 40:
            explanations.append("Moderate match with learning opportunities")

        if not explanations:
            explanations.append("Potential match based on profile analysis")

        return '. '.join(explanations) + '.'

    def find_matches_for_all_applicants(self, applicants, organizations, top_n=5):
        """
        Find matches for ALL applicants in one efficient batch pass.

        Instead of fitting a new TF-IDF vectorizer for every single
        applicant-organization pair (O(applicants x organizations) fits),
        this builds ONE shared vocabulary across everyone, then computes
        the full similarity matrix in a single operation. This scales to
        thousands of applicants and organizations instead of only dozens.
        """
        if not applicants or not organizations:
            return []

        # Skip organizations that have no remaining capacity
        available_organizations = [
            o for o in organizations
            if (o.positions_filled or 0) < (o.positions_available or 1)
        ]

        if not available_organizations:
            return []

        applicant_profiles = [self.create_applicant_profile(a) for a in applicants]
        org_profiles = [self.create_organization_profile(o) for o in available_organizations]

        # Build one shared vocabulary across everyone, once
        all_profiles = applicant_profiles + org_profiles
        tfidf_matrix = self.vectorizer.fit_transform(all_profiles)

        applicant_vectors = tfidf_matrix[:len(applicants)]
        org_vectors = tfidf_matrix[len(applicants):]

        # One matrix multiplication computes every applicant-org score at once
        similarity_matrix = cosine_similarity(applicant_vectors, org_vectors)

        all_matches = []
        match_results_to_save = []

        for i, applicant in enumerate(applicants):
            scores = similarity_matrix[i] * 100  # convert to 0-100 scale
            # Get indices of top N organizations for this applicant, highest first
            top_indices = np.argsort(scores)[::-1][:top_n]

            rank = 1
            for org_idx in top_indices:
                score = float(scores[org_idx])
                if score <= 0:
                    continue
                organization = available_organizations[org_idx]
                explanation = self.generate_explanation(applicant, organization, score)

                match_dict = {
                    'applicant_id': applicant.id,
                    'organization_id': organization.id,
                    'organization': organization.to_dict(),
                    'match_score': round(score, 2),
                    'explanation': explanation
                }
                all_matches.append(match_dict)

                match_results_to_save.append(MatchResult(
                    applicant_id=applicant.id,
                    organization_id=organization.id,
                    match_score=round(score, 2),
                    explanation=explanation,
                    rank=rank,
                    status='Pending'
                ))
                rank += 1

        # Bulk insert all matches in one transaction instead of one commit per applicant
        db.session.bulk_save_objects(match_results_to_save)
        db.session.commit()

        return all_matches
    def auto_assign_matches(self, applicants, organizations):
        """
        Automatically assign each applicant to their best available organization,
        respecting capacity — a greedy algorithm that maximizes overall match
        quality: every possible (applicant, organization) pairing is scored,
        sorted best-first, then assigned in that order as long as the organization
        still has room. This mirrors NSA's real process of matching graduates to
        agency vacancies without needing manual admin approval per applicant.
        """
        if not applicants or not organizations:
            return {}

        applicant_profiles = [self.create_applicant_profile(a) for a in applicants]
        org_profiles = [self.create_organization_profile(o) for o in organizations]

        all_profiles = applicant_profiles + org_profiles
        tfidf_matrix = self.vectorizer.fit_transform(all_profiles)

        applicant_vectors = tfidf_matrix[:len(applicants)]
        org_vectors = tfidf_matrix[len(applicants):]

        similarity_matrix = cosine_similarity(applicant_vectors, org_vectors) * 100

        # Build every (applicant_index, org_index, score) triple, sorted best-first
        all_pairs = []
        for i in range(len(applicants)):
            for j in range(len(organizations)):
                score = similarity_matrix[i][j]
                if score > 0:
                    all_pairs.append((score, i, j))
        all_pairs.sort(key=lambda x: x[0], reverse=True)

        remaining_capacity = {
            org.id: max(0, (org.positions_available or 1) - (org.positions_filled or 0))
            for org in organizations
        }
        assigned_applicants = set()
        assignments = {}  # applicant_id -> (organization_id, score)

        for score, i, j in all_pairs:
            applicant = applicants[i]
            organization = organizations[j]

            if applicant.id in assigned_applicants:
                continue
            if remaining_capacity[organization.id] <= 0:
                continue

            assignments[applicant.id] = (organization.id, round(float(score), 2))
            assigned_applicants.add(applicant.id)
            remaining_capacity[organization.id] -= 1

        return assignments

    def find_matches_for_applicant(self, applicant, organizations, top_n=5):
        """Find best matching organizations for a single applicant (used for on-demand re-matching)"""
        matches = self.find_matches_for_all_applicants([applicant], organizations, top_n=top_n)
        return matches

# Create singleton instance
matching_engine = AIMatchingEngine()