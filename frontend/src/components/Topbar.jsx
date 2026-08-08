import useAuth from '../hooks/useAuth';
import useTheme from '../hooks/useTheme';

const Topbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="topbar fade-in">
      <div>
        <h3>Operations Portal</h3>
        <p className="muted">Welcome back, {user?.name}</p>
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <span className="badge">Role: {user?.role}</span>
        <button type="button" className="btn btn-ghost" onClick={toggleTheme}>
          {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </button>
        <button type="button" className="btn btn-primary" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Topbar;
