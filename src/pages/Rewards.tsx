import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import Layout from '../Components/Layout';
import { useAuth } from '../hooks/useAuth';
import { Gift, Star, ShoppingCart, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

interface Reward {
  id: number;
  name: string;
  description: string;
  points_cost: number;
  image_url: string;
}

interface Toast {
    id: number;
    type: 'success' | 'error';
    message: string;
}

export default function RewardsPage() {
  const { user, profile, setProfile } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redeemingId, setRedeemingId] = useState<number | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const fetchRewards = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .order('points_cost', { ascending: true });

    if (error) {
      console.error('Error fetching rewards:', error);
      setError('Could not load rewards. Please try again later.');
    } else {
      setRewards(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRewards();
  }, [fetchRewards]);

  const addToast = (type: 'success' | 'error', message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }

  const handleRedeem = async (reward: Reward) => {
    if (!user || !profile || profile.loyalty_points === undefined) {
        addToast('error', 'You must be logged in to redeem rewards.');
        return;
    }

    if (profile.loyalty_points < reward.points_cost) {
        addToast('error', 'You do not have enough points for this reward.');
        return;
    }

    setRedeemingId(reward.id);

    try {
        const { data, error } = await supabase.functions.invoke('redeem-reward', {
            body: {
                user_id: user.id,
                reward_id: reward.id,
            },
        });

        if (error) {
            throw new Error(`Function error: ${error.message}`);
        }

        if (!data.success) {
            throw new Error(data.message || 'An unknown error occurred during redemption.');
        }

        addToast('success', `Successfully redeemed: ${reward.name}!`);
        
        if (setProfile && profile.loyalty_points !== undefined) {
            setProfile({
                ...profile,
                loyalty_points: profile.loyalty_points - reward.points_cost,
            });
        }

    } catch (err: any) {
        console.error('Redemption process error:', err);
        addToast('error', err.message || 'Failed to redeem reward.');
    } finally {
        setRedeemingId(null);
    }
};


  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="fixed top-20 right-5 z-[100]">
            {toasts.map(toast => (
                <div key={toast.id} className={`flex items-center p-4 mb-4 rounded-lg shadow-lg text-white ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                    {toast.type === 'success' ? <CheckCircle className="w-6 h-6 mr-3"/> : <XCircle className="w-6 h-6 mr-3"/>}
                    {toast.message}
                </div>
            ))}
        </div>

        <div className="text-center mb-12">
            <Gift className="w-12 h-12 mx-auto text-red-600 mb-4" />
            <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">Rewards Catalog</h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">Spend your hard-earned points on exclusive rewards!</p>
        </div>

        {loading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl shadow-lg animate-pulse">
                        <div className="w-full h-48 bg-gray-200 rounded-t-2xl"></div>
                        <div className="p-6">
                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && !error && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {rewards.map(reward => {
                    const canAfford = profile && profile.loyalty_points !== undefined && profile.loyalty_points >= reward.points_cost;
                    const isRedeemingThis = redeemingId === reward.id;
                    return (
                        <div key={reward.id} className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col group">
                            <div className="relative">
                                <img src={reward.image_url} alt={reward.name} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                                <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center shadow-md">
                                    <Star className="w-4 h-4 mr-1.5" />
                                    {reward.points_cost.toLocaleString()}
                                </div>
                            </div>
                            <div className="p-6 flex flex-col flex-grow">
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{reward.name}</h3>
                                <p className="text-gray-600 flex-grow mb-6">{reward.description}</p>
                                <button 
                                    onClick={() => handleRedeem(reward)}
                                    disabled={!canAfford || isRedeemingThis}
                                    className="mt-auto w-full bg-red-600 text-white font-semibold py-3 rounded-lg hover:bg-red-700 transition-all flex items-center justify-center shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {isRedeemingThis ? (
                                        <><RefreshCw className="w-5 h-5 mr-2 animate-spin" /> Redeeming...</>
                                    ) : (
                                        <><ShoppingCart className="w-5 h-5 mr-2" /> Redeem</>
                                    )}
                                </button>
                                {!canAfford && <p className="text-center text-xs text-red-500 mt-2">Not enough points</p>}
                            </div>
                        </div>
                    )
                })}
            </div>
        )}
      </div>
    </Layout>
  );
}
