
import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import AdminLayout from '../../Components/Layout';
import { useForm, SubmitHandler } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Plus, Edit, Trash2, Check, X, Clock } from 'lucide-react';

// Interfaces
interface Campaign {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  scope: 'nationwide' | 'branch_specific';
  target_branch_id?: number;
  points_reward?: number;
  status: 'pending' | 'approved' | 'rejected' | 'lined_up' | 'active' | 'completed' | 'cancelled';
}

interface CampaignRequest {
    id: number;
    name: string;
    status: Campaign['status'];
    profiles: { full_name: string } | null;
    branches: { name: string } | null;
}

interface CampaignInputs {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  scope: 'nationwide' | 'branch_specific';
  target_branch_id?: number;
  points_reward?: number;
}

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [requests, setRequests] = useState<CampaignRequest[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  const { register, handleSubmit, setValue, reset, watch } = useForm<CampaignInputs>();
  const scope = watch('scope');

  useEffect(() => {
    fetchCampaignsAndRequests();
  }, []);

  const fetchCampaignsAndRequests = async () => {
    const { data: campaignsData, error: campaignsError } = await supabase.from('campaigns').select('*');
    const { data: requestsData, error: requestsError } = await supabase
      .from('campaign_requests')
      .select(`id, name, status, requesting_user_id, profiles ( full_name ), branches ( name )`)
      .eq('status', 'pending');

    if (campaignsError || requestsError) {
      toast.error('Failed to fetch data.');
      console.error('Error fetching data:', campaignsError || requestsError);
    } else {
      setCampaigns(campaignsData || []);
      setRequests(requestsData as unknown as CampaignRequest[] || []);
    }
  };

  const onSubmit: SubmitHandler<CampaignInputs> = async (data) => {
    const payload = {
        ...data,
        points_reward: data.points_reward ? Number(data.points_reward) : undefined,
        target_branch_id: data.scope === 'branch_specific' ? data.target_branch_id : undefined,
    };

    const { error } = editingCampaign
      ? await supabase.from('campaigns').update(payload).eq('id', editingCampaign.id)
      : await supabase.from('campaigns').insert([{ ...payload, status: 'approved' }]);

    if (error) {
      toast.error(`Failed to ${editingCampaign ? 'update' : 'create'} campaign.`);
    } else {
      toast.success(`Campaign ${editingCampaign ? 'updated' : 'created'} successfully!`);
      fetchCampaignsAndRequests();
      closeModal();
    }
  };
  
  const handleRequest = async (id: number, newStatus: Campaign['status']) => {
    const { error } = await supabase
      .from('campaign_requests')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update request status.');
    } else {
      toast.success('Request status updated!');
      fetchCampaignsAndRequests();
    }
  };

  const openModalForEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    Object.keys(campaign).forEach(key => {
        setValue(key as keyof CampaignInputs, campaign[key as keyof Campaign]);
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCampaign(null);
    reset();
  };

  const deleteCampaign = async (id: number) => {
    if (window.confirm('Are you sure?')) {
      const { error } = await supabase.from('campaigns').delete().eq('id', id);
      if (error) toast.error('Delete failed.');
      else {
        toast.success('Deleted!');
        fetchCampaignsAndRequests();
      }
    }
  };

  const getStatusChip = (status: Campaign['status']) => {
    const baseClasses = "px-3 py-1 text-xs font-medium rounded-full inline-block";
    switch (status) {
        case 'active': return `${baseClasses} bg-green-100 text-green-800`;
        case 'pending': return `${baseClasses} bg-yellow-100 text-yellow-800`;
        case 'approved': return `${baseClasses} bg-blue-100 text-blue-800`;
        case 'rejected': return `${baseClasses} bg-red-100 text-red-800`;
        case 'completed': return `${baseClasses} bg-gray-100 text-gray-800`;
        case 'lined_up': return `${baseClasses} bg-indigo-100 text-indigo-800`;
        default: return `${baseClasses} bg-gray-200 text-gray-800`;
    }
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Campaign Management</h1>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary bg-red-600 text-white flex items-center justify-center rounded-lg px-4 py-2 shadow-md hover:bg-red-700 transition-colors">
            <Plus className="mr-2 h-5 w-5" /> Create Campaign
          </button>
        </div>

        {/* Pending Requests */}
        <div className="mb-10">
          <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-700">Pending Requests</h2>
          {requests.length > 0 ? (
            <div className="space-y-4 md:hidden">
              {requests.map((req) => (
                <div key={req.id} className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-bold text-lg text-gray-800">{req.name}</h3>
                  <p className="text-sm text-gray-600">Requested by: {req.profiles?.full_name || 'N/A'}</p>
                  <p className="text-sm text-gray-600">Branch: {req.branches?.name || 'N/A'}</p>
                  <div className="flex justify-end space-x-2 mt-3">
                    <button onClick={() => handleRequest(req.id, 'approved')} className="p-2 bg-green-100 text-green-600 rounded-md hover:bg-green-200"><Check className="h-4 w-4"/></button>
                    <button onClick={() => handleRequest(req.id, 'rejected')} className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"><X className="h-4 w-4"/></button>
                    <button onClick={() => handleRequest(req.id, 'lined_up')} className="p-2 bg-indigo-100 text-indigo-600 rounded-md hover:bg-indigo-200"><Clock className="h-4 w-4"/></button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="md:hidden text-center py-4 text-gray-500">No pending requests.</div>
          )}
          <div className="hidden md:block bg-white shadow-md rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.length > 0 ? requests.map((req) => (
                  <tr key={req.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{req.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{req.profiles?.full_name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{req.branches?.name || 'Nationwide'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 space-x-2 text-right">
                      <button onClick={() => handleRequest(req.id, 'approved')} className="font-medium text-green-600 hover:text-green-800">Approve</button>
                      <button onClick={() => handleRequest(req.id, 'rejected')} className="font-medium text-red-600 hover:text-red-800">Reject</button>
                      <button onClick={() => handleRequest(req.id, 'lined_up')} className="font-medium text-indigo-600 hover:text-indigo-800">Line Up</button>
                    </td>
                  </tr>
                )) : <tr><td colSpan={4} className="text-center py-4 text-gray-500">No pending requests.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* All Campaigns */}
        <div>
          <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-700">All Campaigns</h2>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:hidden">
              {campaigns.map(campaign => (
                <div key={campaign.id} className="bg-white p-4 rounded-lg shadow">
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg text-gray-800 mb-2 flex-1 pr-2">{campaign.name}</h3>
                        <span className={getStatusChip(campaign.status)}>{campaign.status}</span>
                    </div>
                    <p className="text-sm text-gray-600 capitalize">Scope: {campaign.scope.replace('_', ' ')}</p>
                     <p className="text-sm text-gray-500">{new Date(campaign.start_date).toLocaleDateString()} - {new Date(campaign.end_date).toLocaleDateString()}</p>
                    <div className="flex justify-end space-x-2 mt-4">
                        <button onClick={() => openModalForEdit(campaign)} className="p-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"><Edit className="h-4 w-4"/></button>
                        <button onClick={() => deleteCampaign(campaign.id)} className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"><Trash2 className="h-4 w-4"/></button>
                    </div>
                </div>
              ))}
            </div>
            <div className="hidden md:block bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scope</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {campaigns.map(campaign => (
                            <tr key={campaign.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{campaign.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap"><span className={getStatusChip(campaign.status)}>{campaign.status}</span></td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">{campaign.scope.replace('_', ' ')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(campaign.start_date).toLocaleDateString()} - {new Date(campaign.end_date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2 text-right">
                                    <button onClick={() => openModalForEdit(campaign)} className="p-2 text-blue-600 hover:text-blue-800 rounded-md hover:bg-blue-50"><Edit className="h-4 w-4"/></button>
                                    <button onClick={() => deleteCampaign(campaign.id)} className="p-2 text-red-600 hover:text-red-800 rounded-md hover:bg-red-50"><Trash2 className="h-4 w-4"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
                <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">{editingCampaign ? 'Edit' : 'Create'} Campaign</h2>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="space-y-4">
                            <input {...register('name')} placeholder="Campaign Name" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"/>
                            <textarea {...register('description')} placeholder="Description" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" rows={3}/>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <input type="date" {...register('start_date')} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"/>
                              <input type="date" {...register('end_date')} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"/>
                            </div>
                            <select {...register('scope')} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500">
                                <option value="nationwide">Nationwide</option>
                                <option value="branch_specific">Branch Specific</option>
                            </select>
                            {scope === 'branch_specific' && <input type="number" {...register('target_branch_id')} placeholder="Branch ID" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"/>}
                            <input type="number" {...register('points_reward')} placeholder="Points Reward" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"/>
                        </div>
                        <div className="flex justify-end space-x-3 mt-6">
                            <button type="button" onClick={closeModal} className="px-5 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">Cancel</button>
                            <button type="submit" className="px-5 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700">{editingCampaign ? 'Save Changes' : 'Create'}</button>
                        </div>
                    </form>
                </div>
            </div>
        )}
      </div>
    </AdminLayout>
  );
}
