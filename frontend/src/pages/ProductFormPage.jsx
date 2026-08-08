import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createProductApi, getProductApi, updateProductApi, uploadProductImageApi } from '../api/productApi';
import useToast from '../hooks/useToast';

const initialForm = {
  name: '',
  sku: '',
  category: '',
  unitPrice: '',
  currentStock: 0,
  minStockAlert: 0,
  warehouseLocation: '',
  imageUrl: ''
};

const ProductFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const showToast = useToast();

  const isEdit = useMemo(() => Boolean(id), [id]);
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!isEdit) {
      return;
    }

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await getProductApi(id);
        const product = response.data;

        setFormData({
          name: product.name || '',
          sku: product.sku || '',
          category: product.category || '',
          unitPrice: product.unitPrice || '',
          currentStock: product.currentStock ?? 0,
          minStockAlert: product.minStockAlert ?? 0,
          warehouseLocation: product.warehouseLocation || '',
          imageUrl: product.imageUrl || ''
        });
      } catch (apiError) {
        showToast(apiError.response?.data?.message || 'Failed to load product', 'error');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, isEdit, navigate, showToast]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleImageFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await uploadProductImageApi(file);
      const uploadedUrl = res.data?.imageUrl;
      setFormData((prev) => ({ ...prev, imageUrl: uploadedUrl }));
      showToast('Product image uploaded successfully', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to upload image', 'error');
    } finally {
      setUploading(false);
    }
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.name.trim()) nextErrors.name = 'Name is required';
    if (!formData.sku.trim()) nextErrors.sku = 'SKU is required';
    if (!formData.category.trim()) nextErrors.category = 'Category is required';
    if (!String(formData.unitPrice).trim() || Number(formData.unitPrice) <= 0) {
      nextErrors.unitPrice = 'Unit price must be greater than 0';
    }
    if (Number(formData.currentStock) < 0) nextErrors.currentStock = 'Current stock cannot be negative';
    if (Number(formData.minStockAlert) < 0) nextErrors.minStockAlert = 'Min alert cannot be negative';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setSaving(true);

    const payload = {
      ...formData,
      unitPrice: Number(formData.unitPrice),
      currentStock: Number(formData.currentStock),
      minStockAlert: Number(formData.minStockAlert)
    };

    try {
      if (isEdit) {
        await updateProductApi(id, payload);
        showToast('Product updated successfully', 'success');
      } else {
        await createProductApi(payload);
        showToast('Product created successfully', 'success');
      }
      navigate('/products');
    } catch (apiError) {
      showToast(apiError.response?.data?.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
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

  return (
    <section className="card fade-in">
      <div className="section-head">
        <h2>{isEdit ? 'Edit Product' : 'Add Product'}</h2>
        <Link to="/products" className="btn btn-ghost">Back</Link>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        <label className="form-group">
          <span>Product Image</span>
          <input
            type="file"
            accept="image/*"
            className="input"
            onChange={handleImageFileChange}
            disabled={uploading}
          />
          {uploading ? <small className="muted">Uploading image...</small> : null}
          {formData.imageUrl ? (
            <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <img
                src={formData.imageUrl}
                alt="Product preview"
                style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
              />
              <small className="muted">Image uploaded!</small>
            </div>
          ) : null}
        </label>

        <label className="form-group">
          <span>Name *</span>
          <input className="input" name="name" value={formData.name} onChange={handleChange} required />
          {errors.name ? <small className="error-text">{errors.name}</small> : null}
        </label>

        <label className="form-group">
          <span>SKU *</span>
          <input className="input" name="sku" value={formData.sku} onChange={handleChange} required />
          {errors.sku ? <small className="error-text">{errors.sku}</small> : null}
        </label>

        <label className="form-group">
          <span>Category *</span>
          <input className="input" name="category" value={formData.category} onChange={handleChange} required />
          {errors.category ? <small className="error-text">{errors.category}</small> : null}
        </label>

        <label className="form-group">
          <span>Unit Price (₹) *</span>
          <input className="input" type="number" min="0" step="0.01" name="unitPrice" value={formData.unitPrice} onChange={handleChange} required />
          {errors.unitPrice ? <small className="error-text">{errors.unitPrice}</small> : null}
        </label>

        <label className="form-group">
          <span>Current Stock</span>
          <input className="input" type="number" min="0" name="currentStock" value={formData.currentStock} onChange={handleChange} />
          {errors.currentStock ? <small className="error-text">{errors.currentStock}</small> : null}
        </label>

        <label className="form-group">
          <span>Min Stock Alert Threshold</span>
          <input className="input" type="number" min="0" name="minStockAlert" value={formData.minStockAlert} onChange={handleChange} />
          {errors.minStockAlert ? <small className="error-text">{errors.minStockAlert}</small> : null}
        </label>

        <label className="form-group form-group-wide">
          <span>Warehouse Location</span>
          <input className="input" name="warehouseLocation" value={formData.warehouseLocation} onChange={handleChange} placeholder="e.g. Aisle 3, Rack B" />
        </label>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving || uploading}>
            {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </section>
  );
};

export default ProductFormPage;
