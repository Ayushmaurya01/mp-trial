import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  CheckSquare,
  Square,
  BookOpen,
  CalendarCheck,
  FileCheck2,
  Trash2,
  Edit2,
  Clock,
  Layers,
} from 'lucide-react';
import {
  subjectService,
  unitService,
  topicService,
  attendanceService,
  lectureService,
  assignmentService,
} from '../services/api';
import Modal from '../components/common/Modal';
import CircularGauge from '../components/common/CircularGauge';
import ProgressBar from '../components/common/ProgressBar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';

const SubjectDetailPage = () => {
  const { id: subjectId } = useParams();

  const [subjectData, setSubjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('syllabus'); // syllabus | attendance | assignments | lectures

  // Modals state
  const [unitModalOpen, setUnitModalOpen] = useState(false);
  const [unitTitle, setUnitTitle] = useState('');
  const [unitNumber, setUnitNumber] = useState('');

  const [topicModalOpen, setTopicModalOpen] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const [topicTitle, setTopicTitle] = useState('');

  const [lectureModalOpen, setLectureModalOpen] = useState(false);
  const [lectureData, setLectureData] = useState({
    topicCovered: '',
    status: 'Completed',
    notes: '',
    updateAttendance: true,
  });

  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    dueDate: '',
  });

  const { showSuccess, showError } = useToast();

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await subjectService.getById(subjectId);
      if (res.data.success) {
        setSubjectData(res.data.data);
      }
    } catch (err) {
      showError('Failed to load subject details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [subjectId]);

  // Topic Toggle Handler
  const handleToggleTopic = async (topicId, currentStatus) => {
    try {
      const res = await topicService.update(topicId, { isCompleted: !currentStatus });
      if (res.data.success) {
        showSuccess(!currentStatus ? 'Topic marked as completed!' : 'Topic marked as pending');
        fetchDetails();
      }
    } catch (err) {
      showError('Failed to update topic status');
    }
  };

  // Add Unit
  const handleAddUnit = async (e) => {
    e.preventDefault();
    if (!unitTitle) return;

    try {
      const res = await unitService.create(subjectId, {
        title: unitTitle,
        unitNumber: unitNumber ? parseInt(unitNumber) : undefined,
      });
      if (res.data.success) {
        showSuccess('Unit added successfully');
        setUnitModalOpen(false);
        setUnitTitle('');
        setUnitNumber('');
        fetchDetails();
      }
    } catch (err) {
      showError('Failed to create unit');
    }
  };

  // Delete Unit
  const handleDeleteUnit = async (unitId, title) => {
    if (window.confirm(`Delete unit "${title}" and all its topics?`)) {
      try {
        await unitService.delete(unitId);
        showSuccess('Unit deleted');
        fetchDetails();
      } catch (err) {
        showError('Failed to delete unit');
      }
    }
  };

  // Add Topic
  const handleOpenAddTopic = (unitId) => {
    setSelectedUnitId(unitId);
    setTopicTitle('');
    setTopicModalOpen(true);
  };

  const handleAddTopic = async (e) => {
    e.preventDefault();
    if (!topicTitle || !selectedUnitId) return;

    try {
      const res = await topicService.create(selectedUnitId, { title: topicTitle });
      if (res.data.success) {
        showSuccess('Topic added successfully');
        setTopicModalOpen(false);
        setTopicTitle('');
        fetchDetails();
      }
    } catch (err) {
      showError('Failed to create topic');
    }
  };

  // Delete Topic
  const handleDeleteTopic = async (topicId) => {
    try {
      await topicService.delete(topicId);
      showSuccess('Topic deleted');
      fetchDetails();
    } catch (err) {
      showError('Failed to delete topic');
    }
  };

  // Log Quick Attendance (+1 Present / +1 Absent)
  const handleLogAttendance = async (status) => {
    try {
      const res = await attendanceService.quickLog({ subjectId, status });
      if (res.data.success) {
        showSuccess(`Recorded 1 ${status} lecture`);
        fetchDetails();
      }
    } catch (err) {
      showError('Failed to log attendance');
    }
  };

  // Add Lecture Log
  const handleAddLecture = async (e) => {
    e.preventDefault();
    if (!lectureData.topicCovered) return;

    try {
      const res = await lectureService.create({
        subjectId,
        ...lectureData,
      });
      if (res.data.success) {
        showSuccess('Lecture history recorded');
        setLectureModalOpen(false);
        setLectureData({ topicCovered: '', status: 'Completed', notes: '', updateAttendance: true });
        fetchDetails();
      }
    } catch (err) {
      showError('Failed to record lecture');
    }
  };

  // Add Assignment
  const handleAddAssignment = async (e) => {
    e.preventDefault();
    if (!assignmentForm.title || !assignmentForm.dueDate) return;

    try {
      const res = await assignmentService.create({
        subjectId,
        ...assignmentForm,
      });
      if (res.data.success) {
        showSuccess('Assignment created successfully');
        setAssignmentModalOpen(false);
        setAssignmentForm({ title: '', description: '', dueDate: '' });
        fetchDetails();
      }
    } catch (err) {
      showError('Failed to create assignment');
    }
  };

  // Toggle Assignment Status
  const handleToggleAssignment = async (assignmentId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
      const res = await assignmentService.update(assignmentId, { status: newStatus });
      if (res.data.success) {
        showSuccess(`Assignment marked ${newStatus}`);
        fetchDetails();
      }
    } catch (err) {
      showError('Failed to update assignment status');
    }
  };

  if (loading) return <LoadingSpinner message="Loading subject syllabus and details..." />;

  if (!subjectData || !subjectData.subject) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <h3>Subject not found or removed</h3>
        <Link to="/subjects" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Subjects
        </Link>
      </div>
    );
  }

  const { subject, units = [], attendance = {}, assignments = [], lectures = [], progress = {} } = subjectData;

  return (
    <div>
      {/* Back link */}
      <Link to="/subjects" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.88rem', marginBottom: '1.25rem', fontWeight: 500 }}>
        <ArrowLeft size={16} /> Back to Subjects
      </Link>

      {/* Subject Header Panel */}
      <div className="card" style={{ marginBottom: '1.75rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-info">{subject.code}</span>
              {subject.semester && <span className="badge badge-success">{subject.semester}</span>}
            </div>
            <h1 style={{ fontSize: '1.8rem', color: '#f8fafc', marginBottom: '0.35rem' }}>{subject.name}</h1>
            {subject.faculty && (
              <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                Faculty: <strong style={{ color: '#f8fafc' }}>{subject.faculty}</strong>
              </p>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <CircularGauge percentage={progress?.overallSubjectProgress || 0} size={90} strokeWidth={8} label="Overall Subject Progress" />
          </div>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '1.75rem', gap: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('syllabus')}
          style={{
            padding: '0.75rem 0.25rem',
            background: 'none',
            border: 'none',
            color: activeTab === 'syllabus' ? 'var(--primary)' : '#94a3b8',
            fontWeight: activeTab === 'syllabus' ? 700 : 500,
            borderBottom: activeTab === 'syllabus' ? '2px solid var(--primary)' : '2px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.95rem',
          }}
        >
          <Layers size={18} /> Units & Topics Syllabus ({units.length})
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          style={{
            padding: '0.75rem 0.25rem',
            background: 'none',
            border: 'none',
            color: activeTab === 'attendance' ? 'var(--primary)' : '#94a3b8',
            fontWeight: activeTab === 'attendance' ? 700 : 500,
            borderBottom: activeTab === 'attendance' ? '2px solid var(--primary)' : '2px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.95rem',
          }}
        >
          <CalendarCheck size={18} /> Attendance Log ({attendance.presentLectures || 0}/{attendance.totalLectures || 0})
        </button>

        <button
          onClick={() => setActiveTab('assignments')}
          style={{
            padding: '0.75rem 0.25rem',
            background: 'none',
            border: 'none',
            color: activeTab === 'assignments' ? 'var(--primary)' : '#94a3b8',
            fontWeight: activeTab === 'assignments' ? 700 : 500,
            borderBottom: activeTab === 'assignments' ? '2px solid var(--primary)' : '2px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.95rem',
          }}
        >
          <FileCheck2 size={18} /> Assignments ({assignments.length})
        </button>

        <button
          onClick={() => setActiveTab('lectures')}
          style={{
            padding: '0.75rem 0.25rem',
            background: 'none',
            border: 'none',
            color: activeTab === 'lectures' ? 'var(--primary)' : '#94a3b8',
            fontWeight: activeTab === 'lectures' ? 700 : 500,
            borderBottom: activeTab === 'lectures' ? '2px solid var(--primary)' : '2px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.95rem',
          }}
        >
          <Clock size={18} /> Lecture History ({lectures.length})
        </button>
      </div>

      {/* TAB 1: UNITS & TOPICS SYLLABUS */}
      {activeTab === 'syllabus' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.2rem', color: '#f8fafc' }}>Syllabus Breakdown</h2>
            <button className="btn btn-primary btn-sm" onClick={() => setUnitModalOpen(true)}>
              <Plus size={16} /> Add Unit
            </button>
          </div>

          {units.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No units added to this subject"
              description="Create Unit 1 to start organizing individual study topics."
              actionLabel="Add Unit 1"
              onAction={() => setUnitModalOpen(true)}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {units.map((unit) => {
                const topicCount = unit.topics?.length || 0;
                const completedTopicCount = unit.topics?.filter((t) => t.isCompleted).length || 0;
                const unitProgressPct = topicCount > 0 ? Math.round((completedTopicCount / topicCount) * 100) : 0;

                return (
                  <div key={unit._id} className="card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span className="badge badge-info">Unit {unit.unitNumber}</span>
                        <h3 style={{ fontSize: '1.1rem', color: '#f8fafc' }}>{unit.title}</h3>
                        {unit.isCompleted && <span className="badge badge-success">Completed</span>}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => handleOpenAddTopic(unit._id)}>
                          <Plus size={14} /> Topic
                        </button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDeleteUnit(unit._id, unit.title)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <ProgressBar percentage={unitProgressPct} height={6} showText={true} />
                    </div>

                    {/* Topics Checklist */}
                    {unit.topics && unit.topics.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', backgroundColor: '#0f172a', padding: '0.75rem', borderRadius: '8px' }}>
                        {unit.topics.map((t) => (
                          <div
                            key={t._id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '0.4rem 0.5rem',
                              borderRadius: '4px',
                            }}
                          >
                            <label
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.65rem',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                color: t.isCompleted ? '#94a3b8' : '#f8fafc',
                                textDecoration: t.isCompleted ? 'line-through' : 'none',
                                flex: 1,
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={t.isCompleted}
                                onChange={() => handleToggleTopic(t._id, t.isCompleted)}
                                style={{ display: 'none' }}
                              />
                              {t.isCompleted ? <CheckSquare size={18} color="#10b981" /> : <Square size={18} color="#64748b" />}
                              <span>{t.title}</span>
                            </label>

                            <button
                              onClick={() => handleDeleteTopic(t._id)}
                              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.82rem', color: '#64748b', fontStyle: 'italic', padding: '0.5rem 0' }}>
                        No topics added to this unit yet. Click "+ Topic" above.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ATTENDANCE LOG */}
      {activeTab === 'attendance' && (
        <div className="card">
          <h2 style={{ fontSize: '1.2rem', color: '#f8fafc', marginBottom: '1rem' }}>Subject Attendance Tracker</h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <CircularGauge
              percentage={attendance.totalLectures > 0 ? Math.round((attendance.presentLectures / attendance.totalLectures) * 100) : 0}
              size={110}
              strokeWidth={10}
              label="Current Attendance"
            />

            <div style={{ flex: 1, minWidth: '240px' }}>
              <div className="grid-3" style={{ marginBottom: '1.25rem' }}>
                <div style={{ backgroundColor: '#0f172a', padding: '0.85rem', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Total Lectures</span>
                  <h3 style={{ fontSize: '1.5rem', color: '#f8fafc' }}>{attendance.totalLectures || 0}</h3>
                </div>

                <div style={{ backgroundColor: '#0f172a', padding: '0.85rem', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Present Lectures</span>
                  <h3 style={{ fontSize: '1.5rem', color: '#34d399' }}>{attendance.presentLectures || 0}</h3>
                </div>

                <div style={{ backgroundColor: '#0f172a', padding: '0.85rem', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Absent Lectures</span>
                  <h3 style={{ fontSize: '1.5rem', color: '#f87171' }}>{attendance.absentLectures || 0}</h3>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-primary" onClick={() => handleLogAttendance('Present')}>
                  + 1 Present Lecture
                </button>
                <button className="btn btn-danger" onClick={() => handleLogAttendance('Absent')}>
                  + 1 Absent Lecture
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ASSIGNMENTS */}
      {activeTab === 'assignments' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.2rem', color: '#f8fafc' }}>Subject Assignments</h2>
            <button className="btn btn-primary btn-sm" onClick={() => setAssignmentModalOpen(true)}>
              <Plus size={16} /> Add Assignment
            </button>
          </div>

          {assignments.length === 0 ? (
            <EmptyState
              icon={FileCheck2}
              title="No assignments added for this subject"
              description="Track deadlines and submission status by adding assignments."
              actionLabel="Add Assignment"
              onAction={() => setAssignmentModalOpen(true)}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {assignments.map((ass) => (
                <div key={ass._id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                    <button
                      onClick={() => handleToggleAssignment(ass._id, ass.status)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', marginTop: '0.15rem' }}
                    >
                      {ass.status === 'Completed' ? <CheckSquare size={20} color="#10b981" /> : <Square size={20} color="#64748b" />}
                    </button>
                    <div>
                      <h4
                        style={{
                          fontSize: '1rem',
                          color: ass.status === 'Completed' ? '#94a3b8' : '#f8fafc',
                          textDecoration: ass.status === 'Completed' ? 'line-through' : 'none',
                        }}
                      >
                        {ass.title}
                      </h4>
                      {ass.description && <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{ass.description}</p>}
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        Due Date: {new Date(ass.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <span className={`badge badge-${ass.status === 'Completed' ? 'success' : 'warning'}`}>{ass.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: LECTURE HISTORY */}
      {activeTab === 'lectures' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.2rem', color: '#f8fafc' }}>Recorded Lectures</h2>
            <button className="btn btn-primary btn-sm" onClick={() => setLectureModalOpen(true)}>
              <Plus size={16} /> Log Lecture
            </button>
          </div>

          {lectures.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No lectures logged yet"
              description="Keep a record of what topics were taught in each class."
              actionLabel="Log Class Lecture"
              onAction={() => setLectureModalOpen(true)}
            />
          ) : (
            <div className="card" style={{ padding: '0.5rem 1.25rem' }}>
              {lectures.map((lec, idx) => (
                <div
                  key={lec._id}
                  style={{
                    padding: '0.85rem 0',
                    borderBottom: idx < lectures.length - 1 ? '1px solid var(--border-color)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '0.95rem', color: '#f8fafc' }}>{lec.topicCovered}</h4>
                    {lec.notes && <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{lec.notes}</p>}
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Date: {new Date(lec.lectureDate).toLocaleDateString()}
                    </span>
                  </div>

                  <span className={`badge badge-${lec.status === 'Completed' ? 'success' : 'info'}`}>{lec.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Unit Modal */}
      <Modal
        isOpen={unitModalOpen}
        onClose={() => setUnitModalOpen(false)}
        title="Add New Unit"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setUnitModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleAddUnit}>
              Add Unit
            </button>
          </>
        }
      >
        <form onSubmit={handleAddUnit}>
          <div className="form-group">
            <label className="form-label">Unit Number (Optional)</label>
            <input
              type="number"
              className="form-input"
              placeholder="e.g. 1"
              value={unitNumber}
              onChange={(e) => setUnitNumber(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Unit Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Arrays and Linked Lists"
              value={unitTitle}
              onChange={(e) => setUnitTitle(e.target.value)}
              required
            />
          </div>
        </form>
      </Modal>

      {/* Add Topic Modal */}
      <Modal
        isOpen={topicModalOpen}
        onClose={() => setTopicModalOpen(false)}
        title="Add New Topic"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setTopicModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleAddTopic}>
              Add Topic
            </button>
          </>
        }
      >
        <form onSubmit={handleAddTopic}>
          <div className="form-group">
            <label className="form-label">Topic Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Doubly Linked List Operations"
              value={topicTitle}
              onChange={(e) => setTopicTitle(e.target.value)}
              required
            />
          </div>
        </form>
      </Modal>

      {/* Log Lecture Modal */}
      <Modal
        isOpen={lectureModalOpen}
        onClose={() => setLectureModalOpen(false)}
        title="Record Lecture Entry"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setLectureModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleAddLecture}>
              Save Lecture
            </button>
          </>
        }
      >
        <form onSubmit={handleAddLecture}>
          <div className="form-group">
            <label className="form-label">Topic Covered in Class *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Infix to Postfix conversion using stacks"
              value={lectureData.topicCovered}
              onChange={(e) => setLectureData({ ...lectureData, topicCovered: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Optional Lecture Notes</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Key concepts, homework hints..."
              value={lectureData.notes}
              onChange={(e) => setLectureData({ ...lectureData, notes: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              id="autoAttendance"
              checked={lectureData.updateAttendance}
              onChange={(e) => setLectureData({ ...lectureData, updateAttendance: e.target.checked })}
            />
            <label htmlFor="autoAttendance" className="form-label" style={{ marginBottom: 0, cursor: 'pointer' }}>
              Automatically increment Present attendance count (+1)
            </label>
          </div>
        </form>
      </Modal>

      {/* Add Assignment Modal */}
      <Modal
        isOpen={assignmentModalOpen}
        onClose={() => setAssignmentModalOpen(false)}
        title="Add New Assignment"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setAssignmentModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleAddAssignment}>
              Save Assignment
            </button>
          </>
        }
      >
        <form onSubmit={handleAddAssignment}>
          <div className="form-group">
            <label className="form-label">Assignment Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Implementation of Linked List"
              value={assignmentForm.title}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Due Date *</label>
            <input
              type="date"
              className="form-input"
              value={assignmentForm.dueDate}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description (Optional)</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Submission instructions, guidelines..."
              value={assignmentForm.description}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SubjectDetailPage;
