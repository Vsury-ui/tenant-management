import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Plus,
  Eye,
} from "lucide-react";

import { tenantAPI, rentAPI } from "../services/api";
import toast from "react-hot-toast";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalTenants: 0,
    activeTenants: 0,
    totalRent: 0,
    pendingRent: 0,
    overdueRent: 0,
    paidRent: 0,
  });
  const [recentTenants, setRecentTenants] = useState([]);
  const [recentRents, setRecentRents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch tenants
      const tenantsResponse = await tenantAPI.getAll({ limit: 1000 });
      const tenants = tenantsResponse.data.tenants || [];

      // Fetch rent records
      const currentMonth = new Date().toISOString().slice(0, 7);
      const rentResponse = await rentAPI.getAll({
        month: currentMonth,
        limit: 1000,
      });
      const rentRecords = rentResponse.data.rentRecords || [];

      // Calculate stats
      const totalTenants = tenants.length;
      const activeTenants = tenants.filter((t) => t.isActive).length;
      const totalRent = rentRecords.reduce(
        (sum, rent) => sum + rent.totalAmount,
        0
      );
      const pendingRent = rentRecords
        .filter((r) => r.status === "pending")
        .reduce((sum, rent) => sum + rent.totalAmount, 0);
      const overdueRent = rentRecords
        .filter((r) => r.status === "overdue")
        .reduce((sum, rent) => sum + rent.totalAmount, 0);
      const paidRent = rentRecords
        .filter((r) => r.status === "paid")
        .reduce((sum, rent) => sum + rent.totalAmount, 0);

      setStats({
        totalTenants,
        activeTenants,
        totalRent,
        pendingRent,
        overdueRent,
        paidRent,
      });

      // Get recent tenants
      setRecentTenants(tenants.slice(0, 5));

      // Get recent rent records
      setRecentRents(rentRecords.slice(0, 5));
    } catch (error) {
      toast.error("Failed to load dashboard data");
      console.error("Dashboard data error:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="card">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Overview of your tenant management system
          </p>
        </div>
        <div className="flex space-x-3">
          <Link to="/tenants/new" className="btn-primary flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Add Tenant
          </Link>
          <Link to="/rent/new" className="btn-secondary flex items-center">
            <DollarSign className="h-4 w-4 mr-2" />
            Add Rent Record
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Tenants"
          value={stats.totalTenants}
          icon={Users}
          color="bg-primary-500"
          subtitle={`${stats.activeTenants} active`}
        />
        <StatCard
          title="Total Rent (This Month)"
          value={`₹${stats.totalRent.toLocaleString()}`}
          icon={DollarSign}
          color="bg-success-500"
        />
        <StatCard
          title="Pending Rent"
          value={`₹${stats.pendingRent.toLocaleString()}`}
          icon={AlertTriangle}
          color="bg-warning-500"
        />
        <StatCard
          title="Paid Rent"
          value={`₹${stats.paidRent.toLocaleString()}`}
          icon={CheckCircle}
          color="bg-success-500"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tenants */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Tenants
            </h3>
            <Link
              to="/tenants"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentTenants.length > 0 ? (
              recentTenants.map((tenant) => (
                <div
                  key={tenant._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{tenant.name}</p>
                    <p className="text-sm text-gray-600">
                      {tenant.contactNumber}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`badge ${
                        tenant.isActive ? "badge-success" : "badge-danger"
                      }`}
                    >
                      {tenant.isActive ? "Active" : "Inactive"}
                    </span>
                    <Link
                      to={`/tenants/${tenant._id}/edit`}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No tenants found</p>
            )}
          </div>
        </div>

        {/* Recent Rent Records */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Rent Records
            </h3>
            <Link
              to="/rent"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentRents.length > 0 ? (
              recentRents.map((rent) => (
                <div
                  key={rent._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {rent.tenant?.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      ₹{rent.totalAmount.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`badge ${
                        rent.status === "paid"
                          ? "badge-success"
                          : rent.status === "pending"
                          ? "badge-warning"
                          : "badge-danger"
                      }`}
                    >
                      {rent.status.charAt(0).toUpperCase() +
                        rent.status.slice(1)}
                    </span>
                    <Link
                      to={`/rent/${rent._id}/edit`}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                No rent records found
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/tenants/new"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Users className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Add New Tenant</p>
              <p className="text-sm text-gray-600">Register a new tenant</p>
            </div>
          </Link>
          <Link
            to="/rent/generate-monthly"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <TrendingUp className="h-8 w-8 text-success-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Generate Monthly Rent</p>
              <p className="text-sm text-gray-600">
                Create rent records for all tenants
              </p>
            </div>
          </Link>
          <Link
            to="/whatsapp"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <DollarSign className="h-8 w-8 text-warning-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Send Rent Reminders</p>
              <p className="text-sm text-gray-600">Send WhatsApp reminders</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
