import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute = ({ adminOnly = false }) => {
    const { user, isAdmin, isVerified, loading } = useAuth();

    if (loading) return <div className="h-screen flex items-center justify-center bg-background text-primary italic font-black uppercase tracking-widest">Accessing Vault...</div>;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!isVerified && !adminOnly) {
        // Option: Redirect to signup where OTP can be entered
        return <Navigate to="/signup" replace />;
    }

    if (adminOnly && !isAdmin) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};
