import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { 
  BarChart3, 
  Settings, 
  Megaphone, 
  Users, 
  Building, 
  Star, 
  MessageSquare,
  TrendingUp,
  Award,
  Eye,
  Edit,
  CheckSquare
} from "lucide-react";
import Layout from "../../Components/Layout";
import StatCard from "../../Components/Dashboard/StatCard";

interface DashboardStats {
  totalUsers: number;
  totalFranchises: number;
  totalBranches: number;
  totalFeedback: number;
  totalPoints: number;
  avgRating: number;
}

interface RecentActivity {
  type: string;
  message: string;
  time: string;
  icon: string;
}

export default function SuperAdminDashboard() {
  const { session, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalFranchises: 0,
    totalBranches: 0,
    totalFeedback: 0,
    totalPoints: 0,
    avgRating: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  const fetchDashboardStats = useCallback(async () => {
    const { data, error } = await supabase.rpc('get_superadmin_dashboard_stats');
    if (error) {
      console.error("Failed to fetch dashboard stats:", error);
    } else {
      setStats(data);
    }
  }, []);

  const fetchRecentActivity = useCallback(async () => {
    const mockActivity = [
      { type: 'user', message: 'New user signed up: alex@testing.com', time: '2m ago', icon: 'Users' },
      { type: 'feedback', message: 'New feedback submitted for Branch A', time: '15m ago', icon: 'MessageSquare' },
      { type: 'branch', message: 'Branch C reached 1,000 points distributed', time: '1h ago', icon: 'Building' },
    ];
    setRecentActivity(mockActivity);
  }, []);

  useEffect(() => {
    if (!loading && profile?.role !== 'super_admin') {
      navigate("/");
    }
    if (!loading && session) {
      fetchDashboardStats();
      fetchRecentActivity();
    }
  }, [session, profile, loading, navigate, fetchDashboardStats, fetchRecentActivity]);

  if (loading || !profile) {
    return (
        <Layout>
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
      </Layout>
    );
  }

  const quickActions = [
    {
      title: "System Management",
      description: "Manage franchises, branches, and system settings",
      icon: Settings,
      link: "/admin/system-management",
      color: "from-blue-500 to-blue-600"
    },
    {
        title: "Manage Submissions",
        description: "Approve or reject user-submitted activities for points",
        icon: CheckSquare,
        link: "/admin/manage-activities",
        color: "from-cyan-500 to-teal-600"
    },
    {
      title: "Create Campaigns",
      description: "Design and launch marketing campaigns",
      icon: Megaphone,
      link: "/admin/campaigns",
      color: "from-green-500 to-green-600"
    },
    {
      title: "Analytics Dashboard",
      description: "View detailed performance metrics",
      icon: BarChart3,
      link: "/admin/analytics",
      color: "from-purple-500 to-purple-600"
    },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Super Admin Dashboard</h1>
            <p className="text-gray-600">Complete system overview and management</p>
          </div>
          <Link
            to="/profile"
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md"
          >
            <Edit className="w-4 h-4 mr-2" />
            View Profile
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatCard title="Total Users" value={stats.totalUsers.toLocaleString()} icon={<Users className="w-5 h-5 text-blue-600" />} bgColor="bg-blue-100" />
          <StatCard title="Franchises" value={stats.totalFranchises.toLocaleString()} icon={<Building className="w-5 h-5 text-green-600" />} bgColor="bg-green-100" />
          <StatCard title="Active Branches" value={stats.totalBranches.toLocaleString()} icon={<Building className="w-5 h-5 text-purple-600" />} bgColor="bg-purple-100" />
          <StatCard title="Total Feedback" value={stats.totalFeedback.toLocaleString()} icon={<MessageSquare className="w-5 h-5 text-orange-600" />} bgColor="bg-orange-100" />
          <StatCard title="Points Distributed" value={stats.totalPoints.toLocaleString()} icon={<Star className="w-5 h-5 text-yellow-600" />} bgColor="bg-yellow-100" />
          <StatCard title="Average Rating" value={stats.avgRating.toFixed(1)} icon={<Award className="w-5 h-5 text-red-600" />} bgColor="bg-red-100" />
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100 group hover:scale-105 transform"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 mb-2">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Recent Activity</h3>
              <TrendingUp className="w-5 h-5 text-gray-600" />
            </div>
            <div className="space-y-3">
              {recentActivity.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No recent activity</p>
                </div>
              ) : (
                recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        activity.type === 'user' ? 'bg-blue-100' :
                        activity.type === 'feedback' ? 'bg-green-100' :
                        activity.type === 'branch' ? 'bg-purple-100' :
                        'bg-gray-100'
                      }`}>
                        {activity.type === 'user' && <Users className="w-4 h-4 text-blue-600" />}
                        {activity.type === 'feedback' && <MessageSquare className="w-4 h-4 text-green-600" />}
                        {activity.type === 'branch' && <Building className="w-4 h-4 text-purple-600" />}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-800">{activity.message}</div>
                        <div className="text-xs text-gray-500">{activity.time}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Link 
                to="/admin/activity-log"
                className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center"
              >
                <Eye className="w-4 h-4 mr-1" />
                View All Activity
              </Link>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">System Health</h3>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database Status</span>
                <span className="text-sm font-medium text-green-600">Healthy</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Response Time</span>
                <span className="text-sm font-medium text-green-600">145ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Sessions</span>
                <span className="text-sm font-medium text-blue-600">247</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Storage Usage</span>
                <span className="text-sm font-medium text-orange-600">68%</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Link 
                to="/admin/system-health"
                className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center"
              >
                <Settings className="w-4 h-4 mr-1" />
                System Details
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Pending Actions</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• 3 campaign approval requests from franchise admins</li>
                  <li>• 2 new franchise applications awaiting review</li>
                  <li>• 1 system update available</li>
                </ul>
              </div>
              <div className="flex space-x-3">
                <Link
                  to="/admin/approvals"
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Review All
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
