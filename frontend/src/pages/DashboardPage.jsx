import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, Area,
  XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import { Users, AlertTriangle, FileText, CheckCircle, Plus, ArrowRight, CalendarRange, TrendingUp, TrendingDown } from 'lucide-react';
import { getDashboardStatsApi } from '../api/dashboardApi';
import useAuth from '../hooks/useAuth';
import StatusBadge from '../components/StatusBadge';

const periodOptions = [
  { label: '7 Days', value: 7 },
  { label: '30 Days', value: 30 }
];

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
  const [period, setPeriod] = useState(30);
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
    {
      label: 'Total Customers',
      value: stats.totalCustomers,
      icon: Users,
      color: 'indigo',
      link: '/customers',
      hint: 'Active relationships tracked',
      trend: { label: 'Growing base', direction: 'up' }
    },
    {
      label: 'Low Stock Alerts',
      value: stats.lowStockProducts,
      icon: AlertTriangle,
      color: 'red',
      link: '/products',
      hint: 'Requires attention',
      trend: { label: 'Monitor closely', direction: 'down' }
    },
    {
      label: 'Draft Challans',
      value: stats.draftChallans,
      icon: FileText,
      color: 'amber',
      link: '/challans',
      hint: 'Pending dispatch',
      trend: { label: 'Needs review', direction: 'down' }
    },
    {
      label: 'Confirmed (Month)',
      value: stats.confirmedThisMonth,
      icon: CheckCircle,
      color: 'green',
      link: '/challans',
      hint: 'Completed this month',
      trend: { label: 'Strong flow', direction: 'up' }
    }
  ];

  const lineTrend = useMemo(() => (stats.stockMovementTrend || []).slice(-period), [period, stats.stockMovementTrend]);
  const weeklyTrend = useMemo(() => (stats.challansByStatusWeekly || []).slice(-Math.ceil(period / 7)), [period, stats.challansByStatusWeekly]);

  return (
    <section className="fade-in">
      <div className="section-head dashboard-head">
        <div>
          <h2>Dashboard</h2>
          <p className="muted">Operational overview for {user?.name || 'your team'}</p>
        </div>
        <div className="section-head-actions">
          <div className="chip-group">
            {periodOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`chip ${period === option.value ? 'active' : ''}`}
                onClick={() => setPeriod(option.value)}
              >
                <CalendarRange size={14} />
                {option.label}
              </button>
            ))}
          </div>
          <Link to="/challans/new" className="btn btn-primary">
            <Plus size={16} />
            New Challan
          </Link>
        </div>
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
                <Link key={c.label} to={c.link} className="metric-card metric-card-link">
                  <div className={`metric-icon ${c.color}`}>
                    <Icon size={22} />
                  </div>
                  <div className="metric-body">
                    <div className="metric-label">{c.label}</div>
                    <div className="metric-value">{c.value}</div>
                    <div className="metric-hint-row">
                      <span className={`metric-trend ${c.trend.direction}`}>
                        {c.trend.direction === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {c.trend.label}
                      </span>
                      <span className="metric-link">{c.hint}</span>
                    </div>
                    <span className="metric-link metric-link-inline">
                      View details <ArrowRight size={12} style={{ verticalAlign: 'middle' }} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Charts */}
          <div className="charts-grid mb-3">
            <div className="card chart-card chart-wide">
              <div className="card-head-row">
                <div>
                  <h3 className="chart-title">Stock Movement Trend</h3>
                  <p className="chart-caption">Daily IN vs OUT movements</p>
                </div>
                <span className="chart-caption">Last {period} days</span>
              </div>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="stockLine" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--accent)" stopOpacity="1" />
                        <stop offset="100%" stopColor="var(--accent-hover)" stopOpacity="0.8" />
                      </linearGradient>
                      <linearGradient id="stockArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.24" />
                        <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                    <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} stroke="var(--border-color)" />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} stroke="var(--border-color)" />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="IN" stroke="none" fill="url(#stockArea)" />
                    <Line type="monotone" dataKey="IN" name="Stock IN" stroke="url(#stockLine)" strokeWidth={3} dot={false} activeDot={{ r: 4 }} />
                    <Line type="monotone" dataKey="OUT" name="Stock OUT" stroke="var(--danger)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} strokeDasharray="5 4" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card chart-card">
              <div className="card-head-row">
                <div>
                  <h3 className="chart-title">Weekly Challans</h3>
                  <p className="chart-caption">Status breakdown</p>
                </div>
                <span className="chart-caption">{weeklyTrend.length} periods</span>
              </div>
              <div style={{ width: '100%', height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
