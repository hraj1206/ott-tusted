import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../utils/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Lock, Mail, User, Phone } from 'lucide-react';

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
    const navigate = useNavigate();

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

            // Switch to OTP verification stage
            setVerifying(true);
        } catch (err) {
            console.error("Signup error object:", err);
            let msg = err.message || "An unexpected error occurred during signup.";

            if (msg.includes("rate limit")) {
                msg = "Too many attempts. Please check your email inbox or try again in a minute.";
            }
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error: verifyError } = await supabase.auth.verifyOtp({
                email: formData.email,
                token: otp,
                type: 'signup',
            });

            if (verifyError) throw verifyError;
            navigate('/');
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

                        <button
                            type="button"
                            onClick={() => setVerifying(false)}
                            className="text-xs text-muted hover:text-white transition-colors uppercase tracking-widest font-bold"
                        >
                            ← Back to Signup
                        </button>
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
