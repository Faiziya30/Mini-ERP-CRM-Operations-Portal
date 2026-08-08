import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Package, FileText, Shield } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const menuItems = [
  { label: 'Dashboard', path: '/', roles: ['admin', 'sales', 'warehouse', 'accounts'], icon: LayoutDashboard },
  { label: 'Customers', path: '/customers', roles: ['admin', 'sales', 'warehouse', 'accounts'], icon: Users },
  { label: 'Products', path: '/products', roles: ['admin', 'sales', 'warehouse', 'accounts'], icon: Package },
  { label: 'Challans', path: '/challans', roles: ['admin', 'sales', 'warehouse', 'accounts'], icon: FileText },
  { label: 'Users', path: '/users', roles: ['admin'], icon: Shield }
];

const Sidebar = () => {
  const { user } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <Package size={20} />
        </div>
        <div>
          <h1>Mini ERP</h1>
          <span>Operations Portal</span>
        </div>
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
              >
                <span className="nav-icon"><Icon size={18} /></span>
                <span className="nav-label">{item.label}</span>
              </NavLink>
            );
          })}
      </nav>
    </aside>
  );
};

export default Sidebar;
