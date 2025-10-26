import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import AdminLayout from './AdminLayout';
import { CheckCircle, XCircle, RefreshCw, ExternalLink } from 'lucide-react';

// Type definition for the activities, including user email
interface PendingActivity {
  id: number;
  created_at: string;
  user_id: string;
  activity_type: string;
  description: string;
  status: string;
  users: {
    email: string;
  } | null;
}

export default function ManageActivities() {
  const [activities, setActivities] = useState<PendingActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);

  const fetchPendingActivities = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('point_earning_activities')
      .select(`
        id,
        created_at,
        user_id,
        activity_type,
        description,
        status,
        users ( email )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching activities:', error);
      setError('Failed to load submissions. Please try again.');
    } else {
      setActivities(data as unknown as PendingActivity[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPendingActivities();
  }, []);

  const handleUpdateStatus = async (activity: PendingActivity, newStatus: 'approved' | 'rejected') => {
    setUpdating(activity.id);
    setError(null);

    try {
        if (newStatus === 'approved') {
            const { data, error } = await supabase.functions.invoke('approve-activity', {
                body: { activity_id: activity.id },
            });

            if (error) throw error;
            if (!data.success) throw new Error(data.message || 'Unknown error from function');

        } else { // 'rejected'
            const { error: updateError } = await supabase
                .from('point_earning_activities')
                .update({ status: 'rejected' })
                .eq('id', activity.id);

            if (updateError) throw updateError;
        }

        // On success, remove the activity from the local state
        setActivities(prev => prev.filter(a => a.id !== activity.id));

    } catch (error: any) {
        console.error('Error updating status:', error);
        setError(`Failed to update submission #${activity.id}: ${error.message}`);
    } finally {
        setUpdating(null);
    }
};


  return (
    <AdminLayout>
      <div className="p-6 md:p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Point Submissions</h1>

        {loading && (
          <div className="flex items-center justify-center py-10">
            <RefreshCw className="w-8 h-8 text-gray-500 animate-spin" />
          </div>
        )}

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}

        {!loading && activities.length === 0 && (
            <div className="text-center py-10 bg-white rounded-lg shadow-md">
                <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">All caught up!</h3>
                <p className="mt-1 text-sm text-gray-500">There are no pending submissions to review.</p>
            </div>
        )}

        {!loading && activities.length > 0 && (
            <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submission</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {activities.map(activity => (
                                <tr key={activity.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{activity.users?.email || 'Unknown User'}</div>
                                        <div className="text-xs text-gray-500">ID: {activity.user_id}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <a href={activity.description} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:text-blue-800 hover:underline">
                                            <span className="truncate max-w-xs">{activity.description}</span>
                                            <ExternalLink className="w-4 h-4 ml-2 shrink-0" />
                                        </a>
                                        <div className="text-xs text-gray-500 capitalize">Type: {activity.activity_type.replace('_', ' ')}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(activity.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        {updating === activity.id ? (
                                            <RefreshCw className="w-5 h-5 text-gray-500 animate-spin mx-auto" />
                                        ) : (
                                            <div className="flex items-center justify-center space-x-3">
                                                <button onClick={() => handleUpdateStatus(activity, 'rejected')} className="p-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition-all" title="Reject">
                                                    <XCircle className="w-5 h-5" />
                                                </button>
                                                <button onClick={() => handleUpdateStatus(activity, 'approved')} className="p-2 rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition-all" title="Approve">
                                                    <CheckCircle className="w-5 h-5" />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
      </div>
    </AdminLayout>
  );
}
