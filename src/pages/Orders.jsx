import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';
import { Loader2, Copy, Check, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const CountdownTimer = ({ createdAt }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const calculateTime = () => {
            const start = new Date(createdAt).getTime();
            const end = start + 30 * 60 * 1000; // 30 mins
            const now = new Date().getTime();
            const diff = end - now;

            if (diff <= 0) {
                setTimeLeft('Processing...');
                return;
            }

            const mins = Math.floor(diff / 60000);
            const secs = Math.floor((diff % 60000) / 1000);
            setTimeLeft(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
        };

        const timer = setInterval(calculateTime, 1000);
        calculateTime();
        return () => clearInterval(timer);
    }, [createdAt]);

    return (
        <div className="flex items-center gap-2 text-primary font-mono text-sm group">
            <Clock size={14} className="animate-pulse" />
            <span className="group-hover:neon-text-sm transition-all">EST. {timeLeft}</span>
        </div>
    );
};

export default function Orders() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copiedId, setCopiedId] = useState(null);

    useEffect(() => {
        if (user) {
            fetchOrders();

            const subscription = supabase
                .channel('user-orders')
                .on('postgres_changes',
                    { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${user.id}` },
                    fetchOrders
                )
                .subscribe();

            return () => subscription.unsubscribe();
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            console.log("Fetching orders for user:", user.id);
            // Use standard table names for joins to be safer
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    ott_plans (
                        *,
                        ott_apps (*)
                    )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Supabase query error:', error);
                const { data: raw } = await supabase.from('orders').select('*').eq('user_id', user.id);
                setOrders(raw || []);
            } else {
                console.log("Orders data raw:", data);
                // Map the data to the expected format if table names were used directly
                const mappedData = data?.map(order => ({
                    ...order,
                    plan: order.ott_plans,
                    app: order.ott_plans?.ott_apps
                }));
                setOrders(mappedData || []);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopiedId(text);
        setTimeout(() => setCopiedId(null), 2000);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-white"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

    return (
        <div className="min-h-screen container mx-auto px-4 py-32 z-10 relative">
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display font-black italic text-4xl text-white mb-10 border-b border-white/10 pb-4"
            >
                MY <span className="text-primary font-black">VAULT</span>
            </motion.h1>

            {orders.length === 0 ? (
                <div className="text-center py-20 bg-surface/30 rounded-2xl border border-white/5 backdrop-blur-sm">
                    <p className="text-muted text-lg mb-4">No subscription data found in your vault.</p>
                    <a href="/" className="text-primary hover:underline font-bold uppercase tracking-widest text-sm">Access Catalog</a>
                </div>
            ) : (
                <div className="grid gap-6">
                    {orders.map((order, i) => (
                        <motion.div
                            key={order.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-surface/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-primary/50 transition-all group"
                        >
                            <div className="flex-1 w-full">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-tighter ${order.status === 'accepted' || order.status === 'confirmed' ? 'bg-green-500/20 text-green-500 border border-green-500/30' :
                                        order.status === 'pending' ? 'bg-primary/20 text-primary border border-primary/30 animate-pulse' :
                                            'bg-red-500/20 text-red-500 border border-red-500/30'
                                        }`}>
                                        {order.status === 'accepted' ? 'CONFIRMED' : order.status}
                                    </span>
                                    <span className="text-muted text-xs font-mono">{new Date(order.created_at).toLocaleDateString()}</span>
                                </div>
                                <h3 className="font-display font-bold text-2xl text-white group-hover:text-primary transition-colors">
                                    {order.app?.name || 'Subscription'} <span className="text-primary">/</span> {order.plan?.name || 'Plan'}
                                </h3>
                                <div className="flex items-center gap-4 mt-3">
                                    <p className="text-muted text-xs font-mono uppercase tracking-widest">ORDER #{order.id.slice(0, 8)}</p>
                                    {order.status === 'pending' && <CountdownTimer createdAt={order.created_at} />}
                                </div>
                            </div>

                            {(order.status === 'accepted' || order.status === 'confirmed') ? (
                                <div className="w-full md:w-80 bg-black/60 p-5 rounded-xl border border-primary/30 shadow-glow-red-sm">
                                    <p className="text-[10px] text-primary uppercase font-black tracking-[0.2em] mb-4">SECURE CREDENTIALS</p>
                                    <div className="bg-white/5 p-4 rounded-lg border border-white/10 relative group">
                                        <div className="text-white font-mono text-sm whitespace-pre-line leading-relaxed">
                                            {order.credentials || 'Access details will appear here shortly.'}
                                        </div>
                                        {order.credentials && (
                                            <button
                                                onClick={() => copyToClipboard(order.credentials)}
                                                className="absolute top-2 right-2 p-2 bg-black/50 rounded-md hover:text-primary text-muted transition-colors opacity-0 group-hover:opacity-100"
                                                title="Copy All"
                                            >
                                                {copiedId === order.credentials ? <Check size={14} /> : <Copy size={14} />}
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-[9px] text-muted mt-3 italic text-center">Please secure these details immediately.</p>
                                </div>
                            ) : order.status === 'pending' ? (
                                <div className="w-full md:w-64 text-center p-4 border border-white/5 rounded-xl bg-white/5">
                                    <p className="text-xs text-muted font-medium italic">Verification in progress...</p>
                                </div>
                            ) : null}
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
