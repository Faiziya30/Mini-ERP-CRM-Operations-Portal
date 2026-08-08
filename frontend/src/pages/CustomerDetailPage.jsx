import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { addCustomerFollowUpApi, getCustomerApi } from '../api/customerApi';
import useToast from '../hooks/useToast';
import useAuth from '../hooks/useAuth';

const CustomerDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { pushToast } = useToast();

  const canEdit = true;




  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [followUpForm, setFollowUpForm] = useState({ note: '', followUpDate: '' });
  const [savingNote, setSavingNote] = useState(false);

  const fetchCustomer = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getCustomerApi(id);
      setCustomer(response.data);
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Failed to load customer details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const handleFollowupChange = (event) => {
    const { name, value } = event.target;
    setFollowUpForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFollowupSubmit = async (event) => {
    event.preventDefault();

    if (!followUpForm.note.trim() || !followUpForm.followUpDate) {
      pushToast('Please add note and follow-up date', 'error');
      return;
    }

    setSavingNote(true);

    try {
      await addCustomerFollowUpApi(id, followUpForm);
      pushToast('Follow-up note added', 'success');
      setFollowUpForm({ note: '', followUpDate: '' });
      fetchCustomer();
    } catch (apiError) {
      pushToast(apiError.response?.data?.message || 'Failed to add follow-up', 'error');
    } finally {
      setSavingNote(false);
    }
  };

  if (loading) {
    return (
      <section className="card skeleton-wrap">
        <div className="skeleton-row" />
        <div className="skeleton-row" />
        <div className="skeleton-row" />
      </section>
    );
  }

  if (error) {
    return <section className="card error-text">{error}</section>;
  }

  return (
    <section className="fade-in">
      <div className="section-head">
        <div>
          <h2>{customer.name}</h2>
          <p className="muted">{customer.businessName} • {customer.customerType}</p>
        </div>
        <div className="actions-cell">
          <Link to="/customers" className="btn btn-ghost">Back</Link>
          {canEdit ? (
            <Link to={`/customers/${customer.id}/edit`} className="btn btn-primary">Edit</Link>
          ) : null}
        </div>

      </div>

      <article className="card detail-grid">
        <div><strong>Mobile:</strong> {customer.mobile}</div>
        <div><strong>Email:</strong> {customer.email || '-'}</div>
        <div><strong>GST:</strong> {customer.gstNumber || '-'}</div>
        <div><strong>Status:</strong> <span className={`badge status-${customer.status.toLowerCase()}`}>{customer.status}</span></div>
        <div className="detail-wide"><strong>Address:</strong> {customer.address}</div>
        <div className="detail-wide"><strong>Notes:</strong> {customer.notes || '-'}</div>
      </article>

      <div className="detail-columns">
        <article className="card">
          <h3 style={{ marginBottom: '0.75rem' }}>Add Follow-up</h3>
          <form onSubmit={handleFollowupSubmit}>
            <label className="form-group">
              <span>Follow-up Date</span>
              <input
                type="date"
                className="input"
                name="followUpDate"
                value={followUpForm.followUpDate}
                onChange={handleFollowupChange}
              />
            </label>
            <label className="form-group">
              <span>Note</span>
              <textarea
                className="input"
                rows="4"
                name="note"
                value={followUpForm.note}
                onChange={handleFollowupChange}
              />
            </label>
            <button type="submit" className="btn btn-primary" disabled={savingNote}>
              {savingNote ? 'Adding...' : 'Add Note'}
            </button>
          </form>
        </article>

        <article className="card">
          <h3 style={{ marginBottom: '0.75rem' }}>Follow-up Timeline</h3>
          {!customer.followUps?.length ? (
            <p className="muted">No follow-up history yet.</p>
          ) : (
            <ul className="timeline-list">
              {customer.followUps.map((item) => (
                <li key={item.id} className="timeline-item">
                  <div className="timeline-date">{new Date(item.followUpDate).toLocaleDateString()}</div>
                  <div>{item.note}</div>
                  <div className="muted">By: {item.createdByUser?.name || 'System'}</div>
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>
    </section>
  );
};

export default CustomerDetailPage;
