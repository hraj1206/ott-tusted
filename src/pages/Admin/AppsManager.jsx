import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Plus, Trash2, Edit2, ChevronDown, ChevronUp, Save, Star } from 'lucide-react';

export default function AppsManager() {
    const [apps, setApps] = useState([]);
    const [expandedApp, setExpandedApp] = useState(null);
    const [refresh, setRefresh] = useState(0);

    // New App Form
    const [newApp, setNewApp] = useState({ name: '', description: '', logo_url: '' });

    // New Plan Form
    const [newPlan, setNewPlan] = useState({ name: '', price: '', details: '' });
    const [editingApp, setEditingApp] = useState(null);

    useEffect(() => {
        fetchApps();
    }, [refresh]);

    const fetchApps = async () => {
        const { data } = await supabase
            .from('ott_apps')
            .select('*, plans:ott_plans(*)')
            .order('recommended', { ascending: false })
            .order('created_at', { ascending: false });
        setApps(data || []);
    };

    const handleCreateApp = async () => {
        if (!newApp.name) return;
        await supabase.from('ott_apps').insert(newApp);
        setNewApp({ name: '', description: '', logo_url: '' });
        setRefresh(r => r + 1);
    };

    const handleUpdateApp = async (id) => {
        await supabase.from('ott_apps').update({
            name: editingApp.name,
            logo_url: editingApp.logo_url,
            description: editingApp.description
        }).eq('id', id);
        setEditingApp(null);
        setRefresh(r => r + 1);
    };

    const handleDeleteApp = async (id) => {
        if (!confirm('Are you sure? This will delete all plans associated with this app.')) return;
        await supabase.from('ott_apps').delete().eq('id', id);
        setRefresh(r => r + 1);
    };

    const handleCreatePlan = async (appId) => {
        if (!newPlan.name || !newPlan.price) return;
        await supabase.from('ott_plans').insert({ ...newPlan, app_id: appId });
        setNewPlan({ name: '', price: '', details: '' });
        setRefresh(r => r + 1);
    };

    const handleDeletePlan = async (id) => {
        await supabase.from('ott_plans').delete().eq('id', id);
        setRefresh(r => r + 1);
    };

    const toggleRecommended = async (id, currentStatus) => {
        await supabase.from('ott_apps').update({ recommended: !currentStatus }).eq('id', id);
        setRefresh(r => r + 1);
    };

    return (
        <div className="space-y-8">
            {/* Add New App */}
            <div className="bg-surface/50 p-6 rounded-xl border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4">Add New OTT App</h3>
                <div className="grid gap-4 md:grid-cols-4">
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
                        placeholder="Description (e.g. ID & PASS)"
                        value={newApp.description}
                        onChange={e => setNewApp({ ...newApp, description: e.target.value })}
                    />
                    <Button onClick={handleCreateApp}>
                        <Plus className="mr-2 h-4 w-4" /> Add App
                    </Button>
                </div>
            </div>

            {/* List Apps */}
            <div className="space-y-4">
                {apps.map(app => (
                    <div key={app.id} className="bg-surface/30 rounded-xl border border-white/5 overflow-hidden">
                        <div
                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                            onClick={() => setExpandedApp(expandedApp === app.id ? null : app.id)}
                        >
                            {editingApp?.id === app.id ? (
                                <div className="flex-1 grid grid-cols-3 gap-2 mr-4" onClick={(e) => e.stopPropagation()}>
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
                                        placeholder="Description"
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center space-x-4">
                                    {app.logo_url && <img src={app.logo_url} alt="" className="h-8 w-8 object-contain" />}
                                    <div className="flex flex-col">
                                        <span className="font-bold text-lg text-white">{app.name}</span>
                                        <span className="text-[10px] text-primary font-black uppercase tracking-tight">{app.description || 'No Description'}</span>
                                    </div>
                                    <span className="text-sm text-muted">{app.plans?.length || 0} plans</span>
                                </div>
                            )}

                            <div className="flex items-center space-x-2">
                                {editingApp?.id === app.id ? (
                                    <Button size="sm" onClick={(e) => { e.stopPropagation(); handleUpdateApp(app.id); }}>
                                        <Save className="h-4 w-4 mr-1" /> Save
                                    </Button>
                                ) : (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingApp(app);
                                        }}
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleRecommended(app.id, app.recommended);
                                    }}
                                    title={app.recommended ? "Unmark Recommended" : "Mark as Recommended"}
                                >
                                    <Star className={`h-4 w-4 ${app.recommended ? 'text-yellow-400 fill-yellow-400' : 'text-muted'}`} />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDeleteApp(app.id); }}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                                {expandedApp === app.id ? <ChevronUp /> : <ChevronDown />}
                            </div>
                        </div>

                        {/* Plans Section */}
                        {expandedApp === app.id && (
                            <div className="p-4 border-t border-white/5 bg-black/20">
                                <h4 className="text-sm font-bold text-muted uppercase mb-4">Manage Plans</h4>

                                {/* List Plans */}
                                <div className="space-y-2 mb-6">
                                    {app.plans?.map(plan => (
                                        <div key={plan.id} className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                                            <div>
                                                <span className="font-bold text-white">{plan.name}</span>
                                                <span className="text-primary ml-2">₹{plan.price}</span>
                                                <p className="text-xs text-muted">{plan.details}</p>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeletePlan(plan.id)}>
                                                <X className="h-4 w-4 text-red-400" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>

                                {/* Add Plan */}
                                <div className="grid gap-2 md:grid-cols-4 items-end bg-white/5 p-4 rounded-lg">
                                    <Input
                                        placeholder="Plan Name (e.g. Monthly)"
                                        value={newPlan.name}
                                        onChange={e => setNewPlan({ ...newPlan, name: e.target.value })}
                                    />
                                    <Input
                                        placeholder="Price"
                                        type="number"
                                        value={newPlan.price}
                                        onChange={e => setNewPlan({ ...newPlan, price: e.target.value })}
                                    />
                                    <Input
                                        placeholder="Details (comma separated)"
                                        value={newPlan.details}
                                        onChange={e => setNewPlan({ ...newPlan, details: e.target.value })}
                                    />
                                    <Button size="sm" onClick={() => handleCreatePlan(app.id)}>
                                        Add Plan
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

function X({ className }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18" /><path d="m6 6 18 18" /></svg>
}
