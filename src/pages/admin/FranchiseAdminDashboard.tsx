import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { 
  BarChart3, 
  Building, 
  Users, 
  MessageSquare,
  Star,
  TrendingUp,
  Megaphone,
  Calendar,
  MapPin,
  AlertCircle,
  CheckCircle,
  Clock,
  Edit
} from "lucide-react";
import Layout from "../../Components/Layout";
import StatCard from "../../Components/Dashboard/StatCard";

interface FranchiseStats {
    totalBranches: number;
    totalCustomers: number;
    totalFeedback: number;
    avgRating: number;
    monthlyGrowth: number;
    activeCampaigns: number;
}

interface BranchPerformance {
    name: string;
    customers: number;
    rating: number;
    feedback: number;
}

interface PendingRequest {
    id: number;
    type: string;
    title: string;
    status: string;
    submitted: string;
    urgency: string;
}

export default function FranchiseAdminDashboard() {
  const { session, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<FranchiseStats>({
    totalBranches: 0,
    totalCustomers: 0,
    totalFeedback: 0,
    avgRating: 0,
    monthlyGrowth: 0,
    activeCampaigns: 0
  });
  const [branchPerformance, setBranchPerformance] = useState<BranchPerformance[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);

  const fetchFranchiseStats = useCallback(async () => {
    if (profile?.primary_franchise_id) {
        const { data, error } = await supabase.rpc('get_franchise_admin_dashboard_stats', { f_id: profile.primary_franchise_id });
        if (error) {
        console.error("Failed to fetch franchise stats:", error);
        } else {
        setStats(data);
        }
    }
  }, [profile]);

  const fetchBranchPerformance = useCallback(async () => {
    if (profile?.primary_franchise_id) {
        const { data, error } = await supabase.rpc('get_franchise_branch_performance', { f_id: profile.primary_franchise_id });
        if (error) {
            console.error("Failed to fetch branch performance:", error);
        } else {
            setBranchPerformance(data);
        }
    }
  }, [profile]);

  const fetchPendingRequests = useCallback(async () => {
    // Mock data for now
    const mockData = [
        { id: 1, type: 'Campaign', title: 'Summer Sale Banner', status: 'pending', submitted: new Date().toISOString(), urgency: 'high' },
        { id: 2, type: 'New Product', title: 'Add Iced Coffee', status: 'under_review', submitted: new Date().toISOString(), urgency: 'medium' },
    ]
    setPendingRequests(mockData)
  }, []);

  useEffect(() => {
    if (!loading && profile?.role !== 'franchise_admin') {
      navigate("/");
    }
    if (!loading && session) {
        fetchFranchiseStats();
        fetchBranchPerformance();
        fetchPendingRequests();
    }
  }, [session, profile, loading, navigate, fetchFranchiseStats, fetchBranchPerformance, fetchPendingRequests]);
  
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
      title: "Request Campaign",
      description: "Request new marketing campaigns from Super Admin",
      icon: Megaphone,
      link: "/admin/campaign-requests",
      color: "from-green-500 to-green-600"
    },
    {
      title: "Branch Oversight",
      description: "Monitor branch operations with analytics",
      icon: Building,
      link: "/admin/branch-oversight",
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Performance Tracking",
      description: "Track customer satisfaction and growth",
      icon: TrendingUp,
      link: "/admin/performance-tracking",
      color: "from-orange-500 to-red-600"
    },
    {
      title: "Campaigns",
      description: "Manage and view campaign status",
      icon: BarChart3,
      link: "/admin/campaigns",
      color: "from-blue-500 to-blue-600"
    }
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Franchise Admin Dashboard</h1>
            <p className="text-gray-600">Oversee franchise operations and performance</p>
          </div>
          <Link
            to="/profile"
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md"
          >
            <Edit className="w-4 h-4 mr-2" />
            View Profile
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Branches" value={stats.totalBranches.toString()} icon={<Building className="w-6 h-6 text-blue-600" />} bgColor="bg-blue-100" />
          <StatCard title="Total Customers" value={stats.totalCustomers.toLocaleString()} icon={<Users className="w-6 h-6 text-green-600" />} bgColor="bg-green-100" />
          <StatCard title="Feedback Received" value={stats.totalFeedback.toLocaleString()} icon={<MessageSquare className="w-6 h-6 text-purple-600" />} bgColor="bg-purple-100" />
          <StatCard title="Average Rating" value={stats.avgRating.toFixed(1)} icon={<Star className="w-6 h-6 text-yellow-600" />} bgColor="bg-yellow-100" />
        </div>

        {/* Quick Actions */}
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

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Branch Performance */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">Branch Performance</h3>
              <TrendingUp className="w-5 h-5 text-gray-600" />
            </div>
            <div className="space-y-4">
              {branchPerformance.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Building className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No branch data available</p>
                </div>
              ) : (
                branchPerformance.map((branch, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{branch.name}</div>
                      <div className="text-sm text-gray-500">{branch.customers} customers</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                      <span className="font-medium text-gray-800">{branch.rating}</span>
                    </div>
                    <div className="text-sm text-gray-500">{branch.feedback} feedback</div>
                  </div>
                </div>
                ))
              )}
            </div>
          </div>

          {/* Pending Requests */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">Pending Requests</h3>
              <Clock className="w-5 h-5 text-gray-600" />
            </div>
            <div className="space-y-4">
              {pendingRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No pending requests</p>
                </div>
              ) : (
                pendingRequests.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-800">{request.title}</h4>
                      <p className="text-sm text-gray-600">{request.type}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        request.urgency === "high" ? "bg-red-100 text-red-800" :
                        request.urgency === "medium" ? "bg-yellow-100 text-yellow-800" :
                        "bg-green-100 text-green-800"
                      }`}>
                        {request.urgency}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        request.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                        request.status === "under_review" ? "bg-blue-100 text-blue-800" :
                        "bg-green-100 text-green-800"
                      }`}>
                        {request.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Submitted: {new Date(request.submitted).toLocaleDateString()}
                  </div>
                </div>
                ))
              )}
            </div>
            {pendingRequests.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
              <Link 
                  to="/admin/requests"
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  View All Requests →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">Recent Franchise Activity</h3>
              <Calendar className="w-5 h-5 text-gray-600" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-800">Campaign approved by Super Admin</div>
                    <div className="text-xs text-gray-500">Holiday Special Banner - 2 hours ago</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-800">New customer feedback received</div>
                    <div className="text-xs text-gray-500">Downtown Branch - 5 hours ago</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-800">Monthly report ready for review</div>
                    <div className="text-xs text-gray-500">All branches - 1 day ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
