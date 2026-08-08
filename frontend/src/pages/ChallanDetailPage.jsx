import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getChallanApi, confirmChallanApi, cancelChallanApi, downloadChallanPdfApi } from '../api/challanApi';
import useToast from '../hooks/useToast';
import useAuth from '../hooks/useAuth';
import StatusBadge from '../components/StatusBadge';


const ChallanDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const showToast = useToast();
  const { user } = useAuth();

  const [challan, setChallan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [pdfDownloading, setPdfDownloading] = useState(false);
  const [stockErrors, setStockErrors] = useState([]);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleDownloadPdf = async () => {
    setPdfDownloading(true);
    try {
      const blob = await downloadChallanPdfApi(id);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Challan-${challan?.challanNumber || id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast('PDF downloaded successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to download PDF', 'error');
    } finally {
      setPdfDownloading(false);
    }
  };

  const fetchChallan = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getChallanApi(id);
      setChallan(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load sales challan details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallan();
  }, [id]);

  const handleConfirm = async () => {
    setActionLoading(true);
    setError('');
    setStockErrors([]);

    try {
      await confirmChallanApi(id);
      showToast('Challan confirmed & stock deducted successfully!', 'success');
      fetchChallan();
    } catch (err) {
      const respData = err.response?.data;
      if (respData?.errors && Array.isArray(respData.errors)) {
        setStockErrors(respData.errors);
        setError(respData.message || 'Cannot confirm challan due to insufficient stock');
      } else {
        setError(respData?.message || 'Failed to confirm challan');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    setError('');
    try {
      await cancelChallanApi(id);
      showToast('Challan cancelled successfully', 'success');
      setShowCancelModal(false);
      fetchChallan();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel challan');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <section className="fade-in">
        <div className="card skeleton-wrap">
          <div className="skeleton-row" />
          <div className="skeleton-row" />
          <div className="skeleton-row" />
        </div>
      </section>
    );
  }

  if (error && !challan) {
    return (
      <section className="fade-in">
        <div className="card error-banner">{error}</div>
        <Link to="/challans" className="btn btn-ghost mt-1">
          &larr; Back to Challans
        </Link>
      </section>
    );
  }

  const grandTotalAmount = challan?.items?.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPriceSnapshot) || 0),
    0
  ) || 0;

  const canEditOrConfirm = true;
  const canCancel = true;


  return (
    <section className="fade-in challan-detail-page">
      <div className="section-head no-print">
        <div>
          <h2>Sales Challan: {challan.challanNumber}</h2>
          <p className="muted">Detailed dispatch note with snapshot pricing</p>
        </div>
        <div className="actions-cell gap-1">
          <Link to="/challans" className="btn btn-ghost">
            Back
          </Link>
          <button type="button" className="btn btn-secondary" onClick={handlePrint}>
            Print Slip
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={pdfDownloading}
            onClick={handleDownloadPdf}
          >
            {pdfDownloading ? 'Downloading...' : '📥 Download PDF'}
          </button>


          {challan.status === 'Draft' && canEditOrConfirm ? (
            <>
              <Link to={`/challans/${challan.id}/edit`} className="btn btn-secondary">
                Edit Draft
              </Link>
              <button
                type="button"
                className="btn btn-primary"
                disabled={actionLoading}
                onClick={handleConfirm}
              >
                {actionLoading ? 'Confirming...' : 'Confirm Dispatch'}
              </button>
            </>
          ) : null}

          {challan.status !== 'Cancelled' && canCancel ? (
            <button
              type="button"
              className="btn btn-ghost btn-danger-text"
              onClick={() => setShowCancelModal(true)}
            >
              Cancel Challan
            </button>
          ) : null}
        </div>
      </div>

      {error ? <div className="card error-banner mb-1 no-print">{error}</div> : null}

      {stockErrors.length > 0 ? (
        <div className="card stock-error-box mb-1 no-print">
          <h4 style={{ color: 'var(--color-danger, #e53e3e)', marginBottom: '0.5rem' }}>
            Stock Availability Failure
          </h4>
          <p className="muted mb-1">
            Dispatch cannot be confirmed because the following line items exceed available stock:
          </p>
          <ul>
            {stockErrors.map((errItem, idx) => (
              <li key={idx}>
                <strong>{errItem.productName}</strong> (SKU: {errItem.productSku}) &mdash; Requested{' '}
                <span className="badge badge-warning">{errItem.requested}</span> units, available:{' '}
                <span className="badge badge-danger">{errItem.available}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Printable Dispatch Document Card */}
      <div className="card challan-print-document">
        <div className="challan-header-grid mb-2">
          <div>
            <h1 className="brand-title">Mini ERP Operations</h1>
            <p className="muted">Wholesale & Distribution Dispatch Slip</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 className="challan-num">{challan.challanNumber}</h2>
            <div className="mb-1">
              Status: <StatusBadge status={challan.status} />
            </div>

            <p className="muted">Date: {new Date(challan.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <hr className="divider mb-2" />

        <div className="challan-info-grid mb-2">
          <div className="info-block">
            <h4>Customer Information</h4>
            <p>
              <strong>{challan.customer?.name}</strong>
            </p>
            <p>{challan.customer?.businessName || 'Individual Customer'}</p>
            <p>Phone: {challan.customer?.mobile}</p>
            <p>Address: {challan.customer?.address || 'N/A'}</p>
          </div>
          <div className="info-block" style={{ textAlign: 'right' }}>
            <h4>Dispatch Summary</h4>
            <p>
              Generated By: <strong>{challan.createdByUser?.name || 'System User'}</strong>
            </p>
            <p>User Role: {challan.createdByUser?.role || 'Sales'}</p>
            <p>Total Line Items: {challan.items?.length || 0}</p>
            <p>Total Items Qty: {challan.totalQuantity} units</p>
          </div>
        </div>

        <div className="table-wrap mb-2">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Snapshot Price</th>
                <th>Qty</th>
                <th style={{ textAlign: 'right' }}>Line Total</th>
              </tr>
            </thead>
            <tbody>
              {challan.items?.map((item, idx) => (
                <tr key={item.id || idx}>
                  <td>{idx + 1}</td>
                  <td>
                    <strong>{item.productNameSnapshot}</strong>
                  </td>
                  <td>{item.productSkuSnapshot}</td>
                  <td>₹{Number(item.unitPriceSnapshot).toFixed(2)}</td>
                  <td>{item.quantity}</td>
                  <td style={{ textAlign: 'right' }}>
                    ₹{(Number(item.quantity) * Number(item.unitPriceSnapshot)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="challan-footer-grid flex-between align-center card-inner">
          <div>
            <p className="muted">
              * Unit prices are frozen snapshots taken at the time of challan creation.
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p className="muted">Total Quantity: {challan.totalQuantity} units</p>
            <h3 style={{ color: 'var(--primary)', marginTop: '0.25rem' }}>
              Total Value: ₹{grandTotalAmount.toFixed(2)}
            </h3>
          </div>
        </div>
      </div>

      {/* Cancellation Confirmation Modal */}
      {showCancelModal ? (
        <div className="modal-backdrop fade-in">
          <div className="modal-content card">
            <h3>Confirm Challan Cancellation</h3>
            <p className="muted mt-1 mb-2">
              {challan.status === 'Confirmed'
                ? 'This challan was confirmed. Cancelling it will automatically RESTOCK all items back into inventory (StockMovement IN).'
                : 'Are you sure you want to cancel this draft challan?'}
            </p>
            <div className="flex-end gap-1">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowCancelModal(false)}
              >
                Go Back
              </button>
              <button
                type="button"
                className="btn btn-danger"
                disabled={actionLoading}
                onClick={handleCancel}
              >
                {actionLoading ? 'Cancelling...' : 'Yes, Cancel Challan'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default ChallanDetailPage;
