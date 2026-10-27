import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Book, Calendar, UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    course: 'B.Tech Computer Science',
    semester: 'Semester 5',
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { register } = useAuth();
  const { showSuccess } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name || !formData.email || !formData.password) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      const res = await register(formData);
      if (res.success) {
        showSuccess('Account created successfully! Welcome aboard.');
        navigate('/dashboard');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.4rem', color: '#f8fafc', marginBottom: '0.4rem', textAlign: 'center' }}>
        Student Registration
      </h2>
      <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.5rem', textAlign: 'center' }}>
        Create your individual student profile to track your academic progress
      </p>

      {errorMsg && (
        <div className="alert-banner alert-danger" style={{ padding: '0.75rem 1rem', fontSize: '0.85rem' }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              name="name"
              className="form-input"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              required
              style={{ paddingLeft: '2.5rem' }}
            />
            <User size={18} color="#64748b" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Email Address *</label>
          <div style={{ position: 'relative' }}>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              style={{ paddingLeft: '2.5rem' }}
            />
            <Mail size={18} color="#64748b" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Course / Branch *</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              name="course"
              className="form-input"
              placeholder="e.g. B.Tech Computer Science"
              value={formData.course}
              onChange={handleChange}
              required
              style={{ paddingLeft: '2.5rem' }}
            />
            <Book size={18} color="#64748b" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Semester / Year *</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              name="semester"
              className="form-input"
              placeholder="e.g. Semester 5 or Year 3"
              value={formData.semester}
              onChange={handleChange}
              required
              style={{ paddingLeft: '2.5rem' }}
            />
            <Calendar size={18} color="#64748b" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label className="form-label">Password *</label>
          <div style={{ position: 'relative' }}>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              style={{ paddingLeft: '2.5rem' }}
            />
            <Lock size={18} color="#64748b" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }} disabled={loading}>
          {loading ? (
            'Creating Account...'
          ) : (
            <>
              <UserPlus size={18} /> Register Student Account
            </>
          )}
        </button>
      </form>

      <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.88rem', color: '#94a3b8' }}>
        Already registered?{' '}
        <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
          Login here
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;
