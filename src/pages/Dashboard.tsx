import { useState, useEffect, useCallback, FC, ElementType } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../supabaseClient';
import Layout from '@/Components/Layout';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Star, TrendingUp, Gift, ShoppingBag, History } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: ElementType;
    color: string;
    link?: string;
    linkText?: string;
}

const StatCard: FC<StatCardProps> = ({ title, value, icon: Icon, color, link, linkText }) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-red-100 flex flex-col justify-between h-full">
        <div>
            <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-black">{value}</div>
            <div className="text-sm text-gray-600">{title}</div>
        </div>
        {link && (
            <Link to={link} className="mt-4 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors">
                {linkText} &rarr;
            </Link>
        )}
    </div>
);

interface Reward {
    id: number;
    name: string;
    points_cost: number;
}

interface RecentActivity {
    description: string;
    points: number;
}

interface DashboardData {
    loyalty_points: number;
    rank: string;
    recent_activities: RecentActivity[];
    rewards_catalog: Reward[];
}

export default function Dashboard() {
    const { profile } = useAuth();
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [isDataLoading, setIsDataLoading] = useState(true);

    const fetchDashboardData = useCallback(async () => {
        if (!profile) return;
        setIsDataLoading(true);
        try {
            const { data, error } = await supabase.rpc('get_customer_dashboard_data', { p_user_id: profile.id });
            if (error) throw error;
            setDashboardData(data);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setIsDataLoading(false);
        }
    }, [profile]);

    useEffect(() => {
        if (profile) {
            fetchDashboardData();
        }
    }, [profile, fetchDashboardData]);

    if (isDataLoading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                </div>
            </Layout>
        );
    }

    if (!dashboardData) {
        return (
            <Layout>
                <div className="text-center py-20">
                    <h2 className="text-2xl font-semibold text-gray-700">Could not load dashboard data.</h2>
                    <p className="text-gray-500">Please try again later.</p>
                </div>
            </Layout>
        );
    }

    const { loyalty_points, rank, recent_activities, rewards_catalog } = dashboardData;

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-black">Welcome back, {profile?.full_name || 'User'}!</h1>
                    <p className="text-lg text-gray-600">Here’s a look at your loyalty journey.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard title="Loyalty Points" value={loyalty_points?.toLocaleString() || '0'} icon={Star} color="from-red-500 to-orange-500" link="/earn-points" linkText="Earn More" />
                    <StatCard title="Your Rank" value={rank || 'Newbie'} icon={TrendingUp} color="from-blue-500 to-sky-600" link="/leaderboard" linkText="View Ranks" />
                    <StatCard title="Available Rewards" value={rewards_catalog?.length || '0'} icon={Gift} color="from-purple-500 to-violet-600" link="/rewards" linkText="Redeem Now" />
                    <StatCard title="Activities Logged" value={recent_activities?.length || '0'} icon={History} color="from-teal-500 to-cyan-600" link="/earn-points#history" linkText="View History" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border-2 border-red-100">
                        <h2 className="text-2xl font-bold text-black mb-6">Recent Activity</h2>
                        {recent_activities?.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={recent_activities} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <XAxis dataKey="description" tick={{ fontSize: 12 }} />
                                    <YAxis />
                                    <Tooltip contentStyle={{ backgroundColor: 'white', borderRadius: '10px', border: '1px solid #ddd' }} />
                                    <Bar dataKey="points" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : <p className="text-gray-500 text-center py-10">No recent activity to display.</p>}
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-red-100">
                        <h2 className="text-2xl font-bold text-black mb-6">Top Rewards</h2>
                        {rewards_catalog?.length > 0 ? (
                           <ul className="space-y-4">
                                {rewards_catalog.slice(0, 5).map((reward: Reward) => (
                                    <li key={reward.id} className="flex items-center justify-between">
                                        <div className='flex items-center'>
                                            <div className='w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3'><ShoppingBag className='w-5 h-5 text-gray-500'/></div>
                                            <div>
                                                <p className="font-semibold text-gray-800">{reward.name}</p>
                                                <p className="text-sm text-red-600 font-bold">{reward.points_cost} pts</p>
                                            </div>
                                        </div>
                                        <Link to={`/rewards/${reward.id}`} className='text-xs font-semibold text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-full transition-colors'>View</Link>
                                    </li>
                                ))}
                           </ul>
                        ) : <p className="text-gray-500 text-center py-10">No rewards available right now.</p>}
                    </div>
                </div>
            </div>
        </Layout>
    );
}