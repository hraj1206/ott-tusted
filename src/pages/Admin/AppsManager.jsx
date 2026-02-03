import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Plus, Trash2, Edit2, ChevronDown, ChevronUp, Save, Star, CheckCircle, XCircle } from 'lucide-react';

export default function AppsManager() {
    const [apps, setApps] = useState([]);
    const [expandedApp, setExpandedApp] = useState(null);
    const [refresh, setRefresh] = useState(0);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState({ message: '', type: '' });

    // New App Form
    const [newApp, setNewApp] = useState({ name: '', description: '', logo_url: '', active: true });

    // New Plan Form
    const [newPlan, setNewPlan] = useState({ name: '', price: '', details: '' });
    const [editingApp, setEditingApp] = useState(null);

    useEffect(() => {
        fetchApps();
    }, [refresh]);

    const showStatus = (message, type = 'success') => {
        setStatus({ message, type });
        setTimeout(() => setStatus({ message: '', type: '' }), 3000);
    };

    const fetchApps = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('ott_apps')
                .select('*, plans:ott_plans(*)')
                .order('recommended', { ascending: false })
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching apps:', error);
                showStatus('Failed to fetch apps: ' + error.message, 'error');
            } else {
                setApps(data || []);
            }
        } catch (err) {
            console.error('Unexpected error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateApp = async () => {
        if (!newApp.name) return;
        try {
            const { error } = await supabase.from('ott_apps').insert(newApp);
            if (error) {
                console.error('Error creating app:', error);
                showStatus('Failed to create: ' + error.message, 'error');
            } else {
                showStatus('App created successfully!');
                setNewApp({ name: '', description: '', logo_url: '', active: true });
                setRefresh(r => r + 1);
            }
        } catch (err) {
            console.error('Unexpected error:', err);
        }
    };

    const handleUpdateApp = async (id) => {
        try {
            const { error } = await supabase.from('ott_apps').update({
                name: editingApp.name,
                logo_url: editingApp.logo_url,
                description: editingApp.description,
                active: editingApp.active
            }).eq('id', id);

            if (error) {
                console.error('Error updating app:', error);
                showStatus('Update failed: ' + error.message, 'error');
            } else {
                showStatus('App updated!');
                setEditingApp(null);
                setRefresh(r => r + 1);
            }
        } catch (err) {
            console.error('Unexpected error:', err);
        }
    };

    const handleDeleteApp = async (id, name, isActive) => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
        try {
            const { error } = await supabase.from('ott_apps').delete().eq('id', id);

            if (error) {
                console.error('Error deleting app:', error);

                // Foreign Key Constraint Error (Orders exist)
                if (error.code === '23503') {
                    const forceDelete = confirm(`"${name}" is linked to existing customer orders. \n\nClick OK to PERMANENTLY PURGE all orders, plans, and this app from the database. \n\nClick Cancel to just DEACTIVATE it instead.`);

                    if (forceDelete) {
                        showStatus('Purging associated records...', 'loading');

                        // 1. Get all plan IDs for this app
                        const { data: plans } = await supabase.from('ott_plans').select('id').eq('app_id', id);

                        if (plans && plans.length > 0) {
                            const planIds = plans.map(p => p.id);

                            // 2. Delete all orders associated with these plans
                            const { error: orderError } = await supabase.from('orders').delete().in('plan_id', planIds);

                            if (orderError) {
                                showStatus('Permission Denied: Run the SQL Delete policy in Supabase.', 'error');
                                console.error('Order purge error:', orderError);
                                return;
                            }
                        }

                        // 3. Now delete the app (cascades to plans)
                        const { error: appError } = await supabase.from('ott_apps').delete().eq('id', id);

                        if (appError) {
                            showStatus('Deletion blocked. Add Delete Policies in Supabase.', 'error');
                        } else {
                            showStatus('App purged successfully');
                            setRefresh(r => r + 1);
                        }
                    } else if (isActive) {
                        await toggleActive(id, true);
                        showStatus('App deactivated');
                    }
                } else {
                    showStatus('Delete failed: ' + error.message, 'error');
                }
            } else {
                showStatus('App deleted');
                setRefresh(r => r + 1);
            }
        } catch (err) {
            console.error('Unexpected error:', err);
            showStatus('An unexpected error occurred', 'error');
        }
    };

    const handleCreatePlan = async (appId) => {
        if (!newPlan.name || !newPlan.price) return;
        try {
            const { error } = await supabase.from('ott_plans').insert({ ...newPlan, app_id: appId });
            if (error) {
                console.error('Error creating plan:', error);
                showStatus('Plan creation failed: ' + error.message, 'error');
            } else {
                showStatus('Plan added!');
                setNewPlan({ name: '', price: '', details: '' });
                setRefresh(r => r + 1);
            }
        } catch (err) {
            console.error('Unexpected error:', err);
        }
    };

    const handleDeletePlan = async (id, name) => {
        if (!confirm(`Delete the plan "${name}"?`)) return;
        try {
            const { error } = await supabase.from('ott_plans').delete().eq('id', id);
            if (error) {
                console.error('Error deleting plan:', error);
                if (error.code === '23503') {
                    showStatus('Cannot delete: Plan has active orders.', 'error');
                } else {
                    showStatus('Delete failed: ' + error.message, 'error');
                }
            } else {
                showStatus('Plan deleted');
                setRefresh(r => r + 1);
            }
        } catch (err) {
            console.error('Unexpected error:', err);
        }
    };

    const toggleRecommended = async (id, currentStatus) => {
        try {
            const { error } = await supabase.from('ott_apps').update({ recommended: !currentStatus }).eq('id', id);
            if (error) {
                console.error('Error toggling recommended:', error);
            } else {
                setRefresh(r => r + 1);
            }
        } catch (err) {
            console.error('Unexpected error:', err);
        }
    };

    const toggleActive = async (id, currentStatus) => {
        try {
            const { error } = await supabase.from('ott_apps').update({ active: !currentStatus }).eq('id', id);
            if (error) {
                console.error('Error toggling active:', error);
            } else {
                setRefresh(r => r + 1);
            }
        } catch (err) {
            console.error('Unexpected error:', err);
        }
    };

    return (
        <div className="space-y-8 relative">
            {/* Status Notification */}
            {status.message && (
                <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-2xl border backdrop-blur-md transition-all animate-in slide-in-from-top-4 duration-300 ${status.type === 'error' ? 'bg-red-500/20 border-red-500/50 text-red-200' : 'bg-green-500/20 border-green-500/50 text-green-200'
                    }`}>
                    <p className="text-sm font-bold uppercase tracking-widest">{status.message}</p>
                </div>
            )}
            {/* Add New App */}
            <div className="bg-surface/50 p-6 rounded-xl border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4">Add New OTT App</h3>
                <div className="grid gap-4 md:grid-cols-5">
                    <Input
                        placeholder="App Name"
                        value={newApp.name}
                        onChange={e => setNewApp({ ...newApp, name: e.target.value })}
                    />
                    <Input
                        placeholder="Logo URL"
                        value={newApp.logo_url}
                        onChange={e => setNewApp({ ...newApp, logo_url: e.target.value })}
                    />
                    <Input
                        placeholder="Description"
                        value={newApp.description}
                        onChange={e => setNewApp({ ...newApp, description: e.target.value })}
                    />
                    <div className="flex items-center space-x-2 bg-white/5 px-3 rounded-lg border border-white/10">
                        <span className="text-xs text-muted">Active:</span>
                        <input
                            type="checkbox"
                            checked={newApp.active}
                            onChange={e => setNewApp({ ...newApp, active: e.target.checked })}
                            className="accent-primary"
                        />
                    </div>
                    <Button onClick={handleCreateApp}>
                        <Plus className="mr-2 h-4 w-4" /> Add
                    </Button>
                </div>
            </div>

            {/* List Apps */}
            <div className="space-y-4">
                {loading && apps.length === 0 ? (
                    <div className="text-center py-10"><span className="animate-pulse text-muted">Loading catalog...</span></div>
                ) : apps.length === 0 ? (
                    <div className="text-center py-10 text-muted">No apps found in catalog.</div>
                ) : apps.map(app => (
                    <div key={app.id} className={`bg-surface/30 rounded-xl border border-white/5 overflow-hidden transition-opacity ${!app.active ? 'opacity-50' : ''}`}>
                        <div
                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                            onClick={() => setExpandedApp(expandedApp === app.id ? null : app.id)}
                        >
                            {editingApp?.id === app.id ? (
                                <div className="flex-1 grid grid-cols-4 gap-2 mr-4" onClick={(e) => e.stopPropagation()}>
                                    <Input
                                        value={editingApp.name}
                                        onChange={e => setEditingApp({ ...editingApp, name: e.target.value })}
                                        className="h-8 text-xs"
                                    />
                                    <Input
                                        value={editingApp.logo_url}
                                        onChange={e => setEditingApp({ ...editingApp, logo_url: e.target.value })}
                                        className="h-8 text-xs"
                                    />
                                    <Input
                                        value={editingApp.description}
                                        onChange={e => setEditingApp({ ...editingApp, description: e.target.value })}
                                        className="h-8 text-xs"
                                    />
                                    <div className="flex items-center space-x-2 bg-white/5 px-2 rounded border border-white/10 h-8">
                                        <span className="text-[10px] text-muted">Active:</span>
                                        <input
                                            type="checkbox"
                                            checked={editingApp.active}
                                            onChange={e => setEditingApp({ ...editingApp, active: e.target.checked })}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-4">
                                    <div className="relative">
                                        {app.logo_url ? (
                                            <img src={app.logo_url} alt="" className="h-10 w-10 object-contain bg-white/5 rounded-lg p-1" />
                                        ) : (
                                            <div className="h-10 w-10 bg-white/5 rounded-lg flex items-center justify-center text-xs font-bold">{app.name.substring(0, 2)}</div>
                                        )}
                                        {!app.active && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-background" title="Inactive" />}
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-lg text-white">{app.name}</span>
                                            {!app.active && <span className="text-[8px] bg-white/10 px-1 rounded text-muted">INACTIVE</span>}
                                        </div>
                                        <span className="text-[10px] text-primary font-black uppercase tracking-tight">{app.description || 'No Description'}</span>
                                    </div>
                                    <span className="text-xs text-muted font-medium bg-white/5 px-2 py-0.5 rounded-full">{app.plans?.length || 0} plans</span>
                                </div>
                            )}

                            <div className="flex items-center space-x-2" onClick={e => e.stopPropagation()}>
                                {editingApp?.id === app.id ? (
                                    <Button size="sm" onClick={() => handleUpdateApp(app.id)} className="h-8 px-3">
                                        <Save className="h-4 w-4 mr-1" /> Save
                                    </Button>
                                ) : (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setEditingApp(app)}
                                        className="h-8 w-8"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => toggleActive(app.id, app.active)}
                                    title={app.active ? "Deactivate" : "Activate"}
                                    className="h-8 w-8"
                                >
                                    {app.active ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-muted" />}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => toggleRecommended(app.id, app.recommended)}
                                    title={app.recommended ? "Unmark Recommended" : "Mark as Recommended"}
                                    className="h-8 w-8"
                                >
                                    <Star className={`h-4 w-4 ${app.recommended ? 'text-yellow-400 fill-yellow-400' : 'text-muted'}`} />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteApp(app.id, app.name, app.active)} className="h-8 w-8">
                                    <Trash2 className="h-4 w-4 text-red-500 hover:text-red-400" />
                                </Button>
                                <button className="p-1 hover:bg-white/5 rounded transition-colors" onClick={() => setExpandedApp(expandedApp === app.id ? null : app.id)}>
                                    {expandedApp === app.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Plans Section */}
                        {expandedApp === app.id && (
                            <div className="p-4 border-t border-white/5 bg-black/20">
                                <h4 className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-4">Plan Management</h4>

                                {/* List Plans */}
                                <div className="space-y-2 mb-6">
                                    {app.plans && app.plans.length > 0 ? app.plans.map(plan => (
                                        <div key={plan.id} className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-white uppercase text-sm">{plan.name}</span>
                                                    <span className="text-primary font-black text-xs">₹{plan.price}</span>
                                                </div>
                                                <p className="text-[10px] text-muted mt-1">{plan.details}</p>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeletePlan(plan.id, plan.name)} className="hover:bg-red-500/10 transition-colors">
                                                <Trash2 className="h-4 w-4 text-red-400" />
                                            </Button>
                                        </div>
                                    )) : (
                                        <div className="text-center py-4 text-[10px] text-muted uppercase tracking-widest italic">No plans defined for this archetype</div>
                                    )}
                                </div>

                                {/* Add Plan */}
                                <div className="grid gap-2 md:grid-cols-4 items-end bg-white/5 p-4 rounded-lg border border-white/5">
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-muted font-bold uppercase ml-1">Plan Name</label>
                                        <Input
                                            placeholder="e.g. 1 Month / 1 Screen"
                                            value={newPlan.name}
                                            onChange={e => setNewPlan({ ...newPlan, name: e.target.value })}
                                            className="h-9 truncate"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-muted font-bold uppercase ml-1">Price</label>
                                        <Input
                                            placeholder="Price"
                                            type="number"
                                            value={newPlan.price}
                                            onChange={e => setNewPlan({ ...newPlan, price: e.target.value })}
                                            className="h-9"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-muted font-bold uppercase ml-1">Details</label>
                                        <Input
                                            placeholder="Comma separated details"
                                            value={newPlan.details}
                                            onChange={e => setNewPlan({ ...newPlan, details: e.target.value })}
                                            className="h-9"
                                        />
                                    </div>
                                    <Button size="sm" onClick={() => handleCreatePlan(app.id)} className="h-9 font-black uppercase tracking-widest text-[10px]">
                                        <Plus className="mr-1 h-3 w-3" /> Add Plan
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

