import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar,
  Download,
  AlertTriangle
} from 'lucide-react';
import { rentAPI, tenantAPI } from '../services/api';
import toast from 'react-hot-toast';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [monthlyData, setMonthlyData] = useState([]);
  const [tenantStats, setTenantStats] = useState({});
  const [rentStats, setRentStats] = useState({});

  useEffect(() => {
    fetchReportData();
  }, [selectedYear]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      // Fetch tenants
      const tenantsResponse = await tenantAPI.getAll({ limit: 1000 });
      const tenants = tenantsResponse.data.tenants || [];
      
      // Fetch rent records for the year
      const rentResponse = await rentAPI.getAll({ limit: 1000 });
      const rentRecords = rentResponse.data.rentRecords || [];
      
      // Filter by selected year
      const yearRentRecords = rentRecords.filter(record => 
        record.month.startsWith(selectedYear)
      );
      
      // Calculate monthly data
      const monthly = [];
      for (let month = 1; month <= 12; month++) {
        const monthStr = `${selectedYear}-${month.toString().padStart(2, '0')}`;
        const monthRecords = yearRentRecords.filter(record => record.month === monthStr);
        
        const totalRent = monthRecords.reduce((sum, record) => sum + record.rentAmount, 0);
        const totalLightBill = monthRecords.reduce((sum, record) => sum + record.lightBillAmount, 0);
        const totalAmount = monthRecords.reduce((sum, record) => sum + record.totalAmount, 0);
        const paidAmount = monthRecords
          .filter(record => record.status === 'paid')
          .reduce((sum, record) => sum + record.totalAmount, 0);
        
        monthly.push({
          month: monthStr,
          monthName: new Date(monthStr + '-01').toLocaleDateString('en-IN', { month: 'short' }),
          totalRent,
          totalLightBill,
          totalAmount,
          paidAmount,
          pendingAmount: totalAmount - paidAmount,
          recordCount: monthRecords.length
        });
      }
      
      setMonthlyData(monthly);
      
      // Calculate tenant statistics
      const activeTenants = tenants.filter(t => t.isActive).length;
      const inactiveTenants = tenants.filter(t => !t.isActive).length;
      const totalDeposit = tenants.reduce((sum, t) => sum + t.deposit, 0);
      const totalMonthlyRent = tenants.reduce((sum, t) => sum + t.monthlyRent, 0);
      const agreementsDone = tenants.filter(t => t.agreement.isDone).length;
      const agreementsPending = tenants.filter(t => !t.agreement.isDone).length;
      
      setTenantStats({
        total: tenants.length,
        active: activeTenants,
        inactive: inactiveTenants,
        totalDeposit,
        totalMonthlyRent,
        agreementsDone,
        agreementsPending
      });
      
      // Calculate rent statistics
      const totalRentCollected = yearRentRecords
        .filter(record => record.status === 'paid')
        .reduce((sum, record) => sum + record.totalAmount, 0);
      
      const totalRentPending = yearRentRecords
        .filter(record => record.status === 'pending')
        .reduce((sum, record) => sum + record.totalAmount, 0);
      
      const totalRentOverdue = yearRentRecords
        .filter(record => record.status === 'overdue')
        .reduce((sum, record) => sum + record.totalAmount, 0);
      
      const totalLightBillCollected = yearRentRecords
        .filter(record => record.status === 'paid')
        .reduce((sum, record) => sum + record.lightBillAmount, 0);
      
      setRentStats({
        totalCollected: totalRentCollected,
        totalPending: totalRentPending,
        totalOverdue: totalRentOverdue,
        totalLightBill: totalLightBillCollected,
        totalRecords: yearRentRecords.length,
        paidRecords: yearRentRecords.filter(record => record.status === 'paid').length,
        pendingRecords: yearRentRecords.filter(record => record.status === 'pending').length,
        overdueRecords: yearRentRecords.filter(record => record.status === 'overdue').length
      });
      
    } catch (error) {
      toast.error('Failed to load report data');
      console.error('Fetch report data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString()}`;
  };

  const getPaymentRate = () => {
    if (rentStats.totalRecords === 0) return 0;
    return Math.round((rentStats.paidRecords / rentStats.totalRecords) * 100);
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
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive insights into your tenant management</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="input"
          >
            {Array.from({ length: 5 }, (_, i) => {
              const year = new Date().getFullYear() - i;
              return (
                <option key={year} value={year.toString()}>
                  {year}
                </option>
              );
            })}
          </select>
          <button className="btn-secondary flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-primary-500">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Collected ({selectedYear})</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(rentStats.totalCollected)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-success-500">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Tenants</p>
              <p className="text-2xl font-bold text-gray-900">{tenantStats.active}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-warning-500">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Payment Rate</p>
              <p className="text-2xl font-bold text-gray-900">{getPaymentRate()}%</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-danger-500">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Amount</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(rentStats.totalPending)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Revenue Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue ({selectedYear})</h3>
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="bg-gray-50">
              <tr>
                <th>Month</th>
                <th>Rent Collected</th>
                <th>Light Bill</th>
                <th>Total Amount</th>
                <th>Pending Amount</th>
                <th>Records</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {monthlyData.map((data) => (
                <tr key={data.month} className="hover:bg-gray-50">
                  <td className="font-medium text-gray-900">{data.monthName}</td>
                  <td className="text-success-600 font-medium">
                    {formatCurrency(data.totalRent)}
                  </td>
                  <td className="text-gray-600">
                    {formatCurrency(data.totalLightBill)}
                  </td>
                  <td className="font-bold text-gray-900">
                    {formatCurrency(data.totalAmount)}
                  </td>
                  <td className="text-warning-600">
                    {formatCurrency(data.pendingAmount)}
                  </td>
                  <td className="text-gray-600">{data.recordCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tenant Statistics */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tenant Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Tenants</span>
              <span className="font-semibold">{tenantStats.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Tenants</span>
              <span className="font-semibold text-success-600">{tenantStats.active}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Inactive Tenants</span>
              <span className="font-semibold text-gray-500">{tenantStats.inactive}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Deposit</span>
              <span className="font-semibold">{formatCurrency(tenantStats.totalDeposit)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Monthly Rent Potential</span>
              <span className="font-semibold">{formatCurrency(tenantStats.totalMonthlyRent)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Agreements Completed</span>
              <span className="font-semibold text-success-600">{tenantStats.agreementsDone}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Agreements Pending</span>
              <span className="font-semibold text-warning-600">{tenantStats.agreementsPending}</span>
            </div>
          </div>
        </div>

        {/* Rent Collection Statistics */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rent Collection Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Records</span>
              <span className="font-semibold">{rentStats.totalRecords}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Paid Records</span>
              <span className="font-semibold text-success-600">{rentStats.paidRecords}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending Records</span>
              <span className="font-semibold text-warning-600">{rentStats.pendingRecords}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Overdue Records</span>
              <span className="font-semibold text-danger-600">{rentStats.overdueRecords}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Collected</span>
              <span className="font-semibold text-success-600">{formatCurrency(rentStats.totalCollected)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Pending</span>
              <span className="font-semibold text-warning-600">{formatCurrency(rentStats.totalPending)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Overdue</span>
              <span className="font-semibold text-danger-600">{formatCurrency(rentStats.totalOverdue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Light Bill Collected</span>
              <span className="font-semibold">{formatCurrency(rentStats.totalLightBill)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">
              {getPaymentRate()}%
            </div>
            <div className="text-sm text-gray-600">Payment Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-success-600 mb-2">
              {tenantStats.active > 0 ? Math.round((tenantStats.agreementsDone / tenantStats.active) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-600">Agreement Completion Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-warning-600 mb-2">
              {rentStats.totalRecords > 0 ? Math.round((rentStats.pendingRecords / rentStats.totalRecords) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-600">Pending Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports; 