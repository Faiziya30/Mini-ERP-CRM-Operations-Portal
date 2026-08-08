import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { listProductsApi } from '../api/productApi';
import useDebounce from '../hooks/useDebounce';

const ProductsPage = () => {
  const [filters, setFilters] = useState({ search: '', category: '', lowStock: false });
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const debouncedSearch = useDebounce(filters.search, 450);

  const queryParams = useMemo(() => ({
    page,
    limit: 10,
    search: debouncedSearch || undefined,
    category: filters.category || undefined,
    lowStock: filters.lowStock ? 'true' : undefined
  }), [debouncedSearch, filters.category, filters.lowStock, page]);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await listProductsApi(queryParams);
      setProducts(response.data);
      setMeta(response.meta || { total: response.data.length, page: 1, totalPages: 1, limit: 10 });
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [queryParams.page, queryParams.limit, queryParams.search, queryParams.category, queryParams.lowStock]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setPage(1);
    setFilters((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <section className="fade-in">
      <div className="section-head">
        <div>
          <h2>Products</h2>
          <p className="muted">Inventory items with live stock visibility and alerts.</p>
        </div>
        <Link to="/products/new" className="btn btn-primary">Add Product</Link>
      </div>

      <div className="card toolbar">
        <input
          className="input"
          type="text"
          name="search"
          value={filters.search}
          onChange={handleChange}
          placeholder="Search by name, SKU, category"
        />
        <input
          className="input"
          type="text"
          name="category"
          value={filters.category}
          onChange={handleChange}
          placeholder="Filter by category"
        />
        <label className="filter-check">
          <input
            type="checkbox"
            name="lowStock"
            checked={filters.lowStock}
            onChange={handleChange}
          />
          <span>Low Stock Only</span>
        </label>
      </div>

      {loading ? (
        <div className="card skeleton-wrap">
          <div className="skeleton-row" />
          <div className="skeleton-row" />
          <div className="skeleton-row" />
        </div>
      ) : error ? (
        <div className="card error-text">{error}</div>
      ) : products.length === 0 ? (
        <div className="card empty-state">
          <h3>No products found</h3>
          <p className="muted">Try adjusting filters or add your first product.</p>
        </div>
      ) : (
        <div className="card table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Unit Price</th>
                <th>Current Stock</th>
                <th>Min Alert</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const lowStock = Number(product.currentStock) <= Number(product.minStockAlert);
                return (
                  <tr key={product.id} className={lowStock ? 'low-stock-row' : ''}>
                    <td>{product.name}</td>
                    <td>{product.sku}</td>
                    <td>{product.category}</td>
                    <td>{Number(product.unitPrice).toFixed(2)}</td>
                    <td>
                      {product.currentStock}
                      {lowStock ? <span className="badge low-stock-badge">Low</span> : null}
                    </td>
                    <td>{product.minStockAlert}</td>
                    <td className="actions-cell">
                      <Link className="btn btn-ghost" to={`/products/${product.id}`}>View</Link>
                      <Link className="btn btn-ghost" to={`/products/${product.id}/edit`}>Edit</Link>
                    </td>
                  </tr>
                );
              })}
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

export default ProductsPage;
