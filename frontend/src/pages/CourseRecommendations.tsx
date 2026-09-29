import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  HiOutlineAcademicCap,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
} from 'react-icons/hi';

export const CourseRecommendations: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/courses/recommendations');
        if (res.data.success) {
          setCourses(res.data.recommendations);
        }
      } catch (err) {
        toast.error('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleEnroll = async (id: string, title: string) => {
    setEnrollingId(id);
    try {
      const res = await api.post(`/courses/${id}/enroll`);
      if (res.data.success) {
        toast.success(res.data.message);
      }
    } catch (err) {
      toast.error('Failed to enroll in course');
    } finally {
      setEnrollingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 w-full">
        <div className="border-b border-slate-200 pb-4">
          <h1 className="text-2xl font-bold text-navy-900">Recommended Bridge Courses</h1>
          <p className="text-xs text-slate-500">
            Government and institute accredited training curricula tailored directly to your detected missing skills.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                    <HiOutlineShieldCheck className="w-3.5 h-3.5" />
                    Verified Training
                  </span>
                  <span className="text-xs text-amber-600 font-bold">★ {course.rating}</span>
                </div>

                <h3 className="font-bold text-base text-slate-900 leading-snug">{course.title}</h3>
                <p className="text-xs font-semibold text-slate-500">{course.provider}</p>
                <p className="text-xs text-slate-600 leading-relaxed">{course.description}</p>

                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 text-xs text-blue-900">
                  <div className="font-semibold flex items-center gap-1.5 mb-1">
                    <HiOutlineSparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Why Recommended:</span>
                  </div>
                  <p className="text-[11px] text-blue-800">{course.reasonForRecommendation}</p>
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  {course.skillsTaught?.map((s: string) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <HiOutlineClock className="w-4 h-4" />
                  <span>{course.durationWeeks} Weeks • {course.difficulty}</span>
                </div>

                <button
                  onClick={() => handleEnroll(course.id, course.title)}
                  disabled={enrollingId === course.id}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-sm transition-colors disabled:opacity-50"
                >
                  {enrollingId === course.id ? 'Enrolling...' : 'Enroll in Cohort'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};
