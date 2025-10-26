
import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Layout from '../../Components/Layout';
import { Mail, Star, Camera, Edit, LogOut, Check, X, QrCode, Gift, ShoppingBag, Clock, MessageSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Activity {
  id: number;
  created_at: string;
  activity_type: string;
  description: string;
  points_change: number;
}

export default function Profile() {
  const { session, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || null);
  const [uploading, setUploading] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    if (!loading && !session) {
      navigate('/login');
    }
    if (profile) {
      setFullName(profile.full_name || '');
      setAvatarUrl(profile.avatar_url || null);
      fetchActivities();
    }
  }, [session, profile, loading, navigate]);

  const fetchActivities = async () => {
    if (!profile) return;
    const { data, error } = await supabase
      .from('points_history')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) {
        console.error('Error fetching activities:', error)
    } else {
        setActivities(data || []);
    }
  }

  const handleUpdateProfile = async () => {
    if (!profile) return;
    const { error } = await supabase
      .from('users')
      .update({ full_name: fullName })
      .eq('id', profile.id);

    if (error) {
      toast.error('Failed to update profile.');
    } else {
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      refreshProfile(); // Refresh profile data from hook
    }
  };

  const handleUploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile) return;
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      refreshProfile(); // Refresh profile data from hook
      toast.success('Avatar updated!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  }

  const getActivityIcon = (type: string) => {
      switch(type) {
          case 'purchase': return <ShoppingBag className="w-4 h-4 text-blue-500" />;
          case 'redemption': return <Gift className="w-4 h-4 text-green-500" />;
          case 'feedback': return <Clock className="w-4 h-4 text-purple-500" />;
          default: return <Star className="w-4 h-4 text-yellow-500" />;
      }
  }

  if (loading || !profile) {
    return (
        <Layout>
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
        </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-center sm:space-x-8 mb-8">
            <div className="relative">
                <img 
                    src={avatarUrl || `https://api.dicebear.com/6.x/initials/svg?seed=${profile.email}`}
                    alt="Avatar"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
                />
                <label htmlFor="avatar-upload" className="absolute bottom-1 right-1 bg-red-600 p-2 rounded-full cursor-pointer hover:bg-red-700 transition-colors">
                    <Camera className="w-5 h-5 text-white"/>
                    <input id="avatar-upload" type="file" accept="image/*" onChange={handleUploadAvatar} disabled={uploading} className="hidden"/>
                </label>
            </div>
            <div className="text-center sm:text-left mt-4 sm:mt-0">
              {isEditing ? (
                <input 
                    type="text" 
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="text-3xl font-bold text-gray-800 bg-gray-100 rounded-lg px-2 py-1" 
                />
              ) : (
                <h1 className="text-4xl font-bold text-gray-800">{fullName}</h1>
              )}
              <p className="text-gray-600 mt-1 flex items-center justify-center sm:justify-start"><Mail className="w-4 h-4 mr-2"/>{profile.email}</p>
              <div className="mt-4 flex items-center justify-center sm:justify-start space-x-4">
                <div className="flex items-center text-lg font-bold text-yellow-500">
                    <Star className="w-6 h-6 mr-2 fill-current"/>
                    {profile.points?.toLocaleString() || 0} Points
                </div>
                {isEditing ? (
                    <div className="flex space-x-2">
                        <button onClick={handleUpdateProfile} className="p-2 bg-green-100 rounded-full text-green-600 hover:bg-green-200"><Check className="w-5 h-5"/></button>
                        <button onClick={() => setIsEditing(false)} className="p-2 bg-red-100 rounded-full text-red-600 hover:bg-red-200"><X className="w-5 h-5"/></button>
                    </div>
                ) : (
                    <button onClick={() => setIsEditing(true)} className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200"><Edit className="w-5 h-5"/></button>
                )}
              </div>
            </div>
          </div>

          {/* QR Code and Actions */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-gray-50 p-6 rounded-2xl text-center">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Your Loyalty QR Code</h2>
                <div className="flex justify-center mb-4">
                  {/* In a real app, this would be a dynamically generated QR code */}
                  <QrCode className="w-32 h-32 text-gray-800" />
                </div>
                <p className="text-gray-600 text-sm">Present this code at any branch to earn points on your purchases or redeem rewards.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Actions</h2>
                <div className="space-y-3">
                    <button onClick={() => navigate('/rewards')} className="w-full text-left p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center"> <Gift className="w-5 h-5 mr-3 text-red-500"/> View Rewards</button>
                    <button onClick={() => navigate('/feedback')} className="w-full text-left p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center"> <MessageSquare className="w-5 h-5 mr-3 text-blue-500"/> Give Feedback</button>
                    <button onClick={handleLogout} className="w-full text-left p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center"> <LogOut className="w-5 h-5 mr-3 text-gray-500"/> Logout</button>
                </div>
              </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Activity</h2>
            <div className="space-y-4">
                {activities.length > 0 ? activities.map(activity => (
                    <div key={activity.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="p-2 bg-gray-100 rounded-full mr-4">
                                {getActivityIcon(activity.activity_type)}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800 capitalize">{activity.description}</p>
                                <p className="text-sm text-gray-500">{new Date(activity.created_at).toLocaleString()}</p>
                            </div>
                        </div>
                        <p className={`font-bold ${activity.points_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {activity.points_change >= 0 ? '+' : ''}{activity.points_change} pts
                        </p>
                    </div>
                )) : (
                    <p className="text-gray-500">No recent activity.</p>
                )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
