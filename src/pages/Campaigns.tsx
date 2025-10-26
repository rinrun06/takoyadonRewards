
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../hooks/useAuth';

interface Campaign {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  scope: 'nationwide' | 'branch_specific';
  points_reward?: number;
  status: string;
  image_url?: string;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const { profile } = useAuth();

  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!profile) return;

      const query = supabase
        .from('campaigns')
        .select('*')
        .eq('status', 'active')
        .or(`scope.eq.nationwide,and(scope.eq.branch_specific,target_branch_id.eq.${profile.id})`);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching campaigns:', error);
      } else {
        setCampaigns(data || []);
      }
    };

    fetchCampaigns();
  }, [profile]);

  const getStatusClass = (status: string) => {
    return status === 'active' ? 'bg-green-500' : 'bg-red-500';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-red-600">Active Campaigns</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:scale-105 flex flex-col">
            <img
              className="w-full h-48 object-cover"
              src={campaign.image_url || 'https://via.placeholder.com/300'}
              alt={campaign.name}
            />
            <div className="p-6 flex-grow">
              <h2 className="text-2xl font-bold mb-2">{campaign.name}</h2>
              <p className="text-gray-700 mb-4">{campaign.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm">{`${campaign.points_reward || 0} Points`}</div>
                <div className={`px-3 py-1 ${getStatusClass(campaign.status)} text-white rounded-full text-sm`}>{campaign.status}</div>
              </div>
              <p className="text-sm text-gray-500">
                {new Date(campaign.start_date).toLocaleDateString()} - {new Date(campaign.end_date).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
