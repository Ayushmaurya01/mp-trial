import React, { useState } from 'react';
import { User, Mail, Book, Calendar, Lock, Sparkles, CheckCircle2, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/api';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    course: user?.course || '',
    semester: user?.semester || '',
    password: '',
  });

  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        name: formData.name,
        course: formData.course,
        semester: formData.semester,
      };
      if (formData.password) {
        payload.password = formData.password;
      }

      const res = await authService.updateProfile(payload);
      if (res.data.success) {
        updateUser(res.data.data);
        showSuccess('Profile updated successfully!');
        setFormData((prev) => ({ ...prev, password: '' }));
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSeedDemoData = async () => {
    if (window.confirm('Insert sample demo subjects (Data Structures, DBMS, Computer Networks, OS), attendance, units & assignments into your account?')) {
      try {
        setSeeding(true);
        const res = await authService.seedDemoData();
        if (res.data.success) {
          showSuccess('Sample academic demo data inserted successfully!');
          window.location.reload();
        }
      } catch (err) {
        showError('Failed to seed demo data');
      } finally {
        setSeeding(false);
      }
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.6rem', color: '#f8fafc', marginBottom: '0.25rem' }}>Student Profile Settings</h1>
        <p style={{ fontSize: '0.88rem', color: '#94a3b8' }}>Manage account details, branch information, and preferences</p>
      </div>

      {/* Profile Overview Card */}
      <div className="card" style={{ marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1.6rem',
          }}
        >
          {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
        </div>
        <div>
          <h2 style={{ fontSize: '1.3rem', color: '#f8fafc' }}>{user?.name}</h2>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block' }}>{user?.email}</span>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
            <span className="badge badge-info">{user?.course || 'B.Tech CS'}</span>
            <span className="badge badge-success">{user?.semester || 'Semester 5'}</span>
          </div>
        </div>
      </div>

      {/* Edit Form Card */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <h3 style={{ fontSize: '1.15rem', color: '#f8fafc', marginBottom: '1.25rem' }}>Update Personal Information</h3>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                required
                style={{ paddingLeft: '2.5rem' }}
              />
              <User size={18} color="#64748b" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address (Read-only)</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                value={user?.email || ''}
                disabled
                style={{ paddingLeft: '2.5rem', opacity: 0.7, cursor: 'not-allowed' }}
              />
              <Mail size={18} color="#64748b" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Course / Branch</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                name="course"
                className="form-input"
                value={formData.course}
                onChange={handleChange}
                required
                style={{ paddingLeft: '2.5rem' }}
              />
              <Book size={18} color="#64748b" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Semester / Year</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                name="semester"
                className="form-input"
                value={formData.semester}
                onChange={handleChange}
                required
                style={{ paddingLeft: '2.5rem' }}
              />
              <Calendar size={18} color="#64748b" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">New Password (Leave blank to keep unchanged)</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                minLength={6}
                style={{ paddingLeft: '2.5rem' }}
              />
              <Lock size={18} color="#64748b" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            <Save size={18} /> {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>

      {/* Viva / Demo Data Seed Card */}
      <div className="card">
        <h3 style={{ fontSize: '1.15rem', color: '#f8fafc', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={20} color="#fbbf24" /> Viva Demonstration Utility
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.25rem', lineHeight: 1.5 }}>
          Optionally populate your account with pre-configured sample B.Tech mini project subjects (Data Structures, DBMS, Computer Networks, Operating Systems) along with sample units, attendance, and assignments for quick live demo.
        </p>

        <button className="btn btn-outline" onClick={handleSeedDemoData} disabled={seeding}>
          {seeding ? 'Generating Sample Data...' : 'Seed Sample Academic Data'}
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
