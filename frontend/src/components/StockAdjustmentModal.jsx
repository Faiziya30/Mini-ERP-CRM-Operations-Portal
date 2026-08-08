import { useState } from 'react';

const StockAdjustmentModal = ({ open, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({ movementType: 'IN', quantity: 1, reason: '' });
  const [submitting, setSubmitting] = useState(false);

  if (!open) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await onSubmit({
        movementType: formData.movementType,
        quantity: Number(formData.quantity),
        reason: formData.reason
      });
      setFormData({ movementType: 'IN', quantity: 1, reason: '' });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card fade-in">
        <h3>Adjust Stock</h3>
        <p className="muted">Add or deduct stock with a reason for audit trail.</p>
        <form onSubmit={handleSubmit}>
          <label className="form-group">
            <span>Movement Type</span>
            <select
              className="input"
              name="movementType"
              value={formData.movementType}
              onChange={handleChange}
            >
              <option value="IN">IN (Add Stock)</option>
              <option value="OUT">OUT (Deduct Stock)</option>
            </select>
          </label>
          <label className="form-group">
            <span>Quantity</span>
            <input
              className="input"
              type="number"
              min="1"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
            />
          </label>
          <label className="form-group">
            <span>Reason</span>
            <textarea
              className="input"
              rows="3"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              required
            />
          </label>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Adjustment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockAdjustmentModal;
