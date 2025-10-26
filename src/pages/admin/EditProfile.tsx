import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ArrowLeft, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '../../Components/Layout';

export default function EditProfilePage() {
  const { profile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [profilePicture, setProfilePicture] = useState(profile?.avatar_url || null);

  const handlePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfilePicture(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const getDashboardLink = () => {
      if(!profile) return "/";
      switch(profile.role) {
          case 'super_admin': return '/admin/super-admin';
          case 'franchise_admin': return '/admin/franchise-admin';
          case 'branch_staff': return '/admin/branch-staff';
          default: return '/';
      }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would handle form submission to your backend here
    console.log({ displayName, email, profilePicture });
    alert('Profile updated successfully!');
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to={getDashboardLink()} className="flex items-center text-gray-600 hover:text-black mb-8">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Link>
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h1 className="text-4xl font-bold text-black mb-8">Edit Profile</h1>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-8 mb-8">
              <div className="relative mb-4 sm:mb-0">
                <img
                  src={profilePicture || 'https://via.placeholder.com/150'}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover"
                />
                <label htmlFor="profile-picture-upload" className="absolute bottom-0 right-0 p-2 bg-black text-white rounded-full cursor-pointer hover:bg-gray-800">
                  <Camera className="w-5 h-5" />
                  <input id="profile-picture-upload" type="file" className="hidden" onChange={handlePictureUpload} accept="image/*" />
                </label>
              </div>
              <div className="flex-grow w-full">
                <div className="mb-4">
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">Display Name</label>
                  <input id="displayName" type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" />
                </div>
              </div>
            </div>
            <div className="text-right">
              <button type="submit" className="px-8 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-lg">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
