import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import Navbar from '../components/layout/Navbar';
import Hero from '../components/home/Hero';
import Stats from '../components/home/Stats';
import AppCard from '../components/home/AppCard';
import Reviews from '../components/home/Reviews';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Landing() {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useEffect(() => {
        fetchApps();
    }, []);

    const fetchApps = async () => {
        try {
            const { data, error } = await supabase
                .from('ott_apps')
                .select('*')
                .eq('active', true)
                .order('recommended', { ascending: false })
                .order('created_at', { ascending: true });

            // If no data (dev mode), mock it for visual confirmation
            if (!data || data.length === 0) {
                setApps([
                    { id: '1', name: 'Netflix', price: 199, logo_url: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg' },
                    { id: '2', name: 'YouTube', price: 99, logo_url: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/YouTube_Logo_2017.svg' },
                    { id: '3', name: 'Disney+', price: 149, logo_url: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg' },
                    { id: '4', name: 'Prime', price: 99, logo_url: 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Prime_Video.png' },
                ]);
            } else {
                setApps(data);
            }
        } catch (error) {
            console.error('Error fetching apps:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-white selection:bg-primary selection:text-white overflow-x-hidden relative">
            {/* Cinematic Layer */}
            <div className="noise-overlay" />

            {/* Ambient Particles */}
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    className="floating-particle"
                    animate={{
                        y: [0, -100, 0],
                        opacity: [0, 0.4, 0],
                        scale: [0.5, 1.5, 0.5],
                    }}
                    transition={{
                        duration: Math.random() * 10 + 10,
                        repeat: Infinity,
                        ease: "linear",
                        delay: Math.random() * 20
                    }}
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        width: `${Math.random() * 4 + 2}px`,
                        height: `${Math.random() * 4 + 2}px`,
                    }}
                />
            ))}

            {/* Interactive Effects */}
            <div
                className="mouse-glow"
                style={{ left: mousePos.x, top: mousePos.y }}
            />
            <div className="scanline" />
            <div className="lightning-bolt" style={{ left: '20%', animationDelay: '2s' }} />
            <div className="lightning-bolt" style={{ left: '80%', animationDelay: '4.5s' }} />

            <div className="cyber-grid" />
            <div className="cyber-overlay" />
            <Navbar />

            <Hero />

            <Stats />

            {/* Catalog Section */}
            <section className="container mx-auto px-4 py-32">
                <div className="text-center mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="font-display font-black italic text-5xl md:text-7xl uppercase tracking-tighter glitch-hover cursor-default"
                    >
                        Premium <span className="text-primary">Catalog</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="mt-6 text-muted max-w-2xl mx-auto"
                    >
                        Direct activation slots for the most desired platforms. Select your archetype to continue.
                    </motion.p>
                    <div className="w-16 h-1 bg-primary mx-auto mt-8 rounded-full" />
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {apps.map((app, index) => (
                            <AppCard key={app.id} app={app} index={index} />
                        ))}
                    </div>
                )}
            </section>

            <Reviews />

            {/* Elite Protocol / Footer Tease */}
            <section className="py-20 border-t border-white/5">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="font-display font-black italic text-4xl text-white uppercase mb-2">Elite Protocol</h2>
                    <p className="text-muted text-sm">© 2024 OTT TRUSTED. All rights reserved.</p>
                </div>
            </section>
        </div>
    );
}
