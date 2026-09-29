import pytest
from fastapi.testclient import TestClient
from src.main import app, extract_skills_from_text, parse_candidate_metadata

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["taxonomyCount"] > 0
    assert data["models"]["taxonomy_loaded"] is True

def test_taxonomy_endpoint():
    response = client.get("/api/ai/taxonomy")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["count"] >= 20

def test_extract_skills_nlp():
    sample_text = """
    Priya Sharma
    Email: priya@demo.com | Phone: +91-9876543210
    Full Stack Developer with 3+ years experience in React.js, TypeScript, Node.js, and PostgreSQL.
    Proficient in Docker and Git version control.
    """
    response = client.post("/api/ai/extract-skills", json={"text": sample_text})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    extracted_names = [s["name"] for s in data["parsedData"]["extractedSkills"]]
    assert "React.js" in extracted_names
    assert "TypeScript" in extracted_names
    assert "Node.js" in extracted_names
    assert "PostgreSQL" in extracted_names
    assert "Docker" in extracted_names
    assert "Git" in extracted_names
    assert data["parsedData"]["headline"] == "Full Stack Engineer"
    assert data["parsedData"]["email"] == "priya@demo.com"

def test_extract_skills_empty_text():
    response = client.post("/api/ai/extract-skills", json={"text": "   "})
    assert response.status_code == 400

def test_skill_gap_analysis():
    payload = {
        "candidateSkills": [
            {"name": "React.js", "proficiency": 4, "isVerified": True},
            {"name": "Node.js", "proficiency": 3, "isVerified": True},
        ],
        "jobRequiredSkills": [
            {"name": "React.js", "importance": "REQUIRED", "minProficiency": 3},
            {"name": "Node.js", "importance": "REQUIRED", "minProficiency": 3},
            {"name": "Docker", "importance": "REQUIRED", "minProficiency": 3},
            {"name": "AWS", "importance": "PREFERRED", "minProficiency": 2},
        ],
        "jobDescription": "Full stack engineer building cloud microservices with React and Docker."
    }
    response = client.post("/api/ai/skill-gap", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "matchPercentage" in data
    assert "skillGapScore" in data
    assert len(data["matchedSkills"]) == 2
    assert len(data["missingSkills"]) == 2
    assert any(m["name"] == "Docker" for m in data["missingSkills"])
    assert any(m["name"] == "AWS" for m in data["missingSkills"])
    # Disclaimers must exist
    assert "disclaimer" in data["scoringMethodology"]

def test_course_recommendations():
    payload = {
        "candidateSkills": [{"name": "React.js", "proficiency": 4}],
        "courses": [
            {
                "id": "c-1",
                "title": "Cloud DevOps & Docker Mastery",
                "skillsTaught": ["Docker", "Kubernetes", "AWS"],
                "rating": 4.9
            },
            {
                "id": "c-2",
                "title": "Frontend Basics",
                "skillsTaught": ["React.js", "HTML", "CSS"],
                "rating": 4.5
            }
        ]
    }
    response = client.post("/api/ai/recommend-courses", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    # The cloud course should be ranked first because it teaches 3 unacquired skills
    assert data["recommendations"][0]["id"] == "c-1"

def test_match_jobs():
    payload = {
        "candidateSkills": [
            {"name": "React.js", "proficiency": 4},
            {"name": "Node.js", "proficiency": 3}
        ],
        "jobs": [
            {
                "id": "j-1",
                "title": "Full Stack Developer",
                "requiredSkills": [{"name": "React.js"}, {"name": "Node.js"}]
            },
            {
                "id": "j-2",
                "title": "Data Scientist",
                "requiredSkills": [{"name": "Python"}, {"name": "scikit-learn"}, {"name": "Pandas"}]
            }
        ]
    }
    response = client.post("/api/ai/match-jobs", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["jobs"][0]["id"] == "j-1"
    assert data["jobs"][0]["matchScore"] > data["jobs"][1]["matchScore"]
