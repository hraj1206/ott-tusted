import { motion, useSpring, useTransform, useInView } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { Users, Diamond, Globe, Zap } from 'lucide-react';

const stats = [
    { icon: Users, value: 62400, suffix: "+", label: "Verified Users", color: "text-purple-500" },
    { icon: Diamond, value: 99.9, suffix: "%", label: "Uptime Score", color: "text-blue-500" },
    { icon: Globe, value: 180, suffix: "+", label: "Global Servers", color: "text-cyan-500" },
    { icon: Zap, value: 5, suffix: "m", label: "Support Speed", color: "text-yellow-500" },
];

function Counter({ value, suffix }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-20px" });
    const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
    const display = useTransform(spring, (current) => Math.round(current).toLocaleString());

    useEffect(() => {
        if (inView) {
            spring.set(value);
        }
    }, [inView, value, spring]);

    return (
        <span ref={ref} className="flex items-baseline">
            <motion.span>{display}</motion.span>
            <span>{suffix}</span>
        </span>
    );
}

export default function Stats() {
    return (
        <section className="container mx-auto px-4 py-20 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-surface border border-white/5 rounded-3xl p-8 hover:border-white/10 transition-colors group"
                    >
                        <stat.icon className={`w-8 h-8 ${stat.color} mb-4 opacity-80 group-hover:opacity-100 transition-opacity`} />
                        <div className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2">{stat.label}</div>
                        <div className="font-display font-black italic text-4xl text-white flex items-center">
                            <Counter value={stat.value} suffix={stat.suffix} />
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
