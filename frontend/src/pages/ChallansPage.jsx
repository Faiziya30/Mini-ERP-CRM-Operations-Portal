import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { listChallansApi } from '../api/challanApi';
import { listCustomersApi } from '../api/customerApi';

const ChallansPage = () => {
  const [filters, setFilters] = useState({
    status: '',
    customerId: '',
    startDate: '',
    endDate: ''
  });
  const [page, setPage] = useState(1);
  const [challans, setChallans] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const queryParams = useMemo(() => ({
    page,
    limit: 10,
    status: filters.status || undefined,
    customerId: filters.customerId || undefined,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined
  }), [filters, page]);

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const res = await listCustomersApi({ page: 1, limit: 100 });
        setCustomers(res.data || []);
      } catch (e) {
        setCustomers([]);
      }
    };

    loadCustomers();
  }, []);

  const fetchChallans = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await listChallansApi(queryParams);
      setChallans(response.data || []);
      setMeta(response.meta || { total: 0, page: 1, totalPages: 1, limit: 10 });
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Failed to load challans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallans();
  }, [queryParams.page, queryParams.limit, queryParams.status, queryParams.customerId, queryParams.startDate, queryParams.endDate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setPage(1);
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <section className="fade-in">
      <div className="section-head">
        <div>
          <h2>Sales Challans</h2>
          <p className="muted">Draft, confirm, and track dispatch challans.</p>
        </div>
        <Link to="/challans/new" className="btn btn-primary">Create Challan</Link>
      </div>

      <div className="card toolbar challan-filter-grid">
        <select className="input" name="status" value={filters.status} onChange={handleChange}>
          <option value="">All Status</option>
          <option value="Draft">Draft</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <select className="input" name="customerId" value={filters.customerId} onChange={handleChange}>
          <option value="">All Customers</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>{customer.name} - {customer.businessName}</option>
          ))}
        </select>

        <input className="input" type="date" name="startDate" value={filters.startDate} onChange={handleChange} />
        <input className="input" type="date" name="endDate" value={filters.endDate} onChange={handleChange} />
      </div>

      {loading ? (
        <div className="card skeleton-wrap">
          <div className="skeleton-row" />
          <div className="skeleton-row" />
          <div className="skeleton-row" />
        </div>
      ) : error ? (
        <div className="card error-text">{error}</div>
      ) : challans.length === 0 ? (
        <div className="card empty-state">
          <h3>No challans found</h3>
          <p className="muted">Create your first draft challan to get started.</p>
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
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {challans.map((challan) => (
                <tr key={challan.id}>
                  <td>{challan.challanNumber}</td>
                  <td>{challan.customer?.name || '-'} ({challan.customer?.businessName || '-'})</td>
                  <td>{challan.totalQuantity}</td>
                  <td><span className={`badge status-${challan.status.toLowerCase()}`}>{challan.status}</span></td>
                  <td>{new Date(challan.createdAt).toLocaleDateString()}</td>
                  <td className="actions-cell">
                    <Link className="btn btn-ghost" to={`/challans/${challan.id}`}>View</Link>
                    {challan.status === 'Draft' ? (
                      <Link className="btn btn-ghost" to={`/challans/${challan.id}/edit`}>Edit</Link>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="pagination-bar">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          disabled={meta.page <= 1}
        >
          Previous
        </button>
        <span className="muted">Page {meta.page} of {meta.totalPages} • {meta.total} records</span>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setPage((prev) => Math.min(meta.totalPages, prev + 1))}
          disabled={meta.page >= meta.totalPages}
        >
          Next
        </button>
      </div>
    </section>
  );
};

export default ChallansPage;
