import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  ArrowRight,
  User,
  Calendar,
} from 'lucide-react';
import { subjectService } from '../services/api';
import Modal from '../components/common/Modal';
import CircularGauge from '../components/common/CircularGauge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';

const SubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    faculty: '',
    semester: 'Semester 5',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const { showSuccess, showError } = useToast();

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const res = await subjectService.getAll();
      if (res.data.success) {
        setSubjects(res.data.data);
      }
    } catch (err) {
      showError('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleOpenAddModal = () => {
    setEditingSubject(null);
    setFormData({
      name: '',
      code: '',
      faculty: '',
      semester: 'Semester 5',
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (subj) => {
    setEditingSubject(subj);
    setFormData({
      name: subj.name,
      code: subj.code,
      faculty: subj.faculty || '',
      semester: subj.semester || 'Semester 5',
      description: subj.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      showError('Subject name and code are required');
      return;
    }

    try {
      setSubmitting(true);
      if (editingSubject) {
        const res = await subjectService.update(editingSubject._id, formData);
        if (res.data.success) {
          showSuccess('Subject updated successfully');
        }
      } else {
        const res = await subjectService.create(formData);
        if (res.data.success) {
          showSuccess('Subject added successfully');
        }
      }
      setIsModalOpen(false);
      fetchSubjects();
    } catch (err) {
      showError(err.response?.data?.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This will delete all its units, topics, lectures, attendance and assignments.`)) {
      try {
        const res = await subjectService.delete(id);
        if (res.data.success) {
          showSuccess('Subject deleted successfully');
          fetchSubjects();
        }
      } catch (err) {
        showError('Failed to delete subject');
      }
    }
  };

  const filteredSubjects = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', color: '#f8fafc', marginBottom: '0.25rem' }}>Subject Management</h1>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8' }}>Create, organize, and monitor performance per academic subject</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          <Plus size={18} /> Add Subject
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '1.5rem', maxWidth: '400px', position: 'relative' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search subject by name or code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ paddingLeft: '2.5rem' }}
        />
        <Search size={18} color="#64748b" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
      </div>

      {loading ? (
        <LoadingSpinner message="Loading academic subjects..." />
      ) : filteredSubjects.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={searchQuery ? 'No matching subjects found' : 'No subjects added yet'}
          description={
            searchQuery
              ? 'Try searching for another subject title or code.'
              : 'Add your first subject to start tracking units, topics, lectures, attendance, and assignments.'
          }
          actionLabel={searchQuery ? null : 'Add First Subject'}
          onAction={handleOpenAddModal}
        />
      ) : (
        <div className="grid-2">
          {filteredSubjects.map((subject) => {
            const progress = subject.progress?.overallSubjectProgress || 0;
            const topicsCount = subject.progress?.topics?.total || 0;
            const completedTopics = subject.progress?.topics?.completed || 0;

            return (
              <div key={subject._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div>
                      <span className="badge badge-info" style={{ marginBottom: '0.35rem' }}>{subject.code}</span>
                      <h3 style={{ fontSize: '1.2rem', color: '#f8fafc' }}>{subject.name}</h3>
                    </div>
                    <CircularGauge percentage={progress} size={75} strokeWidth={7} />
                  </div>

                  {subject.description && (
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem', lineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {subject.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
                    {subject.faculty && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <User size={15} color="#64748b" /> Faculty: <span style={{ color: '#f8fafc', fontWeight: 500 }}>{subject.faculty}</span>
                      </div>
                    )}
                    {subject.semester && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Calendar size={15} color="#64748b" /> Semester: <span style={{ color: '#f8fafc', fontWeight: 500 }}>{subject.semester}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <BookOpen size={15} color="#64748b" /> Topic Progress: <span style={{ color: '#f8fafc', fontWeight: 500 }}>{completedTopics} / {topicsCount} topics completed</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: '1rem', borderTop: '1px solid var(--border-color)', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button className="btn btn-outline btn-sm btn-icon" title="Edit Subject" onClick={() => handleOpenEditModal(subject)}>
                      <Edit2 size={16} />
                    </button>
                    <button className="btn btn-danger btn-sm btn-icon" title="Delete Subject" onClick={() => handleDelete(subject._id, subject.name)}>
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <Link to={`/subjects/${subject._id}`} className="btn btn-primary btn-sm">
                    Open Details <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSubject ? 'Edit Subject Details' : 'Add New Subject'}
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Saving...' : editingSubject ? 'Update Subject' : 'Create Subject'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Subject Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Data Structures & Algorithms"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Subject Code *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. CS301"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Faculty / Instructor Name (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Dr. Alan Turing"
              value={formData.faculty}
              onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Semester / Term</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Semester 5"
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Subject Description (Optional)</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Brief course objectives, syllabus scope..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SubjectsPage;
