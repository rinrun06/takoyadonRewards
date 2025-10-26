import { useAuth } from '../hooks/useAuth';
import Dashboard from './Dashboard';
import Home from './Home';
import Layout from '@/Components/Layout';

export default function IndexPage() {
    const { session, loading } = useAuth();

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                </div>
            </Layout>
        );
    }

    return session ? <Dashboard /> : <Home />;
}
