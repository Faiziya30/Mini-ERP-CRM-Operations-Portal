import { useEffect, useRef, useState } from 'react';
import { Bell, ChevronDown, LogOut, Moon, PanelLeftOpen, Search, Sun } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import useTheme from '../hooks/useTheme';

const Topbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = (user?.name || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <header className="topbar-shell fade-in">
      <div className="topbar-title-wrap">
        <button type="button" className="sidebar-collapse-inline" onClick={onToggleSidebar} aria-label="Toggle sidebar">
          <PanelLeftOpen size={16} />
        </button>
        <div>
          <h2>Operations Portal</h2>
          <span className="user-greeting">Welcome back, {user?.name}</span>
        </div>
      </div>

      <div className="topbar-search">
        <Search size={16} />
        <input type="search" placeholder="Search customers, products, challans" aria-label="Search" />
      </div>

      <div className="topbar-actions">
        <button type="button" className="topbar-icon-btn" title="Notifications" aria-label="Notifications">
          <Bell size={16} />
          <span className="topbar-notification-dot" />
        </button>
        <button
          type="button"
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>
        <button type="button" className="topbar-user" onClick={() => setMenuOpen((prev) => !prev)}>
          <span className="topbar-user-avatar">{initials}</span>
          <span className="topbar-user-copy">
            <strong>{user?.name}</strong>
            <small>{user?.role}</small>
          </span>
          <ChevronDown size={14} />
        </button>

        {menuOpen ? (
          <div className="topbar-dropdown" ref={menuRef}>
            <button type="button" onClick={toggleTheme}>
              {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
              Switch to {theme === 'light' ? 'dark' : 'light'} mode
            </button>
            <button type="button" onClick={logout}>
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
};

export default Topbar;
