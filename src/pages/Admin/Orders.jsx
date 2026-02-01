import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';
import { Button } from '../../components/ui/Button';
import { Loader2, ExternalLink, Check, X } from 'lucide-react';

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [acceptingOrder, setAcceptingOrder] = useState(null);
    const [creds, setCreds] = useState({ id: '', pass: '' });

    useEffect(() => {
        fetchOrders();
        const subscription = supabase
            .channel('orders')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders)
            .subscribe();

        return () => subscription.unsubscribe();
    }, []);

    const fetchOrders = async () => {
        try {
            console.log("Admin fetching all orders...");
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    ott_plans (
                        *,
                        ott_apps (*)
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Admin fetch error:", error);
                const { data: raw } = await supabase.from('orders').select('*');
                setOrders(raw || []);
            } else {
                console.log("Admin orders count:", data?.length);
                const mappedData = data?.map(order => ({
                    ...order,
                    plan: order.ott_plans,
                    app: order.ott_plans?.ott_apps
                }));
                setOrders(mappedData || []);
            }
        } catch (err) {
            console.error("Admin orders fatal error:", err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status, credentials = null) => {
        const updateData = { status };
        if (credentials) updateData.credentials = credentials;

        await supabase.from('orders').update(updateData).eq('id', id);
        setAcceptingOrder(null);
        setCreds({ id: '', pass: '' });
        fetchOrders();
    };

    const handleAccept = () => {
        const message = `ID: ${creds.id}\nPASS: ${creds.pass}\nNOTE: do not change any thing`;
        updateStatus(acceptingOrder.id, 'accepted', message);
    };

    if (loading) return <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />;

    return (
        <div className="bg-surface/50 rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-muted uppercase">
                        <tr>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">User</th>
                            <th className="px-6 py-3">Item</th>
                            <th className="px-6 py-3">Proof</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {new Date(order.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-white">USER ID</div>
                                    <div className="text-xs text-muted font-mono">{order.user_id.slice(0, 8)}...</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-white">{order.plan?.app?.name || 'Item'}</div>
                                    <div className="text-xs text-muted">{order.plan?.name || 'Plan'} - ₹{order.plan?.price || '0'}</div>
                                </td>
                                <td className="px-6 py-4">
                                    {order.payment_proof_url ? (
                                        <a href={order.payment_proof_url} target="_blank" rel="noreferrer" className="block relative group w-12 h-12">
                                            <img
                                                src={order.payment_proof_url}
                                                alt="Proof"
                                                className="w-full h-full object-cover rounded border border-white/10 group-hover:border-primary transition-all shadow-lg"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded">
                                                <ExternalLink className="h-4 w-4 text-white" />
                                            </div>
                                        </a>
                                    ) : (
                                        <span className="text-muted text-[10px] italic">No proof</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider
                                        ${order.status === 'accepted' ? 'bg-green-500/20 text-green-500 border border-green-500/30' :
                                            order.status === 'rejected' ? 'bg-red-500/20 text-red-500 border border-red-500/30' :
                                                'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 animate-pulse'}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {order.status === 'pending' && (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setAcceptingOrder(order)}
                                                className="p-2 rounded bg-green-500 hover:bg-green-600 text-white transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] active:scale-90"
                                                title="Accept"
                                            >
                                                <Check className="h-4 w-4 stroke-[3px]" />
                                            </button>
                                            <button
                                                onClick={() => updateStatus(order.id, 'rejected')}
                                                className="p-2 rounded bg-red-500 hover:bg-red-600 text-white transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)] active:scale-90"
                                                title="Reject"
                                            >
                                                <X className="h-4 w-4 stroke-[3px]" />
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {orders.length === 0 && (
                            <tr><td colSpan="6" className="px-6 py-8 text-center text-muted">No orders found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Accept Order Modal */}
            {acceptingOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setAcceptingOrder(null)} />
                    <div className="relative bg-surface border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="font-display font-black italic text-2xl text-white uppercase mb-6">
                            Accept <span className="text-primary">Order</span>
                        </h3>

                        <div className="space-y-4 mb-8">
                            <div>
                                <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-2">OTT ID</label>
                                <input
                                    type="text"
                                    value={creds.id}
                                    onChange={(e) => setCreds({ ...creds, id: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary outline-none transition-colors"
                                    placeholder="email@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-2">OTT Password</label>
                                <input
                                    type="text"
                                    value={creds.pass}
                                    onChange={(e) => setCreds({ ...creds, pass: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary outline-none transition-colors"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                                <p className="text-[10px] text-primary font-bold uppercase mb-1 italic">Fixed Note Included:</p>
                                <p className="text-xs text-white italic">"do not change any thing"</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setAcceptingOrder(null)}
                                className="flex-1 py-3 rounded-lg border border-white/10 text-white font-bold hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <Button
                                onClick={handleAccept}
                                disabled={!creds.id || !creds.pass}
                                className="flex-1"
                            >
                                Deliver Access
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
