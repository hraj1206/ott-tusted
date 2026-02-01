import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../utils/supabase';
import { LogOut, User, Shield } from 'lucide-react';

export default function Navbar() {
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
            <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
                        <img src="/ott_logo.png" alt="OTT Logo" className="relative z-10 w-10 h-10 object-contain rounded-lg border border-white/10" />
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="font-display font-black italic text-xl tracking-wider text-white">OTT</span>
                        <span className="font-sans text-[10px] tracking-[0.2em] text-primary font-bold">TRUSTED</span>
                    </div>
                </Link>

                {/* Links */}
                <div className="flex items-center gap-6">
                    <Link to="/" className="text-sm font-medium text-muted hover:text-white transition-colors">Home</Link>

                    {user ? (
                        <>
                            <Link to="/orders" className="text-sm font-medium text-muted hover:text-white transition-colors">My Vault</Link>
                            {isAdmin && (
                                <Link to="/admin" className="flex items-center gap-1 text-sm font-bold text-primary hover:text-red-400 transition-colors">
                                    <Shield size={14} /> Admin
                                </Link>
                            )}
                            <div className="h-4 w-px bg-white/10 mx-2" />
                            <div className="flex items-center gap-4">
                                <span className="text-xs text-muted flex items-center gap-1">
                                    <User size={14} />
                                    {user.user_metadata?.full_name || 'Member'}
                                </span>
                                <button onClick={handleLogout} className="text-muted hover:text-white transition-colors">
                                    <LogOut size={18} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-sm font-medium text-muted hover:text-white transition-colors">Login</Link>
                            <Link to="/signup">
                                <Button className="bg-primary hover:bg-secondary text-white font-bold italic px-8 py-2 rounded-full shadow-glow-red hover:scale-105 transition-all">
                                    JOIN NOW
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
