import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Layout from './Layout';

const RoleBasedRedirect = () => {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600"></div>
        </div>
      </Layout>
    );
  }
  
  switch (profile?.role) {
    case 'super_admin':
      return <Navigate to="/admin/super-admin" replace />;
    case 'franchise_admin':
      return <Navigate to="/admin/franchise-admin" replace />;
    case 'branch_staff':
      return <Navigate to="/admin/branch-staff" replace />;
    case 'customer':
    default:
      return <Navigate to="/home" replace />;
  }
};

export default RoleBasedRedirect;
