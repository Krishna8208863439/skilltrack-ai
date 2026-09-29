import React, { useState, useRef } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  HiOutlineDocumentText,
  HiOutlineSparkles,
  HiOutlineCheckCircle,
  HiOutlineUpload,
  HiOutlineTrash,
  HiCheck,
} from 'react-icons/hi';

export const ResumeUpload: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'text'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState(
    `Priya Sharma\nEmail: priya.sharma@demo.com | Phone: +91-9876543210\nLocation: New Delhi, India\n\nPROFESSIONAL SUMMARY:\nEnthusiastic Full Stack Engineer with strong foundations in JavaScript, TypeScript, React.js, and Node.js. Experienced in designing REST APIs, integrating PostgreSQL databases, and utilizing Git for collaborative version control. Currently learning Docker containerization and AWS cloud infrastructure.\n\nTECHNICAL SKILLS:\nLanguages: JavaScript (ES6+), TypeScript, SQL, Python basics\nFrameworks: React.js, Node.js, Express.js\nDatabases: PostgreSQL, MongoDB\nDevOps & Tools: Git, GitHub, Docker (beginner), Linux\n\nEDUCATION:\nB.Tech in Computer Science & Engineering - Delhi Technological University (2020 - 2024)\n\nPROJECTS:\n1. E-Commerce Microservices: Built RESTful API services with Node.js and PostgreSQL.\n2. Analytics Portal: Interactive dashboard with React.js and Recharts.`
  );

  const [parsing, setParsing] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleParseText = async () => {
    if (!resumeText.trim()) {
      toast.error('Please provide resume text to analyze.');
      return;
    }
    setParsing(true);
    try {
      const res = await api.post('/candidate/parse-resume-text', { resumeText });
      if (res.data.success) {
        setExtractedData(res.data.parsedData);
        toast.success('Resume parsed successfully! Please review detected skills below.');
      }
    } catch (err) {
      toast.error('Failed to parse resume text.');
    } finally {
      setParsing(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to parse.');
      return;
    }
    setParsing(true);
    const formData = new FormData();
    formData.append('resume', selectedFile);

    try {
      const res = await api.post('/candidate/upload-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setExtractedData(res.data.parsedData);
        toast.success(`Parsed ${selectedFile.name} successfully via AI Service!`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to parse resume file.');
    } finally {
      setParsing(false);
    }
  };

  const handleRemoveSkill = (index: number) => {
    if (!extractedData) return;
    const updated = [...extractedData.extractedSkills];
    updated.splice(index, 1);
    setExtractedData({ ...extractedData, extractedSkills: updated });
  };

  const handleProficiencyChange = (index: number, prof: number) => {
    if (!extractedData) return;
    const updated = [...extractedData.extractedSkills];
    updated[index].proficiency = prof;
    setExtractedData({ ...extractedData, extractedSkills: updated });
  };

  const handleConfirmAndSave = async () => {
    if (!extractedData) return;
    setSaving(true);
    try {
      const profRes = await api.get('/candidate/profile');
      const currentSkills = profRes.data.profile?.skills || [];

      const newSkills = extractedData.extractedSkills.map((es: any) => ({
        id: es.id,
        name: es.name,
        category: es.category || 'TECHNICAL',
        proficiency: es.proficiency,
        source: 'RESUME_EXTRACTED',
        isVerified: true,
      }));

      // Merge avoiding duplicates
      const mergedMap = new Map();
      currentSkills.forEach((s: any) => mergedMap.set(s.name.toLowerCase(), s));
      newSkills.forEach((s: any) => mergedMap.set(s.name.toLowerCase(), s));
      const mergedSkills = Array.from(mergedMap.values());

      await api.put('/candidate/profile', {
        headline: extractedData.headline || profRes.data.profile?.headline,
        skills: mergedSkills,
      });

      toast.success('Reviewed skills confirmed and persisted to your profile!');
    } catch (err) {
      toast.error('Failed to save reviewed skills.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 w-full">
        <div className="border-b border-slate-200 pb-4">
          <h1 className="text-2xl font-bold text-navy-900">AI Resume Extraction & Skill Verification</h1>
          <p className="text-xs text-slate-500">
            Powered by PyMuPDF, python-docx & NLP Skill Taxonomy. Supports transparent candidate review prior to saving.
          </p>
        </div>

        {/* Ethical AI Notice */}
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-start gap-3">
          <HiOutlineSparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Transparent AI Policy:</span> SkillTrack AI extracts candidate skills and suggested experience levels using semantic dictionary matching. To protect candidate agency, extractions are <span className="font-bold underline">never auto-saved</span> without explicit candidate review and confirmation.
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-5 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'upload'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HiOutlineUpload className="w-4 h-4" />
            <span>Upload Resume Document (.PDF, .DOCX, .TXT)</span>
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`px-5 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'text'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HiOutlineDocumentText className="w-4 h-4" />
            <span>Paste / Edit Resume Text</span>
          </button>
        </div>

        {/* Tab 1: File Upload */}
        {activeTab === 'upload' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-2xl p-8 text-center cursor-pointer transition-all hover:bg-slate-50 flex flex-col items-center justify-center space-y-3"
            >
              <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center">
                <HiOutlineUpload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">
                  {selectedFile ? selectedFile.name : 'Click to select or drag and drop your resume file'}
                </p>
                <p className="text-xs text-slate-500 mt-1">Supports PDF, Word (.docx), and plain text (.txt) up to 10MB</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleFileUpload}
                disabled={!selectedFile || parsing}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <HiOutlineSparkles className="w-4 h-4" />
                <span>{parsing ? 'Parsing Document with AI...' : 'Extract Skills with AI'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Text Area Input */}
        {activeTab === 'text' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <HiOutlineDocumentText className="w-4 h-4 text-brand-600" />
                <span>Resume Content (Text / Sample Demo)</span>
              </h2>
              <button
                type="button"
                onClick={handleParseText}
                disabled={parsing}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <HiOutlineSparkles className="w-4 h-4" />
                <span>{parsing ? 'Extracting NLP Skills...' : 'Run AI Extraction'}</span>
              </button>
            </div>

            <textarea
              rows={10}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="w-full p-4 text-xs font-mono border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
            />
          </div>
        )}

        {/* Review & Edit Extracted Results */}
        {extractedData && (
          <div className="bg-white p-6 rounded-2xl border border-brand-300 shadow-md space-y-5 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-base text-navy-900 flex items-center gap-2">
                  <HiOutlineCheckCircle className="w-5 h-5 text-emerald-600" />
                  <span>Review & Verify Extracted Skills</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {extractedData.extractedSkills?.length || 0} skills identified. Adjust proficiency or remove non-applicable items.
                </p>
                {extractedData.suggestedEducation && (
                  <p className="text-xs text-brand-700 font-semibold mt-1">
                    Detected Degree: {extractedData.suggestedEducation}
                  </p>
                )}
              </div>

              <button
                onClick={handleConfirmAndSave}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <HiCheck className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Confirm & Save to Profile'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {extractedData.extractedSkills?.map((skill: any, idx: number) => (
                <div
                  key={skill.name + idx}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{skill.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">
                        {skill.confidence}% match
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[11px] text-slate-500">Proficiency:</span>
                      <select
                        value={skill.proficiency}
                        onChange={(e) => handleProficiencyChange(idx, Number(e.target.value))}
                        className="text-xs py-1 px-2 border border-slate-300 rounded bg-white"
                      >
                        <option value={1}>1 - Beginner</option>
                        <option value={2}>2 - Elementary</option>
                        <option value={3}>3 - Intermediate</option>
                        <option value={4}>4 - Advanced</option>
                        <option value={5}>5 - Expert</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveSkill(idx)}
                    title="Remove skill"
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
