import React, { useState, useEffect } from 'react';
import { CalendarCheck, AlertTriangle, Plus, Minus, Edit2 } from 'lucide-react';
import { attendanceService } from '../services/api';
import CircularGauge from '../components/common/CircularGauge';
import PerformanceLineChart from '../components/common/PerformanceLineChart';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';

const AttendancePage = () => {
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formState, setFormState] = useState({
    presentLectures: 0,
    absentLectures: 0,
    totalLectures: 0,
    minRequiredPercentage: 75,
  });

  const { showSuccess, showError } = useToast();

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await attendanceService.getAll();
      if (res.data.success) {
        setAttendanceList(res.data.data);
      }
    } catch (err) {
      showError('Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleQuickLog = async (subjectId, status) => {
    try {
      const res = await attendanceService.quickLog({ subjectId, status });
      if (res.data.success) {
        showSuccess(`Logged 1 ${status} class`);
        fetchAttendance();
      }
    } catch (err) {
      showError('Failed to update attendance');
    }
  };

  const handleOpenEdit = (rec) => {
    setEditingRecord(rec);
    setFormState({
      presentLectures: rec.presentLectures || 0,
      absentLectures: rec.absentLectures || 0,
      totalLectures: rec.totalLectures || 0,
      minRequiredPercentage: rec.minRequiredPercentage || 75,
    });
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingRecord) return;

    try {
      const res = await attendanceService.update(editingRecord._id, formState);
      if (res.data.success) {
        showSuccess('Attendance updated');
        setIsEditOpen(false);
        fetchAttendance();
      }
    } catch (err) {
      showError('Failed to update attendance record');
    }
  };

  if (loading) return <LoadingSpinner message="Loading attendance records..." />;

  const lowAttendanceCount = attendanceList.filter((a) => a.isLowAttendance).length;

  const chartData = attendanceList.map((rec) => ({
    name: rec.subject?.code || rec.subject?.name || 'Subject',
    attendancePct: rec.percentage,
  }));

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', color: '#f8fafc', marginBottom: '0.25rem' }}>Attendance Management</h1>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8' }}>Monitor class attendance rates and maintain target eligibility</p>
        </div>
      </div>

      {lowAttendanceCount > 0 && (
        <div className="alert-banner alert-warning">
          <AlertTriangle size={22} style={{ flexShrink: 0 }} />
          <div>
            <strong style={{ display: 'block', fontSize: '0.95rem' }}>
              Warning: {lowAttendanceCount} subject(s) fall below the minimum required attendance threshold!
            </strong>
            <span style={{ fontSize: '0.83rem' }}>Ensure you attend upcoming lectures to raise your percentage.</span>
          </div>
        </div>
      )}

      {attendanceList.length > 0 && (
        <PerformanceLineChart
          data={chartData}
          title="Subject-wise Attendance Rate Visualization Line Graph"
          height={260}
          lines={[
            { key: 'attendancePct', name: 'Attendance Rate %', color: '#10b981' },
          ]}
          showReferenceLine={true}
          referenceValue={75}
          referenceLabel="Eligibility Threshold (75%)"
        />
      )}

      {attendanceList.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No attendance records found"
          description="Create your first subject in the Subjects module to start logging attendance."
        />
      ) : (
        <div className="grid-2">
          {attendanceList.map((rec) => {
            const subject = rec.subject || { name: 'Unknown Subject', code: 'SUB' };
            const isLow = rec.isLowAttendance;

            return (
              <div key={rec._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div>
                      <span className="badge badge-info" style={{ marginBottom: '0.35rem' }}>{subject.code}</span>
                      <h3 style={{ fontSize: '1.15rem', color: '#f8fafc' }}>{subject.name}</h3>
                      {subject.faculty && <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Faculty: {subject.faculty}</span>}
                    </div>
                    <CircularGauge percentage={rec.percentage} size={85} strokeWidth={8} />
                  </div>

                  <div className="grid-3" style={{ backgroundColor: '#0f172a', padding: '0.85rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total</span>
                      <h4 style={{ fontSize: '1.25rem', color: '#f8fafc' }}>{rec.totalLectures}</h4>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Present</span>
                      <h4 style={{ fontSize: '1.25rem', color: '#34d399' }}>{rec.presentLectures}</h4>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Absent</span>
                      <h4 style={{ fontSize: '1.25rem', color: '#f87171' }}>{rec.absentLectures}</h4>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.85rem', borderTop: '1px solid var(--border-color)', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-primary btn-sm" onClick={() => handleQuickLog(subject._id || rec.subject, 'Present')}>
                      + Present
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleQuickLog(subject._id || rec.subject, 'Absent')}>
                      + Absent
                    </button>
                  </div>

                  <button className="btn btn-outline btn-sm btn-icon" onClick={() => handleOpenEdit(rec)} title="Edit Attendance Counts">
                    <Edit2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Attendance Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Subject Attendance"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSaveEdit}>
              Save Attendance
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveEdit}>
          <div className="form-group">
            <label className="form-label">Present Lectures Count</label>
            <input
              type="number"
              className="form-input"
              value={formState.presentLectures}
              onChange={(e) => {
                const pres = parseInt(e.target.value) || 0;
                setFormState({
                  ...formState,
                  presentLectures: pres,
                  totalLectures: pres + formState.absentLectures,
                });
              }}
              min={0}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Absent Lectures Count</label>
            <input
              type="number"
              className="form-input"
              value={formState.absentLectures}
              onChange={(e) => {
                const abs = parseInt(e.target.value) || 0;
                setFormState({
                  ...formState,
                  absentLectures: abs,
                  totalLectures: formState.presentLectures + abs,
                });
              }}
              min={0}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Total Conducted Lectures</label>
            <input
              type="number"
              className="form-input"
              value={formState.totalLectures}
              onChange={(e) => setFormState({ ...formState, totalLectures: parseInt(e.target.value) || 0 })}
              min={0}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Minimum Required Attendance % (Default 75%)</label>
            <input
              type="number"
              className="form-input"
              value={formState.minRequiredPercentage}
              onChange={(e) => setFormState({ ...formState, minRequiredPercentage: parseInt(e.target.value) || 75 })}
              min={0}
              max={100}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AttendancePage;
