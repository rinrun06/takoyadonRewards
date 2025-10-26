
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../hooks/useAuth';
import Layout from '../Components/Layout';
import { ArrowDownLeft, ArrowUpRight, Award, Calendar, RefreshCw } from 'lucide-react';

interface PointTransaction {
  id: number;
  created_at: string;
  reason: string;
  points_change: number;
}

export default function PointsHistory() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;

      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('point_transactions')
        .select('id, created_at, reason, points_change')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching points history:', error);
        setError('Failed to load your points history. Please try again.');
      } else {
        setTransactions(data);
      }
      setLoading(false);
    };

    fetchTransactions();
  }, [user]);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
            <Award className="w-12 h-12 mx-auto text-amber-500 mb-4" />
            <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">Points History</h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">Track every point you've earned and spent.</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-10 h-10 text-gray-500 animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && transactions.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
                <h3 className="text-xl font-medium text-gray-900">No transactions yet!</h3>
                <p className="mt-2 text-md text-gray-500">Start earning points by participating in activities.</p>
            </div>
        )}

        {!loading && !error && transactions.length > 0 && (
            <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
                <ul className="divide-y divide-gray-200">
                    {transactions.map(tx => {
                        const isEarned = tx.points_change > 0;
                        return (
                            <li key={tx.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                                <div className="flex items-center space-x-4">
                                    <div className={`p-3 rounded-full ${isEarned ? 'bg-green-100' : 'bg-red-100'}`}>
                                        {isEarned ? (
                                            <ArrowUpRight className="w-6 h-6 text-green-600" />
                                        ) : (
                                            <ArrowDownLeft className="w-6 h-6 text-red-600" />
                                        )}
                                    </div>
                                    <div className="flex-grow">
                                        <p className="text-lg font-semibold text-gray-800">{tx.reason}</p>
                                        <div className="flex items-center space-x-3 text-sm text-gray-500 mt-1">
                                            <Calendar className="w-4 h-4" />
                                            <span>{new Date(tx.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                        </div>
                                    </div>
                                    <div className={`text-xl font-bold ${isEarned ? 'text-green-600' : 'text-red-600'}`}>
                                        {isEarned ? `+${tx.points_change}` : tx.points_change}
                                    </div>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            </div>
        )}
      </div>
    </Layout>
  );
}
