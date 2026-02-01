import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Loader2, Upload, QrCode, CheckCircle } from 'lucide-react';

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            alert("You must be logged in to place an order.");
            navigate('/login');
            return;
        }
        if (!file) return alert('Please upload payment proof screenshot');

        setLoading(true);
        try {
            // 1. Upload Proof
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;
            const { error: uploadError, data: uploadData } = await supabase.storage
                .from('payment_proofs')
                .upload(fileName, file);

            if (uploadError) {
                console.error("Upload error details:", uploadError);
                throw new Error(`Upload failed: ${uploadError.message}`);
            }

            const { data: { publicUrl } } = supabase.storage
                .from('payment_proofs')
                .getPublicUrl(fileName);

            // 2. Create Order
            const { error: orderError } = await supabase.from('orders').insert({
                user_id: user.id,
                plan_id: state.plan.id,
                status: 'pending',
                payment_proof_url: publicUrl,
            });

            if (orderError) throw orderError;

            // 3. WhatsApp Redirect
            // Construct message
            const message = `*New Order Placed*\n\nName: ${formData.fullName}\nApp: ${state.app.name}\nPlan: ${state.plan.name} (Rs. ${state.plan.price})\nEmail: ${formData.email}\nPhone: ${formData.phone}\n\nPayment Proof uploaded.`;
            const encodedMessage = encodeURIComponent(message);
            const waNumber = config?.whatsapp_number || '919876543210'; // Fallback

            window.open(`https://wa.me/${waNumber}?text=${encodedMessage}`, '_blank');

            // Redirect to success or home
            alert("Order placed successfully! We will check your proof and approve it shortly.");
            navigate('/');

        } catch (error) {
            console.error("Order failed:", error);
            alert("Failed to place order: " + error.message);
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
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm text-muted mb-1">Full Name</label>
                            <Input
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-muted mb-1">Email</label>
                            <Input
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                type="email"
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

                        <div className="pt-2">
                            <label className="block text-sm text-muted mb-2">Upload Payment Screenshot</label>
                            <div className="relative border-2 border-dashed border-white/10 rounded-xl p-8 hover:bg-white/5 transition-colors text-center cursor-pointer">
                                <input
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    required
                                />
                                <div className="flex flex-col items-center">
                                    {file ? (
                                        <>
                                            <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                                            <span className="text-sm text-green-400">{file.name}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="h-8 w-8 text-muted mb-2" />
                                            <span className="text-sm text-muted">Click to upload image</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button type="submit" className="w-full h-12 text-lg" isLoading={loading}>
                                Submit & Send to WhatsApp
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
