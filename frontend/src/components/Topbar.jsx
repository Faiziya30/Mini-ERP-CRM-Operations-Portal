import { Sun, Moon, LogOut } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import useTheme from '../hooks/useTheme';

const Topbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="topbar fade-in">
      <div className="topbar-title-wrap">
        <h2>Operations Portal</h2>
        <span className="user-greeting">Welcome back, {user?.name}</span>
      </div>
      <div className="topbar-actions">
        <span className="role-badge">{user?.role}</span>
        <button
          type="button"
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={logout}>
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </header>
  );
};

export default Topbar;
