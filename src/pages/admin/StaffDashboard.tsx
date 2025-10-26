
import { useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { 
  QrCode, 
  MessageSquare, 
  Gift, 
  TrendingUp,
  Edit,
  LogOut
} from "lucide-react";
import Layout from "../../Components/Layout";
import { supabase } from "../../supabaseClient";

export default function StaffDashboard() {
  const { session, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!session || profile?.role !== 'branch_staff')) {
      navigate("/admin/login");
    }
  }, [session, profile, loading, navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

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
      title: "Scan QR Code",
      description: "Process customer rewards and points.",
      icon: QrCode,
      link: "/admin/scan-qr",
      color: "from-red-500 to-orange-500"
    },
    {
      title: "View Feedback",
      description: "See what customers are saying.",
      icon: MessageSquare,
      link: "/admin/feedback",
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Manage Redemptions",
      description: "Approve or deny reward requests.",
      icon: Gift,
      link: "/admin/redemptions",
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Branch Reports",
      description: "Check daily performance metrics.",
      icon: TrendingUp,
      link: "/admin/reports",
      color: "from-purple-500 to-pink-500"
    }
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold text-gray-800">Staff Dashboard</h1>
            <p className="text-gray-600">Welcome back, {profile.full_name || 'Staff Member'}!</p>
          </div>
          <div className="flex items-center space-x-3">
            <Link to="/admin/edit-profile" className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                <Edit className="w-4 h-4 mr-2"/>
                Edit Profile
            </Link>
            <button onClick={handleLogout} className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">
                <LogOut className="w-4 h-4 mr-2"/>
                Logout
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100 group hover:-translate-y-1 transform"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-800 text-lg mb-2">{action.title}</h3>
              <p className="text-sm text-gray-600">{action.description}</p>
            </Link>
          ))}
        </div>
        
        <div className="mt-8 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h3>
            <p className="text-gray-500">Recent activity feed is not yet available.</p>
            {/* Placeholder for recent activity feed */}
        </div>

      </div>
    </Layout>
  );
}
