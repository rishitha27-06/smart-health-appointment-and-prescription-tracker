import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VerifyOtpPage from "./pages/VerifyOtpPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import PatientDashboard from "./pages/patient/PatientDashboard";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AppointmentsPage from "./pages/patient/AppointmentsPage";
import QueuePage from "./pages/doctor/QueuePage";
import AvailabilityPage from "./pages/doctor/AvailabilityPage";
import PrescriptionsPage from "./pages/patient/PrescriptionsPage";
import FindDoctors from "./pages/patient/FindDoctors";
import PatientChatsPage from "./pages/patient/ChatsPage";
import MyDoctors from "./pages/patient/MyDoctors";
import DoctorPrescribePage from "./pages/doctor/DoctorPrescribePage";
import RequestsPage from "./pages/doctor/RequestsPage";
import DoctorChatsPage from "./pages/doctor/ChatsPage";
import PatientsPage from "./pages/doctor/PatientsPage";
import Layout from "./components/Layout";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen">
        <Routes>
          {/* Global layout wraps ALL routes */}
          <Route element={<Layout />}>
            {/* Public */}
            <Route index element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-otp" element={<VerifyOtpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Protected */}
            <Route
              path="/patient"
              element={
                <ProtectedRoute roles={["patient"]}>
                  <PatientDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/appointments"
              element={
                <ProtectedRoute roles={["patient"]}>
                  <AppointmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/chats"
              element={
                <ProtectedRoute roles={["patient"]}>
                  <PatientChatsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/my-doctors"
              element={
                <ProtectedRoute roles={["patient"]}>
                  <MyDoctors />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/find-doctors"
              element={
                <ProtectedRoute roles={["patient"]}>
                  <FindDoctors />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor"
              element={
                <ProtectedRoute roles={["doctor"]}>
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/queue"
              element={
                <ProtectedRoute roles={["doctor"]}>
                  <QueuePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/availability"
              element={
                <ProtectedRoute roles={["doctor"]}>
                  <AvailabilityPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/prescribe"
              element={
                <ProtectedRoute roles={["doctor"]}>
                  <DoctorPrescribePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/requests"
              element={
                <ProtectedRoute roles={["doctor"]}>
                  <RequestsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/chats"
              element={
                <ProtectedRoute roles={["doctor"]}>
                  <DoctorChatsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/patients"
              element={
                <ProtectedRoute roles={["doctor"]}>
                  <PatientsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/prescriptions"
              element={
                <ProtectedRoute roles={["patient"]}>
                  <PrescriptionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Redirects */}
            <Route path="/patient-dashboard" element={<Navigate to="/patient" replace />} />
            <Route path="/doctor-dashboard" element={<Navigate to="/doctor" replace />} />
            <Route path="/admin-dashboard" element={<Navigate to="/admin" replace />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
        <Toaster position="top-right" />
      </div>
    </AuthProvider>
  );
};

export default App;