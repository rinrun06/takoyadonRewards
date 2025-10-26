import { useState, useEffect, useCallback, type FormEvent } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { 
  Megaphone, 
  Plus, 
  Calendar, 
  Users, 
  Target,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  ArrowLeft
} from "lucide-react";
import Layout from "@/Components/Layout";

interface CampaignRequest {
  id: number;
  name: string;
  description: string;
  type: string;
  status: string;
  start_date: string;
  end_date: string;
  target_audience: string;
  bonus_points?: number;
  discount_percentage?: number;
  created_at: string;
  creator_name: string;
}

export default function CampaignRequests() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<CampaignRequest[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "banner",
    start_date: "",
    end_date: "",
    target_audience: "all_customers",
    bonus_points: "",
    discount_percentage: ""
  });

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoadingData(true);
      const response = await fetch("/api/admin/campaigns");
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data);
      }
    } catch (error) {
      console.error("Failed to fetch campaigns:", error);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'franchise_admin') {
        navigate("/");
      } else {
        fetchCampaigns();
      }
    }
  }, [user, loading, navigate, fetchCampaigns]);

  const handleSubmitRequest = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch("/api/admin/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...formData,
          bonus_points: formData.bonus_points ? parseInt(formData.bonus_points) : null,
          discount_percentage: formData.discount_percentage ? parseInt(formData.discount_percentage) : null
        })
      });

      if (response.ok) {
        setShowRequestForm(false);
        setFormData({
          name: "",
          description: "",
          type: "banner",
          start_date: "",
          end_date: "",
          target_audience: "all_customers",
          bonus_points: "",
          discount_percentage: ""
        });
        fetchCampaigns();
      }
    } catch (error) {
      console.error("Failed to create campaign request:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return CheckCircle;
      case 'draft':
        return Clock;
      case 'paused':
        return AlertCircle;
      case 'completed':
        return CheckCircle;
      default:
        return Clock;
    }
  };

  if (loadingData) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

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
              <h1 className="text-3xl font-bold text-gray-800">Campaign Requests</h1>
              <p className="text-gray-600">Request new marketing campaigns from Super Admin</p>
            </div>
          </div>
          <button
            onClick={() => setShowRequestForm(true)}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Request
          </button>
        </div>

        {/* Campaign Request Form Modal */}
        {showRequestForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Request New Campaign</h2>
                <button
                  onClick={() => setShowRequestForm(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitRequest} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="banner">Banner Campaign</option>
                      <option value="points_bonus">Points Bonus</option>
                      <option value="discount">Discount Offer</option>
                      <option value="seasonal">Seasonal Campaign</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                  <select
                    value={formData.target_audience}
                    onChange={(e) => setFormData(prev => ({ ...prev, target_audience: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="all_customers">All Customers</option>
                    <option value="new_customers">New Customers</option>
                    <option value="loyal_customers">Loyal Customers</option>
                    <option value="inactive_customers">Inactive Customers</option>
                  </select>
                </div>

                {formData.type === 'points_bonus' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bonus Points</label>
                    <input
                      type="number"
                      value={formData.bonus_points}
                      onChange={(e) => setFormData(prev => ({ ...prev, bonus_points: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Enter bonus points amount"
                    />
                  </div>
                )}

                {formData.type === 'discount' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount Percentage</label>
                    <input
                      type="number"
                      value={formData.discount_percentage}
                      onChange={(e) => setFormData(prev => ({ ...prev, discount_percentage: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Enter discount percentage"
                      min="1"
                      max="100"
                    />
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowRequestForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Campaign Requests List */}
        <div className="space-y-6">
          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <Megaphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No Campaign Requests</h3>
              <p className="text-gray-500 mb-6">Start by creating your first campaign request</p>
              <button
                onClick={() => setShowRequestForm(true)}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Create Request
              </button>
            </div>
          ) : (
            campaigns.map((campaign) => {
              const StatusIcon = getStatusIcon(campaign.status);
              return (
                <div key={campaign.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-800">{campaign.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                          <StatusIcon className="w-3 h-3 inline mr-1" />
                          {campaign.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{campaign.description}</p>
                      
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          {new Date(campaign.start_date).toLocaleDateString()} - {new Date(campaign.end_date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Users className="w-4 h-4 mr-2" />
                          {campaign.target_audience.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Target className="w-4 h-4 mr-2" />
                          {campaign.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                      </div>

                      {(campaign.bonus_points || campaign.discount_percentage) && (
                        <div className="mt-3 flex space-x-4">
                          {campaign.bonus_points && (
                            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                              +{campaign.bonus_points} bonus points
                            </div>
                          )}
                          {campaign.discount_percentage && (
                            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                              {campaign.discount_percentage}% discount
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      Created by {campaign.creator_name} • {new Date(campaign.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex space-x-2">
                      <button className="flex items-center px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <FileText className="w-4 h-4 mr-1" />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
}
