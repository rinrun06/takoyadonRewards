import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router";
import { 
  Building, 
  Users, 
  Star, 
  MessageSquare, 
  TrendingUp,
  MapPin,
  Filter,
  Download,
  Eye,
  BarChart3,
  LineChart
} from "lucide-react";
import Layout from "../../Components/Layout";

export default function BranchOversight() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();
  const [loadingData, setLoadingData] = useState(true);
  const [timeframe, setTimeframe] = useState("6months");
  const [ownerType, setOwnerType] = useState("all");
  
  // Analytics Data
  const [analyticsData, setAnalyticsData] = useState({
    totalCustomers: 0,
    newCustomersThisMonth: 0,
    totalFeedback: 0,
    avgRating: 0,
    totalPointsAwarded: 0,
    totalRedemptions: 0,
    customerGrowth: 0,
    feedbackGrowth: 0,
    ratingTrend: 0
  });
  
  const [chartData, setChartData] = useState<Array<{month: string, customers: number, feedback: number, rating: number}>>([]);
  const [topBranches, setTopBranches] = useState<Array<{id: number, name: string, customers: number, rating: number, feedback: number, owner_type: string}>>([]);
  const [feedbackCategories, setFeedbackCategories] = useState<Array<{category: string, rating: number, trend: string}>>([]);

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoadingData(true);
      const response = await fetch(`/api/admin/analytics/overview?timeframe=${timeframe}&owner_type=${ownerType}`);
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      }
    } catch (error) {
      console.error("Failed to fetch analytics data:", error);
    } finally {
      setLoadingData(false);
    }
  }, [timeframe, ownerType]);

  const fetchChartData = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/analytics/chart-data?timeframe=${timeframe}`);
      if (response.ok) {
        const data = await response.json();
        setChartData(data);
      }
    } catch (error) {
      console.error("Failed to fetch chart data:", error);
    }
  }, [timeframe]);

  const fetchTopBranches = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/analytics/top-branches?owner_type=${ownerType}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setTopBranches(data);
      }
    } catch (error) {
      console.error("Failed to fetch top branches:", error);
    }
  }, [ownerType]);

  const fetchFeedbackCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/analytics/feedback-categories');
      if (response.ok) {
        const data = await response.json();
        setFeedbackCategories(data);
      }
    } catch (error) {
      console.error("Failed to fetch feedback categories:", error);
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!profile || profile.role !== 'franchise_admin') {
        navigate("/");
      } else {
        fetchAnalyticsData();
        fetchChartData();
        fetchTopBranches();
        fetchFeedbackCategories();
      }
    }
  }, [profile, loading, navigate, fetchAnalyticsData, fetchChartData, fetchTopBranches, fetchFeedbackCategories]);

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      const response = await fetch(`/api/admin/analytics/export?format=${format}&timeframe=${timeframe}&owner_type=${ownerType}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `branch-oversight-${timeframe}-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error(`Failed to export ${format}:`, error);
    }
  };

  if (loadingData) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const statCards = [
    {
      title: "Total Customers",
      value: analyticsData.totalCustomers.toLocaleString(),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      trend: `+${analyticsData.customerGrowth}%`
    },
    {
      title: "Monthly Feedback",
      value: analyticsData.totalFeedback.toLocaleString(),
      icon: MessageSquare,
      color: "text-green-600",
      bgColor: "bg-green-100",
      trend: `+${analyticsData.feedbackGrowth}%`
    },
    {
      title: "Average Rating",
      value: analyticsData.avgRating.toFixed(1),
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      trend: `${analyticsData.ratingTrend >= 0 ? '+' : ''}${analyticsData.ratingTrend}`
    },
    {
      title: "Points Awarded",
      value: analyticsData.totalPointsAwarded.toLocaleString(),
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      trend: "+12%"
    }
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Branch Oversight & Analytics</h1>
          <p className="text-gray-600">Monitor branch performance and analyze operational metrics</p>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-700">Filters:</span>
            </div>
            
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="1month">Last Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
              <option value="all">All Time</option>
            </select>

            <select
              value={ownerType}
              onChange={(e) => setOwnerType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">All Branches</option>
              <option value="franchise">Franchise Only</option>
              <option value="company_owned">Company-Owned Only</option>
            </select>

            <div className="flex space-x-2 ml-auto">
              <button
                onClick={() => handleExport('csv')}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                CSV
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                PDF
              </button>
            </div>
          </div>
        </div>

        {/* Analytics Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className={`text-sm font-medium ${
                  stat.trend.startsWith('+') ? 'text-green-600' : 
                  stat.trend.startsWith('-') ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {stat.trend}
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.title}</div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Performance Trends Chart */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">Performance Trends</h3>
              <BarChart3 className="w-5 h-5 text-gray-600" />
            </div>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
              <div className="text-center">
                <LineChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Performance chart visualization</p>
                <p className="text-sm text-gray-400">
                  {chartData.length} data points over {timeframe}
                </p>
              </div>
            </div>
          </div>

          {/* Feedback Categories */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">Feedback Categories</h3>
              <MessageSquare className="w-5 h-5 text-gray-600" />
            </div>
            <div className="space-y-4">
              {feedbackCategories.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-800">{category.category}</div>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < category.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-600">{category.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${
                    category.trend.startsWith('+') ? 'text-green-600' : 
                    category.trend.startsWith('-') ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {category.trend}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Performing Branches */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800">Top Performing Branches</h3>
            <Building className="w-5 h-5 text-gray-600" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Rank</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Branch</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Customers</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Rating</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Feedback</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {topBranches.map((branch, index) => (
                  <tr key={branch.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          index === 2 ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {index + 1}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                        <div className="font-medium text-gray-800">{branch.name}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        branch.owner_type === 'franchise' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {branch.owner_type === 'franchise' ? 'Franchise' : 'Company-Owned'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-800">{branch.customers}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        <span className="text-gray-800">{branch.rating}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-800">{branch.feedback}</td>
                    <td className="py-3 px-4">
                      <button className="flex items-center px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
