import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../utils/supabase';
import PlanCard from '../components/features/PlanCard';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function Plans() {
    const { appId } = useParams();
    const navigate = useNavigate();
    const [app, setApp] = useState(null);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAppAndPlans();
    }, [appId]);

    const fetchAppAndPlans = async () => {
        try {
            // Fetch App Details
            const { data: appData, error: appError } = await supabase
                .from('ott_apps')
                .select('*')
                .eq('id', appId)
                .single();

            if (appError) throw appError;
            setApp(appData);

            // Fetch Plans
            const { data: plansData, error: plansError } = await supabase
                .from('ott_plans')
                .select('*')
                .eq('app_id', appId)
                .eq('active', true)
                .order('price', { ascending: true });

            if (plansError) throw plansError;
            setPlans(plansData || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            navigate('/'); // Redirect if invalid app
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPlan = (plan) => {
        navigate('/payment', { state: { app, plan } });
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen container mx-auto px-4 py-10">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-8 pl-0 hover:bg-transparent hover:text-primary">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Apps
            </Button>

            <div className="mb-12 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-surface/30 inline-block p-4 rounded-full mb-6"
                >
                    {app?.logo_url ? (
                        <img src={app.logo_url} alt={app.name} className="h-16 w-16 object-contain" />
                    ) : (
                        <span className="text-2xl font-bold text-primary">{app?.name}</span>
                    )}
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-3xl font-bold text-white"
                >
                    Choose your plan for <span className="text-primary">{app?.name}</span>
                </motion.h1>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
                {plans.length > 0 ? (
                    plans.map((plan, index) => (
                        <PlanCard key={plan.id} plan={plan} index={index} onSelect={handleSelectPlan} />
                    ))
                ) : (
                    <div className="col-span-full text-center py-20 rounded-2xl bg-surface/30 border border-white/5">
                        <p className="text-muted text-lg">No plans available for this app yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
