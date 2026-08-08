import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="auth-wrap fade-in">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: 8 }}>404</h1>
        <h3 style={{ marginBottom: 8 }}>Page Not Found</h3>
        <p className="muted" style={{ marginBottom: 24 }}>The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn btn-primary">
          <Home size={16} />
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
