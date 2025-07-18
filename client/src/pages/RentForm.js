import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save } from 'lucide-react';
import { rentAPI, tenantAPI } from '../services/api';
import toast from 'react-hot-toast';

const RentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [rentRecord, setRentRecord] = useState(null);
  const [tenants, setTenants] = useState([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm();

  const selectedTenant = watch('tenant');

  useEffect(() => {
    fetchTenants();
    if (id) {
      fetchRentRecord();
    }
  }, [id]);

  const fetchTenants = async () => {
    try {
      const response = await tenantAPI.getAll({ limit: 1000 });
      setTenants(response.data.tenants || []);
    } catch (error) {
      toast.error('Failed to load tenants');
      console.error('Fetch tenants error:', error);
    }
  };

  const fetchRentRecord = async () => {
    try {
      setLoading(true);
      const response = await rentAPI.getById(id);
      const rentData = response.data;
      setRentRecord(rentData);
      
      // Set form values
      setValue('tenant', rentData.tenant._id);
      setValue('month', rentData.month);
      setValue('rentAmount', rentData.rentAmount);
      setValue('lightBillAmount', rentData.lightBillAmount);
      setValue('paymentMethod', rentData.paymentMethod);
      setValue('notes', rentData.notes);
    } catch (error) {
      toast.error('Failed to load rent record');
      console.error('Fetch rent record error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      const rentData = {
        tenant: data.tenant,
        month: data.month,
        rentAmount: parseFloat(data.rentAmount),
        lightBillAmount: parseFloat(data.lightBillAmount) || 0,
        paymentMethod: data.paymentMethod,
        notes: data.notes
      };

      if (id) {
        await rentAPI.update(id, rentData);
        toast.success('Rent record updated successfully');
      } else {
        await rentAPI.create(rentData);
        toast.success('Rent record created successfully');
      }
      
      navigate('/rent');
    } catch (error) {
      toast.error(id ? 'Failed to update rent record' : 'Failed to create rent record');
      console.error('Submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedTenant = () => {
    return tenants.find(t => t._id === selectedTenant);
  };

  if (loading && id) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/rent')}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {id ? 'Edit Rent Record' : 'Add Rent Record'}
            </h1>
            <p className="text-gray-600">
              {id ? 'Update rent record information' : 'Create a new rent record'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rent Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tenant *
              </label>
              <select
                {...register('tenant', { required: 'Tenant is required' })}
                className="input"
              >
                <option value="">Select a tenant...</option>
                {tenants.map((tenant) => (
                  <option key={tenant._id} value={tenant._id}>
                    {tenant.name} ({tenant.contactNumber})
                  </option>
                ))}
              </select>
              {errors.tenant && (
                <p className="text-danger-600 text-sm mt-1">{errors.tenant.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Month *
              </label>
              <input
                type="month"
                {...register('month', { required: 'Month is required' })}
                className="input"
              />
              {errors.month && (
                <p className="text-danger-600 text-sm mt-1">{errors.month.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rent Amount (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                {...register('rentAmount', { 
                  required: 'Rent amount is required',
                  min: { value: 0, message: 'Rent amount must be positive' }
                })}
                className="input"
                placeholder="Enter rent amount"
              />
              {errors.rentAmount && (
                <p className="text-danger-600 text-sm mt-1">{errors.rentAmount.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Light Bill Amount (₹)
              </label>
              <input
                type="number"
                step="0.01"
                {...register('lightBillAmount', { 
                  min: { value: 0, message: 'Light bill amount must be positive' }
                })}
                className="input"
                placeholder="Enter light bill amount"
              />
              {errors.lightBillAmount && (
                <p className="text-danger-600 text-sm mt-1">{errors.lightBillAmount.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <select
                {...register('paymentMethod')}
                className="input"
              >
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="upi">UPI</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                {...register('notes')}
                className="input"
                rows="3"
                placeholder="Add any additional notes..."
              />
            </div>
          </div>
        </div>

        {/* Tenant Information Preview */}
        {selectedTenant && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tenant Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-600">Name</p>
                <p className="text-lg font-semibold text-gray-900">{getSelectedTenant()?.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Contact Number</p>
                <p className="text-lg font-semibold text-gray-900">{getSelectedTenant()?.contactNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Rent</p>
                <p className="text-lg font-semibold text-gray-900">₹{getSelectedTenant()?.monthlyRent?.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/rent')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {id ? 'Update Rent Record' : 'Create Rent Record'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RentForm; 