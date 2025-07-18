import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  QrCode, 
  Send, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  LogOut,
  Calendar,
  Users
} from 'lucide-react';
import { whatsappAPI, rentAPI, tenantAPI } from '../services/api';
import toast from 'react-hot-toast';

const WhatsApp = () => {
  const [status, setStatus] = useState({ isReady: false, hasQR: false });
  const [qrCode, setQrCode] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [bulkResults, setBulkResults] = useState(null);
  const [customMessage, setCustomMessage] = useState('');
  const [selectedTenant, setSelectedTenant] = useState('');
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStatus();
    fetchTenants();
    const interval = setInterval(fetchStatus, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await whatsappAPI.getStatus();
      setStatus(response.data);
      
      if (response.data.hasQR && !qrCode) {
        fetchQRCode();
      }
    } catch (error) {
      console.error('Fetch status error:', error);
    }
  };

  const fetchQRCode = async () => {
    try {
      const response = await whatsappAPI.getQR();
      setQrCode(response.data.qrCode);
    } catch (error) {
      console.error('Fetch QR code error:', error);
    }
  };

  const fetchTenants = async () => {
    try {
      const response = await tenantAPI.getAll({ limit: 1000 });
      setTenants(response.data.tenants || []);
    } catch (error) {
      console.error('Fetch tenants error:', error);
    }
  };

  const handleSendBulkReminders = async () => {
    if (!selectedMonth) {
      toast.error('Please select a month');
      return;
    }

    try {
      setLoading(true);
      const response = await whatsappAPI.sendBulkReminders(selectedMonth);
      setBulkResults(response.data);
      toast.success(`Bulk reminders sent: ${response.data.sent.length} successful, ${response.data.failed.length} failed`);
    } catch (error) {
      toast.error('Failed to send bulk reminders');
      console.error('Send bulk reminders error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendCustomMessage = async () => {
    if (!selectedTenant || !customMessage.trim()) {
      toast.error('Please select a tenant and enter a message');
      return;
    }

    try {
      setLoading(true);
      await whatsappAPI.sendCustomMessage(selectedTenant, customMessage);
      toast.success('Custom message sent successfully');
      setCustomMessage('');
      setSelectedTenant('');
    } catch (error) {
      toast.error('Failed to send custom message');
      console.error('Send custom message error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await whatsappAPI.logout();
      setStatus({ isReady: false, hasQR: false });
      setQrCode('');
      toast.success('WhatsApp logged out successfully');
    } catch (error) {
      toast.error('Failed to logout from WhatsApp');
      console.error('Logout error:', error);
    }
  };

  const refreshStatus = () => {
    fetchStatus();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">WhatsApp Integration</h1>
          <p className="text-gray-600">Send rent reminders and notifications via WhatsApp</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={refreshStatus}
            className="btn-secondary flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Status
          </button>
          {status.isReady && (
            <button
              onClick={handleLogout}
              className="btn-danger flex items-center"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          )}
        </div>
      </div>

      {/* Connection Status */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Connection Status</h3>
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 ${status.isReady ? 'text-success-600' : 'text-warning-600'}`}>
            {status.isReady ? (
              <CheckCircle className="h-6 w-6" />
            ) : (
              <AlertTriangle className="h-6 w-6" />
            )}
            <span className="font-medium">
              {status.isReady ? 'Connected to WhatsApp' : 'Not connected'}
            </span>
          </div>
          {status.isReady && (
            <span className="badge badge-success">Ready to send messages</span>
          )}
        </div>
      </div>

      {/* QR Code Authentication */}
      {!status.isReady && status.hasQR && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Connect WhatsApp</h3>
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Scan this QR code with your WhatsApp mobile app to connect
            </p>
            {qrCode && (
              <div className="inline-block p-4 bg-white border rounded-lg">
                <img src={qrCode} alt="WhatsApp QR Code" className="w-64 h-64" />
              </div>
            )}
            <p className="text-sm text-gray-500 mt-4">
              Open WhatsApp → Settings → Linked Devices → Link a Device
            </p>
          </div>
        </div>
      )}

      {/* Bulk Rent Reminders */}
      {status.isReady && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bulk Rent Reminders</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Month
                </label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="input"
                />
              </div>
              <button
                onClick={handleSendBulkReminders}
                disabled={loading || !selectedMonth}
                className="btn-primary flex items-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send Bulk Reminders
              </button>
            </div>
            
            {bulkResults && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Results:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Successful: {bulkResults.sent.length}</p>
                    {bulkResults.sent.length > 0 && (
                      <ul className="text-xs text-gray-500 mt-1">
                        {bulkResults.sent.slice(0, 3).map((item, index) => (
                          <li key={index}>✓ {item.tenantName} ({item.phoneNumber})</li>
                        ))}
                        {bulkResults.sent.length > 3 && (
                          <li>... and {bulkResults.sent.length - 3} more</li>
                        )}
                      </ul>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Failed: {bulkResults.failed.length}</p>
                    {bulkResults.failed.length > 0 && (
                      <ul className="text-xs text-gray-500 mt-1">
                        {bulkResults.failed.slice(0, 3).map((item, index) => (
                          <li key={index}>✗ {item.tenantName} ({item.phoneNumber})</li>
                        ))}
                        {bulkResults.failed.length > 3 && (
                          <li>... and {bulkResults.failed.length - 3} more</li>
                        )}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom Message */}
      {status.isReady && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Custom Message</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Tenant
                </label>
                <select
                  value={selectedTenant}
                  onChange={(e) => setSelectedTenant(e.target.value)}
                  className="input"
                >
                  <option value="">Choose a tenant...</option>
                  {tenants.map((tenant) => (
                    <option key={tenant._id} value={tenant._id}>
                      {tenant.name} ({tenant.contactNumber})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="input"
                rows="4"
                placeholder="Enter your message..."
              />
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={handleSendCustomMessage}
                disabled={loading || !selectedTenant || !customMessage.trim()}
                className="btn-primary flex items-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <MessageCircle className="h-4 w-4 mr-2" />
                )}
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!status.isReady && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How to Connect</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <span className="bg-primary-100 text-primary-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">1</span>
              <p>Open WhatsApp on your mobile device</p>
            </div>
            <div className="flex items-start space-x-2">
              <span className="bg-primary-100 text-primary-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">2</span>
              <p>Go to Settings → Linked Devices → Link a Device</p>
            </div>
            <div className="flex items-start space-x-2">
              <span className="bg-primary-100 text-primary-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">3</span>
              <p>Scan the QR code that appears above</p>
            </div>
            <div className="flex items-start space-x-2">
              <span className="bg-primary-100 text-primary-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">4</span>
              <p>Once connected, you can send rent reminders and notifications</p>
            </div>
          </div>
        </div>
      )}

      {/* Features Info */}
      {status.isReady && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-primary-500">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Reminders</p>
                <p className="text-lg font-bold text-gray-900">Automated</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-success-500">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Custom Messages</p>
                <p className="text-lg font-bold text-gray-900">Personalized</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-warning-500">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Bulk Sending</p>
                <p className="text-lg font-bold text-gray-900">Efficient</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsApp; 