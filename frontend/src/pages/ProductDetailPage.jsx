import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { adjustProductStockApi, getProductApi, getProductStockLogApi } from '../api/productApi';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';
import StockAdjustmentModal from '../components/StockAdjustmentModal';

const ProductDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { pushToast } = useToast();

  const [product, setProduct] = useState(null);
  const [stockLogs, setStockLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stockModalOpen, setStockModalOpen] = useState(false);

  const canAdjust = true;


  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      const [productRes, logRes] = await Promise.all([
        getProductApi(id),
        getProductStockLogApi(id, { page: 1, limit: 20 })
      ]);

      setProduct(productRes.data);
      setStockLogs(logRes.data || []);
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAdjustStock = async (payload) => {
    try {
      await adjustProductStockApi(id, payload);
      pushToast('Stock adjusted successfully', 'success');
      await fetchData();
    } catch (apiError) {
      const msg = apiError.response?.data?.errors?.[0]?.message || apiError.response?.data?.message || 'Failed to adjust stock';
      pushToast(msg, 'error');
      throw apiError;
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

  const lowStock = Number(product.currentStock) <= Number(product.minStockAlert);

  return (
    <section className="fade-in">
      <div className="section-head">
        <div>
          <h2>{product.name}</h2>
          <p className="muted">SKU: {product.sku} • {product.category}</p>
        </div>
        <div className="actions-cell">
          <Link to="/products" className="btn btn-ghost">Back</Link>
          {canAdjust ? (
            <>
              <Link to={`/products/${product.id}/edit`} className="btn btn-primary">Edit</Link>
              <button type="button" className="btn btn-ghost" onClick={() => setStockModalOpen(true)}>
                Adjust Stock
              </button>
            </>
          ) : null}
        </div>

      </div>

      <article className="card detail-grid">
        <div><strong>Unit Price:</strong> {Number(product.unitPrice).toFixed(2)}</div>
        <div>
          <strong>Current Stock:</strong> {product.currentStock}
          {lowStock ? <span className="badge low-stock-badge">Low Stock</span> : null}
        </div>
        <div><strong>Min Stock Alert:</strong> {product.minStockAlert}</div>
        <div><strong>Warehouse Location:</strong> {product.warehouseLocation || '-'}</div>
      </article>

      <article className="card table-wrap">
        <h3 style={{ marginBottom: '0.75rem' }}>Stock Movement Log</h3>
        {!stockLogs.length ? (
          <p className="muted">No stock movements yet.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Reason</th>
                <th>By</th>
              </tr>
            </thead>
            <tbody>
              {stockLogs.map((log) => (
                <tr key={log.id}>
                  <td>{new Date(log.createdAt).toLocaleString()}</td>
                  <td><span className={`badge ${log.movementType === 'IN' ? 'status-active' : 'status-inactive'}`}>{log.movementType}</span></td>
                  <td>{log.quantityChanged}</td>
                  <td>{log.reason}</td>
                  <td>{log.createdByUser?.name || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </article>

      <StockAdjustmentModal
        open={stockModalOpen}
        onClose={() => setStockModalOpen(false)}
        onSubmit={handleAdjustStock}
      />
    </section>
  );
};

export default ProductDetailPage;
