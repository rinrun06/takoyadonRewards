import type { JSX } from "react";
import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { remoteConfig } from "./firebase";
import { fetchAndActivate, getAll } from "firebase/remote-config";

// Page Imports
import IndexPage from "./pages/IndexPage";
import CustomerLogin from "./pages/Login";
import Register from "./pages/Register";
import CheckEmail from "./pages/customer/CheckEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ProfilePage from "./pages/Profile";
import Feedback from "./pages/Feedback";
import InfluencerPage from "./pages/Influencer";
import RoleBasedRedirect from "./Components/RoleBasedRedirect";
import RewardsPage from "./pages/Rewards";
import EarnPoints from "./pages/EarnPoints";
import PointsHistory from "./pages/PointsHistory";
import CampaignsPage from "./pages/Campaigns";
import LoyaltyDashboard from "./pages/LoyaltyDashboard";
import ReferralPage from "./pages/Referral";

// Admin Pages
import AdminLogin from "./pages/admin/Login";
import AdminSignup from "./pages/admin/AdminSignup";
import SuperAdminDashboard from "./pages/admin/SuperAdminDashboard";
import FranchiseAdminDashboard from "./pages/admin/FranchiseAdminDashboard";
import BranchStaffDashboard from "./pages/admin/BranchStaffDashboard";
import Campaigns from "./pages/admin/Campaigns";
import SystemManagement from "./pages/admin/SystemManagement";
import Analytics from "./pages/admin/Analytics";
import QRCodes from "./pages/admin/QRCodes";
import PointsSystemRules from "./pages/admin/PointsSystemRules";
import BranchOversight from "./pages/admin/BranchOversight";
import CampaignRequests from "./pages/admin/CampaignRequests";
import PerformanceTracking from "./pages/admin/PerformanceTracking";
import ScanQRPage from "./pages/admin/ScanQR";
import RedemptionsPage from "./pages/admin/Redemptions";
import StaffFeedbackPage from "./pages/admin/Feedback";
import ReportsPage from "./pages/admin/Reports";
import EditProfilePage from "./pages/admin/EditProfile";
import Dashboard from "./pages/Dashboard";

// Higher-order component for private routes
const PrivateRoute = ({
  children,
  roles,
  redirectTo = "/customer/login",
}: {
  children: JSX.Element;
  roles?: string[];
  redirectTo?: string;
}) => {
  const { session, profile } = useAuth();

  if (!session) return <Navigate to={redirectTo} replace />;

  if (roles && !roles.includes(profile?.role || "")) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const { session, loading, setRemoteConfigValues } = useAuth();

  useEffect(() => {
    const fetchConfig = async () => {
      await fetchAndActivate(remoteConfig);
      const allConfigs = getAll(remoteConfig);
      const configs: { [key: string]: boolean } = {};

      Object.entries(allConfigs).forEach(([key, value]) => {
        // TypeScript infers value correctly here
        configs[key] = value.asBoolean();
      });

      setRemoteConfigValues(configs);
    };

    fetchConfig();
  }, [setRemoteConfigValues]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/customer/login"
        element={!session ? <CustomerLogin /> : <Navigate to="/dashboard" replace />}
      />
      <Route
        path="/customer/register"
        element={!session ? <Register /> : <Navigate to="/dashboard" replace />}
      />
      <Route path="/customer/check-email" element={<CheckEmail />} />
      <Route path="/customer/forgot-password" element={<ForgotPassword />} />
      <Route path="/password-reset" element={<ResetPassword />} />
      <Route path="/influencer-program" element={<InfluencerPage />} />

      {/* Admin Login and Signup */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/signup" element={<AdminSignup />} />

      {/* Root Route */}
      <Route path="/" element={<IndexPage />} />

      {/* Private Routes for Logged-in Users */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/feedback"
        element={
          <PrivateRoute>
            <Feedback />
          </PrivateRoute>
        }
      />
      <Route
        path="/earn-points"
        element={
          <PrivateRoute>
            <EarnPoints />
          </PrivateRoute>
        }
      />
      <Route
        path="/rewards"
        element={
          <PrivateRoute>
            <RewardsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/points-history"
        element={
          <PrivateRoute>
            <PointsHistory />
          </PrivateRoute>
        }
      />
      <Route
        path="/campaigns"
        element={
          <PrivateRoute>
            <CampaignsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/loyalty"
        element={
          <PrivateRoute>
            <LoyaltyDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/referral"
        element={
          <PrivateRoute>
            <ReferralPage />
          </PrivateRoute>
        }
      />

      {/* Super Admin Routes */}
      <Route
        path="/admin/super-admin"
        element={
          <PrivateRoute roles={["super_admin"]} redirectTo="/admin/login">
            <SuperAdminDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/system-management"
        element={
          <PrivateRoute roles={["super_admin"]} redirectTo="/admin/login">
            <SystemManagement />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <PrivateRoute roles={["super_admin"]} redirectTo="/admin/login">
            <Analytics />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/campaigns"
        element={
          <PrivateRoute roles={["super_admin", "franchise_admin"]} redirectTo="/admin/login">
            <Campaigns />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/qr-codes"
        element={
          <PrivateRoute roles={["super_admin"]} redirectTo="/admin/login">
            <QRCodes />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/points-rules"
        element={
          <PrivateRoute roles={["super_admin"]} redirectTo="/admin/login">
            <PointsSystemRules />
          </PrivateRoute>
        }
      />

      {/* Franchise Admin Routes */}
      <Route
        path="/admin/franchise-admin"
        element={
          <PrivateRoute roles={["franchise_admin"]} redirectTo="/admin/login">
            <FranchiseAdminDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/branch-oversight"
        element={
          <PrivateRoute roles={["franchise_admin"]} redirectTo="/admin/login">
            <BranchOversight />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/campaign-requests"
        element={
          <PrivateRoute roles={["franchise_admin"]} redirectTo="/admin/login">
            <CampaignRequests />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/performance-tracking"
        element={
          <PrivateRoute roles={["franchise_admin"]} redirectTo="/admin/login">
            <PerformanceTracking />
          </PrivateRoute>
        }
      />

      {/* Branch Staff Routes */}
      <Route
        path="/admin/branch-staff"
        element={
          <PrivateRoute roles={["branch_staff"]} redirectTo="/admin/login">
            <BranchStaffDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/staff/scan-qr"
        element={
          <PrivateRoute roles={["branch_staff"]} redirectTo="/admin/login">
            <ScanQRPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/staff/redemptions"
        element={
          <PrivateRoute roles={["branch_staff"]} redirectTo="/admin/login">
            <RedemptionsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/staff/feedback"
        element={
          <PrivateRoute roles={["branch_staff"]} redirectTo="/admin/login">
            <StaffFeedbackPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/staff/reports"
        element={
          <PrivateRoute roles={["branch_staff"]} redirectTo="/admin/login">
            <ReportsPage />
          </PrivateRoute>
        }
      />

      {/* Shared Admin/Staff Route */}
      <Route
        path="/admin/edit-profile"
        element={
          <PrivateRoute
            roles={["super_admin", "franchise_admin", "branch_staff"]}
            redirectTo="/admin/login"
          >
            <EditProfilePage />
          </PrivateRoute>
        }
      />

      {/* Role-based redirect route */}
      <Route path="/redirect" element={<RoleBasedRedirect />} />

      {/* Fallback Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
