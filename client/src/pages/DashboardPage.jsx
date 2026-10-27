import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  CalendarCheck,
  BookOpen,
  FileCheck2,
  AlertTriangle,
  Plus,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import { progressService, authService } from '../services/api';
import SummaryCard from '../components/common/SummaryCard';
import CircularGauge from '../components/common/CircularGauge';
import ProgressBar from '../components/common/ProgressBar';
import PerformanceLineChart from '../components/common/PerformanceLineChart';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';

const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seeding, setSeeding] = useState(false);

  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await progressService.getOverall();
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard progress:', err);
      setError('Failed to load academic progress data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSeed = async () => {
    try {
      setSeeding(true);
      const res = await authService.seedDemoData();
      if (res.data.success) {
        showSuccess('Sample academic demo data seeded successfully!');
        fetchDashboardData();
      }
    } catch (err) {
      showError('Failed to seed demo data');
    } finally {
      setSeeding(false);
    }
  };

  if (loading) return <LoadingSpinner message="Calculating academic progress..." />;

  if (error) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <AlertTriangle size={36} color="#f87171" style={{ marginBottom: '1rem' }} />
        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{error}</h3>
        <button className="btn btn-primary" onClick={fetchDashboardData}>
          Retry Loading
        </button>
      </div>
    );
  }

  const {
    overallAcademicProgress = 0,
    averageAttendance = 0,
    totalSubjects = 0,
    pendingAssignments = 0,
    lowAttendanceSubjectsCount = 0,
    subjectBreakdown = [],
    recentActivities = [],
  } = data || {};

  const chartData = subjectBreakdown.map((sb) => ({
    name: sb.subject?.code || sb.subject?.name || 'Subject',
    overallSubjectProgress: sb.overallSubjectProgress,
    attendancePct: sb.attendance?.percentage || 0,
    topicPct: sb.topics?.percentage || 0,
  }));

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', color: '#f8fafc', marginBottom: '0.25rem' }}>Academic Dashboard</h1>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8' }}>Real-time student progress & performance breakdown</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {totalSubjects === 0 && (
            <button className="btn btn-outline" onClick={handleSeed} disabled={seeding}>
              <Sparkles size={16} color="#fbbf24" /> {seeding ? 'Seeding...' : 'Seed Sample Data'}
            </button>
          )}
          <Link to="/subjects" className="btn btn-primary">
            <Plus size={18} /> Manage Subjects
          </Link>
        </div>
      </div>

      {/* Low Attendance Warning Banner */}
      {lowAttendanceSubjectsCount > 0 && (
        <div className="alert-banner alert-warning">
          <AlertTriangle size={22} style={{ flexShrink: 0 }} />
          <div>
            <strong style={{ display: 'block', fontSize: '0.95rem' }}>
              Attendance Warning: {lowAttendanceSubjectsCount} subject(s) below required 75% threshold!
            </strong>
            <span style={{ fontSize: '0.83rem' }}>
              Check your attendance breakdown below and attend upcoming lectures to maintain eligibility.
            </span>
          </div>
        </div>
      )}

      {/* Top 4 Summary Cards */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <SummaryCard
          title="Overall Academic Progress"
          value={`${overallAcademicProgress}%`}
          subtext="Calculated across all subjects"
          icon={TrendingUp}
          color="#6366f1"
          badge={{ text: 'Overall', type: 'info' }}
        />

        <SummaryCard
          title="Average Attendance"
          value={`${averageAttendance}%`}
          subtext={averageAttendance < 75 ? 'Below 75% target' : 'Healthy attendance rate'}
          icon={CalendarCheck}
          color={averageAttendance >= 75 ? '#10b981' : '#f59e0b'}
          badge={{
            text: averageAttendance >= 75 ? 'On Track' : 'Needs Focus',
            type: averageAttendance >= 75 ? 'success' : 'warning',
          }}
        />

        <SummaryCard
          title="Total Subjects"
          value={totalSubjects}
          subtext="Active academic modules"
          icon={BookOpen}
          color="#3b82f6"
        />

        <SummaryCard
          title="Pending Assignments"
          value={pendingAssignments}
          subtext={pendingAssignments === 0 ? 'All caught up!' : 'Action items pending'}
          icon={FileCheck2}
          color={pendingAssignments > 0 ? '#f59e0b' : '#10b981'}
          badge={{
            text: pendingAssignments > 0 ? 'Pending' : 'Done',
            type: pendingAssignments > 0 ? 'warning' : 'success',
          }}
        />
      </div>

      {/* Performance Trends Line Chart Visualization */}
      {subjectBreakdown.length > 0 && (
        <PerformanceLineChart
          data={chartData}
          title="Subject Academic Performance Trends Line Graph"
          height={280}
          lines={[
            { key: 'overallSubjectProgress', name: 'Overall Progress %', color: '#6366f1' },
            { key: 'attendancePct', name: 'Attendance Rate %', color: '#10b981' },
            { key: 'topicPct', name: 'Syllabus Topics %', color: '#3b82f6' },
          ]}
          showReferenceLine={true}
          referenceValue={75}
          referenceLabel="Benchmark Target (75%)"
        />
      )}

      {/* Subject-Wise Academic Breakdown Section */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#f8fafc' }}>Subject Performance Overview</h2>
          <Link to="/subjects" style={{ fontSize: '0.88rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            View All Subjects <ArrowRight size={16} />
          </Link>
        </div>

        {subjectBreakdown.length === 0 ? (
          <EmptyState
            title="No Subjects Added Yet"
            description="Add your first subject to start tracking units, topics, attendance, and assignments."
            actionLabel="Add Subject Now"
            onAction={() => navigate('/subjects')}
          />
        ) : (
          <div className="grid-2">
            {subjectBreakdown.map((sb) => {
              const { subject, units, topics, attendance, assignments, overallSubjectProgress } = sb;
              return (
                <div key={subject._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <div>
                        <span className="badge badge-info" style={{ marginBottom: '0.35rem' }}>{subject.code}</span>
                        <h3 style={{ fontSize: '1.15rem', color: '#f8fafc' }}>{subject.name}</h3>
                        {subject.faculty && (
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Faculty: {subject.faculty}</span>
                        )}
                      </div>
                      <CircularGauge percentage={overallSubjectProgress} size={85} strokeWidth={8} label="Progress" />
                    </div>

                    {/* Progress Metrics Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1rem', backgroundColor: '#0f172a', padding: '0.85rem', borderRadius: '8px' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Topics Covered</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                          {topics.completed} / {topics.total} ({topics.percentage}%)
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Units Completed</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                          {units.completed} / {units.total} ({units.percentage}%)
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Attendance</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: attendance.isLowAttendance ? '#f87171' : '#34d399' }}>
                          {attendance.presentLectures} / {attendance.totalLectures} ({attendance.percentage}%)
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Assignments</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                          {assignments.completed} / {assignments.total} ({assignments.percentage}%)
                        </div>
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/subjects/${subject._id}`}
                    className="btn btn-outline btn-sm"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Open Subject Details <ArrowRight size={15} />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Activity Log */}
      <div>
        <h2 style={{ fontSize: '1.25rem', color: '#f8fafc', marginBottom: '1rem' }}>Recently Updated Academic Activities</h2>
        {recentActivities.length === 0 ? (
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.88rem' }}>
            No recent lecture or assignment activity logged yet.
          </div>
        ) : (
          <div className="card" style={{ padding: '0.5rem 1.25rem' }}>
            {recentActivities.map((act, index) => (
              <div
                key={act.id + index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 0',
                  borderBottom: index < recentActivities.length - 1 ? '1px solid var(--border-color)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div
                    style={{
                      padding: '0.5rem',
                      borderRadius: '8px',
                      backgroundColor: act.type === 'Lecture' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      color: act.type === 'Lecture' ? '#818cf8' : '#34d399',
                    }}
                  >
                    {act.type === 'Lecture' ? <BookOpen size={18} /> : <FileCheck2 size={18} />}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.92rem', color: '#f8fafc', fontWeight: 600 }}>{act.title}</h4>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{act.subtitle}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: '#64748b' }}>
                  <Clock size={14} />
                  <span>{new Date(act.date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
