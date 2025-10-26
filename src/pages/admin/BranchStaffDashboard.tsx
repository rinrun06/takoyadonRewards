import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { 
  Users, 
  MessageSquare, 
  Gift, 
  Star,
  TrendingUp,
  QrCode,
  Edit,
  CheckCircle
} from "lucide-react";
import Layout from "../../Components/Layout";
import StatCard from "../../Components/Dashboard/StatCard";

interface BranchStats {
    todayCustomers: number;
    pendingRedemptions: number;
    newFeedback: number;
    avgRating: number;
}

export default function BranchStaffDashboard() {
  const { session, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<BranchStats>({
    todayCustomers: 0,
    pendingRedemptions: 0,
    newFeedback: 0,
    avgRating: 0,
  });

  const fetchBranchStats = useCallback(async () => {
    if (profile?.primary_branch_id) {
        const { data, error } = await supabase.rpc('get_branch_staff_dashboard_stats', { b_id: profile.primary_branch_id });
        if (error) {
            console.error("Failed to fetch branch stats:", error);
        } else {
            setStats(data);
        }
    }
  }, [profile]);

  useEffect(() => {
      if (!loading && profile?.role !== 'branch_staff') {
        navigate("/");
      } 
      if (!loading && session) {
          fetchBranchStats();
      }
    }, [session, profile, loading, navigate, fetchBranchStats]);

  if (loading || !profile) {
    return <Layout><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div></div></Layout>;
  }
  
  const hasPendingActions = stats.pendingRedemptions > 0 || stats.newFeedback > 0;

  return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-black mb-2">Branch Dashboard</h1>
              <p className="text-gray-600 text-lg">Welcome, {profile.full_name || session?.user.email}.</p>
            </div>
            <Link
              to="/profile"
              className="mt-4 sm:mt-0 flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-md"
            >
              <Edit className="w-4 h-4 mr-2" />
              View Profile
            </Link>
          </div>
  
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Today's Customers" value={stats.todayCustomers.toString()} icon={<Users className="w-8 h-8 text-blue-600" />} bgColor="bg-blue-100" />
            <StatCard title="Pending Redemptions" value={stats.pendingRedemptions.toString()} icon={<Gift className="w-8 h-8 text-green-600" />} bgColor="bg-green-100" />
            <StatCard title="New Feedback" value={stats.newFeedback.toString()} icon={<MessageSquare className="w-8 h-8 text-purple-600" />} bgColor="bg-purple-100" />
            <StatCard title="Average Rating" value={`${stats.avgRating.toFixed(1)}/5`} icon={<Star className="w-8 h-8 text-yellow-600" />} bgColor="bg-yellow-100" />
          </div>
          
          {/* Pending Actions Panel */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-black mb-6">Pending Actions</h2>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
              {hasPendingActions ? (
                <ul className="space-y-4">
                  {stats.pendingRedemptions > 0 && (
                    <li className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-red-50 rounded-lg">
                      <div>
                        <p className="font-bold text-red-800">New Redemption Requests</p>
                        <p className="text-sm text-red-700">You have {stats.pendingRedemptions} pending redemptions to approve.</p>
                      </div>
                      <Link to="/staff/redemptions" className="mt-2 sm:mt-0 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">
                        Review ({stats.pendingRedemptions})
                      </Link>
                    </li>
                  )}
                  {stats.newFeedback > 0 && (
                    <li className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-bold text-blue-800">New Customer Feedback</p>
                        <p className="text-sm text-blue-700">You have {stats.newFeedback} new feedback entries to read.</p>
                      </div>
                      <Link to="/staff/feedback" className="mt-2 sm:mt-0 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                        View ({stats.newFeedback})
                      </Link>
                    </li>
                  )}
                </ul>
              ) : (
                <div className="text-center py-10">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-800">You're all caught up!</h3>
                  <p className="text-gray-500 mt-2">There are no pending actions at the moment.</p>
                </div>
              )}
            </div>
          </div>

          {/* Tools Panel */}
          <div>
            <h2 className="text-3xl font-bold text-black mb-6">Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link to="/staff/scan-qr" className="block bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-2 group">
                <div className="w-16 h-16 bg-gray-100 text-black rounded-full flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                  <QrCode className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-black mb-2">Scan Customer QR</h3>
                <p className="text-gray-600 leading-relaxed">Award points for visits or purchases.</p>
              </Link>
              <Link to="/staff/reports" className="block bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-2 group">
                <div className="w-16 h-16 bg-gray-100 text-black rounded-full flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-black mb-2">View Reports</h3>
                <p className="text-gray-600 leading-relaxed">Generate daily activity reports.</p>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
  );
}
