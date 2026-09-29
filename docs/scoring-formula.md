# SkillTrack AI — Explainable Scoring & Recommendation Formulas
**Smart India Hackathon 2026 | Problem Statement ID: 26135**  
**Team: Code Warriors**

---

> ⚠️ **DISCLAIMER & ETHICAL TRANSPARENCY**  
> **A compatibility or match score is NOT a probability of being hired.** It is an objective, deterministic measure of qualification alignment against the posted requirements. SkillTrack AI does not fabricate statistical hiring chances or arbitrary AI confidence values.

---

## 1. Skill-Match Score Formulation

The Skill-Match score between a candidate profile $C$ and a job $J$ evaluates whether required and preferred skills are present, factoring in proficiency depth.

### 1.1 Weight Assignment by Importance
Every skill $s_i \in J_{skills}$ carries an importance weight $w_i$:
- **REQUIRED:** $w_i = 3.0$
- **PREFERRED:** $w_i = 1.5$
- **NICE_TO_HAVE:** $w_i = 0.5$

### 1.2 Proficiency Credit Score ($p_i$)
Proficiency levels are mapped from 1 to 5:
- `BEGINNER` = 1
- `ELEMENTARY` = 2
- `INTERMEDIATE` = 3
- `ADVANCED` = 4
- `EXPERT` = 5

For each job skill requirement with target proficiency $P_{req}$ and candidate proficiency $P_{cand}$:
$$p_i = \begin{cases} 
1.0 & \text{if } P_{cand} \ge P_{req} \\
0.75 & \text{if } P_{cand} = P_{req} - 1 \\
0.50 & \text{if } P_{cand} = P_{req} - 2 \\
0.25 & \text{if candidate possesses skill, but } P_{cand} < P_{req} - 2 \\
0.0 & \text{if candidate does not possess skill}
\end{cases}$$

### 1.3 Aggregate Skill Match Calculation
$$\text{SkillMatchScore} = \left( \frac{\sum_{i=1}^{N} w_i \cdot p_i}{\sum_{i=1}^{N} w_i} \right) \times 100$$

---

## 2. Overall Job Recommendation Composite Score

When ranking jobs for a candidate, the system combines four explainable factors:

$$\text{CompositeScore} = 0.45 \cdot S_{skill} + 0.20 \cdot S_{tfidf} + 0.15 \cdot S_{exp} + 0.10 \cdot S_{edu} + 0.10 \cdot S_{loc}$$

Where:
1. **$S_{skill}$ (Skill Match Score, 45%):** Deterministic rule-based formula from Section 1.
2. **$S_{tfidf}$ (Semantic Similarity, 20%):** Cosine similarity between TF-IDF vector of candidate's combined experience/projects and the full text of the job description.
3. **$S_{exp}$ (Experience Fit, 15%):**
   - $100\%$ if Candidate Experience $\ge$ Job Minimum Experience
   - Pro-rated linearly if Candidate Experience $<$ Job Minimum Experience.
4. **$S_{edu}$ (Education Alignment, 10%):** Binary or degree level equivalence (e.g., B.Tech matches B.E. / B.S.).
5. **$S_{loc}$ (Location & Work Mode Alignment, 10%):** Matches preference for Remote, Hybrid, or On-site city.

### Per-Factor Explanation Schema
Every recommended job returns an explicit breakdown:
```json
{
  "jobId": "job-101",
  "jobTitle": "Full Stack Engineer",
  "compositeScore": 84.5,
  "breakdown": {
    "skillScore": 88.0,
    "semanticTextMatch": 79.5,
    "experienceScore": 100.0,
    "educationScore": 100.0,
    "locationScore": 60.0
  },
  "matchingSkills": ["React.js", "Node.js", "PostgreSQL"],
  "missingRequiredSkills": ["Docker"],
  "missingPreferredSkills": ["Redis", "Kubernetes"],
  "explanation": "You meet 3 of 4 required skills with full experience qualification. Acquiring Docker will increase your match to 96%."
}
```

---

## 3. Course Recommendation Formula

Missing skills identified in the Skill-Gap phase are mapped directly to available training courses. Courses are ranked using:

$$\text{CourseRankScore} = \left( \frac{\text{Missing Skills Covered by Course}}{\text{Total Missing Skills Identified}} \times 0.60 \right) + (S_{difficulty\_fit} \times 0.25) + (S_{duration\_fit} \times 0.15)$$

- Verified courses taught by recognized partner institutes receive a verified badge.
- Completing a verified course automatically triggers the assessment or institute verification workflow to update the candidate's verified skill level.
