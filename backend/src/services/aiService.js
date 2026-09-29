const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

class AIServiceClient {
  constructor() {
    this.baseUrl = AI_SERVICE_URL;
  }

  async checkHealth() {
    try {
      const res = await fetch(`${this.baseUrl}/health`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      return { status: 'DEGRADED', reason: 'Python AI service unreachable' };
    }
  }

  async extractSkills(text) {
    try {
      const res = await fetch(`${this.baseUrl}/api/ai/extract-skills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('AIService extractSkills failed, falling back to local heuristic parser:', e.message);
    }
    // Local fallback
    return this.localExtractSkills(text);
  }

  async parseResumeFile(fileBuffer, originalname) {
    try {
      const formData = new FormData();
      const blob = new Blob([fileBuffer]);
      formData.append('file', blob, originalname);

      const res = await fetch(`${this.baseUrl}/api/ai/parse-resume-file`, {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(10000),
      });

      if (res.ok) {
        return await res.json();
      }
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'AI parser failed');
    } catch (e) {
      console.warn('AIService parseResumeFile failed:', e.message);
      throw e;
    }
  }

  async calculateSkillGap(candidateSkills, jobRequiredSkills, jobDescription) {
    try {
      const res = await fetch(`${this.baseUrl}/api/ai/skill-gap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateSkills,
          jobRequiredSkills,
          jobDescription: jobDescription || '',
        }),
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('AIService calculateSkillGap failed, falling back to deterministic local math:', e.message);
    }
    return null;
  }

  localExtractSkills(text) {
    const knownSkills = [
      { name: 'JavaScript', category: 'LANGUAGE', keywords: ['javascript', 'js', 'es6'] },
      { name: 'TypeScript', category: 'LANGUAGE', keywords: ['typescript', 'ts'] },
      { name: 'Python', category: 'LANGUAGE', keywords: ['python', 'fastapi', 'django'] },
      { name: 'React.js', category: 'FRAMEWORK', keywords: ['react', 'react.js', 'reactjs'] },
      { name: 'Node.js', category: 'FRAMEWORK', keywords: ['node', 'nodejs', 'express'] },
      { name: 'Docker', category: 'TOOL', keywords: ['docker', 'container', 'dockerfile'] },
      { name: 'Kubernetes', category: 'TOOL', keywords: ['kubernetes', 'k8s'] },
      { name: 'PostgreSQL', category: 'DATABASE', keywords: ['postgresql', 'postgres', 'sql'] },
      { name: 'MongoDB', category: 'DATABASE', keywords: ['mongodb', 'nosql'] },
      { name: 'Redis', category: 'DATABASE', keywords: ['redis'] },
      { name: 'AWS', category: 'CLOUD', keywords: ['aws', 'amazon web services', 's3', 'ec2'] },
      { name: 'Git', category: 'TOOL', keywords: ['git', 'github', 'version control'] },
    ];

    const lower = text.toLowerCase();
    const extractedSkills = [];

    for (const sk of knownSkills) {
      const matched = sk.keywords.some(k => lower.includes(k));
      if (matched) {
        extractedSkills.push({
          id: 'ext-' + Math.random().toString(36).substr(2, 9),
          name: sk.name,
          category: sk.category,
          proficiency: 3,
          source: 'RESUME_EXTRACTED',
          isVerified: false,
          confidence: 88,
        });
      }
    }

    let detectedDegree = 'Bachelor Degree / Engineering';
    if (lower.includes('master') || lower.includes('m.tech') || lower.includes('m.s')) {
      detectedDegree = 'Master Degree / Post Graduate';
    } else if (lower.includes('diploma')) {
      detectedDegree = 'Polytechnic Diploma';
    }

    return {
      success: true,
      message: 'Extracted skills using built-in deterministic taxonomy.',
      parsedData: {
        headline: lower.includes('full stack') ? 'Full Stack Engineer' : 'Software Engineer & Technologist',
        suggestedEducation: detectedDegree,
        extractedSkills,
        reviewRequired: true,
        ethicalNotice: 'Review all AI-extracted skills and adjust your proficiency levels (1-5) before saving to your profile.',
      }
    };
  }
}

module.exports = new AIServiceClient();
