import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Tenants from './pages/Tenants';
import TenantForm from './pages/TenantForm';
import TenantDetail from './pages/TenantDetail';
import RentCollection from './pages/RentCollection';
import RentForm from './pages/RentForm';
import WhatsApp from './pages/WhatsApp';
import Reports from './pages/Reports';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tenants" element={<Tenants />} />
        <Route path="/tenants/new" element={<TenantForm />} />
        <Route path="/tenants/:id" element={<TenantDetail />} />
        <Route path="/tenants/:id/edit" element={<TenantForm />} />
        <Route path="/rent" element={<RentCollection />} />
        <Route path="/rent/new" element={<RentForm />} />
        <Route path="/rent/:id/edit" element={<RentForm />} />
        <Route path="/whatsapp" element={<WhatsApp />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </Layout>
  );
}

export default App; 