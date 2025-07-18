import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import { tenantAPI } from '../services/api';
import toast from 'react-hot-toast';

const TenantForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tenant, setTenant] = useState(null);
  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [panFile, setPanFile] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm();

  const agreementDone = watch('agreement.isDone');

  useEffect(() => {
    if (id) {
      fetchTenant();
    }
  }, [id]);

  const fetchTenant = async () => {
    try {
      setLoading(true);
      const response = await tenantAPI.getById(id);
      const tenantData = response.data;
      setTenant(tenantData);
      
      // Set form values
      setValue('name', tenantData.name);
      setValue('address', tenantData.address);
      setValue('kyc.aadhaarCard.number', tenantData.kyc.aadhaarCard.number);
      setValue('kyc.panCard.number', tenantData.kyc.panCard.number);
      setValue('accommodationFromDate', tenantData.accommodationFromDate.split('T')[0]);
      setValue('deposit', tenantData.deposit);
      setValue('agreement.isDone', tenantData.agreement.isDone);
      setValue('agreement.date', tenantData.agreement.date ? tenantData.agreement.date.split('T')[0] : '');
      setValue('contactNumber', tenantData.contactNumber);
      setValue('monthlyRent', tenantData.monthlyRent);
    } catch (error) {
      toast.error('Failed to load tenant data');
      console.error('Fetch tenant error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('address', data.address);
      formData.append('kyc[aadhaarCard][number]', data.kyc.aadhaarCard.number);
      formData.append('kyc[panCard][number]', data.kyc.panCard.number);
      formData.append('accommodationFromDate', data.accommodationFromDate);
      formData.append('deposit', data.deposit);
      formData.append('agreement[isDone]', data.agreement.isDone);
      if (data.agreement.isDone && data.agreement.date) {
        formData.append('agreement[date]', data.agreement.date);
      }
      formData.append('contactNumber', data.contactNumber);
      formData.append('monthlyRent', data.monthlyRent);

      if (aadhaarFile) {
        formData.append('aadhaarFile', aadhaarFile);
      }
      if (panFile) {
        formData.append('panFile', panFile);
      }
      if (photoFile) {
        formData.append('photoFile', photoFile);
      }

      if (id) {
        await tenantAPI.update(id, formData);
        toast.success('Tenant updated successfully');
      } else {
        await tenantAPI.create(formData);
        toast.success('Tenant created successfully');
      }
      
      navigate('/tenants');
    } catch (error) {
      toast.error(id ? 'Failed to update tenant' : 'Failed to create tenant');
      console.error('Submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'aadhaar') {
        setAadhaarFile(file);
      } else if (type === 'pan') {
        setPanFile(file);
      } else if (type === 'photo') {
        setPhotoFile(file);
      }
    }
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
            onClick={() => navigate('/tenants')}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {id ? 'Edit Tenant' : 'Add New Tenant'}
            </h1>
            <p className="text-gray-600">
              {id ? 'Update tenant information' : 'Register a new tenant'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                {...register('name', { required: 'Name is required' })}
                className="input"
                placeholder="Enter full name"
              />
              {errors.name && (
                <p className="text-danger-600 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Number *
              </label>
              <input
                type="tel"
                {...register('contactNumber', { 
                  required: 'Contact number is required',
                  pattern: {
                    value: /^[6-9]\d{9}$/,
                    message: 'Please enter a valid 10-digit mobile number'
                  }
                })}
                className="input"
                placeholder="Enter contact number"
              />
              {errors.contactNumber && (
                <p className="text-danger-600 text-sm mt-1">{errors.contactNumber.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <textarea
                {...register('address', { required: 'Address is required' })}
                className="input"
                rows="3"
                placeholder="Enter complete address"
              />
              {errors.address && (
                <p className="text-danger-600 text-sm mt-1">{errors.address.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'photo')}
                className="input"
              />
              {tenant?.photo && !photoFile && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-2">Current photo:</p>
                  <img 
                    src={`http://localhost:5001/uploads/${tenant.photo}`} 
                    alt="Current profile" 
                    className="w-20 h-20 object-cover rounded-lg border"
                  />
                </div>
              )}
              {photoFile && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-2">New photo preview:</p>
                  <img 
                    src={URL.createObjectURL(photoFile)} 
                    alt="Preview" 
                    className="w-20 h-20 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* KYC Information */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">KYC Documents</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aadhaar Number *
              </label>
              <input
                type="text"
                {...register('kyc.aadhaarCard.number', { 
                  required: 'Aadhaar number is required',
                  pattern: {
                    value: /^\d{12}$/,
                    message: 'Aadhaar number must be 12 digits'
                  }
                })}
                className="input"
                placeholder="Enter 12-digit Aadhaar number"
              />
              {errors.kyc?.aadhaarCard?.number && (
                <p className="text-danger-600 text-sm mt-1">{errors.kyc.aadhaarCard.number.message}</p>
              )}
              
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aadhaar Card Document *
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange(e, 'aadhaar')}
                  className="input"
                />
                {tenant?.kyc?.aadhaarCard?.file && !aadhaarFile && (
                  <p className="text-sm text-gray-500 mt-1">
                    Current file: {tenant.kyc.aadhaarCard.file}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PAN Number *
              </label>
              <input
                type="text"
                {...register('kyc.panCard.number', { 
                  required: 'PAN number is required',
                  pattern: {
                    value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
                    message: 'Please enter a valid PAN number (e.g., ABCDE1234F)'
                  }
                })}
                className="input"
                placeholder="Enter PAN number"
              />
              {errors.kyc?.panCard?.number && (
                <p className="text-danger-600 text-sm mt-1">{errors.kyc.panCard.number.message}</p>
              )}
              
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PAN Card Document *
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange(e, 'pan')}
                  className="input"
                />
                {tenant?.kyc?.panCard?.file && !panFile && (
                  <p className="text-sm text-gray-500 mt-1">
                    Current file: {tenant.kyc.panCard.file}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Accommodation Details */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Accommodation Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Accommodation From Date *
              </label>
              <input
                type="date"
                {...register('accommodationFromDate', { required: 'Accommodation date is required' })}
                className="input"
              />
              {errors.accommodationFromDate && (
                <p className="text-danger-600 text-sm mt-1">{errors.accommodationFromDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Rent (₹) *
              </label>
              <input
                type="number"
                {...register('monthlyRent', { 
                  required: 'Monthly rent is required',
                  min: { value: 0, message: 'Rent must be positive' }
                })}
                className="input"
                placeholder="Enter monthly rent"
              />
              {errors.monthlyRent && (
                <p className="text-danger-600 text-sm mt-1">{errors.monthlyRent.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deposit Amount (₹) *
              </label>
              <input
                type="number"
                {...register('deposit', { 
                  required: 'Deposit amount is required',
                  min: { value: 0, message: 'Deposit must be positive' }
                })}
                className="input"
                placeholder="Enter deposit amount"
              />
              {errors.deposit && (
                <p className="text-danger-600 text-sm mt-1">{errors.deposit.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Agreement Details */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Agreement Details</h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('agreement.isDone')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                Agreement has been completed
              </label>
            </div>

            {agreementDone && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agreement Date
                </label>
                <input
                  type="date"
                  {...register('agreement.date')}
                  className="input"
                />
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/tenants')}
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
            {id ? 'Update Tenant' : 'Create Tenant'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TenantForm; 