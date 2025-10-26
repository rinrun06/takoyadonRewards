import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../supabaseClient";
import { useAuth } from "../../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  BarChart3, 
  TrendingUp, 
  Users, 
  MessageSquare,
  Star,
  Calendar,
  Filter,
  RefreshCw,
  Building,
  Home,
} from "lucide-react";
import Layout from "../../Components/Layout";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnalyticsData {
  totalCustomers: number;
  newCustomersThisMonth: number;
  totalFeedback: number;
  avgRating: number;
  totalPointsAwarded: number;
  totalRedemptions: number;
  customerGrowth: number;
  feedbackGrowth: number;
  ratingTrend: number;
}

interface ChartData {
  month: string;
  customers: number;
  feedback: number;
  rating: number;
}

interface TopBranch {
  id: number;
  name: string;
  customers: number;
  rating: number;
  feedback: number;
  owner_type: 'franchise' | 'company_owned';
  franchise_name?: string;
  company_owned_name?: string;
}

interface FeedbackCategory {
  category: string;
  rating: number;
  trend: string;
}

interface CampaignPerformanceStats {
    campaign_id: number;
    campaign_name: string;
    total_participants: number;
    total_points_awarded: number;
    engagement_rate: number;
}

export default function Analytics() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [topBranches, setTopBranches] = useState<TopBranch[]>([]);
  const [feedbackCategories, setFeedbackCategories] = useState<FeedbackCategory[]>([]);
  const [campaignStats, setCampaignStats] = useState<CampaignPerformanceStats[]>([]);
  
  const [selectedTimeframe, setSelectedTimeframe] = useState('6months');
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [selectedOwnerType, setSelectedOwnerType] = useState('all'); // all, franchise, company_owned
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchAnalyticsData = useCallback(async () => {
    // This function would normally fetch data from your backend
    // For now, we'll use mock data.
    setAnalyticsData({
        totalCustomers: 12345,
        newCustomersThisMonth: 456,
        totalFeedback: 789,
        avgRating: 4.5,
        totalPointsAwarded: 123456,
        totalRedemptions: 1234,
        customerGrowth: 15,
        feedbackGrowth: 5,
        ratingTrend: 0.1
    });
  }, [selectedTimeframe, selectedMetric, selectedOwnerType]);

  const fetchChartData = useCallback(async () => {
    // Mock data for charts
    setChartData([
        { month: "Jan", customers: 100, feedback: 20, rating: 4.2 },
        { month: "Feb", customers: 120, feedback: 25, rating: 4.3 },
        { month: "Mar", customers: 150, feedback: 30, rating: 4.4 },
        { month: "Apr", customers: 180, feedback: 35, rating: 4.5 },
        { month: "May", customers: 220, feedback: 40, rating: 4.6 },
        { month: "Jun", customers: 250, feedback: 45, rating: 4.7 },
    ]);
  }, [selectedTimeframe, selectedOwnerType]);

  const fetchTopBranches = useCallback(async () => {
    // Mock data for top branches
    setTopBranches([
        { id: 1, name: "Main Branch", customers: 1200, rating: 4.8, feedback: 250, owner_type: 'company_owned', company_owned_name: 'Takoyadon Inc.' },
        { id: 2, name: "Downtown Franchise", customers: 950, rating: 4.6, feedback: 180, owner_type: 'franchise', franchise_name: 'TD Franchise Group' },
    ]);
  }, [selectedOwnerType]);

  const fetchFeedbackCategories = useCallback(async () => {
    // Mock data for feedback categories
    setFeedbackCategories([
        { category: "Food Quality", rating: 4.6, trend: "+0.2" },
        { category: "Service Speed", rating: 4.4, trend: "-0.1" },
        { category: "Staff Friendliness", rating: 4.8, trend: "+0.3" },
        { category: "Cleanliness", rating: 4.5, trend: "+0.1" },
        { category: "Value for Money", rating: 4.3, trend: "0" },
    ]);
  }, [selectedTimeframe, selectedOwnerType]);

  const fetchCampaignStats = useCallback(async () => {
    const { data, error } = await supabase.rpc('get_campaign_performance_stats');
    if (error) {
        console.error("Error fetching campaign stats:", error);
        setCampaignStats([]);
    } else {
        setCampaignStats(data);
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!profile || !['super_admin', 'franchise_admin'].includes(profile.role ?? "")) {
        navigate("/");
      } else {
        fetchAnalyticsData();
        fetchChartData();
        fetchTopBranches();
        fetchFeedbackCategories();
        fetchCampaignStats();
      }
    }
  }, [profile, loading, navigate, fetchAnalyticsData, fetchChartData, fetchTopBranches, fetchFeedbackCategories, fetchCampaignStats]);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchAnalyticsData(),
        fetchChartData(),
        fetchTopBranches(),
        fetchFeedbackCategories(),
        fetchCampaignStats()
      ]);
      setLastRefresh(new Date());
    } catch (error) {
      console.error("Failed to refresh analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ... (rest of the component is the same, so I'm omitting it for brevity)

  if (!analyticsData) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        </div>
      </Layout>
    );
  }

  const metricCards = [
    {
      title: "Total Customers",
      value: analyticsData.totalCustomers.toLocaleString(),
      change: `${analyticsData.customerGrowth >= 0 ? '+' : ''}${analyticsData.customerGrowth}%`,
      changeType: analyticsData.customerGrowth >= 0 ? "positive" : "negative",
      icon: Users,
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "New This Month",
      value: analyticsData.newCustomersThisMonth.toString(),
      change: "Current",
      changeType: "neutral",
      icon: TrendingUp,
      color: "from-green-500 to-green-600"
    },
    {
      title: "Total Feedback",
      value: analyticsData.totalFeedback.toLocaleString(),
      change: `${analyticsData.feedbackGrowth >= 0 ? '+' : ''}${analyticsData.feedbackGrowth}%`,
      changeType: analyticsData.feedbackGrowth >= 0 ? "positive" : "negative",
      icon: MessageSquare,
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Average Rating",
      value: analyticsData.avgRating.toFixed(1),
      change: `${analyticsData.ratingTrend >= 0 ? '+' : ''}${analyticsData.ratingTrend}`,
      changeType: analyticsData.ratingTrend >= 0 ? "positive" : "negative",
      icon: Star,
      color: "from-yellow-500 to-yellow-600"
    },
    {
      title: "Points Awarded",
      value: analyticsData.totalPointsAwarded.toLocaleString(),
      change: "Total",
      changeType: "neutral",
      icon: Star,
      color: "from-orange-500 to-red-600"
    },
    {
      title: "Redemptions",
      value: analyticsData.totalRedemptions.toString(),
      change: "Total",
      changeType: "neutral",
      icon: BarChart3,
      color: "from-indigo-500 to-indigo-600"
    }
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/admin/super-admin"
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Analytics Dashboard</h1>
              <p className="text-gray-600">
                Real-time insights into customer behavior and performance 
                <span className="text-sm text-gray-500 ml-2">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </span>
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={refreshData}
                disabled={isLoading}
                className="flex items-center px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-800">Filters:</span>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="1month">Last Month</option>
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last Year</option>
                <option value="all">All Time</option>
              </select>
              
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Metrics</option>
                <option value="customers">Customers</option>
                <option value="feedback">Feedback</option>
                <option value="ratings">Ratings</option>
                <option value="redemptions">Redemptions</option>
              </select>

              <select
                value={selectedOwnerType}
                onChange={(e) => setSelectedOwnerType(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Branches</option>
                <option value="franchise">Franchise Only</option>
                <option value="company_owned">Company-Owned Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {metricCards.map((metric, index) => (
            <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${metric.color} rounded-xl flex items-center justify-center`}>
                  <metric.icon className="w-5 h-5 text-white" />
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  metric.changeType === 'positive' ? 'bg-green-100 text-green-800' : 
                  metric.changeType === 'negative' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {metric.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-800 mb-1">{metric.value}</div>
              <div className="text-sm text-gray-600">{metric.title}</div>
            </div>
          ))}
        </div>
        
        {/* Campaign Performance Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Campaign Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={campaignStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="campaign_name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total_participants" fill="#8884d8" name="Total Participants" />
                    <Bar dataKey="total_points_awarded" fill="#82ca9d" name="Total Points Awarded" />
                    <Bar dataKey="engagement_rate" fill="#ffc658" name="Engagement Rate (%)" />
                </BarChart>
            </ResponsiveContainer>
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Customer Growth Chart */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">Customer Growth Trend</h3>
              <Calendar className="w-5 h-5 text-gray-600" />
            </div>
            
            {chartData.length > 0 ? (
              <div className="space-y-4">
                {chartData.map((data) => (
                  <div key={data.month} className="flex items-center">
                    <div className="w-12 text-sm text-gray-600">{data.month}</div>
                    <div className="flex-1 mx-4">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min((data.customers / Math.max(...chartData.map(d => d.customers))) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-16 text-sm font-medium text-gray-800 text-right">
                      {data.customers}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No data available for selected period</p>
              </div>
            )}
          </div>

          {/* Feedback Volume Chart */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">Feedback Volume</h3>
              <MessageSquare className="w-5 h-5 text-gray-600" />
            </div>
            
            {chartData.length > 0 ? (
              <div className="space-y-4">
                {chartData.map((data) => (
                  <div key={data.month} className="flex items-center">
                    <div className="w-12 text-sm text-gray-600">{data.month}</div>
                    <div className="flex-1 mx-4">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min((data.feedback / Math.max(...chartData.map(d => d.feedback))) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-16 text-sm font-medium text-gray-800 text-right">
                      {data.feedback}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No feedback data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Analysis Tables */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Top Performing Branches */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Top Performing Branches</h3>
            {topBranches.length > 0 ? (
              <div className="space-y-4">
                {topBranches.map((branch, branchIndex) => (
                  <div key={branchIndex} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{branchIndex + 1}</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-800 flex items-center space-x-2">
                          <span>{branch.name}</span>
                          {branch.owner_type === 'franchise' ? (
                            <Building className="w-3 h-3 text-blue-600" />
                          ) : (
                            <Home className="w-3 h-3 text-green-600" />
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {branch.customers} customers • {branch.owner_type === 'franchise' ? branch.franchise_name : branch.company_owned_name}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        <span className="font-medium text-gray-800">{branch.rating.toFixed(1)}</span>
                      </div>
                      <div className="text-sm text-gray-500">{branch.feedback} feedback</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Building className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No branch data available</p>
              </div>
            )}
          </div>

          {/* Feedback Category Analysis */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Feedback Categories</h3>
            <div className="space-y-4">
              {feedbackCategories.map((category, categoryIndex) => (
                <div key={categoryIndex} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div>
                    <div className="font-medium text-gray-800">{category.category}</div>
                    <div className="text-sm text-gray-500">Average rating</div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                      <span className="font-medium text-gray-800">{category.rating.toFixed(1)}</span>
                    </div>
                    <div className={`text-sm font-medium ${
                      parseFloat(category.trend) > 0 ? 'text-green-600' : 
                      parseFloat(category.trend) < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {parseFloat(category.trend) > 0 ? '+' : ''}{category.trend}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Insights Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Key Insights</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Growth Highlights</h4>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• Customer base {analyticsData.customerGrowth >= 0 ? 'grew' : 'declined'} by {Math.abs(analyticsData.customerGrowth)}% this period</li>
                <li>• Feedback volume {analyticsData.feedbackGrowth >= 0 ? 'increased' : 'decreased'} by {Math.abs(analyticsData.feedbackGrowth)}%</li>
                <li>• Average rating {analyticsData.ratingTrend >= 0 ? 'improved' : 'declined'} by {Math.abs(analyticsData.ratingTrend)} points</li>
                <li>• {analyticsData.newCustomersThisMonth} new customers joined this month</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Performance Summary</h4>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• Total {analyticsData.totalPointsAwarded.toLocaleString()} loyalty points distributed</li>
                <li>• {analyticsData.totalRedemptions} rewards successfully redeemed</li>
                <li>• {topBranches.length > 0 ? topBranches[0]?.name || 'N/A' : 'N/A'} is the top performing branch</li>
                <li>• Filtering by: {selectedOwnerType === 'all' ? 'All branches' : selectedOwnerType === 'franchise' ? 'Franchise branches only' : 'Company-owned branches only'}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
