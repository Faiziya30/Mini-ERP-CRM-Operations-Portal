import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const LoginPage = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await login(formData);
      navigate(from, { replace: true });
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-wrap fade-in">
      <div className="auth-card">
        <h1 className="auth-title font-display">Mini ERP + CRM</h1>
        <p className="auth-subtitle">
          Sign in to continue to operations portal
          <span className="subtitle-amber-underline" />
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="label">Email Address</label>
            <input
              id="email"
              className="input font-mono"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="user@mini-erp.local"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="label">Password</label>
            <input
              id="password"
              className="input font-mono"
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          {error ? <div className="error-text mb-2">{error}</div> : null}
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Authenticating...' : 'Sign In to Operations'}
          </button>
        </form>

        <div className="demo-credentials-box mt-3">
          <span className="eyebrow-label">DEMO ACCOUNTS</span>
          <div className="demo-creds-grid font-mono">
            <div>admin@mini-erp.local / Admin@123</div>
            <div>sales@mini-erp.local / Sales@123</div>
            <div>warehouse@mini-erp.local / Warehouse@123</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
