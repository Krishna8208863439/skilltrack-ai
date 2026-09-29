const test = require('node:test');
const assert = require('node:assert');

const BASE_URL = 'http://localhost:5000/api';

test('SkillTrack AI Backend Integration Test Suite', async (t) => {
  let candidateToken = '';
  let employerToken = '';
  let adminToken = '';

  await t.test('1. Health Check Endpoint', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, 'healthy');
    assert.strictEqual(data.problemStatementId, '26135');
  });

  await t.test('2. Authentication & Authorization', async (sub) => {
    await sub.test('Candidate Login with valid credentials', async () => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'priya.sharma@demo.com', password: 'Candidate@123' }),
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(data.token);
      assert.strictEqual(data.user.role, 'CANDIDATE');
      candidateToken = data.token;
    });

    await sub.test('Employer Login', async () => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'recruiter@techcorp.in', password: 'Employer@123' }),
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.user.role, 'EMPLOYER');
      employerToken = data.token;
    });

    await sub.test('Admin Login', async () => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@skilltrack.ai', password: 'Admin@123456' }),
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.user.role, 'ADMIN');
      adminToken = data.token;
    });

    await sub.test('Login with invalid password returns 401', async () => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'priya.sharma@demo.com', password: 'WrongPassword' }),
      });
      assert.strictEqual(res.status, 401);
      const data = await res.json();
      assert.strictEqual(data.success, false);
    });

    await sub.test('Register new candidate user', async () => {
      const uniqueEmail = `test.user.${Date.now()}@demo.com`;
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Ananya Verma',
          email: uniqueEmail,
          password: 'Password@123',
          role: 'CANDIDATE',
        }),
      });
      assert.strictEqual(res.status, 201);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.user.name, 'Ananya Verma');
    });

    await sub.test('Duplicate registration returns 409 Conflict', async () => {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Priya Sharma',
          email: 'priya.sharma@demo.com',
          password: 'Password@123',
        }),
      });
      assert.strictEqual(res.status, 409);
    });

    await sub.test('Protected endpoint without token returns 401', async () => {
      const res = await fetch(`${BASE_URL}/candidate/profile`);
      assert.strictEqual(res.status, 401);
    });

    await sub.test('Role guard: Candidate accessing Admin stats returns 403 Forbidden', async () => {
      const res = await fetch(`${BASE_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${candidateToken}` },
      });
      assert.strictEqual(res.status, 403);
    });
  });

  await t.test('3. Candidate Profile Management', async (sub) => {
    await sub.test('GET /candidate/profile', async () => {
      const res = await fetch(`${BASE_URL}/candidate/profile`, {
        headers: { Authorization: `Bearer ${candidateToken}` },
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(data.profile);
    });

    await sub.test('PUT /candidate/profile updates details', async () => {
      const res = await fetch(`${BASE_URL}/candidate/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${candidateToken}`,
        },
        body: JSON.stringify({
          headline: 'Full Stack Engineer & Cloud Specialist',
          yearsOfExperience: 2.0,
        }),
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.profile.headline, 'Full Stack Engineer & Cloud Specialist');
    });
  });

  await t.test('4. AI Resume Parsing', async () => {
    const resumeSample = `
      Priya Sharma
      Full Stack Software Engineer
      Skills: JavaScript, TypeScript, React.js, Node.js, PostgreSQL, Docker, AWS.
      B.Tech Computer Science graduate.
    `;
    const res = await fetch(`${BASE_URL}/candidate/parse-resume-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${candidateToken}`,
      },
      body: JSON.stringify({ resumeText: resumeSample }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.parsedData.extractedSkills.length >= 4);
    assert.strictEqual(data.parsedData.reviewRequired, true);
  });

  await t.test('5. Skill Gap Analysis & Radar Matrix', async () => {
    const res = await fetch(`${BASE_URL}/skill-gap/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${candidateToken}`,
      },
      body: JSON.stringify({ jobId: 'job-1' }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.data.matchPercentage >= 0 && data.data.matchPercentage <= 100);
    assert.ok(data.data.radarData.length > 0);
    assert.ok(data.data.scoringMethodology.disclaimer);
  });

  await t.test('6. Jobs & Application Workflow', async (sub) => {
    await sub.test('GET /jobs returns enriched jobs with match scores', async () => {
      const res = await fetch(`${BASE_URL}/jobs`, {
        headers: { Authorization: `Bearer ${candidateToken}` },
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.ok(data.jobs.length > 0);
      assert.ok(data.jobs[0].matchScore >= 0);
    });

    await sub.test('Employer posts new job', async () => {
      const res = await fetch(`${BASE_URL}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${employerToken}`,
        },
        body: JSON.stringify({
          title: 'Senior Cloud Architect',
          company: 'TechCorp India',
          description: 'Looking for Kubernetes and cloud architecture lead.',
          requiredSkills: [
            { name: 'Kubernetes', importance: 'REQUIRED', minProficiency: 4 },
            { name: 'AWS', importance: 'REQUIRED', minProficiency: 4 },
          ],
        }),
      });
      assert.strictEqual(res.status, 201);
      const data = await res.json();
      assert.strictEqual(data.job.title, 'Senior Cloud Architect');
    });
  });

  await t.test('7. Course Recommendations & Enrollment', async (sub) => {
    await sub.test('GET /courses/recommendations', async () => {
      const res = await fetch(`${BASE_URL}/courses/recommendations`, {
        headers: { Authorization: `Bearer ${candidateToken}` },
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.ok(data.recommendations.length > 0);
    });

    await sub.test('POST /courses/:id/enroll enrolls student', async () => {
      const res = await fetch(`${BASE_URL}/courses/crs-1/enroll`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${candidateToken}` },
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
    });
  });

  await t.test('8. Employment Tracking Pipeline', async (sub) => {
    await sub.test('GET /tracking/pipeline', async () => {
      const res = await fetch(`${BASE_URL}/tracking/pipeline`, {
        headers: { Authorization: `Bearer ${candidateToken}` },
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.ok(data.data.applications);
      assert.ok(data.data.interviews);
    });

    await sub.test('Employer updates application status', async () => {
      const res = await fetch(`${BASE_URL}/tracking/status-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${employerToken}`,
        },
        body: JSON.stringify({
          applicationId: 'app-1',
          status: 'SHORTLISTED',
          notes: 'Candidate meets all technical criteria.',
        }),
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.application.status, 'SHORTLISTED');
    });
  });

  await t.test('9. Admin Analytics, Audit & CSV Export', async (sub) => {
    await sub.test('GET /admin/stats', async () => {
      const res = await fetch(`${BASE_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.ok(data.data.overview.totalCandidates > 0);
      assert.ok(data.data.overview.placementRatePercentage > 0);
    });

    await sub.test('GET /admin/audit-logs', async () => {
      const res = await fetch(`${BASE_URL}/admin/audit-logs`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.ok(data.logs.length > 0);
    });

    await sub.test('GET /admin/export-csv returns CSV with headers', async () => {
      const res = await fetch(`${BASE_URL}/admin/export-csv`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.strictEqual(res.status, 200);
      assert.ok(res.headers.get('content-type').includes('text/csv'));
      const text = await res.text();
      assert.ok(text.includes('Metric'));
      assert.ok(text.includes('Placement Rate %'));
    });
  });
});
