import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { 
  TrendingUp, 
  Users, 
  Star, 
  MessageSquare,
  Filter,
  ArrowLeft,
  BarChart3,
  LineChart,
  PieChart,
  Activity
} from "lucide-react";
import Layout from "@/Components/Layout";

interface BranchMetric {
  name: string;
  customers: number;
  rating: number;
  feedback: number;
  pointsAwarded: number;
  redemptions: number;
}

export default function PerformanceTracking() {
  const { profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("6months");
  
  const [performanceData, setPerformanceData] = useState({
    totalCustomers: 0,
    customerGrowth: 0,
    avgRating: 0,
    ratingTrend: 0,
    totalFeedback: 0,
    feedbackGrowth: 0,
    pointsAwarded: 0,
    redemptions: 0
  });

  const [branchMetrics, setBranchMetrics] = useState<BranchMetric[]>([]);

  const [monthlyTrends, setMonthlyTrends] = useState<Array<{
    month: string;
    customers: number;
    rating: number;
    feedback: number;
  }>>([]);

  const fetchPerformanceData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/franchise-stats");
      if (response.ok) {
        const data = await response.json();
        setPerformanceData({
          totalCustomers: data.totalCustomers,
          customerGrowth: data.monthlyGrowth,
          avgRating: data.avgRating,
          ratingTrend: 0.2, // Mock trend data
          totalFeedback: data.totalFeedback,
          feedbackGrowth: 15, // Mock growth data
          pointsAwarded: 12500, // Mock data
          redemptions: 380 // Mock data
        });
      }
    } catch (error) {
      console.error("Failed to fetch performance data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBranchMetrics = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/branch-performance");
      if (response.ok) {
        const data = await response.json();
        setBranchMetrics(data.map((branch: BranchMetric) => ({
          ...branch,
          pointsAwarded: Math.floor(Math.random() * 1000) + 500, // Mock data
          redemptions: Math.floor(Math.random() * 50) + 10 // Mock data
        })));
      }
    } catch (error) {
      console.error("Failed to fetch branch metrics:", error);
    }
  }, []);

  const fetchMonthlyTrends = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/analytics/chart-data?timeframe=${timeframe}`);
      if (response.ok) {
        const data = await response.json();
        setMonthlyTrends(data);
      }
    } catch (error) {
      console.error("Failed to fetch monthly trends:", error);
    }
  }, [timeframe]);

  useEffect(() => {
    if (!authLoading) {
      if (!profile || profile.role !== 'franchise_admin') {
        navigate("/");
      } else {
        fetchPerformanceData();
        fetchBranchMetrics();
        fetchMonthlyTrends();
      }
    }
  }, [profile, authLoading, navigate, timeframe, fetchPerformanceData, fetchBranchMetrics, fetchMonthlyTrends]);

  if (loading) {
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

  const performanceCards = [
    {
      title: "Customer Growth",
      value: `+${performanceData.customerGrowth}%`,
      subtitle: `${performanceData.totalCustomers} total`,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      trend: performanceData.customerGrowth
    },
    {
      title: "Rating Trend",
      value: performanceData.avgRating.toFixed(1),
      subtitle: `+${performanceData.ratingTrend} this month`,
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      trend: performanceData.ratingTrend
    },
    {
      title: "Feedback Growth",
      value: `+${performanceData.feedbackGrowth}%`,
      subtitle: `${performanceData.totalFeedback} received`,
      icon: MessageSquare,
      color: "text-green-600",
      bgColor: "bg-green-100",
      trend: performanceData.feedbackGrowth
    },
    {
      title: "Points Activity",
      value: performanceData.pointsAwarded.toLocaleString(),
      subtitle: `${performanceData.redemptions} redemptions`,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      trend: 18.5
    }
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin/franchise-admin')}
              className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Performance Tracking</h1>
              <p className="text-gray-600">Monitor customer satisfaction and franchise growth</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="1month">Last Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
            </select>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {performanceCards.map((card, index) => (
            <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${card.bgColor} rounded-xl flex items-center justify-center`}>
                  <card.icon className={`w-6 h-6 ${card.color}`} />
                </div>
                <div className={`text-sm font-medium ${
                  card.trend > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {card.trend > 0 ? '+' : ''}{card.trend}%
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-800 mb-1">{card.value}</div>
              <div className="text-sm text-gray-600">{card.title}</div>
              <div className="text-xs text-gray-500 mt-1">{card.subtitle}</div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Trends */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">Monthly Performance Trends</h3>
              <LineChart className="w-5 h-5 text-gray-600" />
            </div>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Monthly trends visualization</p>
                <p className="text-sm text-gray-400">
                  {monthlyTrends.length} months of data
                </p>
              </div>
            </div>
          </div>

          {/* Customer Satisfaction Breakdown */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">Customer Satisfaction</h3>
              <PieChart className="w-5 h-5 text-gray-600" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">Excellent (5★)</span>
                </div>
                <span className="font-medium text-gray-800">45%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">Good (4★)</span>
                </div>
                <span className="font-medium text-gray-800">35%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">Average (3★)</span>
                </div>
                <span className="font-medium text-gray-800">15%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-orange-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">Poor (2★)</span>
                </div>
                <span className="font-medium text-gray-800">4%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">Very Poor (1★)</span>
                </div>
                <span className="font-medium text-gray-800">1%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Branch Performance Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800">Branch Performance Metrics</h3>
            <Activity className="w-5 h-5 text-gray-600" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Branch</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Customers</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Rating</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Feedback</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Points Awarded</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Redemptions</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Performance</th>
                </tr>
              </thead>
              <tbody>
                {branchMetrics.map((branch, index) => {
                  const maxCustomers = Math.max(...branchMetrics.map(b => b.customers));
                  const performance = maxCustomers > 0 ? ((branch.rating / 5) * 50) + ((branch.customers / maxCustomers) * 50) : 0;
                  const performanceColor = performance >= 80 ? 'text-green-600' : performance >= 60 ? 'text-yellow-600' : 'text-red-600';
                  
                  return (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-800">{branch.name}</td>
                      <td className="py-3 px-4 text-gray-800">{branch.customers}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                          <span className="text-gray-800">{branch.rating.toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-800">{branch.feedback}</td>
                      <td className="py-3 px-4 text-gray-800">{branch.pointsAwarded.toLocaleString()}</td>
                      <td className="py-3 px-4 text-gray-800">{branch.redemptions}</td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${performanceColor}`}>
                          {performance.toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Key Insights */}
        <div className="mt-8">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Key Performance Insights</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700">Strengths</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Customer satisfaction rating above 4.0 across all branches</li>
                  <li>• Consistent month-over-month customer growth</li>
                  <li>• High engagement with points and rewards program</li>
                  <li>• Positive feedback trends in service quality</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700">Areas for Improvement</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Increase feedback response rates to get more customer insights</li>
                  <li>• Focus on converting new customers to loyal tier members</li>
                  <li>• Optimize peak hours operations based on customer patterns</li>
                  <li>• Enhance marketing campaigns for seasonal promotions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
