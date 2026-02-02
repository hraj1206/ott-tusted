import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';

const RECENT_NAMES = ["Nikhil R.", "Priya S.", "Rahul M.", "Sneha K.", "Vikram J.", "Ananya L.", "Deepak T.", "Rohit D."];
const RECENT_PLANS = ["Netflix Elite", "YouTube Premium", "Disney+ Hotstar", "Prime Video", "SonyLIV", "Zee5 Premium"];

export default function Hero() {
    const [notification, setNotification] = useState({ name: "Nikhil R.", plan: "Netflix Elite" });

    useEffect(() => {
        const interval = setInterval(() => {
            const randomName = RECENT_NAMES[Math.floor(Math.random() * RECENT_NAMES.length)];
            const randomPlan = RECENT_PLANS[Math.floor(Math.random() * RECENT_PLANS.length)];
            setNotification({ name: randomName, plan: randomPlan });
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
            {/* Background glow */}
            {/* Background glow and effects */}
            <div className="absolute top-0 center w-full h-full bg-gradient-to-b from-primary/5 to-transparent opacity-20" />

            {/* Ambient Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/20 rounded-full blur-[80px]" style={{ animation: 'pulse 4s infinite reverse' }} />
            </div>

            <div className="container mx-auto px-4 text-center z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-block px-4 py-1 rounded-full border border-white/10 bg-white/5 mb-8"
                >
                    <span className="text-[10px] tracking-[0.2em] font-bold text-white uppercase flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        Authorized Premium Distributor
                    </span>
                </motion.div>

                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="font-display italic font-black text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tighter leading-[0.9] mb-6"
                >
                    <span className="text-white block neon-text text-glow" style={{ animation: 'var(--animate-flicker)' }}>WATCH</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-primary to-secondary block neon-text-lg font-black">BEYOND.</span>
                </motion.h1>

                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="max-w-2xl mx-auto text-muted text-base sm:text-lg md:text-xl font-light mb-10 text-glow px-4"
                >
                    Experience pure 4K cinema at 70% off. Legit slots, private profiles, and <span className="font-bold italic text-white text-glow">Instant Global Activation</span>.
                </motion.p>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <Link to="/orders">
                        <Button className="bg-primary hover:bg-secondary text-white font-black italic text-base sm:text-lg px-8 sm:px-10 py-3 sm:py-4 rounded-full shadow-glow-red hover:shadow-[0_0_30px_rgba(255,0,0,0.6)] transition-all">
                            ACCESS THE VAULT
                        </Button>
                    </Link>
                </motion.div>
            </div>

            {/* Live Activation Toast */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={`${notification.name}-${notification.plan}`}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="fixed bottom-4 left-4 right-4 sm:right-auto sm:bottom-8 sm:left-8 z-50 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl p-3 sm:p-4 flex items-center gap-4 shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden sm:min-w-[240px] group cursor-default"
                >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_10px_rgba(255,0,0,1)]" />

                    {/* Ticketer Scanning Bar - Hidden on Mobile for Performance */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20 hidden sm:block">
                        <div className="absolute inset-x-0 h-full w-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-[scanline_3s_linear_infinite]" style={{ width: '2px' }} />
                    </div>

                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-zinc-900 flex items-center justify-center font-black text-base sm:text-xl text-primary italic border border-white/5 group-hover:scale-110 transition-transform flex-shrink-0">
                        {notification.plan.charAt(0)}
                    </div>
                    <div className="relative overflow-hidden">
                        <div className="text-[8px] sm:text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-0.5 flex items-center gap-2">
                            <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-primary animate-ping" />
                            Live Protocol
                        </div>
                        <div className="text-xs sm:text-sm text-white font-medium truncate">
                            <span className="font-black italic uppercase text-glow">{notification.name}</span>
                        </div>
                        <div className="text-[8px] sm:text-[10px] text-white/60 font-bold uppercase tracking-widest mt-0.5 group-hover:text-primary transition-colors truncate">
                            {notification.plan}
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </section>
    );
}
