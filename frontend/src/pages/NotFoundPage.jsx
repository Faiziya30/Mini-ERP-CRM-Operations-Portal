import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="auth-wrap fade-in">
      <div className="auth-card">
        <h1>404</h1>
        <p className="muted">The page you requested was not found.</p>
        <Link to="/" className="btn btn-primary" style={{ display: 'inline-block', marginTop: '1rem' }}>
          Back Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
