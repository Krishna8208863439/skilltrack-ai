/**
 * SkillTrack AI — PostgreSQL Seed Script
 * SIH 2026 | PS-26135 | Team: Code Warriors
 *
 * ⚠️  DEMO DATA — Not real-world statistics.
 *     Clearly labeled in the UI as "Demo data".
 *     Replace all credentials before any production deployment.
 *
 * Run: node prisma/seed.js
 */

'use strict'

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient({ log: ['warn', 'error'] })

// ─── Helpers ──────────────────────────────────────────────────────────────────
const hash = (pw) => bcrypt.hashSync(pw, 12)
const ago = (days) => new Date(Date.now() - days * 86400000)
const future = (days) => new Date(Date.now() + days * 86400000)

async function main() {
  console.log('🌱  Starting seed...')

  // ── 1. Users ────────────────────────────────────────────────────────────────
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@skilltrack.ai' },
    update: {},
    create: {
      email: 'admin@skilltrack.ai',
      passwordHash: hash('Admin@123456'),
      name: 'Platform Admin',
      role: 'ADMIN',
      isActive: true,
      emailVerified: true,
    },
  })

  const candidate1 = await prisma.user.upsert({
    where: { email: 'priya.sharma@demo.com' },
    update: {},
    create: {
      email: 'priya.sharma@demo.com',
      passwordHash: hash('Candidate@123'),
      name: 'Priya Sharma',
      role: 'CANDIDATE',
      phone: '+91-9876543210',
      isActive: true,
      emailVerified: true,
      lastLoginAt: ago(1),
    },
  })

  const candidate2 = await prisma.user.upsert({
    where: { email: 'rahul.kumar@demo.com' },
    update: {},
    create: {
      email: 'rahul.kumar@demo.com',
      passwordHash: hash('Candidate@123'),
      name: 'Rahul Kumar',
      role: 'CANDIDATE',
      phone: '+91-9876543211',
      isActive: true,
      emailVerified: true,
      lastLoginAt: ago(3),
    },
  })

  const candidate3 = await prisma.user.upsert({
    where: { email: 'ananya.patel@demo.com' },
    update: {},
    create: {
      email: 'ananya.patel@demo.com',
      passwordHash: hash('Candidate@123'),
      name: 'Ananya Patel',
      role: 'CANDIDATE',
      isActive: true,
      emailVerified: true,
    },
  })

  const employerUser = await prisma.user.upsert({
    where: { email: 'hr@techcorp.demo.com' },
    update: {},
    create: {
      email: 'hr@techcorp.demo.com',
      passwordHash: hash('Employer@123'),
      name: 'TechCorp HR',
      role: 'EMPLOYER',
      isActive: true,
      emailVerified: true,
    },
  })

  const employer2User = await prisma.user.upsert({
    where: { email: 'talent@infosys.demo.com' },
    update: {},
    create: {
      email: 'talent@infosys.demo.com',
      passwordHash: hash('Employer@123'),
      name: 'Infosys Talent',
      role: 'EMPLOYER',
      isActive: true,
      emailVerified: true,
    },
  })

  const instituteUser = await prisma.user.upsert({
    where: { email: 'admin@nsdc.demo.com' },
    update: {},
    create: {
      email: 'admin@nsdc.demo.com',
      passwordHash: hash('Institute@123'),
      name: 'NSDC Admin',
      role: 'INSTITUTE',
      isActive: true,
      emailVerified: true,
    },
  })

  console.log('  ✅ Users created')

  // ── 2. Consents ─────────────────────────────────────────────────────────────
  for (const userId of [candidate1.id, candidate2.id]) {
    for (const consentType of ['PROFILE_VISIBLE_TO_EMPLOYERS', 'CONTACT_VISIBLE']) {
      await prisma.consent.upsert({
        where: { userId_consentType: { userId, consentType } },
        update: {},
        create: { userId, consentType, granted: true, grantedAt: ago(30) },
      })
    }
  }
  console.log('  ✅ Consents created')

  // ── 3. Skills Taxonomy ──────────────────────────────────────────────────────
  const skillsData = [
    // Technical / Programming
    { name: 'JavaScript', normalizedName: 'javascript', category: 'TECHNICAL', aliases: ['JS', 'ES6', 'ECMAScript', 'Node JS'] },
    { name: 'TypeScript', normalizedName: 'typescript', category: 'TECHNICAL', aliases: ['TS'] },
    { name: 'Python', normalizedName: 'python', category: 'TECHNICAL', aliases: ['Python3', 'Py'] },
    { name: 'Java', normalizedName: 'java', category: 'TECHNICAL', aliases: ['Java 11', 'Java 17'] },
    { name: 'C++', normalizedName: 'c++', category: 'TECHNICAL', aliases: ['CPP', 'C Plus Plus'] },
    { name: 'Go', normalizedName: 'go', category: 'TECHNICAL', aliases: ['Golang'] },
    { name: 'Rust', normalizedName: 'rust', category: 'TECHNICAL', aliases: [] },
    // Frameworks
    { name: 'React', normalizedName: 'react', category: 'FRAMEWORK', aliases: ['React.js', 'ReactJS'] },
    { name: 'Node.js', normalizedName: 'nodejs', category: 'FRAMEWORK', aliases: ['Node', 'NodeJS', 'Express.js'] },
    { name: 'FastAPI', normalizedName: 'fastapi', category: 'FRAMEWORK', aliases: ['Fast API'] },
    { name: 'Django', normalizedName: 'django', category: 'FRAMEWORK', aliases: [] },
    { name: 'Spring Boot', normalizedName: 'spring-boot', category: 'FRAMEWORK', aliases: ['Spring', 'Spring Framework'] },
    { name: 'Vue.js', normalizedName: 'vuejs', category: 'FRAMEWORK', aliases: ['Vue', 'VueJS'] },
    { name: 'Next.js', normalizedName: 'nextjs', category: 'FRAMEWORK', aliases: ['Next', 'NextJS'] },
    // Databases
    { name: 'PostgreSQL', normalizedName: 'postgresql', category: 'DATABASE', aliases: ['Postgres', 'PG'] },
    { name: 'MySQL', normalizedName: 'mysql', category: 'DATABASE', aliases: [] },
    { name: 'MongoDB', normalizedName: 'mongodb', category: 'DATABASE', aliases: ['Mongo'] },
    { name: 'Redis', normalizedName: 'redis', category: 'DATABASE', aliases: [] },
    // Cloud
    { name: 'AWS', normalizedName: 'aws', category: 'CLOUD', aliases: ['Amazon Web Services'] },
    { name: 'Google Cloud', normalizedName: 'gcp', category: 'CLOUD', aliases: ['GCP', 'Google Cloud Platform'] },
    { name: 'Azure', normalizedName: 'azure', category: 'CLOUD', aliases: ['Microsoft Azure'] },
    { name: 'Docker', normalizedName: 'docker', category: 'TOOL', aliases: ['Docker Compose'] },
    { name: 'Kubernetes', normalizedName: 'kubernetes', category: 'TOOL', aliases: ['K8s'] },
    { name: 'Git', normalizedName: 'git', category: 'TOOL', aliases: ['GitHub', 'GitLab', 'Version Control'] },
    // Data / AI-ML
    { name: 'Machine Learning', normalizedName: 'machine-learning', category: 'DOMAIN', aliases: ['ML'] },
    { name: 'Deep Learning', normalizedName: 'deep-learning', category: 'DOMAIN', aliases: ['DL', 'Neural Networks'] },
    { name: 'Data Science', normalizedName: 'data-science', category: 'DOMAIN', aliases: ['Data Analysis'] },
    { name: 'TensorFlow', normalizedName: 'tensorflow', category: 'FRAMEWORK', aliases: ['TF'] },
    { name: 'PyTorch', normalizedName: 'pytorch', category: 'FRAMEWORK', aliases: [] },
    { name: 'Pandas', normalizedName: 'pandas', category: 'TOOL', aliases: [] },
    { name: 'NumPy', normalizedName: 'numpy', category: 'TOOL', aliases: [] },
    { name: 'scikit-learn', normalizedName: 'scikit-learn', category: 'TOOL', aliases: ['sklearn'] },
    { name: 'SQL', normalizedName: 'sql', category: 'LANGUAGE', aliases: [] },
    // Soft Skills
    { name: 'Communication', normalizedName: 'communication', category: 'SOFT', aliases: [] },
    { name: 'Problem Solving', normalizedName: 'problem-solving', category: 'SOFT', aliases: [] },
    { name: 'Teamwork', normalizedName: 'teamwork', category: 'SOFT', aliases: ['Collaboration'] },
    { name: 'Leadership', normalizedName: 'leadership', category: 'SOFT', aliases: [] },
    // Domain
    { name: 'REST APIs', normalizedName: 'rest-api', category: 'DOMAIN', aliases: ['RESTful API', 'REST', 'API Development'] },
    { name: 'GraphQL', normalizedName: 'graphql', category: 'DOMAIN', aliases: [] },
    { name: 'System Design', normalizedName: 'system-design', category: 'DOMAIN', aliases: ['Software Architecture'] },
    { name: 'Agile', normalizedName: 'agile', category: 'DOMAIN', aliases: ['Scrum', 'Kanban'] },
    { name: 'DevOps', normalizedName: 'devops', category: 'DOMAIN', aliases: ['CI/CD'] },
    { name: 'Cybersecurity', normalizedName: 'cybersecurity', category: 'DOMAIN', aliases: ['Security', 'Information Security'] },
    { name: 'UI/UX Design', normalizedName: 'ui-ux', category: 'DOMAIN', aliases: ['User Experience', 'UX Design', 'Figma'] },
    { name: 'Excel / Spreadsheets', normalizedName: 'excel', category: 'TOOL', aliases: ['MS Excel', 'Google Sheets'] },
    { name: 'Power BI', normalizedName: 'power-bi', category: 'TOOL', aliases: ['PowerBI', 'Business Intelligence'] },
  ]

  const skillMap = {}
  for (const s of skillsData) {
    const skill = await prisma.skill.upsert({
      where: { normalizedName: s.normalizedName },
      update: { aliases: s.aliases },
      create: s,
    })
    skillMap[s.normalizedName] = skill
  }
  console.log(`  ✅ Skills taxonomy: ${Object.keys(skillMap).length} skills`)

  // ── 4. Candidate Profiles ───────────────────────────────────────────────────
  const profile1 = await prisma.candidateProfile.upsert({
    where: { userId: candidate1.id },
    update: {},
    create: {
      userId: candidate1.id,
      headline: 'Full Stack Developer | React & Node.js | Open to Work',
      summary: 'Motivated CS graduate with hands-on experience in React, Node.js, and PostgreSQL. Passionate about building scalable web applications. Looking for opportunities in product-based companies.',
      location: 'Bengaluru, Karnataka',
      preferredLocations: ['Bengaluru', 'Mumbai', 'Remote'],
      careerInterests: ['Full Stack Development', 'System Design', 'Cloud Engineering'],
      isOpenToWork: true,
      employmentStatus: 'JOB_SEEKER',
      profileCompleteness: 82,
      linkedinUrl: 'https://linkedin.com/in/priya-sharma-demo',
      githubUrl: 'https://github.com/priya-sharma-demo',
      expectedSalaryMin: 700000,
      expectedSalaryMax: 1200000,
    },
  })

  const profile2 = await prisma.candidateProfile.upsert({
    where: { userId: candidate2.id },
    update: {},
    create: {
      userId: candidate2.id,
      headline: 'Data Science Enthusiast | Python | ML | Fresher',
      summary: 'B.Tech (CS) final year student with strong foundations in Python, machine learning, and data analysis. Completed 2 ML internships. Interested in AI/ML roles.',
      location: 'Pune, Maharashtra',
      preferredLocations: ['Pune', 'Hyderabad', 'Remote'],
      careerInterests: ['Machine Learning', 'Data Science', 'AI Research'],
      isOpenToWork: true,
      employmentStatus: 'STUDENT',
      profileCompleteness: 65,
      expectedSalaryMin: 600000,
      expectedSalaryMax: 1000000,
    },
  })

  const profile3 = await prisma.candidateProfile.upsert({
    where: { userId: candidate3.id },
    update: {},
    create: {
      userId: candidate3.id,
      headline: 'Backend Developer | Java Spring Boot',
      summary: 'Java developer with 2 years of experience building enterprise applications with Spring Boot and PostgreSQL.',
      location: 'Hyderabad, Telangana',
      careerInterests: ['Backend Development', 'Microservices'],
      isOpenToWork: true,
      employmentStatus: 'EMPLOYED',
      profileCompleteness: 70,
      expectedSalaryMin: 1000000,
      expectedSalaryMax: 1500000,
    },
  })
  console.log('  ✅ Candidate profiles created')

  // ── 5. Education ─────────────────────────────────────────────────────────────
  await prisma.educationRecord.upsert({
    where: { id: 'edu-1-priya' },
    update: {},
    create: {
      id: 'edu-1-priya',
      candidateProfileId: profile1.id,
      degree: 'B.Tech',
      fieldOfStudy: 'Computer Science Engineering',
      institution: 'Visvesvaraya Technological University',
      startYear: 2019,
      endYear: 2023,
      grade: '8.7 CGPA',
    },
  })
  await prisma.educationRecord.upsert({
    where: { id: 'edu-1-rahul' },
    update: {},
    create: {
      id: 'edu-1-rahul',
      candidateProfileId: profile2.id,
      degree: 'B.Tech',
      fieldOfStudy: 'Computer Science',
      institution: 'College of Engineering Pune',
      startYear: 2020,
      endYear: 2024,
      grade: '9.1 CGPA',
      isCurrently: true,
    },
  })
  console.log('  ✅ Education records created')

  // ── 6. Candidate Skills ──────────────────────────────────────────────────────
  const priyaSkills = [
    { key: 'javascript', proficiency: 'ADVANCED', yoe: 2 },
    { key: 'react', proficiency: 'ADVANCED', yoe: 2 },
    { key: 'nodejs', proficiency: 'INTERMEDIATE', yoe: 1.5 },
    { key: 'postgresql', proficiency: 'INTERMEDIATE', yoe: 1.5 },
    { key: 'git', proficiency: 'ADVANCED', yoe: 3 },
    { key: 'rest-api', proficiency: 'ADVANCED', yoe: 2 },
    { key: 'sql', proficiency: 'INTERMEDIATE', yoe: 2 },
    { key: 'agile', proficiency: 'INTERMEDIATE', yoe: 1 },
    { key: 'docker', proficiency: 'BEGINNER', yoe: 0.5 },
  ]
  for (const s of priyaSkills) {
    if (!skillMap[s.key]) continue
    await prisma.candidateSkill.upsert({
      where: { candidateProfileId_skillId: { candidateProfileId: profile1.id, skillId: skillMap[s.key].id } },
      update: {},
      create: {
        candidateProfileId: profile1.id,
        skillId: skillMap[s.key].id,
        proficiency: s.proficiency,
        yearsOfExperience: s.yoe,
        source: 'SELF_REPORTED',
      },
    })
  }

  const rahulSkills = [
    { key: 'python', proficiency: 'ADVANCED', yoe: 2 },
    { key: 'machine-learning', proficiency: 'INTERMEDIATE', yoe: 1 },
    { key: 'data-science', proficiency: 'INTERMEDIATE', yoe: 1 },
    { key: 'scikit-learn', proficiency: 'INTERMEDIATE', yoe: 1 },
    { key: 'pandas', proficiency: 'ADVANCED', yoe: 2 },
    { key: 'numpy', proficiency: 'ADVANCED', yoe: 2 },
    { key: 'sql', proficiency: 'INTERMEDIATE', yoe: 1.5 },
    { key: 'git', proficiency: 'INTERMEDIATE', yoe: 2 },
  ]
  for (const s of rahulSkills) {
    if (!skillMap[s.key]) continue
    await prisma.candidateSkill.upsert({
      where: { candidateProfileId_skillId: { candidateProfileId: profile2.id, skillId: skillMap[s.key].id } },
      update: {},
      create: {
        candidateProfileId: profile2.id,
        skillId: skillMap[s.key].id,
        proficiency: s.proficiency,
        yearsOfExperience: s.yoe,
        source: 'SELF_REPORTED',
      },
    })
  }
  console.log('  ✅ Candidate skills created')

  // ── 7. Institute Profile ─────────────────────────────────────────────────────
  const institute = await prisma.instituteProfile.upsert({
    where: { userId: instituteUser.id },
    update: {},
    create: {
      userId: instituteUser.id,
      instituteName: 'NSDC Training Partner — DemoCenter (Sample Data)',
      instituteType: 'training_center',
      description: 'Government-affiliated skill development center offering IT, BFSI, and Logistics training programs under NSDC. [Demo Data — Not a real institute]',
      location: 'New Delhi',
      website: 'https://nsdcindia.org',
      accreditation: 'NSDC',
      establishedYear: 2015,
      contactEmail: 'demo@nsdc-sample.org',
      isVerified: true,
      verifiedAt: ago(90),
    },
  })

  // Training Programs
  const program1 = await prisma.trainingProgram.upsert({
    where: { id: 'prog-fullstack-demo' },
    update: {},
    create: {
      id: 'prog-fullstack-demo',
      instituteId: institute.id,
      title: 'Full Stack Web Development Bootcamp',
      description: 'Comprehensive 16-week program covering React, Node.js, PostgreSQL, and cloud deployment. [Demo Data]',
      durationWeeks: 16,
      mode: 'HYBRID',
      fees: 25000,
      capacity: 40,
      startDate: ago(60),
      endDate: future(50),
      status: 'ONGOING',
      skillsTaught: ['JavaScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'REST APIs'],
      targetJobRoles: ['Full Stack Developer', 'Frontend Developer', 'Backend Developer'],
    },
  })

  const program2 = await prisma.trainingProgram.upsert({
    where: { id: 'prog-mlops-demo' },
    update: {},
    create: {
      id: 'prog-mlops-demo',
      instituteId: institute.id,
      title: 'Data Science & Machine Learning Certification',
      description: '12-week intensive covering Python, ML algorithms, model deployment, and real-world projects. [Demo Data]',
      durationWeeks: 12,
      mode: 'ONSITE',
      fees: 20000,
      capacity: 30,
      startDate: ago(30),
      endDate: future(54),
      status: 'ONGOING',
      skillsTaught: ['Python', 'Machine Learning', 'scikit-learn', 'Pandas', 'NumPy', 'Data Science'],
      targetJobRoles: ['Data Scientist', 'ML Engineer', 'Data Analyst'],
    },
  })
  console.log('  ✅ Institute + programs created')

  // ── 8. Enrollments ───────────────────────────────────────────────────────────
  await prisma.enrollment.upsert({
    where: { userId_programId: { userId: candidate1.id, programId: program1.id } },
    update: {},
    create: {
      userId: candidate1.id,
      programId: program1.id,
      status: 'IN_PROGRESS',
      progress: 60,
    },
  })
  await prisma.enrollment.upsert({
    where: { userId_programId: { userId: candidate2.id, programId: program2.id } },
    update: {},
    create: {
      userId: candidate2.id,
      programId: program2.id,
      status: 'IN_PROGRESS',
      progress: 45,
    },
  })
  console.log('  ✅ Enrollments created')

  // ── 9. Employer Profiles ─────────────────────────────────────────────────────
  const employer1 = await prisma.employerProfile.upsert({
    where: { userId: employerUser.id },
    update: {},
    create: {
      userId: employerUser.id,
      companyName: 'TechCorp Solutions (Demo)',
      industry: 'Information Technology',
      description: 'Mid-size product company building SaaS tools for enterprises. [Demo Employer]',
      website: 'https://techcorp-demo.example.com',
      location: 'Bengaluru',
      companySize: '51-200',
      foundedYear: 2015,
      isVerified: true,
      contactEmail: 'hr@techcorp.demo.com',
    },
  })

  const employer2 = await prisma.employerProfile.upsert({
    where: { userId: employer2User.id },
    update: {},
    create: {
      userId: employer2User.id,
      companyName: 'DataInsights India (Demo)',
      industry: 'Analytics & AI',
      description: 'AI/ML consulting firm helping enterprises leverage data. [Demo Employer]',
      location: 'Hyderabad',
      companySize: '11-50',
      isVerified: true,
      contactEmail: 'talent@infosys.demo.com',
    },
  })
  console.log('  ✅ Employer profiles created')

  // ── 10. Jobs ─────────────────────────────────────────────────────────────────
  const job1 = await prisma.job.upsert({
    where: { id: 'job-fsd-techcorp-demo' },
    update: {},
    create: {
      id: 'job-fsd-techcorp-demo',
      employerId: employer1.id,
      title: 'Full Stack Developer',
      jobRole: 'Full Stack Developer',
      description: 'Build and maintain scalable web applications using React on the frontend and Node.js/Express on the backend, connected to PostgreSQL. You will work in cross-functional agile teams delivering product features end-to-end.',
      responsibilities: [
        'Design, develop, and deploy React-based frontend applications',
        'Build RESTful APIs using Node.js and Express',
        'Design and optimize PostgreSQL database schemas',
        'Participate in code reviews and agile ceremonies',
        'Collaborate with design, QA, and devops teams',
      ],
      qualifications: [
        "B.Tech/BE in CS, IT, or equivalent",
        "2+ years of full-stack experience",
        "Strong understanding of web fundamentals (HTML, CSS, HTTP)",
        "Familiarity with Docker and CI/CD is a plus",
      ],
      jobType: 'FULL_TIME',
      workMode: 'HYBRID',
      location: 'Bengaluru, Karnataka',
      salaryMin: 800000,
      salaryMax: 1400000,
      experienceMinYrs: 1,
      experienceMaxYrs: 4,
      educationLevel: 'bachelor',
      industry: 'Information Technology',
      status: 'ACTIVE',
      applicationDeadline: future(30),
      applicationCount: 0,
      views: 0,
    },
  })

  const job2 = await prisma.job.upsert({
    where: { id: 'job-ds-datainsights-demo' },
    update: {},
    create: {
      id: 'job-ds-datainsights-demo',
      employerId: employer2.id,
      title: 'Junior Data Scientist',
      jobRole: 'Data Scientist',
      description: 'Develop and deploy machine learning models to solve business problems. Work with structured and unstructured datasets using Python, scikit-learn, and TensorFlow.',
      responsibilities: [
        'Develop, train, and evaluate ML models',
        'Perform exploratory data analysis using Pandas and NumPy',
        'Collaborate with domain experts to understand business requirements',
        'Write production-ready Python code',
        'Document models and prepare reports for stakeholders',
      ],
      qualifications: [
        "B.Tech/M.Tech in CS, Mathematics, Statistics or related",
        "Strong Python programming skills",
        "Knowledge of ML algorithms (regression, classification, clustering)",
        "Experience with Pandas, NumPy, scikit-learn",
      ],
      jobType: 'FULL_TIME',
      workMode: 'HYBRID',
      location: 'Hyderabad, Telangana',
      salaryMin: 700000,
      salaryMax: 1200000,
      experienceMinYrs: 0,
      experienceMaxYrs: 2,
      educationLevel: 'bachelor',
      industry: 'Analytics & AI',
      status: 'ACTIVE',
      applicationDeadline: future(45),
      applicationCount: 0,
      views: 0,
    },
  })

  const job3 = await prisma.job.upsert({
    where: { id: 'job-frontend-techcorp-demo' },
    update: {},
    create: {
      id: 'job-frontend-techcorp-demo',
      employerId: employer1.id,
      title: 'Frontend Developer (React)',
      jobRole: 'Frontend Developer',
      description: 'Build high-quality, accessible, and performant React applications. You care deeply about UI details, component architecture, and user experience.',
      responsibilities: [
        'Develop React components using TypeScript',
        'Implement responsive designs from Figma specifications',
        'Write unit and integration tests',
        'Optimize frontend performance',
      ],
      qualifications: [
        "Experience with React and TypeScript",
        "Knowledge of HTML5, CSS3, responsive design",
        "Familiarity with Git, REST APIs",
      ],
      jobType: 'FULL_TIME',
      workMode: 'REMOTE',
      location: 'Remote (India)',
      salaryMin: 600000,
      salaryMax: 1100000,
      experienceMinYrs: 1,
      experienceMaxYrs: 3,
      educationLevel: 'any',
      industry: 'Information Technology',
      status: 'ACTIVE',
      applicationDeadline: future(20),
      applicationCount: 0,
      views: 0,
    },
  })
  console.log('  ✅ Jobs created')

  // ── 11. Job Required Skills ──────────────────────────────────────────────────
  const job1Skills = [
    { key: 'javascript', importance: 'REQUIRED', proficiency: 'ADVANCED' },
    { key: 'react', importance: 'REQUIRED', proficiency: 'ADVANCED' },
    { key: 'nodejs', importance: 'REQUIRED', proficiency: 'INTERMEDIATE' },
    { key: 'postgresql', importance: 'REQUIRED', proficiency: 'INTERMEDIATE' },
    { key: 'rest-api', importance: 'REQUIRED', proficiency: 'INTERMEDIATE' },
    { key: 'git', importance: 'PREFERRED', proficiency: 'INTERMEDIATE' },
    { key: 'docker', importance: 'NICE_TO_HAVE', proficiency: 'BEGINNER' },
    { key: 'typescript', importance: 'PREFERRED', proficiency: 'INTERMEDIATE' },
    { key: 'agile', importance: 'NICE_TO_HAVE', proficiency: 'BEGINNER' },
    { key: 'system-design', importance: 'PREFERRED', proficiency: 'INTERMEDIATE' },
  ]
  for (const s of job1Skills) {
    if (!skillMap[s.key]) continue
    await prisma.jobRequiredSkill.upsert({
      where: { jobId_skillId: { jobId: job1.id, skillId: skillMap[s.key].id } },
      update: {},
      create: { jobId: job1.id, skillId: skillMap[s.key].id, importance: s.importance, proficiencyLevel: s.proficiency },
    })
  }

  const job2Skills = [
    { key: 'python', importance: 'REQUIRED', proficiency: 'ADVANCED' },
    { key: 'machine-learning', importance: 'REQUIRED', proficiency: 'INTERMEDIATE' },
    { key: 'scikit-learn', importance: 'REQUIRED', proficiency: 'INTERMEDIATE' },
    { key: 'pandas', importance: 'REQUIRED', proficiency: 'INTERMEDIATE' },
    { key: 'numpy', importance: 'REQUIRED', proficiency: 'INTERMEDIATE' },
    { key: 'sql', importance: 'PREFERRED', proficiency: 'INTERMEDIATE' },
    { key: 'data-science', importance: 'PREFERRED', proficiency: 'INTERMEDIATE' },
    { key: 'deep-learning', importance: 'NICE_TO_HAVE', proficiency: 'BEGINNER' },
    { key: 'tensorflow', importance: 'NICE_TO_HAVE', proficiency: 'BEGINNER' },
    { key: 'git', importance: 'PREFERRED', proficiency: 'BEGINNER' },
  ]
  for (const s of job2Skills) {
    if (!skillMap[s.key]) continue
    await prisma.jobRequiredSkill.upsert({
      where: { jobId_skillId: { jobId: job2.id, skillId: skillMap[s.key].id } },
      update: {},
      create: { jobId: job2.id, skillId: skillMap[s.key].id, importance: s.importance, proficiencyLevel: s.proficiency },
    })
  }

  const job3Skills = [
    { key: 'javascript', importance: 'REQUIRED', proficiency: 'ADVANCED' },
    { key: 'react', importance: 'REQUIRED', proficiency: 'ADVANCED' },
    { key: 'typescript', importance: 'REQUIRED', proficiency: 'INTERMEDIATE' },
    { key: 'rest-api', importance: 'PREFERRED', proficiency: 'INTERMEDIATE' },
    { key: 'git', importance: 'REQUIRED', proficiency: 'INTERMEDIATE' },
    { key: 'ui-ux', importance: 'NICE_TO_HAVE', proficiency: 'BEGINNER' },
  ]
  for (const s of job3Skills) {
    if (!skillMap[s.key]) continue
    await prisma.jobRequiredSkill.upsert({
      where: { jobId_skillId: { jobId: job3.id, skillId: skillMap[s.key].id } },
      update: {},
      create: { jobId: job3.id, skillId: skillMap[s.key].id, importance: s.importance, proficiencyLevel: s.proficiency },
    })
  }
  console.log('  ✅ Job required skills created')

  // ── 12. Courses ──────────────────────────────────────────────────────────────
  const coursesData = [
    {
      id: 'course-react-meta',
      title: 'Meta React Basics',
      provider: 'Meta / Coursera',
      description: 'Official React course by Meta. Covers components, JSX, state, hooks, and routing. Certificate available. [Verified link]',
      courseUrl: 'https://www.coursera.org/learn/react-basics',
      durationHours: 27,
      difficulty: 'BEGINNER',
      isFree: false,
      price: 0,
      rating: 4.6,
      hasCertificate: true,
      isVerifiedLink: true,
      isDemo: false,
      skills: ['react', 'javascript'],
      targetJobRoles: ['Frontend Developer', 'Full Stack Developer'],
    },
    {
      id: 'course-python-ml-coursera',
      title: 'Machine Learning Specialization',
      provider: 'DeepLearning.AI / Coursera',
      description: 'Andrew Ng\'s updated ML course covering supervised, unsupervised learning, and deep learning. Industry-standard beginner resource. [Verified link]',
      courseUrl: 'https://www.coursera.org/specializations/machine-learning-introduction',
      durationHours: 90,
      difficulty: 'INTERMEDIATE',
      isFree: false,
      price: 0,
      rating: 4.9,
      hasCertificate: true,
      isVerifiedLink: true,
      isDemo: false,
      skills: ['machine-learning', 'python', 'scikit-learn'],
      targetJobRoles: ['Data Scientist', 'ML Engineer'],
    },
    {
      id: 'course-nodejs-udemy',
      title: 'The Complete Node.js Developer Course',
      provider: 'Udemy (Sample Data)',
      description: 'Comprehensive Node.js course covering Express, REST APIs, authentication, and PostgreSQL. [Sample Data — link may not be current]',
      courseUrl: null,
      durationHours: 35,
      difficulty: 'INTERMEDIATE',
      isFree: false,
      price: 499,
      rating: 4.7,
      hasCertificate: true,
      isVerifiedLink: false,
      isDemo: true,
      skills: ['nodejs', 'javascript', 'rest-api', 'postgresql'],
      targetJobRoles: ['Backend Developer', 'Full Stack Developer'],
    },
    {
      id: 'course-sql-mode',
      title: 'SQL Tutorial for Data Analysis',
      provider: 'Mode Analytics',
      description: 'Free interactive SQL tutorial focusing on data analysis queries, aggregations, and joins. [Verified link]',
      courseUrl: 'https://mode.com/sql-tutorial/',
      durationHours: 8,
      difficulty: 'BEGINNER',
      isFree: true,
      price: 0,
      rating: 4.5,
      hasCertificate: false,
      isVerifiedLink: true,
      isDemo: false,
      skills: ['sql', 'data-science'],
      targetJobRoles: ['Data Analyst', 'Data Scientist'],
    },
    {
      id: 'course-docker-fcc',
      title: 'Docker for Beginners',
      provider: 'freeCodeCamp / YouTube',
      description: 'Free comprehensive Docker tutorial covering containers, images, volumes, and Docker Compose. [Verified link]',
      courseUrl: 'https://www.youtube.com/watch?v=fqMOX6JJhGo',
      durationHours: 4,
      difficulty: 'BEGINNER',
      isFree: true,
      price: 0,
      rating: 4.7,
      hasCertificate: false,
      isVerifiedLink: true,
      isDemo: false,
      skills: ['docker', 'devops'],
      targetJobRoles: ['DevOps Engineer', 'Full Stack Developer'],
    },
    {
      id: 'course-typescript-net',
      title: 'TypeScript Full Course',
      provider: 'Traversy Media / YouTube',
      description: 'Free TypeScript crash course covering types, interfaces, generics, and integration with React. [Verified link]',
      courseUrl: 'https://www.youtube.com/watch?v=BCg4U1FzODs',
      durationHours: 2,
      difficulty: 'INTERMEDIATE',
      isFree: true,
      price: 0,
      rating: 4.5,
      hasCertificate: false,
      isVerifiedLink: true,
      isDemo: false,
      skills: ['typescript', 'javascript'],
      targetJobRoles: ['Frontend Developer', 'Full Stack Developer'],
    },
  ]

  for (const c of coursesData) {
    const { skills, ...courseData } = c
    const course = await prisma.course.upsert({
      where: { id: c.id },
      update: {},
      create: courseData,
    })
    for (const sk of skills) {
      if (!skillMap[sk]) continue
      await prisma.courseSkill.upsert({
        where: { courseId_skillId: { courseId: course.id, skillId: skillMap[sk].id } },
        update: {},
        create: { courseId: course.id, skillId: skillMap[sk].id },
      })
    }
  }
  console.log(`  ✅ Courses: ${coursesData.length} created`)

  // ── 13. Sample Application ───────────────────────────────────────────────────
  const app1 = await prisma.jobApplication.upsert({
    where: { userId_jobId: { userId: candidate1.id, jobId: job1.id } },
    update: {},
    create: {
      userId: candidate1.id,
      jobId: job1.id,
      status: 'SHORTLISTED',
      coverLetter: 'I am excited to apply for the Full Stack Developer role at TechCorp. My experience with React and Node.js aligns well with your requirements...',
      matchScore: 78,
    },
  })
  await prisma.applicationStatusHistory.createMany({
    data: [
      { applicationId: app1.id, status: 'APPLIED', note: 'Application submitted', changedAt: ago(14) },
      { applicationId: app1.id, status: 'SHORTLISTED', note: 'Profile matches requirements', changedAt: ago(7) },
    ],
    skipDuplicates: true,
  })

  // Schedule interview
  await prisma.interview.upsert({
    where: { id: 'interview-1-demo' },
    update: {},
    create: {
      id: 'interview-1-demo',
      applicationId: app1.id,
      scheduledAt: future(3),
      durationMins: 60,
      type: 'VIDEO',
      status: 'SCHEDULED',
      meetingUrl: 'https://meet.google.com/demo-link',
      notes: 'Technical round — cover React hooks, Node.js async patterns, and system design basics.',
    },
  })
  console.log('  ✅ Sample application + interview created')

  // ── 14. Notifications ────────────────────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      {
        userId: candidate1.id,
        title: 'Application Shortlisted',
        message: 'Your application for Full Stack Developer at TechCorp Solutions has been shortlisted!',
        type: 'success',
        link: '/applications',
      },
      {
        userId: candidate1.id,
        title: 'Interview Scheduled',
        message: 'A video interview has been scheduled for your TechCorp application. Check details.',
        type: 'info',
        link: '/applications',
      },
      {
        userId: candidate2.id,
        title: 'Complete Your Profile',
        message: 'Your profile is 65% complete. Add certifications and experience to improve job match scores.',
        type: 'warning',
        link: '/profile',
      },
    ],
    skipDuplicates: true,
  })
  console.log('  ✅ Notifications created')

  // ── 15. Audit Log entries ────────────────────────────────────────────────────
  await prisma.auditLog.createMany({
    data: [
      {
        actorId: adminUser.id,
        action: 'USER_CREATED',
        entityType: 'User',
        entityId: candidate1.id,
        details: { note: 'Seed: demo user created' },
        createdAt: ago(60),
      },
    ],
    skipDuplicates: true,
  })
  console.log('  ✅ Audit log entries created')

  console.log(`
╔══════════════════════════════════════════════════════════════════════════╗
║           SkillTrack AI — Seed Complete (Demo Data Loaded)              ║
╠══════════════════════════════════════════════════════════════════════════╣
║  ⚠️  DEMO CREDENTIALS — CHANGE BEFORE ANY REAL DEPLOYMENT               ║
║                                                                          ║
║  CANDIDATE  priya.sharma@demo.com   Candidate@123                        ║
║  CANDIDATE  rahul.kumar@demo.com    Candidate@123                        ║
║  EMPLOYER   hr@techcorp.demo.com    Employer@123                         ║
║  INSTITUTE  admin@nsdc.demo.com     Institute@123                        ║
║  ADMIN      admin@skilltrack.ai     Admin@123456                         ║
║                                                                          ║
║  All seeded data is labeled "[Demo Data]" in the UI.                     ║
╚══════════════════════════════════════════════════════════════════════════╝
  `)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
