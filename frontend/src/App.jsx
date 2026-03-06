import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";

// Auth Pages
import Landing from "./pages/auth/Landing";
import Pricing from "./pages/auth/Pricing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import EmailVerification from "./pages/auth/EmailVerification";
import TwoFactorAuth from "./pages/auth/TwoFactorAuth";
import SSOLogin from "./pages/auth/SSOLogin";
import OAuthCallback from "./pages/auth/OAuthCallback";
import SessionTimeout from "./pages/auth/SessionTimeout";

// Dashboard
import Dashboard from "./pages/Dashboard";

// User Management
import Users from "./pages/Users";
import AddUser from "./pages/users/AddUser";
import EditUser from "./pages/users/EditUser";
import UserProfile from "./pages/users/UserProfile";
import RoleManagement from "./pages/users/RoleManagement";
import OrganizationProfile from "./pages/users/OrganizationProfile";
import TeamManagement from "./pages/users/TeamManagement";
import ActivityLogs from "./pages/users/ActivityLogs";
import SubscriptionManagement from "./pages/users/SubscriptionManagement";

// Case Management
import Cases from "./pages/Cases";
import CaseDetail from "./pages/CaseDetail";
import CaseParties from "./pages/cases/CaseParties";
import CaseTimeline from "./pages/cases/CaseTimeline";
import CaseNotes from "./pages/cases/CaseNotes";
import CaseBilling from "./pages/cases/CaseBilling";
import CaseCalendar from "./pages/cases/CaseCalendar";
import CaseAnalytics from "./pages/cases/CaseAnalytics";

// Client Management
import Clients from "./pages/Clients";
import ClientDetail from "./pages/ClientDetail";
import ClientAssociatedCases from "./pages/clients/ClientAssociatedCases";
import ClientBillingSummary from "./pages/clients/ClientBillingSummary";
import ClientDocuments from "./pages/clients/ClientDocuments";
import ClientCommunication from "./pages/clients/ClientCommunication";
import ConflictCheck from "./pages/clients/ConflictCheck";

// Document Management
import Documents from "./pages/Documents";

// Task Management
import Tasks from "./pages/Tasks";

// Calendar
import Calendar from "./pages/Calendar";

// Billing
import TimeTracking from "./pages/TimeTracking";
import Invoices from "./pages/Invoices";
import InvoiceDetail from "./pages/InvoiceDetail";

// Reports
import Reports from "./pages/Reports";

// Predictive Analysis
import PredictiveAnalysis from "./pages/PredictiveAnalysis";

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
}

// Public Route Component (redirect if logged in)
function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>Loading...</div>;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <PublicRoute>
            <ResetPassword />
          </PublicRoute>
        }
      />
      <Route
        path="/verify-email/:token"
        element={
          <PublicRoute>
            <EmailVerification />
          </PublicRoute>
        }
      />
      <Route
        path="/2fa"
        element={
          <PublicRoute>
            <TwoFactorAuth />
          </PublicRoute>
        }
      />
      <Route
        path="/auth/callback"
        element={
          <PublicRoute>
            <OAuthCallback />
          </PublicRoute>
        }
      />
      <Route
        path="/auth/callback/:provider"
        element={
          <PublicRoute>
            <OAuthCallback />
          </PublicRoute>
        }
      />
      <Route
        path="/sso"
        element={
          <PublicRoute>
            <SSOLogin />
          </PublicRoute>
        }
      />
      <Route
        path="/session-timeout"
        element={<SessionTimeout />}
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* User Management */}
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/add"
        element={
          <ProtectedRoute>
            <AddUser />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/:id"
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/:id/edit"
        element={
          <ProtectedRoute>
            <EditUser />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/add"
        element={
          <ProtectedRoute>
            <AddUser />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/:id/edit"
        element={
          <ProtectedRoute>
            <EditUser />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/:id"
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/roles"
        element={
          <ProtectedRoute>
            <RoleManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/organization"
        element={
          <ProtectedRoute>
            <OrganizationProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/team"
        element={
          <ProtectedRoute>
            <TeamManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/activity-logs"
        element={
          <ProtectedRoute>
            <ActivityLogs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/subscription"
        element={
          <ProtectedRoute>
            <SubscriptionManagement />
          </ProtectedRoute>
        }
      />

      {/* Case Management */}
      <Route
        path="/cases"
        element={
          <ProtectedRoute>
            <Cases />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cases/:id"
        element={
          <ProtectedRoute>
            <CaseDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cases/:id/parties"
        element={
          <ProtectedRoute>
            <CaseParties />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cases/:id/timeline"
        element={
          <ProtectedRoute>
            <CaseTimeline />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cases/:id/notes"
        element={
          <ProtectedRoute>
            <CaseNotes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cases/:id/billing"
        element={
          <ProtectedRoute>
            <CaseBilling />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cases/:id/calendar"
        element={
          <ProtectedRoute>
            <CaseCalendar />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cases/:id/analytics"
        element={
          <ProtectedRoute>
            <CaseAnalytics />
          </ProtectedRoute>
        }
      />

      {/* Client Management */}
      <Route
        path="/clients"
        element={
          <ProtectedRoute>
            <Clients />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clients/:id"
        element={
          <ProtectedRoute>
            <ClientDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clients/:id/cases"
        element={
          <ProtectedRoute>
            <ClientAssociatedCases />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clients/:id/billing"
        element={
          <ProtectedRoute>
            <ClientBillingSummary />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clients/:id/documents"
        element={
          <ProtectedRoute>
            <ClientDocuments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clients/:id/communication"
        element={
          <ProtectedRoute>
            <ClientCommunication />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clients/:id/conflict-check"
        element={
          <ProtectedRoute>
            <ConflictCheck />
          </ProtectedRoute>
        }
      />

      {/* Document Management */}
      <Route
        path="/documents"
        element={
          <ProtectedRoute>
            <Documents />
          </ProtectedRoute>
        }
      />

      {/* Task Management */}
      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <Tasks />
          </ProtectedRoute>
        }
      />

      {/* Calendar */}
      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <Calendar />
          </ProtectedRoute>
        }
      />

      {/* Billing */}
      <Route
        path="/time-tracking"
        element={
          <ProtectedRoute>
            <TimeTracking />
          </ProtectedRoute>
        }
      />
      <Route
        path="/invoices"
        element={
          <ProtectedRoute>
            <Invoices />
          </ProtectedRoute>
        }
      />
      <Route
        path="/invoices/:id"
        element={
          <ProtectedRoute>
            <InvoiceDetail />
          </ProtectedRoute>
        }
      />

      {/* Reports */}
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        }
      />

      {/* Predictive Analysis */}
      <Route
        path="/predictive-analysis"
        element={
          <ProtectedRoute>
            <PredictiveAnalysis />
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
