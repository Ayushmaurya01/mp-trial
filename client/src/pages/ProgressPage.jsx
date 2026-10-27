import React, { useState, useEffect } from 'react';
import { TrendingUp, Info, Award, BookOpen, CalendarCheck, FileCheck2 } from 'lucide-react';
import { progressService } from '../services/api';
import CircularGauge from '../components/common/CircularGauge';
import ProgressBar from '../components/common/ProgressBar';
import PerformanceLineChart from '../components/common/PerformanceLineChart';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

const ProgressPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const res = await progressService.getOverall();
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Error loading progress:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  if (loading) return <LoadingSpinner message="Calculating comprehensive academic progress..." />;

  const {
    overallAcademicProgress = 0,
    averageAttendance = 0,
    totalSubjects = 0,
    totalUnits = 0,
    completedUnits = 0,
    totalTopics = 0,
    completedTopics = 0,
    totalAssignments = 0,
    completedAssignments = 0,
    subjectBreakdown = [],
  } = data || {};

  const chartData = subjectBreakdown.map((sb) => ({
    name: sb.subject?.code || sb.subject?.name || 'Subject',
    overallSubjectProgress: sb.overallSubjectProgress,
    attendancePct: sb.attendance?.percentage || 0,
    topicPct: sb.topics?.percentage || 0,
  }));

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.6rem', color: '#f8fafc', marginBottom: '0.25rem' }}>Academic Progress Analytics</h1>
        <p style={{ fontSize: '0.88rem', color: '#94a3b8' }}>Transparent calculations and subject-by-subject performance breakdown</p>
      </div>

      {/* Main Aggregate Gauge & Summary Panel */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <CircularGauge percentage={overallAcademicProgress} size={120} strokeWidth={11} label="Overall Student Index" />
            <div>
              <span className="badge badge-info" style={{ marginBottom: '0.35rem' }}>Academic Status</span>
              <h2 style={{ fontSize: '1.8rem', color: '#f8fafc' }}>{overallAcademicProgress}% Progress</h2>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', maxWidth: '380px' }}>
                Average weighted progress aggregated across all {totalSubjects} registered subject modules.
              </p>
            </div>
          </div>

          {/* Breakdown Pills */}
          <div className="grid-2" style={{ gap: '1rem', minWidth: '320px' }}>
            <div style={{ backgroundColor: '#0f172a', padding: '0.85rem 1rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <BookOpen size={14} /> Topics Completed
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                {completedTopics} / {totalTopics} ({totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0}%)
              </div>
            </div>

            <div style={{ backgroundColor: '#0f172a', padding: '0.85rem 1rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CalendarCheck size={14} /> Avg. Attendance
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: averageAttendance >= 75 ? '#34d399' : '#f87171' }}>
                {averageAttendance}%
              </div>
            </div>

            <div style={{ backgroundColor: '#0f172a', padding: '0.85rem 1rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Award size={14} /> Units Completed
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                {completedUnits} / {totalUnits} ({totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0}%)
              </div>
            </div>

            <div style={{ backgroundColor: '#0f172a', padding: '0.85rem 1rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <FileCheck2 size={14} /> Assignments Done
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                {completedAssignments} / {totalAssignments} ({totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0}%)
              </div>
            </div>
          </div>
        </div>

        {/* Transparent Formula Explanation Banner */}
        <div className="alert-banner alert-info" style={{ marginBottom: 0 }}>
          <Info size={20} style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '0.83rem', lineHeight: 1.5 }}>
            <strong>Transparent Calculation Formula:</strong>
            <br />
            Subject Progress = <strong>(40% Topic Completion)</strong> + <strong>(30% Attendance)</strong> + <strong>(30% Assignment Completion)</strong>.
            <br />
            Overall Academic Progress = <strong>Average of all Subject Progress scores</strong>.
          </div>
        </div>
      </div>

      {/* Subject Performance Trajectory Line Chart */}
      {subjectBreakdown.length > 0 && (
        <PerformanceLineChart
          data={chartData}
          title="Subject Academic Performance Comparison Line Graph"
          height={300}
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

      {/* Subject-Wise Performance Breakdown Table */}
      <div>
        <h2 style={{ fontSize: '1.25rem', color: '#f8fafc', marginBottom: '1rem' }}>Subject-wise Detailed Breakdown</h2>

        {subjectBreakdown.length === 0 ? (
          <EmptyState title="No subject data available" description="Add subjects to view detailed academic calculations." />
        ) : (
          <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#0f172a', borderBottom: '1px solid var(--border-color)', color: '#94a3b8' }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Subject</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Topics Covered</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Units Completed</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Attendance Rate</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Assignments</th>
                  <th style={{ padding: '0.85rem 1.25rem', textWrap: 'nowrap' }}>Overall Progress</th>
                </tr>
              </thead>
              <tbody>
                {subjectBreakdown.map((sb, idx) => {
                  const { subject, units, topics, attendance, assignments, overallSubjectProgress } = sb;
                  return (
                    <tr key={subject._id} style={{ borderBottom: idx < subjectBreakdown.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span className="badge badge-info" style={{ marginRight: '0.5rem' }}>{subject.code}</span>
                        <strong style={{ color: '#f8fafc' }}>{subject.name}</strong>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {topics.completed} / {topics.total} ({topics.percentage}%)
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {units.completed} / {units.total} ({units.percentage}%)
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ color: attendance.isLowAttendance ? '#f87171' : '#34d399', fontWeight: 600 }}>
                          {attendance.percentage}%
                        </span>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          ({attendance.presentLectures}/{attendance.totalLectures} lectures)
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {assignments.completed} / {assignments.total} ({assignments.percentage}%)
                      </td>
                      <td style={{ padding: '1rem 1.25rem', minWidth: '160px' }}>
                        <ProgressBar percentage={overallSubjectProgress} height={8} showText={true} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressPage;
