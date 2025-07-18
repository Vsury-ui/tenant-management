import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Phone, MapPin, Calendar, FileText } from 'lucide-react';
import { tenantAPI } from '../services/api';
import toast from 'react-hot-toast';

const TenantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTenant();
  }, [id]);

  const fetchTenant = async () => {
    try {
      setLoading(true);
      const response = await tenantAPI.getById(id);
      setTenant(response.data);
    } catch (error) {
      toast.error('Failed to load tenant details');
      console.error('Fetch tenant error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this tenant?')) {
      try {
        await tenantAPI.delete(id);
        toast.success('Tenant deleted successfully');
        navigate('/tenants');
      } catch (error) {
        toast.error('Failed to delete tenant');
        console.error('Delete tenant error:', error);
      }
    }
  };

  const handleToggleStatus = async () => {
    try {
      await tenantAPI.toggleStatus(id);
      toast.success('Tenant status updated');
      fetchTenant();
    } catch (error) {
      toast.error('Failed to update tenant status');
      console.error('Toggle status error:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Tenant not found</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Tenant Details</h1>
            <p className="text-gray-600">View tenant information</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            to={`/tenants/${id}/edit`}
            className="btn-primary flex items-center"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="btn-danger flex items-center"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </button>
        </div>
      </div>

      {/* Tenant Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Photo and Basic Info */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="text-center">
              {tenant.photo ? (
                <img 
                  src={`http://localhost:5001/uploads/${tenant.photo}`} 
                  alt={tenant.name}
                  className="w-48 h-48 rounded-full object-cover mx-auto mb-4 border-4 border-gray-200"
                />
              ) : (
                <div className="w-48 h-48 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4 border-4 border-gray-200">
                  <span className="text-gray-500 text-6xl font-medium">
                    {tenant.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{tenant.name}</h2>
              
              <div className="flex items-center justify-center space-x-4 mb-4">
                <button
                  onClick={handleToggleStatus}
                  className={`badge ${tenant.isActive ? 'badge-success' : 'badge-danger'} cursor-pointer`}
                >
                  {tenant.isActive ? 'Active' : 'Inactive'}
                </button>
              </div>

              <div className="space-y-3 text-left">
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">{tenant.contactNumber}</span>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  <span className="text-gray-700">{tenant.address}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">
                    From: {formatDate(tenant.accommodationFromDate)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Financial Information */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600">Monthly Rent</label>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(tenant.monthlyRent)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Deposit Amount</label>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(tenant.deposit)}</p>
              </div>
            </div>
          </div>

          {/* KYC Information */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">KYC Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600">Aadhaar Number</label>
                <p className="text-lg font-medium text-gray-900">{tenant.kyc.aadhaarCard.number}</p>
                {tenant.kyc.aadhaarCard.file && (
                  <a 
                    href={`http://localhost:5001/uploads/${tenant.kyc.aadhaarCard.file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-primary-600 hover:text-primary-700 mt-2"
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    View Document
                  </a>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">PAN Number</label>
                <p className="text-lg font-medium text-gray-900">{tenant.kyc.panCard.number}</p>
                {tenant.kyc.panCard.file && (
                  <a 
                    href={`http://localhost:5001/uploads/${tenant.kyc.panCard.file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-primary-600 hover:text-primary-700 mt-2"
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    View Document
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Agreement Information */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Agreement Details</h3>
            <div className="flex items-center space-x-4">
              <span className={`badge ${tenant.agreement.isDone ? 'badge-success' : 'badge-warning'}`}>
                {tenant.agreement.isDone ? 'Agreement Completed' : 'Agreement Pending'}
              </span>
              {tenant.agreement.isDone && tenant.agreement.date && (
                <span className="text-gray-700">
                  Date: {formatDate(tenant.agreement.date)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantDetail; 