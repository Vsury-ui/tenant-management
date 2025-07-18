import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  Download
} from 'lucide-react';
import { tenantAPI } from '../services/api';
import toast from 'react-hot-toast';

const Tenants = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchTenants();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const response = await tenantAPI.getAll({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: statusFilter
      });
      
      setTenants(response.data.tenants);
      setTotalPages(response.data.totalPages);
      setTotal(response.data.total);
    } catch (error) {
      toast.error('Failed to load tenants');
      console.error('Fetch tenants error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this tenant?')) {
      try {
        await tenantAPI.delete(id);
        toast.success('Tenant deleted successfully');
        fetchTenants();
      } catch (error) {
        toast.error('Failed to delete tenant');
        console.error('Delete tenant error:', error);
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await tenantAPI.toggleStatus(id);
      toast.success('Tenant status updated');
      fetchTenants();
    } catch (error) {
      toast.error('Failed to update tenant status');
      console.error('Toggle status error:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTenants();
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tenants</h1>
          <p className="text-gray-600">Manage your tenant information</p>
        </div>
        <Link to="/tenants/new" className="btn-primary flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Add Tenant
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search tenants by name, phone, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </form>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setCurrentPage(1);
              }}
              className="btn-secondary flex items-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="bg-gray-50">
              <tr>
                <th>Photo</th>
                <th>Name</th>
                <th>Contact</th>
                <th>Address</th>
                <th>Monthly Rent</th>
                <th>Deposit</th>
                <th>From Date</th>
                <th>Agreement</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tenants.length > 0 ? (
                tenants.map((tenant) => (
                  <tr key={tenant._id} className="hover:bg-gray-50">
                    <td>
                      {tenant.photo ? (
                        <img 
                          src={`http://localhost:5001/uploads/${tenant.photo}`} 
                          alt={tenant.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-sm font-medium">
                            {tenant.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </td>
                    <td>
                      <div>
                        <div className="font-medium text-gray-900">{tenant.name}</div>
                        <div className="text-sm text-gray-500">Aadhaar: {tenant.kyc.aadhaarCard.number}</div>
                      </div>
                    </td>
                    <td>
                      <div className="text-sm text-gray-900">{tenant.contactNumber}</div>
                      <div className="text-sm text-gray-500">PAN: {tenant.kyc.panCard.number}</div>
                    </td>
                    <td className="text-sm text-gray-900 max-w-xs truncate">
                      {tenant.address}
                    </td>
                    <td className="text-sm font-medium text-gray-900">
                      {formatCurrency(tenant.monthlyRent)}
                    </td>
                    <td className="text-sm text-gray-900">
                      {formatCurrency(tenant.deposit)}
                    </td>
                    <td className="text-sm text-gray-900">
                      {formatDate(tenant.accommodationFromDate)}
                    </td>
                    <td>
                      <div className="flex items-center">
                        <span className={`badge ${tenant.agreement.isDone ? 'badge-success' : 'badge-warning'}`}>
                          {tenant.agreement.isDone ? 'Done' : 'Pending'}
                        </span>
                        {tenant.agreement.isDone && tenant.agreement.date && (
                          <span className="text-xs text-gray-500 ml-1">
                            {formatDate(tenant.agreement.date)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleStatus(tenant._id)}
                        className={`badge ${tenant.isActive ? 'badge-success' : 'badge-danger'} cursor-pointer`}
                      >
                        {tenant.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/tenants/${tenant._id}`}
                          className="text-primary-600 hover:text-primary-700"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/tenants/${tenant._id}/edit`}
                          className="text-primary-600 hover:text-primary-700"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(tenant._id)}
                          className="text-danger-600 hover:text-danger-700"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center py-8 text-gray-500">
                    No tenants found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, total)} of {total} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="flex items-center px-3 py-2 text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-primary-500">
              <div className="text-white font-bold">{total}</div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tenants</p>
              <p className="text-2xl font-bold text-gray-900">{total}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-success-500">
              <div className="text-white font-bold">
                {tenants.filter(t => t.isActive).length}
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Tenants</p>
              <p className="text-2xl font-bold text-gray-900">
                {tenants.filter(t => t.isActive).length}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-warning-500">
              <div className="text-white font-bold">
                {tenants.filter(t => !t.agreement.isDone).length}
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Agreements</p>
              <p className="text-2xl font-bold text-gray-900">
                {tenants.filter(t => !t.agreement.isDone).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tenants; 