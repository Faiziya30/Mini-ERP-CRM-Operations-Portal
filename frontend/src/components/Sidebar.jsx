import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Package, FileText, Shield, LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const menuItems = [
  { label: 'Dashboard', path: '/', roles: ['admin', 'sales', 'warehouse', 'accounts'], icon: LayoutDashboard },
  { label: 'Customers', path: '/customers', roles: ['admin', 'sales', 'warehouse', 'accounts'], icon: Users },
  { label: 'Products', path: '/products', roles: ['admin', 'sales', 'warehouse', 'accounts'], icon: Package },
  { label: 'Challans', path: '/challans', roles: ['admin', 'sales', 'warehouse', 'accounts'], icon: FileText },
  { label: 'Users', path: '/users', roles: ['admin'], icon: Shield }
];

const Sidebar = ({ collapsed = false, onToggleCollapse }) => {
  const { user, logout } = useAuth();

  const initials = (user?.name || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <aside className={`sidebar ${collapsed ? 'is-collapsed' : ''}`}>
      <div className="sidebar-brand-wrap">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <Package size={20} />
          </div>
          <div className="sidebar-brand-copy">
            <h1>Mini ERP</h1>
            <span>Operations Portal</span>
          </div>
        </div>
        <button
          type="button"
          className="sidebar-collapse-btn"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      <nav className="nav-links">
        {menuItems
          .filter((item) => item.roles.includes(user.role))
          .map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                end={item.path === '/'}
                title={collapsed ? item.label : undefined}
              >
                <span className="nav-icon"><Icon size={18} /></span>
                <span className="nav-label">{item.label}</span>
              </NavLink>
            );
          })}
      </nav>

      <div className="sidebar-profile">
        <div className="sidebar-avatar" aria-hidden="true">{initials}</div>
        <div className="sidebar-profile-copy">
          <strong>{user?.name || 'Team Member'}</strong>
          <span>{user?.role || 'member'}</span>
        </div>
        <button type="button" className="sidebar-signout-btn" onClick={logout} title="Sign out">
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
