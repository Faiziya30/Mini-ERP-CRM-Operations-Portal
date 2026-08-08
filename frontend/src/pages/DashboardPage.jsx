import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStatsApi } from '../api/dashboardApi';
import useAuth from '../hooks/useAuth';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    lowStockProducts: 0,
    draftChallans: 0,
    confirmedThisMonth: 0,
    recentChallans: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboardStats = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getDashboardStatsApi();
        setStats(res.data || {});
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard metrics');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardStats();
  }, []);

  const cardItems = [
    {
      label: 'Total Customers',
      value: stats.totalCustomers,
      badge: 'CRM Leads & Active',
      link: '/customers',
      colorClass: 'card-primary'
    },
    {
      label: 'Low Stock Alerts',
      value: stats.lowStockProducts,
      badge: 'Action Required',
      link: '/products',
      colorClass: stats.lowStockProducts > 0 ? 'card-warning' : 'card-success'
    },
    {
      label: 'Draft Challans',
      value: stats.draftChallans,
      badge: 'Pending Confirmation',
      link: '/challans',
      colorClass: 'card-info'
    },
    {
      label: 'Confirmed (This Month)',
      value: stats.confirmedThisMonth,
      badge: 'Dispatched Sales',
      link: '/challans',
      colorClass: 'card-success'
    }
  ];

  return (
    <section className="fade-in">
      <div className="section-head mb-2">
        <div>
          <h2>Welcome back, {user.name} 👋</h2>
          <p className="muted">
            Portal Overview &bull; Role:{' '}
            <span className={`badge role-${user.role}`}>{user.role.toUpperCase()}</span>
          </p>
        </div>
      </div>

      {error ? <div className="card error-banner mb-2">{error}</div> : null}

      {loading ? (
        <div className="card skeleton-wrap mb-2">
          <div className="skeleton-row" />
          <div className="skeleton-row" />
        </div>
      ) : (
        <div className="grid-cards mb-3">
          {cardItems.map((item) => (
            <article key={item.label} className={`card stat-card ${item.colorClass}`}>
              <div className="flex-between align-center">
                <span className="label">{item.label}</span>
                <span className="stat-badge">{item.badge}</span>
              </div>
              <div className="value mt-1 mb-1">{item.value}</div>
              <Link to={item.link} className="card-link">
                View Details &rarr;
              </Link>
            </article>
          ))}
        </div>
      )}

      {/* Recent Sales Challans Table */}
      <div className="card toolbar-head flex-between align-center mb-1">
        <h3>Recent Sales Challans</h3>
        <Link to="/challans" className="btn btn-ghost btn-sm">
          View All Challans &rarr;
        </Link>
      </div>

      {loading ? (
        <div className="card skeleton-wrap">
          <div className="skeleton-row" />
        </div>
      ) : stats.recentChallans?.length === 0 ? (
        <div className="card empty-state">
          <p className="muted">No sales challans recorded yet.</p>
        </div>
      ) : (
        <div className="card table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Challan No.</th>
                <th>Customer</th>
                <th>Total Qty</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentChallans?.map((ch) => (
                <tr key={ch.id}>
                  <td>
                    <strong>{ch.challanNumber}</strong>
                  </td>
                  <td>{ch.customer?.name || 'N/A'} ({ch.customer?.businessName || '-'})</td>
                  <td>{ch.totalQuantity} units</td>
                  <td>
                    <span className={`badge status-${ch.status.toLowerCase()}`}>
                      {ch.status}
                    </span>
                  </td>
                  <td>{new Date(ch.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/challans/${ch.id}`} className="btn btn-ghost btn-sm">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default DashboardPage;
