import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

export default function AppCard({ app, index }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="group relative bg-surface border border-white/5 rounded-[32px] overflow-hidden hover:border-primary hover:neon-border transition-all duration-300 h-[400px] flex flex-col items-center justify-between p-8 hover:scale-[1.05] hover:-translate-y-4 hover-glow perspective-card"
        >
            {/* Top Glow */}
            <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Recommended Badge */}
            {app.recommended && (
                <div className="absolute top-6 right-6 z-20 flex items-center gap-1.5 px-3 py-1 bg-yellow-400 text-black text-[10px] font-black uppercase italic rounded-full shadow-[0_0_20px_rgba(250,204,21,0.4)] animate-pulse">
                    <Star size={10} className="fill-black" />
                    Best Choice
                </div>
            )}

            {/* Animated Shine Effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="absolute -inset-[100%] bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000" />
            </div>

            {/* Logo/Icon Container */}
            <div className="relative z-10 w-32 h-32 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                {app.logo_url ? (
                    <img src={app.logo_url} alt={app.name} className="w-24 h-24 object-contain" />
                ) : (
                    <div className="text-3xl font-black italic text-white">{app.name.substring(0, 2)}</div>
                )}
            </div>

            {/* Content */}
            <div className="text-center z-10 w-full">
                <h3 className="font-display font-black italic text-3xl text-white uppercase leading-none mb-1 glitch-hover cursor-default">
                    {app.name}
                </h3>
                <h4 className="font-display font-black italic text-3xl text-white uppercase leading-none mb-8">
                    PREMIUM
                </h4>

                {/* Delivery Method Tag */}
                <div className="mb-6">
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-primary">
                        {app.description || (
                            app.name.toLowerCase().includes('netflix') || app.name.toLowerCase().includes('prime')
                                ? 'ID & PASSWORD DELIVERY'
                                : app.name.toLowerCase().includes('youtube')
                                    ? 'GMAIL INVITE SYSTEM'
                                    : 'DIRECT WHATSAPP ACTIVATION'
                        )}
                    </span>
                </div>

                <div className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] mb-8">
                    Starting at ₹{app.price || '99'}
                </div>

                <Link to={`/apps/${app.id}`} className="block w-full">
                    <button className="w-full py-4 rounded-full border border-white/20 text-[10px] font-bold text-white uppercase tracking-widest hover:bg-white hover:text-black transition-colors">
                        Browse Plans
                    </button>
                </Link>
            </div>
        </motion.div>
    );
}
