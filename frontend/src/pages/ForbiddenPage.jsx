import { Link } from 'react-router-dom';

const ForbiddenPage = () => {
  return (
    <div className="auth-wrap fade-in">
      <div className="auth-card">
        <h1>403</h1>
        <p className="muted">You do not have permission to access this page.</p>
        <Link to="/" className="btn btn-primary" style={{ display: 'inline-block', marginTop: '1rem' }}>
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default ForbiddenPage;
