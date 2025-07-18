import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter,
  Calendar,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Clock,
  MessageCircle,
  Download,
  Edit
} from 'lucide-react';
import { rentAPI, whatsappAPI } from '../services/api';
import toast from 'react-hot-toast';

const RentCollection = () => {
  const [rentRecords, setRentRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState({});

  useEffect(() => {
    fetchRentRecords();
  }, [currentPage, searchTerm, monthFilter, statusFilter]);

  useEffect(() => {
    if (monthFilter) {
      fetchSummary();
    }
  }, [monthFilter]);

  const fetchRentRecords = async () => {
    try {
      setLoading(true);
      const response = await rentAPI.getAll({
        page: currentPage,
        limit: 10,
        month: monthFilter,
        status: statusFilter,
        tenant: searchTerm
      });
      
      setRentRecords(response.data.rentRecords);
      setTotalPages(response.data.totalPages);
      setTotal(response.data.total);
    } catch (error) {
      toast.error('Failed to load rent records');
      console.error('Fetch rent records error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await rentAPI.getSummary(monthFilter);
      setSummary(response.data);
    } catch (error) {
      console.error('Fetch summary error:', error);
    }
  };

  const handleMarkAsPaid = async (id, paymentMethod = 'cash') => {
    try {
      await rentAPI.markAsPaid(id, { paymentMethod });
      toast.success('Rent marked as paid');
      fetchRentRecords();
      if (monthFilter) {
        fetchSummary();
      }
    } catch (error) {
      toast.error('Failed to mark rent as paid');
      console.error('Mark as paid error:', error);
    }
  };

  const handleSendReminder = async (rentId) => {
    try {
      await whatsappAPI.sendReminder(rentId);
      toast.success('Rent reminder sent via WhatsApp');
      fetchRentRecords();
    } catch (error) {
      toast.error('Failed to send WhatsApp reminder');
      console.error('Send reminder error:', error);
    }
  };

  const handleSendPaymentConfirmation = async (rentId) => {
    try {
      await whatsappAPI.sendPaymentConfirmation(rentId);
      toast.success('Payment confirmation sent via WhatsApp');
      fetchRentRecords();
    } catch (error) {
      toast.error('Failed to send payment confirmation');
      console.error('Send confirmation error:', error);
    }
  };

  const handleGenerateMonthly = async () => {
    const month = monthFilter || new Date().toISOString().slice(0, 7);
    try {
      await rentAPI.generateMonthly(month);
      toast.success('Monthly rent records generated successfully');
      fetchRentRecords();
      if (monthFilter) {
        fetchSummary();
      }
    } catch (error) {
      toast.error('Failed to generate monthly rent records');
      console.error('Generate monthly error:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString()}`;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      paid: { color: 'badge-success', icon: CheckCircle },
      pending: { color: 'badge-warning', icon: Clock },
      overdue: { color: 'badge-danger', icon: AlertTriangle }
    };
    
    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
      <span className={`${config.color} flex items-center`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
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
          <h1 className="text-3xl font-bold text-gray-900">Rent Collection</h1>
          <p className="text-gray-600">Manage monthly rent collection and payments</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleGenerateMonthly}
            className="btn-secondary flex items-center"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Generate Monthly
          </button>
          <Link to="/rent/new" className="btn-primary flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Add Rent Record
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by tenant name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="month"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="input"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
            <button
              onClick={() => {
                setSearchTerm('');
                setMonthFilter('');
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

      {/* Summary Cards */}
      {monthFilter && Object.keys(summary).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-primary-500">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(summary.totalAmount)}
                </p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-success-500">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Paid Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(summary.paidAmount)}
                </p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-warning-500">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(summary.pendingAmount)}
                </p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-danger-500">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overdue Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(summary.overdueAmount)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rent Records Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="bg-gray-50">
              <tr>
                <th>Tenant</th>
                <th>Month</th>
                <th>Rent Amount</th>
                <th>Light Bill</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Payment Date</th>
                <th>WhatsApp</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rentRecords.length > 0 ? (
                rentRecords.map((rent) => (
                  <tr key={rent._id} className="hover:bg-gray-50">
                    <td>
                      <div>
                        <div className="font-medium text-gray-900">{rent.tenant?.name}</div>
                        <div className="text-sm text-gray-500">{rent.tenant?.contactNumber}</div>
                      </div>
                    </td>
                    <td className="text-sm text-gray-900">
                      {new Date(rent.month + '-01').toLocaleDateString('en-IN', { 
                        year: 'numeric', 
                        month: 'long' 
                      })}
                    </td>
                    <td className="text-sm font-medium text-gray-900">
                      {formatCurrency(rent.rentAmount)}
                    </td>
                    <td className="text-sm text-gray-900">
                      {formatCurrency(rent.lightBillAmount)}
                    </td>
                    <td className="text-sm font-bold text-gray-900">
                      {formatCurrency(rent.totalAmount)}
                    </td>
                    <td>
                      {getStatusBadge(rent.status)}
                    </td>
                    <td className="text-sm text-gray-900">
                      {rent.paymentDate ? formatDate(rent.paymentDate) : '-'}
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        {rent.whatsappSent ? (
                          <span className="text-success-600 text-xs">Sent</span>
                        ) : (
                          <span className="text-gray-400 text-xs">Not sent</span>
                        )}
                        {rent.status === 'pending' && (
                          <button
                            onClick={() => handleSendReminder(rent._id)}
                            className="text-primary-600 hover:text-primary-700"
                            title="Send reminder"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </button>
                        )}
                        {rent.status === 'paid' && (
                          <button
                            onClick={() => handleSendPaymentConfirmation(rent._id)}
                            className="text-success-600 hover:text-success-700"
                            title="Send confirmation"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        {rent.status === 'pending' && (
                          <button
                            onClick={() => handleMarkAsPaid(rent._id)}
                            className="text-success-600 hover:text-success-700"
                            title="Mark as paid"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        <Link
                          to={`/rent/${rent._id}/edit`}
                          className="text-primary-600 hover:text-primary-700"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-gray-500">
                    No rent records found
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
    </div>
  );
};

export default RentCollection; 