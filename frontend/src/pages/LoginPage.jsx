import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Package,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import AuthField from '../components/AuthField';
import { authDevCredentials } from '../config/authDevCredentials';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LoginPage = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loginState, setLoginState] = useState('idle');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTimerRef = useRef(null);

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('mini_erp_login_email');
    if (rememberedEmail) {
      setFormData((prev) => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }

    if (import.meta.env.DEV) {
      console.info('Dev auth credentials available via src/config/authDevCredentials.js', authDevCredentials);
    }

    return () => {
      if (redirectTimerRef.current) {
        window.clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  const emailError = useMemo(() => {
    if (!touched.email && !formData.email) return '';
    if (!formData.email.trim()) return 'Email is required.';
    if (!EMAIL_PATTERN.test(formData.email.trim())) return 'Enter a valid email address.';
    return '';
  }, [formData.email, touched.email]);

  const passwordError = useMemo(() => {
    if (!touched.password && !formData.password) return '';
    if (!formData.password.trim()) return 'Password is required.';
    if (formData.password.trim().length < 6) return 'Password must be at least 6 characters.';
    return '';
  }, [formData.password, touched.password]);

  const isFormValid = EMAIL_PATTERN.test(formData.email.trim()) && formData.password.trim().length >= 6;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setError('');
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setTouched({ email: true, password: true });
    if (!isFormValid) return;
    setSubmitting(true);
    setLoginState('idle');
    setError('');

    try {
      await login(formData);
      if (rememberMe) {
        localStorage.setItem('mini_erp_login_email', formData.email.trim());
      } else {
        localStorage.removeItem('mini_erp_login_email');
      }
      setSubmitting(false);
      setLoginState('success');
      redirectTimerRef.current = window.setTimeout(() => {
        navigate(from, { replace: true });
      }, 650);
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Login failed. Please check your credentials.');
      setLoginState('idle');
      setSubmitting(false);
    }
  };

  const handlePointerMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    event.currentTarget.style.setProperty('--cursor-x', `${x}%`);
    event.currentTarget.style.setProperty('--cursor-y', `${y}%`);
  };

  const handlePointerLeave = (event) => {
    event.currentTarget.style.setProperty('--cursor-x', '24%');
    event.currentTarget.style.setProperty('--cursor-y', '22%');
  };

  return (
    <div
      className="auth-page"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{ '--cursor-x': '24%', '--cursor-y': '22%' }}
    >
      <div className="auth-bg-shape auth-bg-shape-one" />
      <div className="auth-bg-shape auth-bg-shape-two" />

      <div className="auth-shell">
        <div className="auth-marketing-panel">
          <div className="auth-brand-chip">
            <ShieldCheck size={16} />
            <span>Mini ERP + CRM</span>
          </div>

          <div className="auth-hero-copy">
            <p className="auth-greeting">
              <Sparkles size={16} />
              Welcome back 👋
            </p>
            <h1>Streamline your business operations effortlessly.</h1>
            <p>
              Manage customers, stock, sales challans, and daily operations from one polished
              control center designed for fast-moving teams.
            </p>
          </div>

          <div className="auth-feature-list">
            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <Package size={16} />
              </div>
              <div>
                <strong>Inventory-aware dispatch</strong>
                <span>Keep stock, challans, and confirmations in sync.</span>
              </div>
            </div>
            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <ArrowRight size={16} />
              </div>
              <div>
                <strong>Faster daily workflows</strong>
                <span>Move from lead to invoice with fewer clicks.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-card auth-card-premium">
          <div className="auth-card-topline" />
          <div className="auth-card-glow" />
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <Package size={22} />
            </div>
            <div>
              <div className="auth-kicker">Operations Portal</div>
              <h2 className="auth-title">Sign in to continue</h2>
            </div>
          </div>

          <p className="auth-subtitle">Access the dashboard, customers, products, and challans.</p>

          {error ? (
            <div className="auth-alert auth-alert-error" role="alert" aria-live="polite">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          ) : null}

          {loginState === 'success' ? (
            <div className="auth-alert auth-alert-success" role="status" aria-live="polite">
              <span className="auth-success-icon">
                <CheckCircle2 size={18} />
              </span>
              <span>Authentication successful. Redirecting...</span>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="auth-form">
            <AuthField
              id="email"
              label="Email Address"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={emailError}
              icon={Mail}
              required
              disabled={submitting}
            />

            <AuthField
              id="password"
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={passwordError}
              icon={Lock}
              required
              disabled={submitting}
              rightElement={(
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              )}
            />

            <div className="auth-meta-row">
              <label className="auth-checkbox">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
                <span>Remember me</span>
              </label>

              <a
                className="auth-forgot-link"
                href="mailto:admin@mini-erp.local?subject=Password%20Reset%20Request"
              >
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              className="btn btn-primary auth-submit-btn"
              disabled={submitting || !isFormValid || loginState === 'success'}
            >
              {submitting ? (
                <span className="auth-button-loading">
                  <span className="spinner" aria-hidden="true" />
                  Signing in...
                </span>
              ) : loginState === 'success' ? (
                <span className="auth-button-loading">
                  <CheckCircle2 size={18} />
                  Access granted
                </span>
              ) : (
                <span>Sign In</span>
              )}
            </button>

            <p className="auth-footnote">
              Protected access for authorized staff only.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
