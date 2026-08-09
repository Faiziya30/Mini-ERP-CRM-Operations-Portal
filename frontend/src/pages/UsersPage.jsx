import { useEffect, useState } from 'react';
import { listUsersApi, registerApi } from '../api/authApi';
import useToast from '../hooks/useToast';
import { Eye, Pencil, Search, Shield, Trash2, X } from 'lucide-react';
import Card from '../components/Card';

const UsersPage = () => {
  const showToast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'sales'
  });

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await listUsersApi();
      setUsers(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');

    try {
      await registerApi(formData);
      showToast(`User ${formData.name} created successfully`, 'success');
      setShowModal(false);
      setFormData({ name: '', email: '', password: '', role: 'sales' });
      fetchUsers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to register user');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="page-shell fade-in">
      <div className="section-head dashboard-head">
        <div>
          <h2>User Management</h2>
          <p className="muted">Admin portal to view and register system users per role.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Create New User
        </button>
      </div>

      {error ? <Card className="error-banner mb-1">{error}</Card> : null}

      {loading ? (
        <Card className="skeleton-wrap">
          <div className="skeleton-row" />
          <div className="skeleton-row" />
          <div className="skeleton-row" />
        </Card>
      ) : users.length === 0 ? (
        <Card className="empty-state">
          <h3>No users registered</h3>
        </Card>
      ) : (
        <Card className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Full Name</th>
                <th>Email Address</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>#{u.id}</td>
                  <td>
                    <strong>{u.name}</strong>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge role-${u.role}`}>{u.role.toUpperCase()}</span>
                  </td>
                  <td>
                    <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* User Creation Modal */}
      {showModal ? (
        <div className="modal-backdrop fade-in">
          <Card className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="flex-between align-center mb-1">
              <div>
                <h3>Register New User</h3>
                <p className="muted">Add a staff account for the operations portal.</p>
              </div>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowModal(false)}
              >
                <X size={16} />
              </button>
            </div>

            {formError ? <Card className="error-banner mb-1">{formError}</Card> : null}

            <form onSubmit={handleRegisterSubmit}>
              <div className="form-group mb-1">
                <label className="label">Full Name *</label>
                <input
                  type="text"
                  className="input"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  required
                />
              </div>

              <div className="form-group mb-1">
                <label className="label">Email Address *</label>
                <input
                  type="email"
                  className="input"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  required
                />
              </div>

              <div className="form-group mb-1">
                <label className="label">Password *</label>
                <input
                  type="password"
                  className="input"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  minLength="6"
                  required
                />
              </div>

              <div className="form-group mb-2">
                <label className="label">System Role *</label>
                <select
                  className="input"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="sales">Sales</option>
                  <option value="warehouse">Warehouse</option>
                  <option value="accounts">Accounts</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex-end gap-1">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Register User'}
                </button>
              </div>
            </form>
          </Card>
        </div>
      ) : null}
    </section>
  );
};

export default UsersPage;
