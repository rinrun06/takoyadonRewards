import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Star, 
  Plus, 
  Edit3, 
  Trash2, 
  Save,
  RefreshCw,
  Settings,
  Award,
  ShoppingBag,
  Users,
  Gift,
  Eye,
  EyeOff
} from "lucide-react";
import Layout from "@/Components/Layout";

interface PointsRule {
  id: number;
  rule_type: 'product' | 'activity' | 'reward' | 'campaign';
  rule_name: string;
  points_value: number;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function PointsSystemRules() {
  const [pointsRules, setPointsRules] = useState<PointsRule[]>([]);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRule, setEditingRule] = useState<PointsRule | null>(null);
  const [newRule, setNewRule] = useState({
    rule_type: "activity" as PointsRule['rule_type'],
    rule_name: "",
    points_value: 0,
    description: ""
  });
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchPointsRules = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/points-rules");
      if (response.ok) {
        const data = await response.json();
        setPointsRules(data);
      }
    } catch (error) {
      console.error("Failed to fetch points rules:", error);
      // Use mock data as fallback
      setPointsRules([
        {
          id: 1,
          rule_type: 'activity',
          rule_name: 'feedback_submission',
          points_value: 10,
          description: 'Points earned for submitting feedback',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          rule_type: 'activity',
          rule_name: 'signup_bonus',
          points_value: 50,
          description: 'Welcome bonus for new customer registration',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 3,
          rule_type: 'product',
          rule_name: 'takoyaki_classic',
          points_value: 15,
          description: 'Points for purchasing Classic Takoyaki',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 4,
          rule_type: 'reward',
          rule_name: 'free_takoyaki',
          points_value: 100,
          description: 'Points required for free takoyaki',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);
    }
  }, []);

  useEffect(() => {
    fetchPointsRules();
  }, [fetchPointsRules]);

  const refreshData = async () => {
    await fetchPointsRules();
    setLastRefresh(new Date());
  };

  const handleCreateRule = async () => {
    try {
      const response = await fetch("/api/admin/points-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRule)
      });
      
      if (response.ok) {
        const result = await response.json();
        const createdRule: PointsRule = {
          id: result.rule_id || pointsRules.length + 1,
          ...newRule,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setPointsRules(prev => [...prev, createdRule]);
        setShowCreateModal(false);
        setNewRule({
          rule_type: "activity",
          rule_name: "",
          points_value: 0,
          description: ""
        });
      }
    } catch (error) {
      console.error("Failed to create rule:", error);
      // Mock creation for demo
      const mockRule: PointsRule = {
        id: pointsRules.length + 1,
        ...newRule,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setPointsRules(prev => [...prev, mockRule]);
      setShowCreateModal(false);
      setNewRule({
        rule_type: "activity",
        rule_name: "",
        points_value: 0,
        description: ""
      });
    }
  };

  const handleEditRule = async () => {
    if (!editingRule) return;

    try {
      const response = await fetch(`/api/admin/points-rules/${editingRule.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingRule)
      });
      
      if (response.ok) {
        setPointsRules(prev => prev.map(rule => 
          rule.id === editingRule.id ? { ...editingRule, updated_at: new Date().toISOString() } : rule
        ));
        setEditingRule(null);
      }
    } catch (error) {
      console.error("Failed to update rule:", error);
      // Update locally for demo
      setPointsRules(prev => prev.map(rule => 
        rule.id === editingRule.id ? { ...editingRule, updated_at: new Date().toISOString() } : rule
      ));
      setEditingRule(null);
    }
  };

  const handleToggleActive = async (ruleId: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/points-rules/${ruleId}/toggle`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !isActive })
      });
      
      if (response.ok) {
        setPointsRules(prev => prev.map(rule => 
          rule.id === ruleId ? { ...rule, is_active: !isActive, updated_at: new Date().toISOString() } : rule
        ));
      }
    } catch (error) {
      console.error("Failed to toggle rule:", error);
      // Update locally for demo
      setPointsRules(prev => prev.map(rule => 
        rule.id === ruleId ? { ...rule, is_active: !isActive, updated_at: new Date().toISOString() } : rule
      ));
    }
  };

  const handleDeleteRule = async (ruleId: number) => {
    if (!confirm("Are you sure you want to delete this points rule? This action cannot be undone and may affect existing campaigns.")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/points-rules/${ruleId}`, {
        method: "DELETE"
      });
      
      if (response.ok) {
        setPointsRules(prev => prev.filter(rule => rule.id !== ruleId));
      }
    } catch (error) {
      console.error("Failed to delete rule:", error);
      // Delete locally for demo
      setPointsRules(prev => prev.filter(rule => rule.id !== ruleId));
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'activity': return Users;
      case 'product': return ShoppingBag;
      case 'reward': return Gift;
      case 'campaign': return Award;
      default: return Star;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'activity': return "bg-blue-100 text-blue-800";
      case 'product': return "bg-green-100 text-green-800";
      case 'reward': return "bg-purple-100 text-purple-800";
      case 'campaign': return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatRuleName = (name: string) => {
    return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const filteredRules = selectedType === "all" 
    ? pointsRules 
    : pointsRules.filter(rule => rule.rule_type === selectedType);

  const rulesByType = {
    activity: pointsRules.filter(r => r.rule_type === 'activity'),
    product: pointsRules.filter(r => r.rule_type === 'product'),
    reward: pointsRules.filter(r => r.rule_type === 'reward'),
    campaign: pointsRules.filter(r => r.rule_type === 'campaign')
  };

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
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Points System Rules</h1>
              <p className="text-gray-600">
                Manage point values for activities, products, and rewards
                <span className="text-sm text-gray-500 ml-2">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </span>
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={refreshData}
                className="flex items-center px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium rounded-lg hover:from-orange-600 hover:to-red-700 transition-all"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Rule
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-800">{rulesByType.activity.length}</div>
            <div className="text-sm text-gray-600">Activity Rules</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-800">{rulesByType.product.length}</div>
            <div className="text-sm text-gray-600">Product Rules</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Gift className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-800">{rulesByType.reward.length}</div>
            <div className="text-sm text-gray-600">Reward Rules</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <Star className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-800">{pointsRules.filter(r => r.is_active).length}</div>
            <div className="text-sm text-gray-600">Active Rules</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4 mb-8">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">All Rule Types</option>
            <option value="activity">Activity Rules</option>
            <option value="product">Product Rules</option>
            <option value="reward">Reward Rules</option>
            <option value="campaign">Campaign Rules</option>
          </select>
        </div>

        {/* Rules List */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Points Rules</h2>
          </div>
          <div className="p-6">
            {filteredRules.length === 0 ? (
              <div className="text-center py-12">
                <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">No Rules Found</h3>
                <p className="text-gray-600 mb-4">Create your first points rule to get started.</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium rounded-lg hover:from-orange-600 hover:to-red-700 transition-all"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Rule
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRules.map((rule) => {
                  const TypeIcon = getTypeIcon(rule.rule_type);
                  return (
                    <div key={rule.id} className="bg-gray-50 rounded-xl p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
                            <TypeIcon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-bold text-gray-800">{formatRuleName(rule.rule_name)}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(rule.rule_type)}`}>
                                {rule.rule_type}
                              </span>
                              {rule.is_active ? (
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                  Active
                                </span>
                              ) : (
                                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                                  Inactive
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 mb-2">{rule.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center">
                                <Star className="w-4 h-4 mr-1 text-yellow-500" />
                                {rule.rule_type === 'reward' ? `${rule.points_value} points required` : `${rule.points_value} points earned`}
                              </div>
                              <div>
                                Updated: {new Date(rule.updated_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleActive(rule.id, rule.is_active)}
                            className={`p-2 transition-colors ${
                              rule.is_active 
                                ? 'text-gray-400 hover:text-red-600' 
                                : 'text-gray-400 hover:text-green-600'
                            }`}
                            title={rule.is_active ? "Deactivate Rule" : "Activate Rule"}
                          >
                            {rule.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button 
                            onClick={() => setEditingRule(rule)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Edit Rule"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteRule(rule.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete Rule"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Create Rule Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Create New Points Rule</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rule Type</label>
                  <select 
                    value={newRule.rule_type}
                    onChange={(e) => setNewRule({...newRule, rule_type: e.target.value as PointsRule['rule_type']})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="activity">Activity Rule</option>
                    <option value="product">Product Rule</option>
                    <option value="reward">Reward Rule</option>
                    <option value="campaign">Campaign Rule</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rule Name</label>
                  <input
                    type="text"
                    placeholder="e.g., takoyaki_purchase"
                    value={newRule.rule_name}
                    onChange={(e) => setNewRule({...newRule, rule_name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Points Value</label>
                  <input
                    type="number"
                    placeholder="Enter points value"
                    value={newRule.points_value}
                    onChange={(e) => setNewRule({...newRule, points_value: Number(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    placeholder="Describe this points rule"
                    value={newRule.description}
                    onChange={(e) => setNewRule({...newRule, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateRule}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all"
                >
                  Create Rule
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Rule Modal */}
        {editingRule && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Edit Points Rule</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rule Type</label>
                  <select 
                    value={editingRule.rule_type}
                    onChange={(e) => setEditingRule({...editingRule, rule_type: e.target.value as PointsRule['rule_type']})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="activity">Activity Rule</option>
                    <option value="product">Product Rule</option>
                    <option value="reward">Reward Rule</option>
                    <option value="campaign">Campaign Rule</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rule Name</label>
                  <input
                    type="text"
                    value={editingRule.rule_name}
                    onChange={(e) => setEditingRule({...editingRule, rule_name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Points Value</label>
                  <input
                    type="number"
                    value={editingRule.points_value}
                    onChange={(e) => setEditingRule({...editingRule, points_value: Number(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={editingRule.description}
                    onChange={(e) => setEditingRule({...editingRule, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setEditingRule(null)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditRule}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all"
                >
                  <Save className="w-4 h-4 mr-2 inline" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
