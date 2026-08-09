import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import Card from '../components/Card';

const NotFoundPage = () => {
  return (
    <div className="auth-page fade-in">
      <Card className="auth-card-premium" style={{ textAlign: 'center', width: 'min(100%, 440px)' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: 8 }}>404</h1>
        <h3 style={{ marginBottom: 8 }}>Page Not Found</h3>
        <p className="muted" style={{ marginBottom: 24 }}>The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn btn-primary">
          <Home size={16} />
          Go to Dashboard
        </Link>
      </Card>
    </div>
  );
};

export default NotFoundPage;
