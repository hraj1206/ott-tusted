import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute = ({ adminOnly = false }) => {
    const { user, isAdmin, loading } = useAuth();

    if (loading) return <div className="h-screen flex items-center justify-center bg-background text-primary">Loading...</div>;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && !isAdmin) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};
