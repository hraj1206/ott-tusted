import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Loader2, CheckCircle, CreditCard, ShieldCheck, Zap, Lock, Mail, Phone, User as UserIcon } from 'lucide-react';

const loadRazorpay = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export default function Payment() {
    const { state } = useLocation();
    const { user } = useAuth(); // Assuming logged in user for creating order
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [config, setConfig] = useState(null);
    const [formData, setFormData] = useState({
        fullName: user?.user_metadata?.full_name || '',
        phone: user?.user_metadata?.phone || '',
        email: user?.email || '',
    });

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
            return;
        }
        if (!state?.plan || !state?.app) {
            navigate('/');
            return;
        }
        fetchPaymentConfig();
    }, [state, navigate, user, loading]);

    const fetchPaymentConfig = async () => {
        const { data } = await supabase.from('payment_config').select('*').maybeSingle();
        setConfig(data);
    };



    const handleRazorpayPayment = async (e) => {
        e.preventDefault();
        if (!user) {
            alert("You must be logged in to place an order.");
            navigate('/login');
            return;
        }

        setLoading(true);
        try {
            const res = await loadRazorpay();
            if (!res) {
                alert('Razorpay SDK failed to load. Are you online?');
                return;
            }

            // 1. Create Order on Backend
            const orderRes = await fetch('/api/create-razorpay-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: state.plan.price,
                    currency: 'INR',
                    receipt: `receipt_${Date.now()}`
                })
            });

            if (!orderRes.ok) {
                const errorText = await orderRes.text();
                console.error('API Error Response:', errorText);
                let errorData = {};
                try {
                    errorData = JSON.parse(errorText);
                } catch (e) {
                    errorData = { error: errorText };
                }
                throw new Error(errorData.error || `Server Error (${orderRes.status}): Failed to create Razorpay order`);
            }
            const razorpayOrder = await orderRes.json();

            // 2. Open Razorpay Checkout
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'YOUR_RAZORPAY_KEY_ID',
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                name: 'OTT Trusted',
                description: `Purchase ${state.app.name} - ${state.plan.name}`,
                order_id: razorpayOrder.id,
                handler: async function (response) {
                    try {
                        setLoading(true);
                        // 3. Verify Payment on Backend
                        const verifyRes = await fetch('/api/verify-razorpay-payment', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            })
                        });

                        const verification = await verifyRes.json();
                        if (verification.success) {
                            // 4. Create Order in Supabase
                            const { error: orderError } = await supabase.from('orders').insert({
                                user_id: user.id,
                                plan_id: state.plan.id,
                                status: 'pending',
                                payment_proof_url: `RAZORPAY_ID:${response.razorpay_payment_id}`,
                            });

                            if (orderError) throw orderError;

                            // 5. WhatsApp Redirect
                            const message = `*New Razorpay Order*\n\nName: ${formData.fullName}\nApp: ${state.app.name}\nPlan: ${state.plan.name} (Rs. ${state.plan.price})\nEmail: ${formData.email}\nPhone: ${formData.phone}\nPayment ID: ${response.razorpay_payment_id}`;
                            const encodedMessage = encodeURIComponent(message);
                            const waNumber = config?.whatsapp_number ? config.whatsapp_number.replace(/\D/g, '') : '919876543210';
                            const whatsappUrl = `https://wa.me/${waNumber}?text=${encodedMessage}`;

                            alert("Payment Successful! Redirecting to WhatsApp...");
                            window.open(whatsappUrl, '_blank');
                            navigate('/orders');
                        } else {
                            alert("Payment verification failed: " + verification.message);
                        }
                    } catch (err) {
                        console.error(err);
                        alert("Error after payment: " + err.message);
                    } finally {
                        setLoading(false);
                    }
                },
                prefill: {
                    name: formData.fullName,
                    email: formData.email,
                    contact: formData.phone
                },
                theme: {
                    color: '#FF0000'
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error) {
            console.error("Order failed:", error);
            alert("Failed to initiate payment: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-white"><Loader2 className="animate-spin h-8 w-8" /></div>;
    if (!state?.plan || !user) return null;

    return (
        <div className="min-h-screen py-20 px-4 relative overflow-hidden bg-[#0A0A0A]">
            {/* Background Ambient Glows */}
            <div className="absolute top-0 -left-[10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full pointer-events-none opacity-50" />
            <div className="absolute bottom-0 -right-[10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full pointer-events-none opacity-30" />
            <div className="cyber-grid absolute inset-0 opacity-20 pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="text-center mb-12">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-display font-black italic uppercase tracking-tighter"
                    >
                        Secure <span className="text-primary">Checkout</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-muted mt-2"
                    >
                        Complete your order to get instant access
                    </motion.p>
                </div>

                <div className="grid gap-8 lg:grid-cols-12">
                    {/* Left Column: Order Summary & Info */}
                    <div className="lg:col-span-5 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="glass-morphism rounded-3xl p-8 border border-white/10 hover-card-3d"
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
                                    <Zap className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white uppercase tracking-tight">Order Summary</h2>
                                    <p className="text-xs text-muted">Direct Activation Protocol</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                                    {state.app.logo_url ? (
                                        <img src={state.app.logo_url} alt={state.app.name} className="h-12 w-12 object-contain" />
                                    ) : (
                                        <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center font-bold text-primary">
                                            {state.app.name[0]}
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <p className="text-xs text-muted uppercase tracking-widest font-bold">Platform</p>
                                        <p className="text-lg font-bold text-white">{state.app.name}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                        <p className="text-[10px] text-muted uppercase tracking-widest font-bold mb-1">Configuration</p>
                                        <p className="font-bold text-white text-sm">{state.plan.name}</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                        <p className="text-[10px] text-muted uppercase tracking-widest font-bold mb-1">Status</p>
                                        <div className="flex items-center gap-1.5 text-green-500 font-bold text-sm">
                                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                            Active
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/10">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-xs text-muted uppercase tracking-widest font-bold">Total Amount</p>
                                            <p className="text-4xl font-black italic text-primary">₹{state.plan.price}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-muted italic">Tax Inclusive</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Trust Badges */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="grid grid-cols-3 gap-4"
                        >
                            <div className="glass-morphism p-4 rounded-2xl border border-white/5 flex flex-col items-center text-center">
                                <ShieldCheck className="h-5 w-5 text-green-500 mb-2" />
                                <span className="text-[10px] font-bold uppercase text-muted">Secure SSL</span>
                            </div>
                            <div className="glass-morphism p-4 rounded-2xl border border-white/5 flex flex-col items-center text-center">
                                <Lock className="h-5 w-5 text-blue-500 mb-2" />
                                <span className="text-[10px] font-bold uppercase text-muted">AES-256</span>
                            </div>
                            <div className="glass-morphism p-4 rounded-2xl border border-white/5 flex flex-col items-center text-center">
                                <CheckCircle className="h-5 w-5 text-primary mb-2" />
                                <span className="text-[10px] font-bold uppercase text-muted">Verified</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Checkout Form */}
                    <div className="lg:col-span-7">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="glass-morphism rounded-3xl p-8 border border-white/10 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <CreditCard className="h-32 w-32 rotate-12" />
                            </div>

                            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3 italic uppercase">
                                <div className="w-8 h-1 bg-primary rounded-full" />
                                Verification Details
                            </h2>

                            <form onSubmit={handleRazorpayPayment} className="space-y-6 relative z-10">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted uppercase tracking-widest flex items-center gap-2">
                                            <UserIcon className="h-3 w-3" /> Full Name
                                        </label>
                                        <Input
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            required
                                            className="bg-white/5 border-white/10 h-12 focus:border-primary transition-all duration-300"
                                            placeholder="Enter your legal name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted uppercase tracking-widest flex items-center gap-2">
                                            <Phone className="h-3 w-3" /> Phone Number
                                        </label>
                                        <Input
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            required
                                            type="tel"
                                            className="bg-white/5 border-white/10 h-12 focus:border-primary transition-all duration-300"
                                            placeholder="+91..."
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted uppercase tracking-widest flex items-center gap-2">
                                        <Mail className="h-3 w-3" />
                                        {state.app.name.toLowerCase().includes('youtube')
                                            ? 'Gmail Address (REQUIRED for Activation)'
                                            : 'Email Address for delivery'}
                                    </label>
                                    <Input
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                        type="email"
                                        className="bg-white/5 border-white/10 h-12 focus:border-primary transition-all duration-300"
                                        placeholder={state.app.name.toLowerCase().includes('youtube') ? 'yourname@gmail.com' : 'email@example.com'}
                                    />
                                    <p className="text-[10px] text-muted italic">Double check this email. Activation details will be sent here.</p>
                                </div>

                                <div className="pt-8">
                                    <Button
                                        type="submit"
                                        className="w-full h-16 text-xl font-bold italic uppercase tracking-wider relative group overflow-hidden"
                                        isLoading={loading}
                                    >
                                        <div className="absolute inset-0 bg-primary opacity-20 group-hover:opacity-30 transition-opacity" />
                                        <div className="relative flex items-center justify-center gap-3">
                                            <CreditCard className="h-6 w-6" />
                                            Initialize Secure Payment
                                        </div>
                                    </Button>
                                    <p className="text-center text-[10px] text-muted mt-4 uppercase tracking-[0.2em] font-bold">
                                        Powered by Razorpay Secure Engine
                                    </p>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
