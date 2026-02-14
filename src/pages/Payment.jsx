import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Loader2, Upload, QrCode, CheckCircle, CreditCard } from 'lucide-react';

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
    const [file, setFile] = useState(null);
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

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
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
        <div className="min-h-screen py-10 px-4">
            <div className="max-w-4xl mx-auto grid gap-8 md:grid-cols-2">
                {/* Payment Details Section */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                >
                    <div className="rounded-2xl border border-white/10 bg-surface/50 p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Order Summary</h2>
                        <div className="space-y-3 text-muted">
                            <div className="flex justify-between">
                                <span>OTT App</span>
                                <span className="text-white font-medium">{state.app.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Plan</span>
                                <span className="text-white font-medium">{state.plan.name}</span>
                            </div>
                            <div className="border-t border-white/10 my-2 pt-2 flex justify-between text-lg font-bold text-primary">
                                <span>Total</span>
                                <span>₹{state.plan.price}</span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center">
                        <h2 className="text-xl font-bold text-white mb-4">Scan to Pay</h2>
                        {config?.qr_code_url ? (
                            <img src={config.qr_code_url} alt="QR Code" className="w-48 h-48 mx-auto rounded-lg mb-4 bg-white p-2" />
                        ) : (
                            <div className="w-48 h-48 mx-auto rounded-lg mb-4 bg-white flex items-center justify-center text-black">
                                <QrCode className="h-12 w-12" />
                            </div>
                        )}
                        <p className="text-muted text-sm mb-2">UPI ID</p>
                        <div className="inline-block px-4 py-2 bg-black/30 rounded-lg text-primary font-mono tracking-wider">
                            {config?.upi_id || 'admin@upi'}
                        </div>
                    </div>
                </motion.div>

                {/* Form Section */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-2xl border border-white/10 bg-surface/50 p-6 backdrop-blur-xl h-fit"
                >
                    <h2 className="text-2xl font-bold text-white mb-6">Confirm Order</h2>
                    <form onSubmit={handleRazorpayPayment} className="space-y-4">
                        <div>
                            <label className="block text-sm text-muted mb-1">Full Name</label>
                            <Input
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-muted mb-1">
                                {state.app.name.toLowerCase().includes('youtube')
                                    ? 'Gmail Address for activation'
                                    : 'Email Address'}
                            </label>
                            <Input
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                type="email"
                                placeholder={state.app.name.toLowerCase().includes('youtube') ? 'yourname@gmail.com' : 'email@example.com'}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-muted mb-1">Phone Number</label>
                            <Input
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                required
                                type="tel"
                            />
                        </div>

                        <div className="pt-4">
                            <Button
                                type="submit"
                                className="w-full h-12 text-lg flex items-center justify-center gap-2"
                                isLoading={loading}
                            >
                                <CreditCard className="h-5 w-5" />
                                Pay with Razorpay
                            </Button>
                        </div>
                    </form>

                    <div className="mt-6 pt-6 border-t border-white/5">
                        <p className="text-center text-sm text-muted mb-4">Secure Payment Powered by Razorpay</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
