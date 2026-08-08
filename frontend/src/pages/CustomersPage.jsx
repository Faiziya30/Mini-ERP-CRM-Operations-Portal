import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteCustomerApi, listCustomersApi } from '../api/customerApi';
import useDebounce from '../hooks/useDebounce';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';
import ConfirmDialog from '../components/ConfirmDialog';

const defaultFilters = {
  search: '',
  status: '',
  customerType: ''
};

const CustomersPage = () => {
  const { user } = useAuth();
  const { pushToast } = useToast();

  const [filters, setFilters] = useState(defaultFilters);
  const [page, setPage] = useState(1);
  const [customers, setCustomers] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const debouncedSearch = useDebounce(filters.search, 450);

  const queryParams = useMemo(() => ({
    page,
    limit: 10,
    search: debouncedSearch || undefined,
    status: filters.status || undefined,
    customerType: filters.customerType || undefined
  }), [debouncedSearch, filters.status, filters.customerType, page]);

  const fetchCustomers = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await listCustomersApi(queryParams);
      setCustomers(response.data);
      setMeta(response.meta || { total: response.data.length, page: 1, totalPages: 1, limit: 10 });
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [queryParams.page, queryParams.limit, queryParams.search, queryParams.status, queryParams.customerType]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setPage(1);
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleDeleteCustomer = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      await deleteCustomerApi(deleteTarget.id);
      pushToast('Customer deleted successfully', 'success');
      setDeleteTarget(null);
      fetchCustomers();
    } catch (apiError) {
      pushToast(apiError.response?.data?.message || 'Delete failed', 'error');
    }
  };

  return (
    <section className="fade-in">
      <div className="section-head">
        <div>
          <h2>Customers</h2>
          <p className="muted">Track leads, active buyers, and follow-up schedules.</p>
        </div>
        <Link to="/customers/new" className="btn btn-primary">Add Customer</Link>
      </div>

      <div className="card toolbar">
        <input
          className="input"
          type="text"
          name="search"
          value={filters.search}
          onChange={handleFilterChange}
          placeholder="Search by name, mobile, business"
        />
        <select className="input" name="status" value={filters.status} onChange={handleFilterChange}>
          <option value="">All Status</option>
          <option value="Lead">Lead</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <select className="input" name="customerType" value={filters.customerType} onChange={handleFilterChange}>
          <option value="">All Types</option>
          <option value="Retail">Retail</option>
          <option value="Wholesale">Wholesale</option>
          <option value="Distributor">Distributor</option>
        </select>
      </div>

      {loading ? (
        <div className="card skeleton-wrap">
          <div className="skeleton-row" />
          <div className="skeleton-row" />
          <div className="skeleton-row" />
        </div>
      ) : error ? (
        <div className="card error-text">{error}</div>
      ) : customers.length === 0 ? (
        <div className="card empty-state">
          <h3>No customers found</h3>
          <p className="muted">Try adjusting filters or add your first customer.</p>
        </div>
      ) : (
        <div className="card table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Business</th>
                <th>Mobile</th>
                <th>Type</th>
                <th>Status</th>
                <th>Follow-up</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.name}</td>
                  <td>{customer.businessName}</td>
                  <td>{customer.mobile}</td>
                  <td>{customer.customerType}</td>
                  <td>
                    <span className={`badge status-${customer.status.toLowerCase()}`}>{customer.status}</span>
                  </td>
                  <td>{customer.followUpDate ? new Date(customer.followUpDate).toLocaleDateString() : '-'}</td>
                  <td className="actions-cell">
                    <Link className="btn btn-ghost" to={`/customers/${customer.id}`}>View</Link>
                    <Link className="btn btn-ghost" to={`/customers/${customer.id}/edit`}>Edit</Link>
                    {user?.role === 'admin' ? (
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => setDeleteTarget(customer)}
                      >
                        Delete
                      </button>
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

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete customer"
        description={deleteTarget ? `This will archive ${deleteTarget.name} from active listings.` : ''}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteCustomer}
        confirmLabel="Delete"
      />
    </section>
  );
};

export default CustomersPage;
