import { NavLink } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const menuItems = [
  { label: 'Dashboard', path: '/', roles: ['admin', 'sales', 'warehouse', 'accounts'] },
  { label: 'Customers', path: '/customers', roles: ['admin', 'sales'] },
  { label: 'Products', path: '/products', roles: ['admin', 'warehouse'] },
  { label: 'Challans', path: '/challans', roles: ['admin', 'sales', 'warehouse', 'accounts'] },
  { label: 'Users', path: '/users', roles: ['admin'] }
];


const Sidebar = () => {
  const { user } = useAuth();

  return (
    <aside className="sidebar">
      <div className="brand">Mini ERP + CRM</div>
      <nav className="nav-links">
        {menuItems
          .filter((item) => item.roles.includes(user.role))
          .map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              end={item.path === '/'}
            >
              {item.label}
            </NavLink>
          ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
