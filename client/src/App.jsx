import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import MainLayout from './layouts/MainLayout.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';

// Pages
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterDonorPage from './pages/RegisterDonorPage.jsx';
import RegisterPatientPage from './pages/RegisterPatientPage.jsx';
import RegisterHospitalPage from './pages/RegisterHospitalPage.jsx';

import DonorDashboardPage from './pages/DonorDashboardPage.jsx';
import PatientDashboardPage from './pages/PatientDashboardPage.jsx';
import HospitalDashboardPage from './pages/HospitalDashboardPage.jsx';
import CreateRequestPage from './pages/CreateRequestPage.jsx';
import RequestDetailsPage from './pages/RequestDetailsPage.jsx';
import DonorProfilePage from './pages/DonorProfilePage.jsx';
import DonorMatchingPage from './pages/DonorMatchingPage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

import { ROLES } from '@shared/constants/roles.js';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes with Main Navbar & Footer */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register/donor" element={<RegisterDonorPage />} />
          <Route path="/register/patient" element={<RegisterPatientPage />} />
          <Route path="/register/hospital" element={<RegisterHospitalPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Authenticated Dashboard Routes */}
        <Route element={<DashboardLayout />}>
          {/* Donor Routes */}
          <Route
            path="/donor/dashboard"
            element={
              <ProtectedRoute allowedRoles={[ROLES.DONOR, ROLES.ADMIN]}>
                <DonorDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donor/profile"
            element={
              <ProtectedRoute allowedRoles={[ROLES.DONOR, ROLES.ADMIN]}>
                <DonorProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Patient Routes */}
          <Route
            path="/patient/dashboard"
            element={
              <ProtectedRoute allowedRoles={[ROLES.PATIENT, ROLES.ADMIN]}>
                <PatientDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Hospital Routes */}
          <Route
            path="/hospital/dashboard"
            element={
              <ProtectedRoute allowedRoles={[ROLES.HOSPITAL, ROLES.ADMIN]}>
                <HospitalDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Request Creation */}
          <Route
            path="/requests/create"
            element={
              <ProtectedRoute allowedRoles={[ROLES.PATIENT, ROLES.HOSPITAL, ROLES.ADMIN]}>
                <CreateRequestPage />
              </ProtectedRoute>
            }
          />

          {/* Request Details & Tracking */}
          <Route
            path="/requests/:id"
            element={
              <ProtectedRoute allowedRoles={[ROLES.DONOR, ROLES.PATIENT, ROLES.HOSPITAL, ROLES.ADMIN]}>
                <RequestDetailsPage />
              </ProtectedRoute>
            }
          />

          {/* Precision Donor Matching Engine */}
          <Route
            path="/requests/:id/matching"
            element={
              <ProtectedRoute allowedRoles={[ROLES.HOSPITAL, ROLES.ADMIN]}>
                <DonorMatchingPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Dashboard */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
