import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createCustomerApi, getCustomerApi, updateCustomerApi } from '../api/customerApi';
import useToast from '../hooks/useToast';

const initialForm = {
  name: '',
  mobile: '',
  email: '',
  businessName: '',
  gstNumber: '',
  customerType: 'Retail',
  status: 'Lead',
  address: '',
  followUpDate: '',
  notes: ''
};

const CustomerFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pushToast } = useToast();

  const isEdit = useMemo(() => Boolean(id), [id]);
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) {
      return;
    }

    const fetchCustomer = async () => {
      setLoading(true);
      try {
        const response = await getCustomerApi(id);
        const customer = response.data;
        setFormData({
          name: customer.name || '',
          mobile: customer.mobile || '',
          email: customer.email || '',
          businessName: customer.businessName || '',
          gstNumber: customer.gstNumber || '',
          customerType: customer.customerType || 'Retail',
          status: customer.status || 'Lead',
          address: customer.address || '',
          followUpDate: customer.followUpDate ? customer.followUpDate.slice(0, 10) : '',
          notes: customer.notes || ''
        });
      } catch (apiError) {
        pushToast(apiError.response?.data?.message || 'Failed to load customer', 'error');
        navigate('/customers');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id, isEdit, navigate, pushToast]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.name.trim()) nextErrors.name = 'Name is required';
    if (!formData.mobile.trim()) nextErrors.mobile = 'Mobile is required';
    if (!formData.businessName.trim()) nextErrors.businessName = 'Business name is required';
    if (!formData.address.trim()) nextErrors.address = 'Address is required';

    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      nextErrors.email = 'Invalid email format';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setSaving(true);

    try {
      if (isEdit) {
        await updateCustomerApi(id, formData);
        pushToast('Customer updated successfully', 'success');
      } else {
        await createCustomerApi(formData);
        pushToast('Customer created successfully', 'success');
      }
      navigate('/customers');
    } catch (apiError) {
      pushToast(apiError.response?.data?.message || 'Save failed', 'error');
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
        <h2>{isEdit ? 'Edit Customer' : 'Add Customer'}</h2>
        <Link to="/customers" className="btn btn-ghost">Back</Link>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        <label className="form-group">
          <span>Name</span>
          <input className="input" name="name" value={formData.name} onChange={handleChange} />
          {errors.name ? <small className="error-text">{errors.name}</small> : null}
        </label>

        <label className="form-group">
          <span>Mobile</span>
          <input className="input" name="mobile" value={formData.mobile} onChange={handleChange} />
          {errors.mobile ? <small className="error-text">{errors.mobile}</small> : null}
        </label>

        <label className="form-group">
          <span>Email</span>
          <input className="input" name="email" value={formData.email} onChange={handleChange} />
          {errors.email ? <small className="error-text">{errors.email}</small> : null}
        </label>

        <label className="form-group">
          <span>Business Name</span>
          <input className="input" name="businessName" value={formData.businessName} onChange={handleChange} />
          {errors.businessName ? <small className="error-text">{errors.businessName}</small> : null}
        </label>

        <label className="form-group">
          <span>GST Number</span>
          <input className="input" name="gstNumber" value={formData.gstNumber} onChange={handleChange} />
        </label>

        <label className="form-group">
          <span>Customer Type</span>
          <select className="input" name="customerType" value={formData.customerType} onChange={handleChange}>
            <option value="Retail">Retail</option>
            <option value="Wholesale">Wholesale</option>
            <option value="Distributor">Distributor</option>
          </select>
        </label>

        <label className="form-group">
          <span>Status</span>
          <select className="input" name="status" value={formData.status} onChange={handleChange}>
            <option value="Lead">Lead</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </label>

        <label className="form-group">
          <span>Follow-up Date</span>
          <input className="input" type="date" name="followUpDate" value={formData.followUpDate} onChange={handleChange} />
        </label>

        <label className="form-group form-group-wide">
          <span>Address</span>
          <textarea className="input" name="address" rows="3" value={formData.address} onChange={handleChange} />
          {errors.address ? <small className="error-text">{errors.address}</small> : null}
        </label>

        <label className="form-group form-group-wide">
          <span>Notes</span>
          <textarea className="input" name="notes" rows="3" value={formData.notes} onChange={handleChange} />
        </label>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Update Customer' : 'Create Customer'}
          </button>
        </div>
      </form>
    </section>
  );
};

export default CustomerFormPage;
