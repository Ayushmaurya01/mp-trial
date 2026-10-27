import React, { useState, useEffect } from 'react';
import { FileCheck2, Plus, CheckSquare, Square, Trash2, Calendar, Filter } from 'lucide-react';
import { assignmentService, subjectService } from '../services/api';
import Modal from '../components/common/Modal';
import ProgressBar from '../components/common/ProgressBar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';

const AssignmentsPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, percentage: 0 });
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All'); // All | Pending | Completed

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    subjectId: '',
    title: '',
    description: '',
    dueDate: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const { showSuccess, showError } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== 'All' ? { status: statusFilter } : {};
      const [assRes, subRes] = await Promise.all([
        assignmentService.getAll(params),
        subjectService.getAll(),
      ]);

      if (assRes.data.success) {
        setAssignments(assRes.data.data);
        if (assRes.data.stats) setStats(assRes.data.stats);
      }
      if (subRes.data.success) {
        setSubjects(subRes.data.data);
      }
    } catch (err) {
      showError('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleOpenAdd = () => {
    setFormData({
      subjectId: subjects.length > 0 ? subjects[0]._id : '',
      title: '',
      description: '',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subjectId || !formData.title || !formData.dueDate) {
      showError('Please fill all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const res = await assignmentService.create(formData);
      if (res.data.success) {
        showSuccess('Assignment added successfully');
        setIsModalOpen(false);
        fetchData();
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to create assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
      const res = await assignmentService.update(id, { status: newStatus });
      if (res.data.success) {
        showSuccess(`Assignment marked as ${newStatus}`);
        fetchData();
      }
    } catch (err) {
      showError('Failed to update status');
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Delete assignment "${title}"?`)) {
      try {
        await assignmentService.delete(id);
        showSuccess('Assignment deleted');
        fetchData();
      } catch (err) {
        showError('Failed to delete assignment');
      }
    }
  };

  if (loading) return <LoadingSpinner message="Loading assignments..." />;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', color: '#f8fafc', marginBottom: '0.25rem' }}>Assignment Management</h1>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8' }}>Track homework assignments, due dates, and completion statistics</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd} disabled={subjects.length === 0}>
          <Plus size={18} /> Add Assignment
        </button>
      </div>

      {/* Progress & Overview Summary Header */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <div className="grid-3" style={{ marginBottom: '1.25rem' }}>
          <div style={{ backgroundColor: '#0f172a', padding: '0.85rem', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Total Assignments</span>
            <h3 style={{ fontSize: '1.5rem', color: '#f8fafc' }}>{stats.total}</h3>
          </div>
          <div style={{ backgroundColor: '#0f172a', padding: '0.85rem', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Completed</span>
            <h3 style={{ fontSize: '1.5rem', color: '#34d399' }}>{stats.completed}</h3>
          </div>
          <div style={{ backgroundColor: '#0f172a', padding: '0.85rem', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Pending</span>
            <h3 style={{ fontSize: '1.5rem', color: '#fbbf24' }}>{stats.pending}</h3>
          </div>
        </div>

        <ProgressBar percentage={stats.percentage} height={8} showText={true} />
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <Filter size={16} color="#94a3b8" />
        <span style={{ fontSize: '0.85rem', color: '#94a3b8', marginRight: '0.5rem' }}>Filter Status:</span>
        {['All', 'Pending', 'Completed'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-outline'}`}
          >
            {st}
          </button>
        ))}
      </div>

      {assignments.length === 0 ? (
        <EmptyState
          icon={FileCheck2}
          title={statusFilter === 'All' ? 'No assignments added yet' : `No ${statusFilter.toLowerCase()} assignments`}
          description={subjects.length === 0 ? 'Add a subject first to create assignments.' : 'Stay on top of deadlines by adding your upcoming coursework assignments.'}
          actionLabel={subjects.length > 0 && statusFilter === 'All' ? 'Add Assignment' : null}
          onAction={handleOpenAdd}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {assignments.map((ass) => {
            const isDone = ass.status === 'Completed';
            const subject = ass.subject || { name: 'Subject', code: 'SUB' };
            const isOverdue = !isDone && new Date(ass.dueDate) < new Date();

            return (
              <div key={ass._id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1 }}>
                  <button
                    onClick={() => handleToggleStatus(ass._id, ass.status)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', marginTop: '0.2rem' }}
                  >
                    {isDone ? <CheckSquare size={22} color="#10b981" /> : <Square size={22} color="#64748b" />}
                  </button>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <span className="badge badge-info">{subject.code}</span>
                      <h3 style={{ fontSize: '1.05rem', color: isDone ? '#94a3b8' : '#f8fafc', textDecoration: isDone ? 'line-through' : 'none' }}>
                        {ass.title}
                      </h3>
                    </div>

                    {ass.description && <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>{ass.description}</p>}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: isOverdue ? '#f87171' : '#64748b' }}>
                      <Calendar size={14} /> Due Date: {new Date(ass.dueDate).toLocaleDateString()}
                      {isOverdue && <span className="badge badge-danger">Overdue</span>}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <span className={`badge badge-${isDone ? 'success' : 'warning'}`}>{ass.status}</span>
                  <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(ass._id, ass.title)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Assignment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Assignment"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Saving...' : 'Create Assignment'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Subject *</label>
            <select
              className="form-select"
              value={formData.subjectId}
              onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
              required
            >
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Assignment Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Relational Algebra Problem Set"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Due Date *</label>
            <input
              type="date"
              className="form-input"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description (Optional)</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Guidelines, reference links..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AssignmentsPage;
