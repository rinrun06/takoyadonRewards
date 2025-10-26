import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../supabaseClient';
import Layout from '../Components/Layout';
import { Link } from 'react-router-dom';

interface Reward {
  id: number;
  name: string;
  description: string;
  points_required: number;
  image_url: string;
}

interface Activity {
  id: number;
  activity_type: string;
  points_earned: number;
  created_at: string;
}

export default function LoyaltyDashboard() {
  const { profile, remoteConfigValues } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const fetchRewards = async () => {
      const { data, error } = await supabase.from('rewards').select('*');
      if (data) setRewards(data);
      if (error) console.error('Error fetching rewards:', error);
    };

    const fetchActivities = async () => {
      if (profile) {
        const { data, error } = await supabase
          .from('activities')
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false });
        if (data) setActivities(data);
        if (error) console.error('Error fetching activities:', error);
      }
    };

    fetchRewards();
    fetchActivities();
  }, [profile]);

  const loyaltyData = profile || { loyalty_points: 0 };
  // Make sure loyalty_points is not undefined or null
  const currentPoints = loyaltyData.loyalty_points || 0;
  const nextRewardTier = 500;
  const pointsToNextReward = Math.max(0, nextRewardTier - currentPoints);
  const progressPercentage = Math.min((currentPoints / nextRewardTier) * 100, 100);

  return (
    <Layout>
      <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="md:col-span-8">
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h1 className="text-3xl font-bold mb-4 text-gray-800">Your Loyalty Dashboard</h1>
              
              {/* Loyalty Points Card */}
              <div className="bg-white shadow-md rounded-lg mb-6 p-4">
                <h3 className="text-xl font-semibold text-gray-700">Loyalty Points</h3>
                <div className="flex items-center my-2">
                  <span className="text-yellow-400 text-3xl mr-2">★</span>
                  <p className="text-4xl font-bold text-gray-800">{currentPoints}</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                </div>
                <p className="text-sm text-gray-500 mt-1">{pointsToNextReward} points to next reward tier</p>
              </div>

              {/* Referral Card */}
              {remoteConfigValues?.referral_feature_enabled && (
                <div className="bg-white shadow-md rounded-lg mb-6 p-4">
                  <h3 className="text-xl font-semibold text-gray-700">Refer a Friend</h3>
                  <p className="text-gray-600 my-2">Earn points by referring your friends!</p>
                  <Link to="/referral" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2 inline-block">
                    Go to Referral Page
                  </Link>
                </div>
              )}

              {/* Recent Activity */}
              <div>
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Recent Activity</h2>
                <div className="space-y-2">
                  {activities.map(activity => (
                    <div key={activity.id} className="bg-white shadow-md rounded-lg p-4 flex justify-between items-center">
                      <div>
                        <p className="text-base font-medium text-gray-800">{activity.activity_type}</p>
                        <p className="text-sm text-gray-500">{new Date(activity.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-green-500 font-bold text-lg">+{activity.points_earned} PTS</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar for Rewards */}
          <div className="md:col-span-4">
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Available Rewards</h2>
              <div className="space-y-4">
                {rewards.map(reward => (
                  <div key={reward.id} className="bg-white shadow-md rounded-lg overflow-hidden">
                    {reward.image_url && <img src={reward.image_url} alt={reward.name} className="w-full h-32 object-cover"/>}
                    <div className="p-4">
                        <h3 className="text-xl font-semibold text-gray-800">{reward.name}</h3>
                        <p className="text-sm text-gray-500 my-1">{reward.description}</p>
                        <div className="flex items-center font-bold text-lg text-gray-800">
                            <span className="text-yellow-400 mr-1">★</span> {reward.points_required} PTS
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
