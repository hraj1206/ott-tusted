import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

export default function AppCard({ app, index }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className="group relative flex flex-col bg-[#070707] border border-white/5 rounded-[40px] p-6 transition-all duration-500 hover:border-primary/40 hover:shadow-[0_0_40px_rgba(239,68,68,0.1)] hover:-translate-y-2 h-full min-h-[440px]"
        >
            {/* Top Glow */}
            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Recommended Badge */}
            {app.recommended && (
                <div className="absolute top-5 right-5 z-20">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-primary text-white text-[9px] font-black uppercase italic rounded-full shadow-glow-red">
                        <Star size={10} className="fill-white" />
                        TOP CHOICE
                    </div>
                </div>
            )}

            {/* Logo Section */}
            <div className="relative mb-8 pt-2 flex justify-center">
                <div className="w-28 h-28 rounded-[28px] bg-[#111] border border-white/5 flex items-center justify-center overflow-hidden transition-all duration-500 group-hover:scale-105 shadow-2xl group-hover:shadow-primary/10">
                    {app.logo_url ? (
                        <img
                            src={app.logo_url}
                            alt={app.name}
                            className="w-4/5 h-4/5 object-contain relative z-10 filter group-hover:brightness-110 transition-all"
                        />
                    ) : (
                        <div className="text-3xl font-black italic text-white/10 uppercase select-none relative z-10">{app.name.substring(0, 2)}</div>
                    )}
                </div>
            </div>

            {/* Information Section */}
            <div className="flex-grow flex flex-col items-center px-2">
                <h3 className="font-display font-black italic text-xl md:text-2xl text-white uppercase tracking-tight text-center mb-1 leading-none group-hover:text-primary transition-colors">
                    {app.name}
                </h3>
                <div className="text-[10px] font-bold text-muted uppercase tracking-[0.25em] mb-4">
                    PREMIUM ACCESS
                </div>

                {/* Delivery Info - Red text for better visibility */}
                <div className="w-full space-y-3 mb-2">
                    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-3 text-center group-hover:border-primary/20 transition-colors">
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-relaxed italic">
                            {app.description || 'Verified ID & Password Delivery'}
                        </p>
                    </div>
                </div>

                {/* Price Section - Moved closer to description */}
                <div className="mt-4 text-center">
                    <div className="text-[10px] font-bold text-muted uppercase tracking-[0.2em]">
                        Starting at ₹{app.price || '99'}
                    </div>
                </div>
            </div>

            {/* Action Section */}
            <div className="mt-6 w-full">
                <Link to={`/apps/${app.id}`} className="block">
                    <button className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black text-white hover:bg-white hover:text-black hover:border-white transition-all duration-500 uppercase tracking-[0.4em] shadow-lg group-hover:shadow-primary/5">
                        BROWSE PLANS
                    </button>
                </Link>
            </div>
        </motion.div>
    );
}
