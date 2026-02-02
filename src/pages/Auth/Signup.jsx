import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../utils/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Lock, Mail, User, Phone, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEffect } from 'react';

export default function Signup() {
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [otp, setOtp] = useState('');
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
    });
    const [error, setError] = useState(null);
    const { user, profile, isVerified } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';

    useEffect(() => {
        // If user logged in but not verified, show OTP screen
        if (user && !isVerified) {
            setVerifying(true);
            setFormData(prev => ({ ...prev, email: user.email }));
        }

        // If user is verified (or an admin), send them back to where they came from
        if (user && isVerified) {
            setVerifying(false);
            // Replace with 'from' to ensure they get to their intended page (like the Vault)
            navigate(from, { replace: true });
        }
    }, [user, isVerified, navigate, from]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error: signUpError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        phone: formData.phone,
                    },
                },
            });

            if (signUpError) throw signUpError;

            // Trigger Brevo OTP Email via Vercel Function
            const response = await fetch('/api/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email })
            });

            if (!response.ok) {
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    const errData = await response.json();
                    throw new Error(errData.error || 'Failed to send verification code');
                } else {
                    const text = await response.text();
                    console.error("Non-JSON error response:", text);
                    throw new Error('API route not found. Please run using "npx vercel dev" for local testing.');
                }
            }

            // Switch to OTP verification stage
            setVerifying(true);
        } catch (err) {
            console.error("Signup error object:", err);
            setError(err.message || "An unexpected error occurred during signup.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Get current user session from Supabase to pass ID
            const { data: { user } } = await supabase.auth.getUser();

            const response = await fetch('/api/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    otp: otp,
                    userId: user?.id
                })
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Verification failed');

            navigate(from, { replace: true });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email })
            });

            if (!response.ok) {
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    const errData = await response.json();
                    throw new Error(errData.error || 'Failed to resend verification code');
                } else {
                    throw new Error('Failed to resend code. Please check your internet or try again later.');
                }
            }
            alert('A new code has been sent to your email.');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (verifying) {
        return (
            <div className="flex min-h-[80vh] items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md space-y-8 rounded-3xl border border-primary/20 bg-surface/50 p-10 backdrop-blur-xl text-center shadow-glow-red-sm"
                >
                    <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                        <Lock className="h-10 w-10 text-primary" />
                    </div>

                    <div>
                        <h2 className="text-3xl font-display font-black italic text-white uppercase tracking-tighter">
                            Verify <span className="text-primary">OTP</span>
                        </h2>
                        <p className="mt-2 text-sm text-muted">
                            Enter the 6-digit code sent to <br />
                            <span className="text-white font-bold">{formData.email}</span>
                        </p>
                    </div>

                    <form onSubmit={handleVerifyOtp} className="space-y-6">
                        <Input
                            type="text"
                            placeholder="0 0 0 0 0 0"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="text-center text-2xl tracking-[0.5em] font-black font-mono placeholder:tracking-normal placeholder:font-sans"
                            maxLength={6}
                            required
                        />

                        {error && (
                            <div className="text-xs text-red-500 bg-red-500/10 p-2 rounded">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full" isLoading={loading}>
                            VERIFY & ACTIVATE
                        </Button>

                        <div className="space-y-4">
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={loading}
                                className="text-xs text-primary hover:text-red-400 transition-colors uppercase tracking-widest font-black"
                            >
                                Resend Verification Code
                            </button>

                            <br />

                            <button
                                type="button"
                                onClick={() => setVerifying(false)}
                                className="text-[10px] text-muted hover:text-white transition-colors uppercase tracking-widest font-bold"
                            >
                                ← Back to Signup
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex min-h-[80vh] items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md space-y-8 rounded-2xl border border-white/10 bg-surface/50 p-8 backdrop-blur-xl"
            >
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-white">Create Account</h2>
                    <p className="mt-2 text-sm text-muted">Join OTT Trusted today</p>
                </div>

                <form onSubmit={handleSignup} className="mt-8 space-y-6">
                    <div className="space-y-4">
                        <div className="relative">
                            <User className="absolute left-3 top-3 h-5 w-5 text-muted" />
                            <Input
                                name="fullName"
                                type="text"
                                placeholder="Full Name"
                                value={formData.fullName}
                                onChange={handleChange}
                                className="pl-10"
                                required
                            />
                        </div>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3 h-5 w-5 text-muted" />
                            <Input
                                name="phone"
                                type="tel"
                                placeholder="Phone Number"
                                value={formData.phone}
                                onChange={handleChange}
                                className="pl-10"
                                required
                            />
                        </div>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-5 w-5 text-muted" />
                            <Input
                                name="email"
                                type="email"
                                placeholder="Email address"
                                value={formData.email}
                                onChange={handleChange}
                                className="pl-10"
                                required
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-muted" />
                            <Input
                                name="password"
                                type="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                className="pl-10"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-sm text-red-500 text-center bg-red-500/10 p-2 rounded">
                            {error}
                        </div>
                    )}

                    <Button type="submit" className="w-full" isLoading={loading}>
                        Sign Up
                    </Button>

                    <p className="text-center text-sm text-muted">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-primary hover:text-red-400 transition-colors">
                            Log in
                        </Link>
                    </p>
                </form>
            </motion.div>
        </div>
    );
}
