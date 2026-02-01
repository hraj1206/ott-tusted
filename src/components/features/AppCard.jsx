import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function AppCard({ app, index }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-surface/50 p-6 backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-surface/80 hover:shadow-2xl hover:shadow-primary/10"
        >
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl transition-all group-hover:bg-primary/20" />

            <div className="relative z-10 flex flex-col h-full">
                <div className="mb-4 h-16 w-16 overflow-hidden rounded-xl bg-black/50 p-2">
                    {app.logo_url ? (
                        <img src={app.logo_url} alt={app.name} className="h-full w-full object-contain" />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-xl font-bold text-primary">
                            {app.name.charAt(0)}
                        </div>
                    )}
                </div>

                <h3 className="mb-2 text-xl font-bold text-white">{app.name}</h3>
                <p className="mb-6 flex-grow text-sm text-muted">{app.description || "Premium entertainment packages available."}</p>

                <Link to={`/apps/${app.id}`}>
                    <button className="flex w-full items-center justify-between rounded-lg bg-white/5 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10 group-hover:bg-primary group-hover:text-white">
                        View Plans
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </Link>
            </div>
        </motion.div>
    );
}
