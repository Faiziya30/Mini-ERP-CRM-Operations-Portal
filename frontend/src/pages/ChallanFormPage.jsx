import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createChallanApi, updateChallanApi, getChallanApi, confirmChallanApi } from '../api/challanApi';
import { listCustomersApi } from '../api/customerApi';
import { listProductsApi } from '../api/productApi';
import useToast from '../hooks/useToast';

const ChallanFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const showToast = useToast();
  const isEdit = Boolean(id);

  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([
    { productId: '', quantity: 1, unitPrice: 0, currentStock: 0, name: '' }
  ]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [stockErrors, setStockErrors] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [custRes, prodRes] = await Promise.all([
          listCustomersApi({ page: 1, limit: 100 }),
          listProductsApi({ page: 1, limit: 100 })
        ]);
        setCustomers(custRes.data || []);
        setProducts(prodRes.data || []);

        if (isEdit) {
          const challanRes = await getChallanApi(id);
          const challan = challanRes.data;

          if (challan.status !== 'Draft') {
            showToast('Only Draft challans can be edited', 'error');
            navigate(`/challans/${id}`);
            return;
          }

          setCustomerId(challan.customerId);
          if (challan.items && challan.items.length > 0) {
            setItems(
              challan.items.map((item) => ({
                productId: String(item.productId),
                quantity: item.quantity,
                unitPrice: Number(item.unitPriceSnapshot),
                currentStock: 0,
                name: item.productNameSnapshot
              }))
            );
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load options');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEdit, navigate, showToast]);

  const handleProductChange = (index, selectedProductId) => {
    const selectedProd = products.find((p) => String(p.id) === String(selectedProductId));
    const newItems = [...items];

    if (selectedProd) {
      newItems[index] = {
        ...newItems[index],
        productId: selectedProductId,
        unitPrice: Number(selectedProd.unitPrice),
        currentStock: selectedProd.currentStock,
        name: selectedProd.name
      };
    } else {
      newItems[index] = {
        ...newItems[index],
        productId: '',
        unitPrice: 0,
        currentStock: 0,
        name: ''
      };
    }
    setItems(newItems);
  };

  const handleQuantityChange = (index, value) => {
    const qty = Math.max(1, parseInt(value, 10) || 1);
    const newItems = [...items];
    newItems[index].quantity = qty;
    setItems(newItems);
  };

  const addItemRow = () => {
    setItems((prev) => [
      ...prev,
      { productId: '', quantity: 1, unitPrice: 0, currentStock: 0, name: '' }
    ]);
  };

  const removeItemRow = (index) => {
    if (items.length <= 1) {
      showToast('A challan must contain at least one item line', 'error');
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!customerId) {
      setError('Please select a customer');
      return false;
    }
    if (items.length === 0) {
      setError('Please add at least one line item');
      return false;
    }
    for (let i = 0; i < items.length; i++) {
      if (!items[i].productId) {
        setError(`Please select a product for item row #${i + 1}`);
        return false;
      }
      if (!items[i].quantity || items[i].quantity <= 0) {
        setError(`Quantity must be greater than 0 for item row #${i + 1}`);
        return false;
      }
    }
    return true;
  };

  const handleSubmitDraft = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setError('');
    setStockErrors([]);

    const payload = {
      customerId: Number(customerId),
      items: items.map((item) => ({
        productId: Number(item.productId),
        quantity: Number(item.quantity)
      }))
    };

    try {
      let response;
      if (isEdit) {
        response = await updateChallanApi(id, payload);
        showToast('Challan draft updated successfully', 'success');
      } else {
        response = await createChallanApi(payload);
        showToast('Challan draft created successfully', 'success');
      }

      const nextId = response?.data?.id || id;
      if (nextId) {
        navigate(`/challans/${nextId}`);
      }
    } catch (err) {
      const respData = err.response?.data;
      const message = respData?.message || err.message || 'Failed to save challan';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitAndConfirm = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setError('');
    setStockErrors([]);

    const payload = {
      customerId: Number(customerId),
      items: items.map((item) => ({
        productId: Number(item.productId),
        quantity: Number(item.quantity)
      }))
    };

    try {
      let targetId = id;
      if (isEdit) {
        await updateChallanApi(id, payload);
      } else {
        const createRes = await createChallanApi(payload);
        targetId = createRes?.data?.id || id;
      }

      const confirmRes = await confirmChallanApi(targetId);
      if (confirmRes?.data?.id || confirmRes?.data?.status) {
        showToast('Sales Challan created & confirmed successfully!', 'success');
        navigate(`/challans/${targetId}`);
      } else {
        setError('Challan was saved but the confirmation response was unexpected.');
      }
    } catch (err) {
      const respData = err.response?.data;
      if (respData?.errors && Array.isArray(respData.errors)) {
        setStockErrors(respData.errors);
        setError(respData.message || 'Stock availability check failed');
      } else {
        const message = respData?.message || err.message || 'Failed to confirm challan';
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const totalQuantity = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const totalEstimatedAmount = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
    0
  );

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

  return (
    <section className="fade-in">
      <div className="section-head">
        <div>
          <h2>{isEdit ? 'Edit Sales Challan' : 'Create Sales Challan'}</h2>
          <p className="muted">
            {isEdit
              ? 'Modify items or save as draft before confirmation'
              : 'Add customer details and product lines for dispatch'}
          </p>
        </div>
        <Link to="/challans" className="btn btn-ghost">
          Cancel
        </Link>
      </div>

      {error ? <div className="card error-banner mb-1">{error}</div> : null}

      {stockErrors.length > 0 ? (
        <div className="card stock-error-box mb-1">
          <h4 style={{ color: 'var(--color-danger, #e53e3e)', marginBottom: '0.5rem' }}>
            Insufficient Stock Alert
          </h4>
          <p className="muted mb-1">
            The following items do not have enough stock in inventory to confirm dispatch:
          </p>
          <ul>
            {stockErrors.map((errItem, idx) => (
              <li key={idx}>
                <strong>{errItem.productName || `Product #${errItem.productId}`}</strong> (SKU: {errItem.productSku}): Requested{' '}
                <span className="badge badge-warning">{errItem.requested}</span> units, but only{' '}
                <span className="badge badge-danger">{errItem.available}</span> available.
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <form onSubmit={handleSubmitDraft} className="card challan-form">
        <div className="form-group mb-2">
          <label className="label">Customer *</label>
          <select
            className="input"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            required
          >
            <option value="">-- Select Customer --</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.businessName || 'Individual'}) - {c.mobile}
              </option>
            ))}
          </select>
        </div>

        <div className="section-subhead flex-between align-center mb-1">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Product Items</h3>
          <button type="button" className="btn btn-secondary btn-sm" onClick={addItemRow}>
            + Add Item Line
          </button>
        </div>

        <div className="table-wrap mb-2">
          <table className="table challan-items-table">
            <thead>
              <tr>
                <th style={{ width: '40%' }}>Product</th>
                <th style={{ width: '15%' }}>Unit Price</th>
                <th style={{ width: '15%' }}>Qty</th>
                <th style={{ width: '15%' }}>Line Total</th>
                <th style={{ width: '15%', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td>
                    <select
                      className="input"
                      value={item.productId}
                      onChange={(e) => handleProductChange(index, e.target.value)}
                      required
                    >
                      <option value="">-- Select Product --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (SKU: {p.sku}) [Stock: {p.currentStock}]
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>₹{item.unitPrice.toFixed(2)}</td>
                  <td>
                    <input
                      type="number"
                      className="input"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(index, e.target.value)}
                      required
                    />
                  </td>
                  <td>₹{(item.quantity * item.unitPrice).toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="btn btn-ghost btn-danger-text"
                      onClick={() => removeItemRow(index)}
                      title="Remove line"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="challan-summary-bar flex-between align-center card-inner mb-2">
          <div>
            <span className="muted">Total Line Items: </span>
            <strong>{items.length}</strong>
          </div>
          <div>
            <span className="muted">Total Quantity: </span>
            <strong style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>{totalQuantity} units</strong>
          </div>
          <div>
            <span className="muted">Estimated Total Value: </span>
            <strong style={{ fontSize: '1.2rem', color: 'var(--color-success, #38a169)' }}>
              ₹{totalEstimatedAmount.toFixed(2)}
            </strong>
          </div>
        </div>

        <div className="form-actions flex-end gap-1">
          <button
            type="submit"
            className="btn btn-secondary"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={submitting}
            onClick={handleSubmitAndConfirm}
          >
            {submitting ? 'Processing...' : 'Save & Confirm Dispatch'}
          </button>
        </div>
      </form>
    </section>
  );
};

export default ChallanFormPage;
