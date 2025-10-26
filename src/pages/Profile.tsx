import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../supabaseClient";
import { 
  Star, 
  Gift, 
  ArrowLeft,
  User as UserIcon,
  Award,
  Calendar,
  AtSign,
  Save,
  Phone,
  LogOut
} from "lucide-react";
import Layout from "../Components/Layout";
import { Link, useNavigate } from "react-router-dom";
import FileUpload from "../Components/FileUpload";

interface ProfileData {
    display_name: string;
    email: string;
    phone_number: string | null;
    loyalty_points: number;
    role: string;
    created_at: string;
    date_of_birth: string | null;
    avatar_url: string | null;
}

interface Transaction {
    id: number;
    created_at: string;
    points_change: number;
    reason: string;
}

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-md mx-auto">
        <h2 className="text-xl font-bold text-black mb-6">{title}</h2>
        {children}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">&times;</button>
      </div>
    </div>
  );
};

export default function ProfilePage() {
  const { session, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  
  const [userProfile, setUserProfile] = useState<ProfileData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState({ display_name: '', date_of_birth: '', phone_number: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && profile) {
      setUserProfile(profile as ProfileData);
      setEditingProfile({ 
        display_name: profile.display_name || '',
        date_of_birth: profile.date_of_birth || '',
        phone_number: profile.phone_number || '',
      });
      setAvatarUrl(profile.avatar_url || null);
      
      if(session?.user.id) {
        fetchTransactions(session.user.id);
      }
    } else if (!loading && !session) {
        navigate('/customer/login')
    }
  }, [session, profile, loading, navigate]);

  const fetchTransactions = async (userId: string) => {
    const { data, error } = await supabase
        .from('point_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching transactions:", error)
    } else {
        setTransactions(data);
    }
  };
  
  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if(!session?.user) return;

    setIsSaving(true);
    const { error } = await supabase
        .from('users')
        .update({
            display_name: editingProfile.display_name,
            date_of_birth: editingProfile.date_of_birth,
            phone_number: editingProfile.phone_number,
        })
        .eq('id', session.user.id)
    
    if(error) {
        console.error("Error updating profile:", error)
    } else {
        if (refreshProfile) refreshProfile();
        console.log("Profile updated successfully");
    }
    
    setIsSaving(false);
    setIsEditModalOpen(false);
  };

  const handleAvatarUploadSuccess = async (uploadedFilePath: string) => {
    if (!session?.user) return;
    
    const { data } = supabase.storage.from('avatars').getPublicUrl(uploadedFilePath);
    const publicUrl = data.publicUrl;

    setAvatarUrl(publicUrl);

    const { error } = await supabase
      .from('users')
      .update({ avatar_url: publicUrl })
      .eq('id', session.user.id);

    if (error) {
      console.error("Error updating avatar URL:", error);
      setAvatarUrl(profile?.avatar_url || null);
    } else {
        if (refreshProfile) refreshProfile();
        console.log("Avatar URL updated successfully!");
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  }

  const getLoyaltyTier = (points: number) => {
      if (points >= 1000) return 'Gold';
      if (points >= 500) return 'Silver';
      return 'Bronze';
  }

  if (loading || !userProfile) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      </Layout>
    );
  }

  const loyaltyTier = getLoyaltyTier(userProfile.loyalty_points);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/" className="flex items-center text-gray-500 hover:text-black transition-colors mb-8">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Link>

        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8 border-t-4 border-red-500">
            <div className="flex flex-col sm:flex-row items-center sm:space-x-6">
                <img src={avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.display_name)}&background=random`} alt="Profile" className="w-28 h-28 rounded-full border-4 border-white shadow-md object-cover" />
                <div className="text-center sm:text-left mt-4 sm:mt-0">
                    <h1 className="text-3xl font-bold text-black">{userProfile.display_name}</h1>
                    <p className="text-gray-600">{userProfile.email}</p>
                    <button onClick={() => setIsEditModalOpen(true)} className="mt-3 px-5 py-2 text-sm font-semibold text-red-600 border-2 border-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all duration-300">Edit Profile</button>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-md"><div className="flex items-center justify-between"><div><div className="text-3xl font-bold text-black">{userProfile.loyalty_points.toLocaleString()}</div><div className="text-sm text-gray-600">Loyalty Points</div></div><div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white"><Star className="w-6 h-6" /></div></div></div>
            <div className="bg-white rounded-2xl p-6 shadow-md"><div className="flex items-center justify-between"><div><div className="text-3xl font-bold text-black capitalize">{loyaltyTier}</div><div className="text-sm text-gray-600">Loyalty Tier</div></div><div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-full flex items-center justify-center text-white"><Award className="w-6 h-6" /></div></div></div>
            <div className="bg-white rounded-2xl p-6 shadow-md"><div className="flex items-center justify-between"><div><div className="text-3xl font-bold text-black">{profile?.total_visits || 0}</div><div className="text-sm text-gray-600">Total Visits</div></div><div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-sky-500 rounded-full flex items-center justify-center text-white"><UserIcon className="w-6 h-6" /></div></div></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold text-black mb-6">Profile Details</h2>
                <div className="bg-white rounded-2xl p-6 shadow-md space-y-4">
                    <div className="flex items-center"><AtSign className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" /><p className="text-gray-700 break-all">{userProfile.email}</p></div>
                    <div className="flex items-center"><Phone className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" /><p className="text-gray-700">{userProfile.phone_number || 'Not provided'}</p></div>
                    <div className="flex items-center"><Calendar className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" /><p className="text-gray-700">{userProfile.date_of_birth || 'Not provided'}</p></div>
                    <button onClick={handleLogout} className="w-full mt-4 flex items-center justify-center px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all"><LogOut className="w-5 h-5 mr-2"/>Logout</button>
                </div>
            </div>
            <div className="lg:col-span-3">
                <h2 className="text-2xl font-bold text-black mb-6">Points History</h2>
                <div className="bg-white rounded-2xl p-6 shadow-md space-y-4 max-h-96 overflow-y-auto">
                {transactions.length > 0 ? transactions.map(item => (
                    <div key={item.id} className="flex items-center justify-between border-b pb-3 last:border-b-0">
                    <div className="flex items-center">
                        {item.points_change > 0 ? <Star className="w-6 h-6 text-green-500 mr-4" /> : <Gift className="w-6 h-6 text-red-500 mr-4" />}
                        <div><p className="font-semibold text-gray-800">{item.reason}</p><p className="text-sm text-gray-500">{new Date(item.created_at).toLocaleString()}</p></div>
                    </div>
                    <div className={`font-bold text-lg ${item.points_change > 0 ? 'text-green-600' : 'text-red-600'}`}>{item.points_change > 0 ? '+' : ''}{item.points_change} pts</div>
                    </div>
                )) : (
                    <p className="text-gray-500 text-center py-10">Your points history will appear here.</p>
                )}
                </div>
            </div>
        </div>
      </div>
      
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Your Profile">
        <div className="space-y-6">
            <form onSubmit={handleProfileUpdate}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input type="text" id="displayName" value={editingProfile.display_name} onChange={(e) => setEditingProfile(prev => ({ ...prev, display_name: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input type="tel" id="phone" value={editingProfile.phone_number || ''} onChange={(e) => setEditingProfile(prev => ({ ...prev, phone_number: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" />
                </div>
                <div>
                  <label htmlFor="birthday" className="block text-sm font-medium text-gray-700 mb-2">Birthday</label>
                  <input type="date" id="birthday" value={editingProfile.date_of_birth || ''} onChange={(e) => setEditingProfile(prev => ({ ...prev, date_of_birth: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" />
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">Cancel</button>
                <button type="submit" disabled={isSaving} className="flex items-center justify-center px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50">
                  {isSaving ? 'Saving...' : <><Save className="w-5 h-5 mr-2" />Save Changes</>}
                </button>
              </div>
            </form>
            <div>
                <h3 className="text-lg font-medium text-gray-900 border-t pt-6 mt-6">Profile Picture</h3>
                <FileUpload 
                    bucketName="avatars" 
                    filePath={`${session?.user.id}`}
                    onUploadSuccess={handleAvatarUploadSuccess}
                    label="Update your avatar"
                />
            </div>
        </div>
      </Modal>
    </Layout>
  );
}
