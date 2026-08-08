import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { getDashboardStatsApi } from '../api/dashboardApi';
import useAuth from '../hooks/useAuth';
import StatusBadge from '../components/StatusBadge';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip-stub">
        <p className="tooltip-title">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="tooltip-row">
            <span className="tooltip-dot" style={{ backgroundColor: entry.color }} />
            <span className="tooltip-name">{entry.name}:</span>
            <span className="tooltip-value">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
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
      label: 'TOTAL CUSTOMERS',
      value: stats.totalCustomers,
      badge: 'CRM ACCOUNTS',
      link: '/customers',
      code: 'CUST-TTL'
    },
    {
      label: 'LOW STOCK ALERTS',
      value: stats.lowStockProducts,
      badge: stats.lowStockProducts > 0 ? 'CRITICAL' : 'OK',
      link: '/products',
      code: 'STK-WARN'
    },
    {
      label: 'DRAFT CHALLANS',
      value: stats.draftChallans,
      badge: 'PENDING',
      link: '/challans',
      code: 'CH-DRAFT'
    },
    {
      label: 'CONFIRMED (MONTH)',
      value: stats.confirmedThisMonth,
      badge: 'DISPATCHED',
      link: '/challans',
      code: 'CH-CNF-M'
    }
  ];

  return (
    <section className="fade-in dashboard-portal">
      <div className="section-head mb-2 flex-between align-center">
        <div>
          <h1 className="portal-headline">Operations Overview</h1>
          <p className="muted font-mono" style={{ fontSize: '0.85rem' }}>
            MANIFEST REF: {new Date().toISOString().split('T')[0]} &bull; DISPATCHER ID: #{user.id}
          </p>
        </div>
        <div className="actions-cell">
          <Link to="/challans/new" className="btn btn-primary">
            + Create Sales Challan
          </Link>
        </div>
      </div>

      {error ? <div className="card error-banner mb-2">{error}</div> : null}

      {/* Ticket Stub Summary Cards */}
      {loading ? (
        <div className="card skeleton-wrap mb-3">
          <div className="skeleton-row" />
        </div>
      ) : (
        <div className="grid-cards mb-3">
          {cardItems.map((item) => (
            <article key={item.label} className="card card-ticket stat-stub-card">
              <div className="ticket-cutout" />
              <div className="flex-between align-center mb-1">
                <span className="eyebrow-label">{item.label}</span>
                <span className="stat-code-tag">{item.code}</span>
              </div>
              <div className="stat-number font-display mb-1">{item.value}</div>
              <div className="flex-between align-center">
                <span className="badge badge-ticket">{item.badge}</span>
                <Link to={item.link} className="card-link font-mono">
                  Manage &rarr;
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Recharts Data Visualizations */}
      {!loading ? (
        <div className="charts-grid mb-3">
          {/* Chart 1: Stock Movement Trend (30 Days) */}
          <div className="card card-ticket chart-card chart-wide">
            <div className="ticket-cutout" />
            <div className="flex-between align-center mb-1">
              <div>
                <span className="eyebrow-label">STOCK MOVEMENT TREND</span>
                <h3 className="chart-title">Daily Stock Receipts vs Dispatches</h3>
                <p className="chart-caption font-mono">30-day aggregate (IN vs OUT stock movements)</p>
              </div>
              <span className="badge font-mono">IN vs OUT</span>
            </div>
            <div className="chart-container" style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.stockMovementTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="date" tick={{ fill: 'var(--ink-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }} stroke="var(--border)" />
                  <YAxis tick={{ fill: 'var(--ink-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }} stroke="var(--border)" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink)' }} />
                  <Line type="monotone" dataKey="IN" name="Stock IN" stroke="var(--status-confirmed)" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="OUT" name="Stock OUT" stroke="var(--status-cancelled)" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Weekly Challans by Status */}
          <div className="card card-ticket chart-card">
            <div className="ticket-cutout" />
            <div className="flex-between align-center mb-1">
              <div>
                <span className="eyebrow-label">WEEKLY THROUGHPUT</span>
                <h3 className="chart-title">Challans by Status</h3>
                <p className="chart-caption font-mono">Last 6-week breakdown</p>
              </div>
            </div>
            <div className="chart-container" style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.challansByStatusWeekly || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="week" tick={{ fill: 'var(--ink-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }} stroke="var(--border)" />
                  <YAxis tick={{ fill: 'var(--ink-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }} stroke="var(--border)" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Draft" name="Draft" stackId="a" fill="var(--status-draft)" />
                  <Bar dataKey="Confirmed" name="Confirmed" stackId="a" fill="var(--status-confirmed)" />
                  <Bar dataKey="Cancelled" name="Cancelled" stackId="a" fill="var(--status-cancelled)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Low Stock Products Horizontal Bar */}
          <div className="card card-ticket chart-card">
            <div className="ticket-cutout" />
            <div className="flex-between align-center mb-1">
              <div>
                <span className="eyebrow-label">INVENTORY ALERT</span>
                <h3 className="chart-title">Low Stock Products</h3>
                <p className="chart-caption font-mono">Current vs Alert threshold</p>
              </div>
              <Link to="/products" className="card-link font-mono" style={{ fontSize: '0.78rem' }}>
                View All &rarr;
              </Link>
            </div>
            <div className="chart-container" style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={stats.lowStockProductsList || []}
                  margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                  <XAxis type="number" tick={{ fill: 'var(--ink-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }} stroke="var(--border)" />
                  <YAxis dataKey="sku" type="category" tick={{ fill: 'var(--ink-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }} width={80} stroke="var(--border)" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="currentStock" name="Current Stock" fill="var(--status-cancelled)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : null}

      {/* Recent Sales Challans Table */}
      <div className="card toolbar-head flex-between align-center mb-1">
        <div>
          <h3 className="font-display">Recent Sales Challans</h3>
          <p className="muted font-mono" style={{ fontSize: '0.8rem' }}>MANIFEST ENTRIES</p>
        </div>
        <Link to="/challans" className="btn btn-ghost btn-sm font-mono">
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
          <table className="table manifest-table">
            <thead>
              <tr>
                <th>CHALLAN NO.</th>
                <th>CUSTOMER</th>
                <th className="num-col">TOTAL QTY</th>
                <th>STATUS</th>
                <th>DATE</th>
                <th style={{ textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentChallans?.map((ch, idx) => (
                <tr key={ch.id} className={`status-row-${ch.status.toLowerCase()}`}>
                  <td className="font-mono bold-text">{ch.challanNumber}</td>
                  <td>
                    <strong>{ch.customer?.name || 'N/A'}</strong>
                    {ch.customer?.businessName ? (
                      <span className="muted"> ({ch.customer.businessName})</span>
                    ) : null}
                  </td>
                  <td className="num-col font-mono">{ch.totalQuantity} units</td>
                  <td>
                    <StatusBadge status={ch.status} index={idx} />
                  </td>
                  <td className="font-mono">{new Date(ch.createdAt).toLocaleDateString()}</td>
                  <td style={{ textAlign: 'right' }}>
                    <Link to={`/challans/${ch.id}`} className="btn btn-ghost btn-sm font-mono">
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
