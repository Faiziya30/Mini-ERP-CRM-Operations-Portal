import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import { Users, AlertTriangle, FileText, CheckCircle, Plus, ArrowRight } from 'lucide-react';
import { getDashboardStatsApi } from '../api/dashboardApi';
import useAuth from '../hooks/useAuth';
import StatusBadge from '../components/StatusBadge';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip-stub">
      <p className="tooltip-title">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="tooltip-row">
          <span className="tooltip-dot" style={{ backgroundColor: entry.color }} />
          <span className="tooltip-name">{entry.name}:</span>
          <span className="tooltip-value">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    lowStockProducts: 0,
    draftChallans: 0,
    confirmedThisMonth: 0,
    recentChallans: [],
    stockMovementTrend: [],
    challansByStatusWeekly: [],
    lowStockProductsList: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getDashboardStatsApi();
        setStats(res.data || {});
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const cards = [
    { label: 'Total Customers', value: stats.totalCustomers, icon: Users, color: 'indigo', link: '/customers' },
    { label: 'Low Stock Alerts', value: stats.lowStockProducts, icon: AlertTriangle, color: 'red', link: '/products' },
    { label: 'Draft Challans', value: stats.draftChallans, icon: FileText, color: 'amber', link: '/challans' },
    { label: 'Confirmed (Month)', value: stats.confirmedThisMonth, icon: CheckCircle, color: 'green', link: '/challans' }
  ];

  return (
    <section className="fade-in">
      <div className="section-head">
        <div>
          <h2>Dashboard</h2>
          <p className="muted">Overview of your operations</p>
        </div>
        <Link to="/challans/new" className="btn btn-primary">
          <Plus size={16} />
          New Challan
        </Link>
      </div>

      {error ? <div className="card error-banner mb-2">{error}</div> : null}

      {loading ? (
        <div className="card skeleton-wrap mb-3">
          <div className="skeleton-row" />
          <div className="skeleton-row" />
        </div>
      ) : (
        <>
          {/* Metric Cards */}
          <div className="metrics-grid mb-3">
            {cards.map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.label} className="metric-card">
                  <div className={`metric-icon ${c.color}`}>
                    <Icon size={22} />
                  </div>
                  <div className="metric-body">
                    <div className="metric-label">{c.label}</div>
                    <div className="metric-value">{c.value}</div>
                    <Link to={c.link} className="metric-link">
                      View details <ArrowRight size={12} style={{ verticalAlign: 'middle' }} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Charts */}
          <div className="charts-grid mb-3">
            <div className="card chart-card chart-wide">
              <h3 className="chart-title">Stock Movement Trend</h3>
              <p className="chart-caption">Daily IN vs OUT movements — last 30 days</p>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.stockMovementTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                    <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} stroke="var(--border-color)" />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} stroke="var(--border-color)" />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="IN" name="Stock IN" stroke="var(--success)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                    <Line type="monotone" dataKey="OUT" name="Stock OUT" stroke="var(--danger)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card chart-card">
              <h3 className="chart-title">Weekly Challans</h3>
              <p className="chart-caption">Status breakdown — last 6 weeks</p>
              <div style={{ width: '100%', height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.challansByStatusWeekly || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                    <XAxis dataKey="week" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} stroke="var(--border-color)" />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} stroke="var(--border-color)" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="Draft" stackId="a" fill="var(--warning)" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="Confirmed" stackId="a" fill="var(--success)" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="Cancelled" stackId="a" fill="var(--danger)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card chart-card">
              <h3 className="chart-title">Low Stock Products</h3>
              <p className="chart-caption">
                Current stock levels
                <Link to="/products" style={{ marginLeft: 8, color: 'var(--accent)', fontSize: '0.78rem' }}>View all →</Link>
              </p>
              <div style={{ width: '100%', height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={stats.lowStockProductsList || []} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                    <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} stroke="var(--border-color)" />
                    <YAxis dataKey="sku" type="category" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} width={80} stroke="var(--border-color)" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="currentStock" name="Stock" fill="var(--danger)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Challans Table */}
          <div className="card">
            <div className="flex-between align-center mb-2">
              <h3>Recent Sales Challans</h3>
              <Link to="/challans" className="btn btn-ghost btn-sm">
                View All <ArrowRight size={14} />
              </Link>
            </div>

            {stats.recentChallans?.length === 0 ? (
              <div className="empty-state">
                <p className="muted">No challans recorded yet.</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Challan No.</th>
                      <th>Customer</th>
                      <th>Qty</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentChallans?.map((ch) => (
                      <tr key={ch.id}>
                        <td><strong>{ch.challanNumber}</strong></td>
                        <td>
                          {ch.customer?.name || 'N/A'}
                          {ch.customer?.businessName ? <span className="muted"> · {ch.customer.businessName}</span> : null}
                        </td>
                        <td>{ch.totalQuantity} units</td>
                        <td><StatusBadge status={ch.status} /></td>
                        <td>{new Date(ch.createdAt).toLocaleDateString()}</td>
                        <td style={{ textAlign: 'right' }}>
                          <Link to={`/challans/${ch.id}`} className="btn btn-ghost btn-sm">View</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
};

export default DashboardPage;
